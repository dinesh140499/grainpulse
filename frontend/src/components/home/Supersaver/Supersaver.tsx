import pulse from '../../../assets/images/products/pulse.png';
import grains from '../../../assets/images/products/grains.png';
import oils from '../../../assets/images/products/oils.png';
import spices from '../../../assets/images/products/spices.png';
import { FaFireAlt, FaStar, FaShoppingBag, FaArrowRight } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { get } from '../../../baseUrl';
import { useDispatch } from 'react-redux';
import { addToCart } from '../../../features/cartSlice';
import { setButton } from '../../../features/commonSlice';
import { useAddToCart } from '../../../hooks/useCart';

const DEFAULT_SUPERSAVER = [
    {
        _id: 'ss-1',
        name: 'Organic Unpolished Yellow Moong Dal',
        specifications: { weight: '1 Kg' },
        category: { name: 'Organic Pulses' },
        images: [{ url: pulse }],
        pricing: { sellingPrice: 165, mrp: 210 },
        rating: { average: 4.9, totalReviews: 29 },
    },
    {
        _id: 'ss-2',
        name: 'Wood-Pressed Pure Sesame Oil (Til Oil)',
        specifications: { weight: '1 Litre' },
        category: { name: 'Cold-Pressed Oils' },
        images: [{ url: oils }],
        pricing: { sellingPrice: 320, mrp: 390 },
        rating: { average: 5.0, totalReviews: 18 },
    },
    {
        _id: 'ss-3',
        name: 'Heritage Barnyard Millet (Sanwa)',
        specifications: { weight: '1 Kg' },
        category: { name: 'Ancient Grains' },
        images: [{ url: grains }],
        pricing: { sellingPrice: 155, mrp: 190 },
        rating: { average: 4.8, totalReviews: 14 },
    },
    {
        _id: 'ss-4',
        name: 'Stone-Ground Salem Turmeric Powder',
        specifications: { weight: '500 g' },
        category: { name: 'Whole Spices' },
        images: [{ url: spices }],
        pricing: { sellingPrice: 190, mrp: 240 },
        rating: { average: 4.9, totalReviews: 32 },
    },
];

const Supersaver = () => {
    const dispatch = useDispatch();
    const addToCartMutation = useAddToCart();

    // Query backend products API
    const { data: apiData } = useQuery({
        queryKey: ['supersaverProducts'],
        queryFn: () => get('default', 'products?limit=4'),
        retry: 1,
    });

    const products = apiData?.products?.length > 0 ? apiData.products : DEFAULT_SUPERSAVER;

    const handleAddToCart = (item: any) => {
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

    return (
        <section className="py-8 sm:py-12 bg-gradient-to-b from-amber-50/50 via-white to-slate-50/50">
            <div className="max-w-[95%] mx-auto w-full">
                
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 pb-4 border-b border-amber-100 gap-2">
                    <div>
                        <div className="inline-flex items-center gap-1.5 text-amber-700 text-xs font-bold uppercase tracking-wider mb-1">
                            <FaFireAlt className="text-amber-500 animate-pulse" />
                            <span>Daily Limited Harvest Deals</span>
                        </div>
                        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                            Supersaver Flash Harvest Deals
                        </h2>
                    </div>
                    <Link to="/deals" className="text-xs sm:text-sm font-bold text-amber-800 hover:text-amber-950 flex items-center gap-1 group">
                        <span>View All Deals</span>
                        <FaArrowRight className="text-xs group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                    {products.map((item: any) => {
                        const price = item.pricing?.sellingPrice || 0;
                        const originalPrice = item.pricing?.mrp || price;
                        const discount = originalPrice > price 
                            ? Math.round(((originalPrice - price) / originalPrice) * 100) 
                            : 15;
                        const image = item.images?.[0]?.url || pulse;
                        const rating = item.rating?.average || 5.0;

                        return (
                            <div
                                key={item._id}
                                className="bg-white rounded-3xl border border-amber-200/70 p-4 shadow-sm hover:shadow-xl hover:border-amber-400 transition-all duration-300 card-hover-effect flex flex-col justify-between"
                            >
                                <div>
                                    <div className="relative h-40 w-full bg-slate-50 rounded-2xl p-2 mb-3 flex items-center justify-center overflow-hidden">
                                        <span className="absolute top-2 left-2 bg-red-600 text-white text-[10px] font-extrabold px-2.5 py-0.5 rounded-full shadow-xs z-10">
                                            {discount}% OFF
                                        </span>
                                        <img src={image} alt={item.name} className="h-full w-full object-contain hover:scale-105 transition duration-200" />
                                    </div>

                                    <div className="flex items-center gap-1 text-amber-400 text-xs mb-1">
                                        <FaStar />
                                        <span className="text-slate-800 font-bold text-xs">{rating}</span>
                                    </div>

                                    <Link to={`/product/${item._id}`}>
                                        <h3 className="text-sm font-bold text-slate-800 hover:text-emerald-800 transition line-clamp-1">
                                            {item.name}
                                        </h3>
                                    </Link>

                                    <p className="text-[11px] font-semibold text-amber-700 mt-1">
                                        🔥 Limited stock remaining
                                    </p>
                                </div>

                                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                                    <div>
                                        <div className="text-base font-extrabold text-emerald-950">₹{price}</div>
                                        {originalPrice > price && (
                                            <div className="text-[11px] text-slate-400 line-through">₹{originalPrice}</div>
                                        )}
                                    </div>
                                    <button 
                                        onClick={() => handleAddToCart(item)}
                                        className="bg-emerald-800 hover:bg-emerald-900 text-white p-2.5 rounded-xl text-xs font-semibold shadow-xs hover:shadow-md transition flex items-center gap-1 cursor-pointer"
                                        aria-label="Add to cart"
                                    >
                                        <FaShoppingBag className="text-xs text-amber-300" />
                                        <span className="hidden sm:inline">Add</span>
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>

            </div>
        </section>
    );
};

export default Supersaver;
