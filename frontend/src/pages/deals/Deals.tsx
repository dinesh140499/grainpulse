import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaFire, FaClock, FaShoppingCart, FaPercent } from 'react-icons/fa';
import Breadcrumbs from '../../components/reusable/Breadcrumps';
import pulse from '../../assets/images/products/pulse.png';
import SEO from '../../components/common/SEO';
import { useDispatch } from 'react-redux';
import { addToCart } from '../../features/cartSlice';
import { setButton } from '../../features/commonSlice';
import { useAddToCart } from '../../hooks/useCart';
import { useQuery } from '@tanstack/react-query';
import { get } from '../../baseUrl';

const coupons = [
  { code: "GRAINPULSE", discount: "10% OFF", desc: "Flat 10% instant discount on orders above ₹499", expiry: "Valid Today" },
  { code: "FREESHIP", discount: "FREE EXPRESS", desc: "Complimentary 2-hour delivery on all staples", expiry: "Auto-applied at checkout" },
  { code: "FARMDIRECT20", discount: "₹100 OFF", desc: "First-time customer welcome bonus on ₹999+", expiry: "First Order" },
];

const Deals = () => {
  const dispatch = useDispatch();
  const addToCartMutation = useAddToCart();
  const [timeLeft, setTimeLeft] = useState({ hours: 5, minutes: 42, seconds: 18 });
  const [copiedCoupon, setCopiedCoupon] = useState<string | null>(null);

  // Fetch live backend products
  const { data: apiData, isLoading } = useQuery({
    queryKey: ['dealsProducts'],
    queryFn: () => get('default', 'products?limit=8'),
    retry: 1,
  });

  const products = apiData?.products || [];

  const handleClaimDeal = (item: any) => {
    const targetId = String(item._id || item.id);
    dispatch(addToCart({
      id: targetId,
      name: item.name,
      price: item.pricing?.sellingPrice || 0,
      originalPrice: item.pricing?.mrp || item.pricing?.sellingPrice || 0,
      weight: item.specifications?.weight || "Standard",
      image: item.images?.[0]?.url || pulse,
      quantity: 1,
    }));
    addToCartMutation.mutate({ productId: targetId, quantity: 1 });
    dispatch(setButton({ cart: true }));
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCoupon(code);
    setTimeout(() => setCopiedCoupon(null), 2000);
  };

  return (
    <div className="bg-slate-50/50 min-h-screen">
      <SEO
        title="Exclusive Deals & Offers on Organic Grains & Pulses"
        description="Grab limited-time discounts and flash sale bundles on 100% natural, unpolished dals, cold-pressed oils, and ancient grains at GrainPulse."
        canonicalUrl="/deals"
      />
      <Breadcrumbs />

      <div className="max-w-[95%] mx-auto py-8 sm:py-12">
        
        {/* Hero Banner */}
        <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-amber-950 rounded-3xl p-6 sm:p-10 text-white mb-10 shadow-sm relative overflow-hidden">
          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-1.5 text-amber-300 text-xs font-bold uppercase tracking-wider bg-emerald-800/80 px-3.5 py-1 rounded-full mb-3 border border-emerald-700/50">
                <FaFire className="text-amber-400 animate-bounce" />
                <span>Today's Harvest Flash Deals</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
                Up to 30% Off Farm-Direct Organic Bundles
              </h1>
              <p className="text-xs sm:text-sm text-emerald-100/80 mt-2 max-w-xl">
                Limited stock directly sourced from our weekly harvest cluster. Chemical-free, 100% unpolished, and fresh from the farm.
              </p>
            </div>

            {/* Countdown Box */}
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 sm:p-5 flex items-center gap-3 shrink-0">
              <div className="flex items-center gap-1.5 text-amber-300 text-xs font-bold mr-2">
                <FaClock className="text-sm" />
                <span>Deals End In:</span>
              </div>
              <div className="flex items-center gap-2 text-center">
                <div className="bg-emerald-950/80 rounded-xl px-3 py-2 min-w-[42px]">
                  <span className="font-extrabold text-base text-amber-400 block">{String(timeLeft.hours).padStart(2, '0')}</span>
                  <span className="text-[9px] uppercase tracking-wider text-slate-300">Hrs</span>
                </div>
                <span className="font-bold text-amber-400">:</span>
                <div className="bg-emerald-950/80 rounded-xl px-3 py-2 min-w-[42px]">
                  <span className="font-extrabold text-base text-amber-400 block">{String(timeLeft.minutes).padStart(2, '0')}</span>
                  <span className="text-[9px] uppercase tracking-wider text-slate-300">Min</span>
                </div>
                <span className="font-bold text-amber-400">:</span>
                <div className="bg-emerald-950/80 rounded-xl px-3 py-2 min-w-[42px]">
                  <span className="font-extrabold text-base text-amber-400 block">{String(timeLeft.seconds).padStart(2, '0')}</span>
                  <span className="text-[9px] uppercase tracking-wider text-slate-300">Sec</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Coupon Codes Row */}
        <div className="mb-12">
          <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <FaPercent className="text-amber-500" />
            <span>Available Harvest Coupons & Vouchers</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {coupons.map((coupon, i) => (
              <div
                key={i}
                className="bg-white border-2 border-dashed border-emerald-200 rounded-2xl p-4 flex items-center justify-between shadow-xs hover:border-emerald-500 transition"
              >
                <div>
                  <div className="text-xs font-bold text-emerald-800 uppercase tracking-wider">{coupon.discount}</div>
                  <div className="text-xs text-slate-600 mt-1 font-medium">{coupon.desc}</div>
                  <div className="text-[10px] text-slate-400 mt-1">{coupon.expiry}</div>
                </div>
                <button
                  onClick={() => copyToClipboard(coupon.code)}
                  className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 px-3 py-1.5 rounded-xl text-xs font-mono font-bold cursor-pointer transition shrink-0 ml-2"
                >
                  {copiedCoupon === coupon.code ? "COPIED!" : coupon.code}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Flash Deals Grid */}
        <div>
          <div className="flex items-center justify-between mb-6 pb-3 border-b border-slate-200">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
              Limited Harvest Flash Deals
            </h2>
            <span className="text-xs text-slate-500 font-medium">
              Showing {products.length} live items
            </span>
          </div>

          {isLoading && (
            <div className="py-12 text-center text-xs text-emerald-800 font-semibold animate-pulse">
              Loading active flash deals...
            </div>
          )}

          {!isLoading && products.length === 0 && (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 max-w-md mx-auto space-y-3">
              <h3 className="text-base font-bold text-slate-800">No Flash Deals Currently Active</h3>
              <p className="text-xs text-slate-500">Check back later for fresh harvest promotions or browse our catalog.</p>
              <Link to="/shop" className="inline-block bg-emerald-800 text-white font-bold text-xs py-2.5 px-6 rounded-xl">
                Shop All Harvest
              </Link>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((item: any) => {
              const price = item.pricing?.sellingPrice || 0;
              const originalPrice = item.pricing?.mrp || price;
              const discount = originalPrice > price 
                ? Math.round(((originalPrice - price) / originalPrice) * 100)
                : 15;
              const image = item.images?.[0]?.url || pulse;
              const weight = item.specifications?.weight || "Standard";

              return (
                <div
                  key={item._id}
                  className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs hover:shadow-lg hover:border-emerald-300 transition duration-200 flex flex-col justify-between group"
                >
                  <div>
                    {/* Image & Discount Badge */}
                    <div className="relative bg-slate-50 rounded-2xl p-4 mb-4 flex items-center justify-center h-44 overflow-hidden">
                      <span className="absolute top-3 left-3 bg-red-600 text-white text-[10px] font-black px-2 py-0.5 rounded-md z-10 shadow-xs">
                        {discount}% OFF
                      </span>
                      <img
                        src={image}
                        alt={item.name}
                        className="h-32 w-32 object-contain group-hover:scale-108 transition duration-300"
                      />
                    </div>

                    {/* Tag / Category */}
                    <span className="inline-block bg-emerald-50 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-md mb-2">
                      {item.category?.name || "Organic Staple"}
                    </span>

                    {/* Title */}
                    <Link
                      to={`/product/${item._id}`}
                      className="font-bold text-slate-900 text-sm hover:text-emerald-800 transition line-clamp-2 block"
                    >
                      {item.name}
                    </Link>

                    {/* Stock Alert */}
                    <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500">
                      <span className="font-semibold text-emerald-700">{weight}</span>
                      <span className="text-amber-700 font-bold">Limited Harvest</span>
                    </div>
                  </div>

                  {/* Price & Claim Button */}
                  <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <div className="text-lg font-black text-slate-900">₹{price}</div>
                      {originalPrice > price && (
                        <div className="text-[11px] text-slate-400 line-through">₹{originalPrice}</div>
                      )}
                    </div>

                    <button
                      onClick={() => handleClaimDeal(item)}
                      className="bg-emerald-800 hover:bg-emerald-900 active:scale-95 text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition cursor-pointer"
                    >
                      <FaShoppingCart className="text-xs text-amber-300" />
                      <span>Claim Deal</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Deals;
