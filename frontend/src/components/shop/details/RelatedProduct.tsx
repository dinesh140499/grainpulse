import ReusableSwiper from '../../ReusableSwiper';
import { FaStar, FaShoppingBag, FaLeaf } from 'react-icons/fa';
import pulse from '../../../assets/images/products/pulse.png';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { get } from '../../../baseUrl';
import { useDispatch } from 'react-redux';
import { addToCart } from '../../../features/cartSlice';
import { setButton } from '../../../features/commonSlice';
import { useAddToCart } from '../../../hooks/useCart';

const RelatedProduct = () => {
  const dispatch = useDispatch();
  const addToCartMutation = useAddToCart();

  // Query products from live database
  const { data: apiData } = useQuery({
    queryKey: ['relatedProducts'],
    queryFn: () => get('default', 'products?limit=8'),
    retry: 1,
  });

  const products = apiData?.products || [];

  if (products.length === 0) {
    return null;
  }

  const slides = products.map((item: any) => {
    const price = item.pricing?.sellingPrice || 0;
    const originalPrice = item.pricing?.mrp || price;
    const discount = originalPrice > price ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0;
    const image = item.images?.[0]?.url || pulse;
    const weight = item.specifications?.weight || "1 Kg";
    const category = item.category?.name || "Organic";
    const rating = item.rating?.average || 5.0;
    const reviews = item.rating?.totalReviews || 0;

    const handleAddToCart = (e: React.MouseEvent) => {
      e.preventDefault();
      const targetId = String(item._id);
      dispatch(addToCart({
        id: targetId,
        name: item.name,
        price,
        originalPrice,
        weight,
        image,
        quantity: 1,
      }));
      addToCartMutation.mutate({ productId: targetId, quantity: 1 });
      dispatch(setButton({ cart: true }));
    };

    return (
      <div key={item._id} className="p-1">
        <div className="bg-white rounded-2xl border border-slate-100 p-3.5 sm:p-4 shadow-xs hover:shadow-lg hover:border-emerald-300 transition-all duration-300 card-hover-effect flex flex-col justify-between h-full">
          <div>
            <Link to={`/categories/${item._id}`} className="block relative h-36 sm:h-44 w-full bg-slate-50 rounded-xl overflow-hidden mb-3 p-2">
              {item.isBestSeller && (
                <span className="absolute top-2 left-2 bg-emerald-800 text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded-md shadow-xs z-10">
                  Best Seller
                </span>
              )}
              {discount > 0 && (
                <span className="absolute top-2 right-2 bg-amber-500 text-emerald-950 text-[10px] font-extrabold px-2 py-0.5 rounded-md z-10">
                  {discount}% OFF
                </span>
              )}
              <img
                src={image}
                className="h-full w-full object-contain hover:scale-108 transition-transform duration-300"
                alt={item.name}
              />
            </Link>

            <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
              <span>{category}</span>
              <span className="font-semibold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
                {weight}
              </span>
            </div>

            <Link to={`/categories/${item._id}`} className="block">
              <h3 className="text-xs sm:text-sm font-bold text-slate-800 line-clamp-2 min-h-[36px] hover:text-emerald-800 transition">
                {item.name}
              </h3>
            </Link>

            <div className="flex items-center gap-1.5 mt-2">
              <div className="flex items-center text-amber-400 text-xs">
                <FaStar />
              </div>
              <span className="text-xs font-bold text-slate-700">{rating}</span>
              <span className="text-[11px] text-slate-400">({reviews})</span>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
            <div>
              <div className="text-sm sm:text-base font-extrabold text-emerald-900 leading-none">
                ₹{price}
              </div>
              {originalPrice > price && (
                <div className="text-[11px] text-slate-400 line-through mt-0.5">
                  ₹{originalPrice}
                </div>
              )}
            </div>
            <button 
              onClick={handleAddToCart}
              className="bg-emerald-800 hover:bg-emerald-900 active:scale-95 text-white p-2 rounded-xl text-xs font-semibold shadow-xs hover:shadow-md transition duration-150 flex items-center justify-center cursor-pointer"
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
    <section className="py-10 border-t border-slate-200/80">
      <div className="max-w-[95%] mx-auto w-full">
        <div className="flex items-center justify-between pb-6">
          <div>
            <div className="flex items-center gap-1.5 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-1">
              <FaLeaf className="text-amber-500" />
              <span>Related Harvest</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
              Frequently Bought Together
            </h2>
          </div>
        </div>

        <div className="relative">
          <ReusableSwiper
            slides={slides}
            loop={slides.length > 3}
            autoplay={{ delay: 5000, disableOnInteraction: false }}
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

export default RelatedProduct;