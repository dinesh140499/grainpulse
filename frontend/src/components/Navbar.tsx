import { Link, useNavigate } from "react-router-dom";
import { FaRegUser, FaLeaf, FaPhoneAlt, FaMapMarkerAlt } from "react-icons/fa";
import { IoCartOutline } from "react-icons/io5";
import { HiOutlineSparkles } from "react-icons/hi2";
import { useDispatch, useSelector } from "react-redux";
import { setButton } from "../features/commonSlice";
import { type RootState } from "../store/store";
import ShopCard from "./common/ShopCard";
import { GiHamburgerMenu } from "react-icons/gi";
import { type SubMenuProps } from "./SubMenu";
import SearchFilter from "./reusable/SearchFilter";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { get } from "../baseUrl";
import { logoutUser } from "../features/authSlice";
import { useCart } from "../hooks/useCart";
import Alert from "./common/Alert";
import { useState } from "react";

const Navbar = ({ setToggleSidebar }: SubMenuProps) => {
  useCart();
  const [alertData, setAlertData] = useState({
    message: "",
    variant: "" as "success" | "error",
    show: false,
  });

  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const user = useSelector((state: RootState) => state.auth.user);
  const cartItems = useSelector((state: RootState) => state.cart.items);
  const navigate = useNavigate();

  const cartItemCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const cartTotalPrice = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

  const logoutMutation = useMutation({
    mutationFn: () => get("default", "auth/logout"),
    onSuccess: (data) => {
      dispatch(logoutUser());
      queryClient.clear();
      setAlertData({
        message: data?.message || "Logout Successful",
        variant: "success",
        show: true,
      });
      setTimeout(() => {
        navigate("/login");
      }, 500);
    },
    onError: (error: any) => {
      dispatch(logoutUser());
      queryClient.clear();
      setAlertData({
        message: error?.message || "Logged out locally",
        variant: "success",
        show: true,
      });
      navigate("/login");
    },
  });

  const handleToggleCart = () => {
    dispatch(setButton({ cart: true }));
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-emerald-100/80 shadow-xs">
        {/* Top Notification & Quick Access Bar */}
        <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-emerald-950 text-white text-xs py-1.5 px-4 border-b border-emerald-800/40">
          <div className="max-w-[95%] mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5 text-emerald-200 font-medium">
                <FaMapMarkerAlt className="text-amber-400 text-xs" />
                <span>Delivery to: <strong className="text-white font-semibold">Sarojini, Delhi</strong></span>
              </span>
              <div className="hidden sm:flex items-center gap-1.5 text-amber-300 pl-3 border-l border-emerald-800">
                <HiOutlineSparkles className="text-sm animate-pulse" />
                <span className="font-medium text-emerald-100">Free Express Delivery on ₹499+</span>
              </div>
            </div>

            {/* Quick Links Menu */}
            <div className="hidden md:flex items-center gap-5 text-emerald-200">
              <Link to="/deals" className="hover:text-amber-300 transition flex items-center gap-1 font-semibold text-amber-300">
                <span>⚡ Daily Deals</span>
              </Link>
              <Link to="/track-order" className="hover:text-amber-300 transition flex items-center gap-1">
                <span>Track Order</span>
                <span className="bg-amber-400 text-emerald-950 text-[9px] font-bold px-1.5 rounded-full">Live</span>
              </Link>
              <Link to="/wishlist" className="hover:text-amber-300 transition">
                Saved Wishlist
              </Link>
              <Link to="/about" className="hover:text-amber-300 transition">
                Our Story
              </Link>
              <Link to="/faq" className="hover:text-amber-300 transition">
                FAQs
              </Link>
              <a href="tel:18000000000" className="flex items-center gap-1 text-white hover:text-amber-300 transition font-bold pl-2 border-l border-emerald-800">
                <FaPhoneAlt className="text-xs text-amber-400" />
                <span>1800-000-0000</span>
              </a>
            </div>
          </div>
        </div>

        {/* Main Navbar */}
        <nav className="max-w-[95%] w-full mx-auto py-3">
          <div className="flex items-center justify-between gap-4 lg:gap-8">
            
            {/* Left: Brand Logo & Mobile Trigger */}
            <div className="flex items-center gap-3">
              <button 
                className="text-2xl text-emerald-900 lg:hidden p-2 hover:bg-emerald-50 rounded-lg transition"
                onClick={() => setToggleSidebar(true)}
                aria-label="Open menu"
              >
                <GiHamburgerMenu />
              </button>

              <Link to="/" className="flex items-center gap-2.5 group">
                <div className="h-10 w-10 sm:h-11 sm:w-11 rounded-xl bg-gradient-to-br from-emerald-700 to-emerald-900 flex items-center justify-center text-amber-400 shadow-md shadow-emerald-900/20 group-hover:scale-105 transition-transform duration-200">
                  <FaLeaf className="text-xl transform -rotate-12" />
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center">
                    <span className="text-xl sm:text-2xl font-bold tracking-tight text-emerald-900">
                      Grain<span className="text-amber-500">Pulse</span>
                    </span>
                  </div>
                  <span className="text-[10px] tracking-wider uppercase font-semibold text-emerald-700/80 -mt-1 hidden sm:block">
                    Pure & Organic Essentials
                  </span>
                </div>
              </Link>
            </div>

            {/* Middle: Search Bar */}
            <div className="flex-1 max-w-2xl hidden md:block">
              <SearchFilter />
            </div>

            {/* Right: Actions (Account, Cart) */}
            <div className="flex items-center gap-2 sm:gap-4">
              
              {/* Account */}
              <div className="flex items-center">
                {user ? (
                  <div className="flex items-center gap-2 bg-emerald-50/80 border border-emerald-200/60 rounded-full py-1.5 px-3 hover:bg-emerald-100/60 transition">
                    <div className="h-7 w-7 rounded-full bg-emerald-800 text-white flex items-center justify-center text-xs font-bold">
                      {user?.firstname ? user.firstname.charAt(0).toUpperCase() : "U"}
                    </div>
                    <div className="hidden lg:flex flex-col text-left">
                      <span className="text-[10px] text-emerald-700 leading-none">Welcome back,</span>
                      <Link to="/account/dashboard" className="text-xs font-semibold text-emerald-950 hover:underline">
                        {user?.firstname}
                      </Link>
                    </div>

                    {(user.role === 'admin' || user.role === 'superadmin') && (
                      <Link
                        to="/admin/dashboard"
                        className="text-[10px] font-bold uppercase bg-amber-500 hover:bg-amber-400 text-emerald-950 px-2 py-0.5 rounded-md shadow-xs transition ml-1"
                      >
                        Admin Portal
                      </Link>
                    )}

                    <button
                      onClick={() => logoutMutation.mutate()}
                      disabled={logoutMutation.isPending}
                      className="text-xs text-red-600 hover:text-red-700 font-medium ml-1 cursor-pointer pl-1 border-l border-emerald-300"
                    >
                      {logoutMutation.isPending ? "..." : "Logout"}
                    </button>
                  </div>
                ) : (
                  <Link
                    to="/login"
                    className="flex items-center gap-2 py-1.5 px-3 sm:px-4 rounded-full bg-emerald-50 text-emerald-900 border border-emerald-200/80 hover:bg-emerald-100 hover:border-emerald-300 transition duration-150"
                  >
                    <FaRegUser className="text-sm text-emerald-800" />
                    <span className="text-xs font-semibold">Sign In / Register</span>
                  </Link>
                )}
              </div>

              <div className="h-6 w-[1px] bg-slate-200 hidden sm:block"></div>

              {/* Cart Drawer Trigger */}
              <button
                onClick={handleToggleCart}
                className="relative flex items-center gap-2.5 bg-gradient-to-r from-emerald-800 to-emerald-900 hover:from-emerald-900 hover:to-emerald-950 text-white py-2 px-3.5 sm:px-4 rounded-xl shadow-sm shadow-emerald-900/20 cursor-pointer hover:shadow-md transition duration-150"
                aria-label="View shopping cart"
              >
                <div className="relative">
                  <IoCartOutline className="text-xl" />
                  {cartItemCount > 0 && (
                    <span className="absolute -top-2.5 -right-2.5 bg-amber-500 text-emerald-950 text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center border-2 border-emerald-900">
                      {cartItemCount}
                    </span>
                  )}
                </div>
                <div className="hidden lg:flex flex-col text-left leading-tight">
                  <span className="text-[10px] text-emerald-200 uppercase font-medium">My Cart</span>
                  <span className="text-xs font-bold text-amber-300">₹{cartTotalPrice.toFixed(0)}</span>
                </div>
              </button>

            </div>
          </div>

          {/* Mobile Search Bar */}
          <div className="mt-2 md:hidden">
            <SearchFilter />
          </div>
        </nav>
      </header>

      {/* Cart Drawer Overlay */}
      <ShopCard />

      {alertData.show && (
        <Alert
          message={alertData.message}
          variant={alertData.variant}
          onDismiss={() => setAlertData((p) => ({ ...p, show: false }))}
        />
      )}
    </>
  );
};

export default Navbar;
