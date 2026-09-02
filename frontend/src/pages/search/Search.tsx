import { useState, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { FaSearch, FaLeaf, FaSlidersH, FaStar, FaShoppingCart, FaEye } from 'react-icons/fa';
import Breadcrumbs from '../../components/reusable/Breadcrumps';
import pulse from '../../assets/images/products/pulse.png';
import SEO from '../../components/common/SEO';
import { useDispatch } from 'react-redux';
import { addToCart } from '../../features/cartSlice';
import { setButton } from '../../features/commonSlice';
import { useAddToCart } from '../../hooks/useCart';
import { useQuery } from '@tanstack/react-query';
import { get } from '../../baseUrl';

interface ProductItem {
  id: string;
  name: string;
  category: string;
  price: number;
  originalPrice: number;
  rating: number;
  reviewsCount: number;
  image: string;
  badge?: string;
  weight: string;
  inStock: boolean;
}

const Search = () => {
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const queryParam = searchParams.get('q') || '';

  const [searchQuery, setSearchQuery] = useState(queryParam);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [sortBy, setSortBy] = useState<string>("relevance");
  const [maxPrice, setMaxPrice] = useState<number>(3000);
  const [filterDrawer, setFilterDrawer] = useState<boolean>(false);

  // 1. Fetch live backend products
  const { data: prodData, isLoading } = useQuery({
    queryKey: ['search-products'],
    queryFn: () => get('default', 'products?limit=100'),
    retry: 1,
  });

  // 2. Fetch live backend categories
  const { data: catData } = useQuery({
    queryKey: ['categories'],
    queryFn: () => get('default', 'categories'),
    retry: 1,
  });

  const backendProducts = prodData?.products || [];
  const backendCategories = catData?.categories || [];

  const categories = ["All", ...backendCategories.map((c: any) => c.name)];

  const allProducts: ProductItem[] = backendProducts.map((p: any) => ({
    id: p._id,
    name: p.name,
    category: p.category?.name || "Organic",
    price: p.pricing?.sellingPrice || 0,
    originalPrice: p.pricing?.mrp || p.pricing?.sellingPrice || 0,
    rating: p.rating?.average || 5.0,
    reviewsCount: p.rating?.totalReviews || 0,
    image: p.images?.[0]?.url || pulse,
    badge: p.isBestSeller ? "Best Seller" : (p.isFeatured ? "Featured" : undefined),
    weight: p.specifications?.weight || "Standard",
    inStock: (p.inventory?.stock ?? p.inventory?.stockQuantity ?? 1) > 0,
  }));

  const addToCartMutation = useAddToCart();

  const handleAddToCart = (product: ProductItem) => {
    const targetId = String(product.id);
    dispatch(addToCart({
      id: targetId,
      name: product.name,
      price: product.price,
      originalPrice: product.originalPrice,
      weight: product.weight,
      image: product.image,
      quantity: 1,
    }));
    addToCartMutation.mutate({ productId: targetId, quantity: 1 });
    dispatch(setButton({ cart: true }));
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setSearchParams({ q: searchQuery.trim() });
    } else {
      setSearchParams({});
    }
  };

  const filteredProducts = useMemo(() => {
    return allProducts
      .filter((p) => {
        const matchesQuery = queryParam
          ? p.name.toLowerCase().includes(queryParam.toLowerCase()) ||
            p.category.toLowerCase().includes(queryParam.toLowerCase())
          : true;
        const matchesCategory = selectedCategory === "All" || p.category.toLowerCase().includes(selectedCategory.toLowerCase());
        const matchesPrice = p.price <= maxPrice;
        return matchesQuery && matchesCategory && matchesPrice;
      })
      .sort((a, b) => {
        if (sortBy === "price-low") return a.price - b.price;
        if (sortBy === "price-high") return b.price - a.price;
        if (sortBy === "rating") return b.rating - a.rating;
        return 0;
      });
  }, [allProducts, queryParam, selectedCategory, maxPrice, sortBy]);

  return (
    <div className="bg-slate-50/50 min-h-screen">
      <SEO
        title={queryParam ? `Search: ${queryParam}` : 'Search Organic Farm Staples'}
        description={`Search unpolished pulses, heritage grains, and cold-pressed oils. ${queryParam ? `Results for ${queryParam}.` : ''}`}
        noIndex={true}
      />
      <Breadcrumbs />

      <div className="max-w-[95%] mx-auto py-8 sm:py-12">
        {/* Search Header Banner */}
        <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-emerald-950 rounded-3xl p-6 sm:p-10 text-white mb-8 shadow-sm relative overflow-hidden">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-1.5 text-amber-300 text-xs font-semibold mb-2 bg-emerald-800/60 px-3 py-1 rounded-full border border-emerald-700/50">
              <FaSearch className="text-xs" />
              <span>Universal Discovery Engine</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              {queryParam ? `Search Results for "${queryParam}"` : "Search Certified Farm Staples"}
            </h1>
            <p className="text-xs sm:text-sm text-emerald-100/80 mt-2">
              Find 100% chemical-free staples, stone-ground flours, cold-pressed oils, and spices.
            </p>

            {/* Quick Search Form */}
            <form onSubmit={handleSearchSubmit} className="mt-6 flex items-center bg-white rounded-2xl p-1.5 shadow-lg max-w-xl text-slate-800">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search pulses, red rice, cold-pressed oils, millets..."
                className="w-full bg-transparent px-4 text-xs sm:text-sm outline-none text-slate-900 placeholder:text-slate-400"
              />
              <button
                type="submit"
                className="bg-emerald-800 hover:bg-emerald-900 text-white font-bold px-6 py-2.5 rounded-xl text-xs flex items-center gap-2 shadow-xs transition cursor-pointer shrink-0"
              >
                <FaSearch className="text-xs" />
                <span>Search</span>
              </button>
            </form>
          </div>
        </div>

        {/* Results & Filter Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left: Filter Sidebar (3 cols) */}
          <aside className={`lg:col-span-3 bg-white rounded-3xl p-6 border border-slate-100 shadow-xs space-y-6 ${filterDrawer ? 'block' : 'hidden lg:block'}`}>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <FaSlidersH className="text-emerald-800" />
                <span>Refine Search</span>
              </span>
              {(selectedCategory !== "All" || maxPrice < 3000) && (
                <button
                  onClick={() => {
                    setSelectedCategory("All");
                    setMaxPrice(3000);
                  }}
                  className="text-xs text-amber-600 font-semibold hover:underline cursor-pointer"
                >
                  Reset
                </button>
              )}
            </div>

            {/* Categories */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">Categories</label>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition flex items-center justify-between cursor-pointer ${
                    selectedCategory === cat
                      ? "bg-emerald-800 text-white shadow-xs"
                      : "text-slate-600 hover:bg-slate-50 hover:text-emerald-900"
                  }`}
                >
                  <span>{cat}</span>
                  {selectedCategory === cat && <FaLeaf className="text-[10px] text-amber-300" />}
                </button>
              ))}
            </div>

            {/* Price Filter */}
            <div className="space-y-3 pt-4 border-t border-slate-100">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                <span>Max Price</span>
                <span className="text-emerald-800 font-extrabold">₹{maxPrice}</span>
              </div>
              <input
                type="range"
                min={50}
                max={3000}
                step={50}
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full accent-emerald-700 h-1.5 bg-slate-100 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-slate-400">
                <span>₹50</span>
                <span>₹3,000</span>
              </div>
            </div>
          </aside>

          {/* Right: Product Grid (9 cols) */}
          <main className="lg:col-span-9 space-y-6">
            
            {/* Control Bar */}
            <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs flex flex-wrap items-center justify-between gap-4">
              <div className="text-xs text-slate-500">
                Showing <strong className="text-slate-900 font-bold">{filteredProducts.length}</strong> farm-verified products
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setFilterDrawer(!filterDrawer)}
                  className="lg:hidden flex items-center gap-1.5 bg-slate-100 text-slate-700 px-3.5 py-2 rounded-xl text-xs font-semibold cursor-pointer"
                >
                  <FaSlidersH />
                  <span>Filters</span>
                </button>

                <div className="flex items-center gap-2 text-xs">
                  <span className="text-slate-400 hidden sm:inline">Sort:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-800 outline-none cursor-pointer"
                  >
                    <option value="relevance">Top Relevance</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="rating">Customer Rating</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Results Grid */}
            {isLoading ? (
              <div className="py-12 text-center text-xs text-emerald-800 font-semibold animate-pulse">
                Searching live catalog database...
              </div>
            ) : filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((product) => (
                  <div
                    key={product.id}
                    className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs hover:shadow-md hover:border-emerald-200 transition duration-200 flex flex-col justify-between group"
                  >
                    <div>
                      {/* Product Image & Badge */}
                      <div className="relative bg-slate-50 rounded-2xl p-4 mb-4 flex items-center justify-center h-48 overflow-hidden">
                        {product.badge && (
                          <span className="absolute top-3 left-3 bg-emerald-800 text-amber-300 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full z-10">
                            {product.badge}
                          </span>
                        )}
                        <img
                          src={product.image}
                          alt={product.name}
                          className="h-36 w-36 object-contain group-hover:scale-105 transition duration-300"
                        />
                      </div>

                      {/* Product Info */}
                      <span className="text-[11px] font-semibold text-emerald-800 uppercase tracking-wider block">
                        {product.category}
                      </span>
                      <Link
                        to={`/categories/${product.id}`}
                        className="font-bold text-slate-900 text-sm hover:text-emerald-800 transition line-clamp-2 mt-1"
                      >
                        {product.name}
                      </Link>

                      <div className="flex items-center gap-2 mt-2 text-xs">
                        <div className="flex items-center text-amber-500 font-bold">
                          <FaStar className="text-[11px] mr-1" />
                          <span>{product.rating}</span>
                        </div>
                        <span className="text-slate-400">({product.reviewsCount} reviews)</span>
                        <span className="text-slate-300">•</span>
                        <span className="text-slate-500 font-medium">{product.weight}</span>
                      </div>
                    </div>

                    {/* Price & Action */}
                    <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                      <div>
                        <div className="text-base font-extrabold text-slate-900">₹{product.price}</div>
                        {product.originalPrice > product.price && (
                          <div className="text-[11px] text-slate-400 line-through">₹{product.originalPrice}</div>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <Link
                          to={`/categories/${product.id}`}
                          className="p-2.5 rounded-xl bg-slate-100 hover:bg-emerald-50 text-slate-600 hover:text-emerald-900 transition"
                          title="Quick View"
                        >
                          <FaEye className="text-xs" />
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleAddToCart(product)}
                          className="bg-emerald-800 hover:bg-emerald-900 active:scale-95 text-white px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition cursor-pointer"
                        >
                          <FaShoppingCart className="text-xs text-amber-300" />
                          <span>Add</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-xs max-w-lg mx-auto space-y-4">
                <div className="h-16 w-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto text-amber-600 text-2xl">
                  <FaSearch />
                </div>
                <h3 className="text-lg font-bold text-slate-900">No Farm Products Found</h3>
                <p className="text-xs text-slate-500">
                  We couldn't find any certified staples matching your search criteria. Try checking spelling or browsing our standard catalog.
                </p>
                <div className="pt-2">
                  <Link
                    to="/shop"
                    className="inline-block bg-emerald-800 text-white text-xs font-bold px-6 py-2.5 rounded-xl shadow-xs hover:bg-emerald-900 transition"
                  >
                    Explore Full Catalog
                  </Link>
                </div>
              </div>
            )}
          </main>

        </div>
      </div>
    </div>
  );
};

export default Search;
