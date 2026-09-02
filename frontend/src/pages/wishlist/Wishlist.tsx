import { FaTrash, FaShoppingBag, FaStar, FaHeart, FaArrowRight } from 'react-icons/fa';
import Breadcrumbs from '../../components/reusable/Breadcrumps';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../../store/store';
import { removeFromWishlist, clearWishlist, type WishlistItem } from '../../features/wishlistSlice';
import { addToCart } from '../../features/cartSlice';
import { setButton } from '../../features/commonSlice';
import { useAddToCart } from '../../hooks/useCart';

const Wishlist = () => {
    const dispatch = useDispatch();
    const addToCartMutation = useAddToCart();
    const items = useSelector((state: RootState) => state.wishlist.items);

    const handleRemove = (id: number | string) => {
        dispatch(removeFromWishlist(id));
    };

    const handleClearAll = () => {
        dispatch(clearWishlist());
    };

    const handleMoveToCart = (item: WishlistItem) => {
        const targetId = String(item.id);
        dispatch(addToCart({
            id: targetId,
            name: item.name,
            price: item.price,
            originalPrice: item.originalPrice,
            weight: item.weight,
            image: item.image,
            quantity: 1,
        }));
        addToCartMutation.mutate({ productId: targetId, quantity: 1 });
        dispatch(removeFromWishlist(item.id));
        dispatch(setButton({ cart: true }));
    };

    return (
        <div className="bg-slate-50/50 min-h-screen">
            <Breadcrumbs />

            <div className="max-w-[95%] mx-auto py-10 sm:py-16">
                
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 pb-4 border-b border-slate-200/80 gap-3">
                    <div>
                        <div className="inline-flex items-center gap-1.5 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-1">
                            <FaHeart className="text-red-500" />
                            <span>Saved Items</span>
                        </div>
                        <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                            My Organic Wishlist ({items.length})
                        </h1>
                    </div>

                    {items.length > 0 && (
                        <button
                            onClick={handleClearAll}
                            className="text-xs font-semibold text-red-600 hover:text-red-700 self-start sm:self-auto cursor-pointer"
                        >
                            Clear All Items
                        </button>
                    )}
                </div>

                {/* Items Grid */}
                {items.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                        {items.map((item) => {
                            const discount = Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100);

                            return (
                                <div
                                    key={item.id}
                                    className="bg-white rounded-3xl border border-slate-100 p-4 shadow-xs hover:shadow-lg hover:border-emerald-300 transition-all duration-300 card-hover-effect flex flex-col justify-between"
                                >
                                    <div>
                                        <div className="relative h-40 w-full bg-slate-50 rounded-2xl overflow-hidden mb-3 p-2 flex items-center justify-center">
                                            <span className="absolute top-2 left-2 bg-amber-500 text-emerald-950 text-[10px] font-extrabold px-2 py-0.5 rounded-md z-10">
                                                {discount}% OFF
                                            </span>
                                            <button
                                                onClick={() => handleRemove(item.id)}
                                                className="absolute top-2 right-2 h-7 w-7 rounded-full bg-white/90 text-slate-400 hover:text-red-600 flex items-center justify-center shadow-xs transition cursor-pointer z-10"
                                                aria-label="Remove from wishlist"
                                            >
                                                <FaTrash className="text-xs" />
                                            </button>
                                            <img
                                                src={item.image}
                                                className="h-full w-full object-contain hover:scale-105 transition"
                                                alt={item.name}
                                            />
                                        </div>

                                        <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                                            <span>{item.category}</span>
                                            <span className="font-semibold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
                                                {item.weight}
                                            </span>
                                        </div>

                                        <Link to={`/product/${item.id}`} className="block">
                                            <h3 className="text-xs sm:text-sm font-bold text-slate-800 line-clamp-2 min-h-[36px] hover:text-emerald-800 transition">
                                                {item.name}
                                            </h3>
                                        </Link>

                                        <div className="flex items-center justify-between mt-2">
                                            <div className="flex items-center gap-1 text-amber-400 text-xs">
                                                <FaStar />
                                                <span className="font-bold text-slate-700">{item.rating}</span>
                                            </div>
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                                item.inStock 
                                                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200/60' 
                                                    : 'bg-red-50 text-red-600'
                                            }`}>
                                                {item.inStock ? 'In Stock' : 'Out of Stock'}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Action */}
                                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                                        <div>
                                            <div className="text-sm sm:text-base font-extrabold text-emerald-950 leading-none">
                                                ₹{item.price}
                                            </div>
                                            <div className="text-[11px] text-slate-400 line-through mt-0.5">
                                                ₹{item.originalPrice}
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => handleMoveToCart(item)}
                                            disabled={!item.inStock}
                                            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                                                item.inStock
                                                    ? 'bg-emerald-800 hover:bg-emerald-900 text-white shadow-xs'
                                                    : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                            }`}
                                        >
                                            <FaShoppingBag className="text-[10px] text-amber-300" />
                                            <span>Move to Cart</span>
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="bg-white rounded-3xl p-12 sm:p-16 text-center border border-slate-100 shadow-xs max-w-lg mx-auto space-y-4">
                        <div className="h-16 w-16 bg-red-50 rounded-full flex items-center justify-center mx-auto text-red-500 text-2xl">
                            <FaHeart />
                        </div>
                        <h2 className="text-xl font-bold text-slate-900">Your Wishlist is Empty</h2>
                        <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                            Save your favorite organic staples, whole spices, and cold-pressed oils here for quick reordering.
                        </p>
                        <div className="pt-2">
                            <Link
                                to="/shop"
                                className="inline-flex items-center gap-2 bg-emerald-800 hover:bg-emerald-900 text-white text-xs sm:text-sm font-bold px-6 py-2.5 rounded-xl shadow-xs transition"
                            >
                                <span>Explore Catalog</span>
                                <FaArrowRight className="text-xs text-amber-300" />
                            </Link>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};

export default Wishlist;
