import ReusableSwiper from '../../ReusableSwiper';
import pulse from '../../../assets/images/products/pulse.png';
import grains from '../../../assets/images/products/grains.png';
import oils from '../../../assets/images/products/oils.png';
import spices from '../../../assets/images/products/spices.png';
import dryFruit from '../../../assets/images/products/dry-fruit.png';
import { FaStar, FaShoppingBag, FaLeaf } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { addToCart } from '../../../features/cartSlice';
import { setButton } from '../../../features/commonSlice';
import { useAddToCart } from '../../../hooks/useCart';
import { useQuery } from '@tanstack/react-query';
import { get } from '../../../baseUrl';

const DEFAULT_NEW_ARRIVALS = [
    {
        _id: 'na-1',
        name: 'Organic Whole Green Moong (Sabut Moong)',
        isBestSeller: true,
        specifications: { weight: '1 Kg' },
        category: { name: 'Organic Pulses' },
        images: [{ url: pulse }],
        pricing: { sellingPrice: 175, mrp: 215 },
        rating: { average: 5.0, totalReviews: 21 },
    },
    {
        _id: 'na-2',
        name: 'Cold-Pressed Virgin Groundnut Oil (Peanut Oil)',
        isBestSeller: false,
        specifications: { weight: '1 Litre' },
        category: { name: 'Cold-Pressed Oils' },
        images: [{ url: oils }],
        pricing: { sellingPrice: 280, mrp: 340 },
        rating: { average: 4.9, totalReviews: 17 },
    },
    {
        _id: 'na-3',
        name: 'Himalayan Black Rice (Karuppu Kavuni)',
        isBestSeller: true,
        specifications: { weight: '1 Kg' },
        category: { name: 'Ancient Grains' },
        images: [{ url: grains }],
        pricing: { sellingPrice: 260, mrp: 320 },
        rating: { average: 5.0, totalReviews: 33 },
    },
    {
        _id: 'na-4',
        name: 'Organic Kashmiri Saffron (Kesar Threads)',
        isBestSeller: false,
        specifications: { weight: '1 g' },
        category: { name: 'Whole Spices' },
        images: [{ url: spices }],
        pricing: { sellingPrice: 380, mrp: 450 },
        rating: { average: 4.9, totalReviews: 12 },
    },
    {
        _id: 'na-5',
        name: 'Premium California Organic Raw Almonds',
        isBestSeller: true,
        specifications: { weight: '500 g' },
        category: { name: 'Dry Fruits & Seeds' },
        images: [{ url: dryFruit }],
        pricing: { sellingPrice: 480, mrp: 580 },
        rating: { average: 4.9, totalReviews: 41 },
    },
];

const NewProducts = () => {
    const dispatch = useDispatch();

    // Query backend products API
    const { data: apiData } = useQuery({
        queryKey: ['newArrivals'],
        queryFn: () => get('default', 'products?limit=8'),
        retry: 1,
    });

    const products = apiData?.products?.length > 0 ? apiData.products : DEFAULT_NEW_ARRIVALS;

    const addToCartMutation = useAddToCart();

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

    const slides = products.map((item: any) => {
        const price = item.pricing?.sellingPrice || 0;
        const originalPrice = item.pricing?.mrp || price;
        const image = item.images?.[0]?.url || pulse;
        const weight = item.specifications?.weight || "1 Kg";
        const category = item.category?.name || "Organic";
        const rating = item.rating?.average || 5.0;

        return (
            <div key={item._id} className="p-1">
                <div className="bg-white rounded-3xl border border-slate-100 p-4 shadow-xs hover:shadow-lg hover:border-emerald-300 transition-all duration-300 card-hover-effect flex flex-col justify-between h-full">
                    <div>
                        <Link to={`/product/${item._id}`} className="block relative h-40 w-full bg-slate-50 rounded-2xl overflow-hidden mb-3 p-2">
                            {item.isBestSeller && (
                                <span className="absolute top-2 left-2 bg-emerald-800 text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded-md shadow-xs z-10">
                                    Best Seller
                                </span>
                            )}
                            <img src={image} alt={item.name} className="h-full w-full object-contain hover:scale-105 transition duration-200" />
                        </Link>

                        <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                            <span>{category}</span>
                            <span className="font-semibold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">{weight}</span>
                        </div>

                        <Link to={`/product/${item._id}`}>
                            <h3 className="text-xs sm:text-sm font-bold text-slate-800 line-clamp-2 min-h-[36px] hover:text-emerald-800 transition">
                                {item.name}
                            </h3>
                        </Link>

                        <div className="flex items-center gap-1.5 mt-2 text-amber-400 text-xs">
                            <FaStar />
                            <span className="text-xs font-bold text-slate-700">{rating}</span>
                        </div>
                    </div>

                    <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
                        <div>
                            <div className="text-sm font-extrabold text-emerald-950">₹{price}</div>
                            {originalPrice > price && (
                                <div className="text-[11px] text-slate-400 line-through">₹{originalPrice}</div>
                            )}
                        </div>
                        <button 
                            onClick={() => handleAddToCart(item)}
                            className="bg-emerald-800 hover:bg-emerald-900 active:scale-95 text-white p-2 rounded-xl text-xs font-semibold shadow-xs transition flex items-center justify-center cursor-pointer"
                            aria-label={`Add ${item.name} to cart`}
                        >
                            <FaShoppingBag className="text-xs text-amber-300" />
                        </button>
                    </div>
                </div>
            </div>
        );
    });

    return (
        <section className="py-8 sm:py-12 bg-slate-50/50">
            <div className="max-w-[95%] mx-auto w-full">
                
                {/* Header */}
                <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-200/80">
                    <div>
                        <div className="inline-flex items-center gap-1.5 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-1">
                            <FaLeaf className="text-amber-500" />
                            <span>Fresh From Farms</span>
                        </div>
                        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                            Latest Seasonal Harvests
                        </h2>
                    </div>
                </div>

                <div className="relative">
                    <ReusableSwiper
                        slides={slides}
                        loop={slides.length > 3}
                        autoplay={{ delay: 4500, disableOnInteraction: false }}
                        pagination={{ clickable: true, type: 'bullets' }}
                        paginationClass="feature-pagination"
                        navigation={false}
                        breakpoints={{
                            320: { slidesPerView: 1, spaceBetween: 12 },
                            640: { slidesPerView: 2, spaceBetween: 16 },
                            768: { slidesPerView: 3, spaceBetween: 18 },
                            1024: { slidesPerView: 4, spaceBetween: 20 },
                        }}
                        options={{
                            speed: 800,
                            grabCursor: true,
                        }}
                    />
                </div>

            </div>
        </section>
    );
};

export default NewProducts;
