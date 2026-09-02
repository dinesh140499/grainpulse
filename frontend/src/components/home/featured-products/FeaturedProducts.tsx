import { useState } from 'react';
import ProductCardSkeleton from '../../common/ProductCardSkeleton';
import pulse from '../../../assets/images/products/pulse.png';
import grains from '../../../assets/images/products/grains.png';
import oils from '../../../assets/images/products/oils.png';
import spices from '../../../assets/images/products/spices.png';
import veg from '../../../assets/images/veg.jpg';
import { FaStar, FaShoppingBag, FaLeaf, FaArrowRight } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { get } from '../../../baseUrl';
import { useDispatch } from 'react-redux';
import { setButton } from '../../../features/commonSlice';
import { addToCart } from '../../../features/cartSlice';
import { useAddToCart } from '../../../hooks/useCart';

const DEFAULT_FEATURED = [
    {
        id: 'fp-1',
        name: 'Organic Unpolished Toor Dal (Pigeon Pea)',
        weight: '1 Kg',
        category: 'Organic Pulses',
        image: pulse,
        price: 185,
        originalPrice: 220,
        rating: 4.9,
        reviews: 38,
        badge: 'Best Seller',
    },
    {
        id: 'fp-2',
        name: 'Cold-Pressed Virgin Mustard Oil (Kachi Ghani)',
        weight: '1 Litre',
        category: 'Cold-Pressed Oils',
        image: oils,
        price: 240,
        originalPrice: 280,
        rating: 4.8,
        reviews: 24,
        badge: 'Featured',
    },
    {
        id: 'fp-3',
        name: 'Ancient Heirloom Foxtail Millet (Kangni)',
        weight: '1 Kg',
        category: 'Ancient Grains',
        image: grains,
        price: 160,
        originalPrice: 195,
        rating: 5.0,
        reviews: 19,
        badge: 'High Fiber',
    },
    {
        id: 'fp-4',
        name: 'Sun-Dried Malabar Black Peppercorns',
        weight: '250 g',
        category: 'Whole Spices',
        image: spices,
        price: 290,
        originalPrice: 350,
        rating: 4.9,
        reviews: 15,
        badge: 'Single Origin',
    },
];

const FeaturedProducts = () => {
    const [activeTab, setActiveTab] = useState("All");
    const dispatch = useDispatch();

    // Query backend products API
    const { data: apiData, isLoading } = useQuery({
        queryKey: ['featured-products'],
        queryFn: () => get('default', 'products?limit=8'),
        retry: 1,
    });

    const backendProducts = apiData?.products || [];

    const productList = backendProducts.length > 0
        ? backendProducts.map((p: any) => ({
            id: p._id,
            name: p.name,
            weight: p.specifications?.weight || "Standard",
            category: p.category?.name || "Organic",
            image: p.images?.[0]?.url || pulse,
            price: p.pricing?.sellingPrice || 0,
            originalPrice: p.pricing?.mrp || p.pricing?.sellingPrice || 0,
            rating: p.rating?.average || 5,
            reviews: p.rating?.totalReviews || 0,
            badge: p.isBestSeller ? "Best Seller" : (p.isFeatured ? "Featured" : undefined),
        }))
        : DEFAULT_FEATURED;

    // Dynamic category tabs based on loaded products
    const categorySet = new Set<string>();
    productList.forEach((p: any) => {
        if (p.category) categorySet.add(String(p.category));
    });
    const uniqueCategories: string[] = ["All", ...Array.from(categorySet)];

    const filtered = activeTab === "All" 
        ? productList 
        : productList.filter((p: any) => p.category === activeTab);

    const addToCartMutation = useAddToCart();

    const handleAddToCart = (item: any) => {
        const targetId = String(item.id || item._id);
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
        dispatch(setButton({ cart: true }));
    };

    return (
        <section className="py-8 sm:py-12 bg-slate-50/50">
            <div className="max-w-[95%] mx-auto w-full">
                
                {/* Header & Tabs */}
                <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-6 sm:mb-8 gap-4">
                    <div>
                        <div className="inline-flex items-center gap-1.5 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-1">
                            <FaLeaf className="text-amber-500" />
                            <span>Harvest Highlights</span>
                        </div>
                        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                            Featured Organic Essentials
                        </h2>
                    </div>

                    {/* Filter Pills with Horizontal Scroll on Mobile */}
                    {uniqueCategories.length > 1 && (
                        <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-2 lg:pb-0 custom-scrollbar -mx-2 px-2 sm:mx-0 sm:px-0">
                            {uniqueCategories.map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer shrink-0 ${
                                        activeTab === tab
                                            ? "bg-emerald-800 text-amber-300 shadow-xs"
                                            : "bg-white text-slate-600 border border-slate-200/80 hover:border-emerald-300 hover:text-emerald-900"
                                    }`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Products Grid & Promo Banner */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6 items-start">
                    
                    {/* Products Grid */}
                    <div className="lg:col-span-8 xl:col-span-9 grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-5">
                        {isLoading && <ProductCardSkeleton count={4} />}
                        {!isLoading && filtered.map((item: any) => {
                            const discount = item.originalPrice > item.price 
                                ? Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100)
                                : 0;

                            return (
                                <div 
                                    key={item.id} 
                                    className="bg-white rounded-2xl sm:rounded-3xl border border-slate-100 p-2.5 sm:p-4 shadow-xs hover:shadow-lg hover:border-emerald-300 transition-all duration-300 card-hover-effect flex flex-col justify-between"
                                >
                                    <div>
                                        {/* Image Box */}
                                        <Link to={`/categories/${item.id}`} className="block relative h-32 sm:h-40 w-full bg-slate-50 rounded-xl sm:rounded-2xl overflow-hidden mb-2.5 p-2 flex items-center justify-center">
                                            {item.badge && (
                                                <span className="absolute top-1.5 left-1.5 bg-emerald-800 text-amber-300 text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 rounded-md shadow-xs z-10 truncate max-w-[65%]">
                                                    {item.badge}
                                                </span>
                                            )}
                                            {discount > 0 && (
                                                <span className="absolute top-1.5 right-1.5 bg-amber-500 text-emerald-950 text-[9px] sm:text-[10px] font-extrabold px-1.5 sm:px-2 py-0.5 rounded-md z-10">
                                                    {discount}% OFF
                                                </span>
                                            )}
                                            <img
                                                src={item.image}
                                                className="h-full w-full object-contain hover:scale-108 transition-transform duration-300"
                                                alt={item.name}
                                                loading="lazy"
                                            />
                                        </Link>

                                        {/* Meta */}
                                        <div className="flex items-center justify-between text-[10px] sm:text-[11px] text-slate-400 mb-1">
                                            <span className="truncate pr-1">{item.category}</span>
                                            <span className="font-semibold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded shrink-0">
                                                {item.weight}
                                            </span>
                                        </div>

                                        {/* Title */}
                                        <Link to={`/categories/${item.id}`} className="block">
                                            <h3 className="text-xs sm:text-sm font-bold text-slate-800 line-clamp-2 min-h-[32px] sm:min-h-[36px] hover:text-emerald-800 transition">
                                                {item.name}
                                            </h3>
                                        </Link>

                                        {/* Rating */}
                                        <div className="flex items-center gap-1 mt-1.5 sm:mt-2 text-[11px]">
                                            <div className="flex items-center text-amber-400 text-xs">
                                                <FaStar />
                                            </div>
                                            <span className="text-xs font-bold text-slate-700">{item.rating}</span>
                                            <span className="text-[10px] text-slate-400 hidden xs:inline">({item.reviews})</span>
                                        </div>
                                    </div>

                                    {/* Price & Add Action */}
                                    <div className="mt-2.5 sm:mt-3 pt-2.5 sm:pt-3 border-t border-slate-100 flex items-center justify-between gap-1.5">
                                        <div className="min-w-0">
                                            <div className="text-xs sm:text-base font-extrabold text-emerald-900 leading-none truncate">
                                                ₹{item.price}
                                            </div>
                                            {item.originalPrice > item.price && (
                                                <div className="text-[10px] sm:text-[11px] text-slate-400 line-through mt-0.5 truncate">
                                                    ₹{item.originalPrice}
                                                </div>
                                            )}
                                        </div>
                                        <button 
                                            onClick={() => handleAddToCart(item)}
                                            className="bg-emerald-800 hover:bg-emerald-900 active:scale-95 text-white p-1.5 sm:px-3 sm:py-1.5 rounded-xl text-xs font-semibold shadow-xs hover:shadow-md transition duration-150 flex items-center gap-1.5 cursor-pointer shrink-0"
                                            aria-label={`Add ${item.name} to cart`}
                                        >
                                            <FaShoppingBag className="text-[10px] text-amber-300" />
                                            <span className="hidden sm:inline">Add</span>
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Promo Banner Card */}
                    <div className="lg:col-span-4 xl:col-span-3 bg-gradient-to-br from-emerald-900 via-emerald-850 to-emerald-950 rounded-2xl sm:rounded-3xl p-5 sm:p-6 text-white flex flex-col sm:flex-row lg:flex-col justify-between gap-4 relative overflow-hidden shadow-lg">
                        <div className="relative z-10 flex-1">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-amber-300 bg-emerald-800/80 px-2.5 py-1 rounded-full">
                                Farm Direct Special
                            </span>
                            <h3 className="text-lg sm:text-xl xl:text-2xl font-black mt-3 leading-tight font-heading">
                                100% Pure Organic Essentials
                            </h3>
                            <p className="text-xs text-emerald-200/80 mt-2 leading-relaxed">
                                Stone-crushed and unpolished with zero chemical additives.
                            </p>
                        </div>

                        <div className="my-2 sm:my-0 lg:my-4 relative z-10 flex-1 max-w-[200px] sm:max-w-xs lg:max-w-none mx-auto">
                            <img 
                                src={veg} 
                                alt="Organic Produce" 
                                className="rounded-xl sm:rounded-2xl shadow-md max-h-40 sm:max-h-48 w-full object-cover" 
                            />
                        </div>

                        <div className="relative z-10 pt-1 flex-1">
                            <div className="text-amber-300 font-extrabold text-xs sm:text-sm mb-1.5">
                                Flat ₹100 OFF with Code:
                            </div>
                            <div className="bg-emerald-800/90 border border-emerald-700/80 rounded-xl py-1.5 sm:py-2 px-3 text-center text-xs font-mono font-bold tracking-wider mb-3 text-amber-200">
                                HARVEST100
                            </div>
                            <Link 
                                to="/shop" 
                                className="w-full bg-amber-400 hover:bg-amber-300 text-emerald-950 font-bold py-2.5 px-4 rounded-xl text-xs text-center flex items-center justify-center gap-1.5 shadow-md transition"
                            >
                                <span>Shop Now</span>
                                <FaArrowRight className="text-[10px]" />
                            </Link>
                        </div>
                    </div>

                </div>

            </div>
        </section>
    );
};

export default FeaturedProducts;
