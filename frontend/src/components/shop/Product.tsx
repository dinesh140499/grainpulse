import { FaStar, FaShoppingBag } from 'react-icons/fa';
import pulse from '../../assets/images/products/pulse.png';
import Pagination from '../reusable/Pagination';
import { useState } from 'react';
import { IoFilter } from 'react-icons/io5';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { get } from '../../baseUrl';
import { useDispatch } from 'react-redux';
import { setButton } from '../../features/commonSlice';
import { addToCart } from '../../features/cartSlice';
import { useAddToCart } from '../../hooks/useCart';

type ProductProps = {
    filterBtnToggle: boolean;
    setFilterBtnToggle: React.Dispatch<React.SetStateAction<boolean>>;
    selectedCategory?: string;
    priceRange?: { min: number; max: number };
};

import ProductCardSkeleton from '../common/ProductCardSkeleton';

interface BackendProduct {
    _id: string;
    name: string;
    slug?: string;
    pricing: {
        mrp?: number;
        sellingPrice: number;
        discountPrice?: number;
    };
    specifications?: {
        weight?: string;
    };
    category?: {
        _id?: string;
        name?: string;
    };
    images?: {
        url: string;
        isPrimary?: boolean;
    }[];
    rating?: {
        average?: number;
        totalReviews?: number;
    };
    isBestSeller?: boolean;
    isFeatured?: boolean;
}

const Product: React.FC<ProductProps> = ({ filterBtnToggle, setFilterBtnToggle, selectedCategory = "All", priceRange }) => {
    const [currentPage, setCurrentPage] = useState(1);
    const [sortBy, setSortBy] = useState('Featured');
    const dispatch = useDispatch();

    // Query live backend products API (no dummy data)
    const { data: apiData, isLoading } = useQuery({
        queryKey: ['products', currentPage, sortBy, selectedCategory],
        queryFn: () => get('default', `products?page=${currentPage}&limit=12`),
        retry: 1,
    });

    const backendProducts: BackendProduct[] = apiData?.products || [];
    const totalPages = apiData?.totalPages || 1;
    const totalCount = apiData?.count || backendProducts.length;

    // Transform pure backend products
    const rawProducts = backendProducts.map((p) => ({
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
    }));

    // Filter by category and price
    const displayProducts = rawProducts
        .filter((item) => {
            if (!selectedCategory || selectedCategory === "All") return true;
            const catLower = selectedCategory.toLowerCase();
            return item.category.toLowerCase().includes(catLower) || item.name.toLowerCase().includes(catLower);
        })
        .filter((item) => {
            if (!priceRange) return true;
            return item.price >= priceRange.min && item.price <= priceRange.max;
        })
        .sort((a, b) => {
            if (sortBy === "PriceLowHigh") return a.price - b.price;
            if (sortBy === "PriceHighLow") return b.price - a.price;
            if (sortBy === "Rating") return b.rating - a.rating;
            if (sortBy === "Newest") return String(b.id).localeCompare(String(a.id));
            return 0;
        });

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
        <div>
            {/* Toolbar */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">

                {/* Left: Mobile Filter Button & Results Info */}
                <div className="flex items-center gap-3">
                    <button
                        className="lg:hidden flex items-center gap-2 bg-emerald-800 text-white text-xs font-semibold py-2 px-3.5 rounded-xl shadow-xs cursor-pointer"
                        onClick={() => setFilterBtnToggle(!filterBtnToggle)}
                    >
                        <IoFilter className="text-sm" />
                        <span>Filters</span>
                    </button>

                    <p className="text-xs sm:text-sm text-slate-600">
                        Showing <strong className="text-slate-900 font-bold">{displayProducts.length}</strong> of {totalCount} items
                    </p>
                </div>

                {/* Right: Sort By Dropdown */}
                <div className="flex items-center gap-2 self-end sm:self-auto text-xs sm:text-sm text-slate-600">
                    <span className="font-medium whitespace-nowrap">Sort by:</span>
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs sm:text-sm font-semibold text-slate-800 outline-none focus:border-emerald-600 cursor-pointer transition"
                    >
                        <option value="Featured">Featured Harvest</option>
                        <option value="PriceLowHigh">Price: Low to High</option>
                        <option value="PriceHighLow">Price: High to Low</option>
                        <option value="Rating">Customer Rating</option>
                        <option value="Newest">Newest Harvest</option>
                    </select>
                </div>

            </div>

            {/* Empty State */}
            {!isLoading && displayProducts.length === 0 && (
                <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-sm space-y-3">
                    <div className="h-16 w-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto text-slate-400 text-2xl">
                        🌾
                    </div>
                    <h3 className="text-lg font-bold text-slate-800">No Products Available</h3>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto">
                        There are currently no products matching this category or price filter in the live inventory.
                    </p>
                </div>
            )}

            {/* Products Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3.5 sm:gap-5">
                {isLoading && <ProductCardSkeleton count={8} />}
                {!isLoading && displayProducts.map((item) => {
                    const discount = item.originalPrice > item.price
                        ? Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100)
                        : 0;

                    return (
                        <div key={item.id} className="bg-white rounded-2xl border border-slate-100 p-3 sm:p-4 shadow-xs hover:shadow-lg hover:border-emerald-300 transition-all duration-300 card-hover-effect flex flex-col justify-between">

                            <div>
                                {/* Image Container with Badges */}
                                <Link to={`/categories/${item.id}`} className="block relative h-36 sm:h-44 w-full bg-slate-50 rounded-xl overflow-hidden mb-3 p-2">
                                    {item.badge && (
                                        <span className="absolute top-2 left-2 bg-emerald-800 text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded-md shadow-xs z-10">
                                            {item.badge}
                                        </span>
                                    )}
                                    {discount > 0 && (
                                        <span className="absolute top-2 right-2 bg-amber-500 text-emerald-950 text-[10px] font-extrabold px-2 py-0.5 rounded-md z-10">
                                            {discount}% OFF
                                        </span>
                                    )}
                                    <img
                                        src={item.image}
                                        className="h-full w-full object-contain hover:scale-108 transition-transform duration-300"
                                        alt={item.name}
                                    />
                                </Link>

                                {/* Weight & Category */}
                                <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                                    <span>{item.category}</span>
                                    <span className="font-semibold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
                                        {item.weight}
                                    </span>
                                </div>

                                {/* Title */}
                                <Link to={`/categories/${item.id}`} className="block">
                                    <h3 className="text-xs sm:text-sm font-bold text-slate-800 line-clamp-2 min-h-[36px] hover:text-emerald-800 transition">
                                        {item.name}
                                    </h3>
                                </Link>

                                {/* Star Ratings */}
                                <div className="flex items-center gap-1.5 mt-2">
                                    <div className="flex items-center text-amber-400 text-xs">
                                        <FaStar />
                                    </div>
                                    <span className="text-xs font-bold text-slate-700">{item.rating}</span>
                                    <span className="text-[11px] text-slate-400">({item.reviews})</span>
                                </div>
                            </div>

                            {/* Price & Action */}
                            <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
                                <div>
                                    <div className="text-sm sm:text-base font-extrabold text-emerald-900 leading-none">
                                        ₹{item.price}
                                    </div>
                                    {item.originalPrice > item.price && (
                                        <div className="text-[11px] text-slate-400 line-through mt-0.5">
                                            ₹{item.originalPrice}
                                        </div>
                                    )}
                                </div>
                                <button
                                    onClick={() => handleAddToCart(item)}
                                    className="bg-emerald-800 hover:bg-emerald-900 active:scale-95 text-white p-2 sm:px-3 sm:py-1.5 rounded-xl text-xs font-semibold shadow-xs hover:shadow-md transition duration-150 flex items-center gap-1.5 cursor-pointer"
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

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="mt-10">
                    <Pagination
                        totalPages={totalPages}
                        currentPage={currentPage}
                        onPageChange={(page) => setCurrentPage(page)}
                        visibleLimit={5}
                    />
                </div>
            )}
        </div>
    );
};

export default Product;