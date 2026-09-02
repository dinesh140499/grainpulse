import { useState, useEffect, type JSX } from 'react';
import pulse from '../../../assets/images/products/pulse.png';
import { FaInstagram, FaStar, FaFacebookF, FaWhatsapp, FaShieldAlt, FaTruck } from 'react-icons/fa';
import { FaXTwitter, FaRegHeart, FaHeart } from "react-icons/fa6";
import { Link, useParams } from 'react-router-dom';
import { HiOutlineShoppingBag, HiOutlineSparkles } from "react-icons/hi2";
import { useDispatch, useSelector } from "react-redux";
import { setButton } from "../../../features/commonSlice";
import { useQuery } from '@tanstack/react-query';
import { get } from '../../../baseUrl';

import { addToCart } from '../../../features/cartSlice';
import { toggleWishlist } from '../../../features/wishlistSlice';
import { useAddToCart } from '../../../hooks/useCart';
import type { RootState } from '../../../store/store';
import SEO from '../../common/SEO';

type SocialType = {
  name: string;
  link: string;
  icon: JSX.Element;
};

const socialLinks: SocialType[] = [
  { name: "WhatsApp", link: "https://whatsapp.com", icon: <FaWhatsapp /> },
  { name: "Instagram", link: "https://instagram.com", icon: <FaInstagram /> },
  { name: "Facebook", link: "https://facebook.com", icon: <FaFacebookF /> },
  { name: "Twitter", link: "https://twitter.com", icon: <FaXTwitter /> },
];

import ProductDetailsSkeleton from './ProductDetailsSkeleton';

const ProductView = () => {
  const { productId } = useParams<{ productId: string }>();
  const dispatch = useDispatch();
  const wishlistItems = useSelector((state: RootState) => state.auth ? state.wishlist?.items || [] : []);

  // Fetch product directly from backend API with automatic retry & cache
  const { data: apiData, isLoading, isError, refetch } = useQuery({
    queryKey: ['product', productId],
    queryFn: () => get('default', `products/${productId}`),
    enabled: Boolean(productId && productId !== 'undefined'),
    staleTime: 1000 * 60 * 5, // 5 minutes fresh cache
    retry: 2,
  });

  const product = apiData?.product;

  const name = product?.name || "";
  const price = product?.pricing?.sellingPrice || 0;
  const originalPrice = product?.pricing?.mrp || price;
  const discount = originalPrice > price ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0;
  const categoryName = product?.category?.name || "Organic";
  const rating = product?.rating?.average || 5.0;
  const reviews = product?.rating?.totalReviews || 0;
  const description = product?.description || "100% natural, farm-fresh certified organic harvest.";
  const packWeights = product?.specifications?.availableWeights || ["500 g", "1 Kg", "2 Kg", "5 Kg"];

  const galleryImages: string[] = product?.images && product.images.length > 0
    ? product.images.map((img: any) => img.url)
    : [pulse];

  const [mainImage, setMainImage] = useState<string>(galleryImages[0]);
  const [quantity, setQuantity] = useState<number>(1);
  const [selectedWeight, setSelectedWeight] = useState<string>(product?.specifications?.weight || "1 Kg");

  // Sync main image and weight when product loads
  useEffect(() => {
    if (product?.images && product.images.length > 0) {
      setMainImage(product.images[0].url);
    } else {
      setMainImage(pulse);
    }
    if (product?.specifications?.weight) {
      setSelectedWeight(product.specifications.weight);
    }
  }, [product]);

  const addToCartMutation = useAddToCart();

  const isWishlisted = wishlistItems.some((item: any) => String(item.id) === String(productId));

  const handleCart = () => {
    if (!product) return;
    const targetId = String(productId || product._id);
    dispatch(addToCart({
      id: targetId,
      name,
      price,
      originalPrice,
      weight: selectedWeight,
      image: mainImage || pulse,
      quantity,
    }));
    addToCartMutation.mutate({ productId: targetId, quantity });
    dispatch(setButton({ cart: true }));
  };

  const handleToggleWishlist = () => {
    if (!product) return;
    dispatch(toggleWishlist({
      id: productId || product._id,
      name,
      price,
      originalPrice,
      weight: selectedWeight,
      category: categoryName,
      image: mainImage || pulse,
      rating,
      inStock: true,
    }));
  };

  if (isLoading) {
    return <ProductDetailsSkeleton />;
  }

  if (isError || !product) {
    return (
      <div className="py-16 text-center max-w-md mx-auto space-y-4">
        <div className="h-16 w-16 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto text-2xl text-amber-600">
          🔍
        </div>
        <h2 className="text-xl font-bold text-slate-900">Product Not Found</h2>
        <p className="text-xs text-slate-500">
          We couldn't load this product right now. It might be due to a temporary network issue.
        </p>
        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            onClick={() => refetch()}
            className="bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs py-2.5 px-6 rounded-xl shadow-xs transition cursor-pointer"
          >
            Try Again
          </button>
          <Link
            to="/shop"
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs py-2.5 px-6 rounded-xl transition"
          >
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  const productJsonLd = product ? {
    '@context': 'https://schema.org/',
    '@type': 'Product',
    name: name,
    image: galleryImages,
    description: description,
    sku: product._id,
    brand: {
      '@type': 'Brand',
      name: 'GrainPulse'
    },
    category: categoryName,
    offers: {
      '@type': 'Offer',
      url: `https://grainpulse.com/categories/${productId}`,
      priceCurrency: 'INR',
      price: price,
      priceValidUntil: '2027-12-31',
      availability: product?.inventory?.stockStatus === 'Out Of Stock'
        ? 'https://schema.org/OutOfStock'
        : 'https://schema.org/InStock',
      itemCondition: 'https://schema.org/NewCondition'
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: rating || 5.0,
      reviewCount: reviews || 18
    }
  } : undefined;

  return (
    <div className="py-6 sm:py-10">
      {product && (
        <SEO
          title={`${name} - Pure Organic ${categoryName}`}
          description={`${description} Order fresh ${name} online at the best price from GrainPulse.`}
          canonicalUrl={`/categories/${productId}`}
          ogImage={mainImage || galleryImages[0]}
          ogType="product"
          jsonLd={productJsonLd}
        />
      )}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">

        {/* Left: Gallery (6 cols) */}
        <div className="lg:col-span-6 flex flex-col-reverse sm:flex-row gap-4">
          {/* Thumbnails */}
          {galleryImages.length > 1 && (
            <div className="flex sm:flex-col gap-3 justify-center sm:justify-start">
              {galleryImages.map((item: string, i: number) => (
                <button
                  key={i}
                  type="button"
                  className={`h-16 w-16 sm:h-20 sm:w-20 rounded-2xl p-1.5 bg-white border-2 cursor-pointer transition-all duration-200 ${mainImage === item
                      ? 'border-emerald-700 shadow-md scale-105'
                      : 'border-slate-200 hover:border-emerald-300'
                    }`}
                  onClick={() => setMainImage(item)}
                >
                  <img src={item} className="h-full w-full object-contain" alt={`Thumbnail ${i + 1}`} />
                </button>
              ))}
            </div>
          )}

          {/* Main Image Showcase */}
          <div className="relative flex-1 h-[320px] sm:h-[420px] bg-slate-50/80 rounded-3xl p-6 border border-slate-100 flex items-center justify-center overflow-hidden">
            <div className="absolute top-4 left-4 flex flex-col gap-1.5 z-10">
              <span className="bg-emerald-800 text-amber-300 text-xs font-bold px-3 py-1 rounded-full shadow-xs">
                100% Farm Fresh
              </span>
              {discount > 0 && (
                <span className="bg-amber-500 text-emerald-950 text-xs font-extrabold px-3 py-1 rounded-full shadow-xs">
                  {discount}% OFF
                </span>
              )}
            </div>

            <img
              src={mainImage}
              alt={name}
              className="max-h-full max-w-full object-contain hover:scale-105 transition-transform duration-300"
            />
          </div>
        </div>

        {/* Right: Product Details & Buying Actions (6 cols) */}
        <div className="lg:col-span-6 space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider bg-emerald-100/70 px-3 py-0.5 rounded-full">
                {categoryName}
              </span>
              <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
                <HiOutlineSparkles /> Verified Organic
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
              {name}
            </h1>

            {/* Rating & In-Stock */}
            <div className="flex items-center gap-4 mt-3">
              <div className="flex items-center gap-1 bg-amber-50 text-amber-700 px-2.5 py-1 rounded-lg text-xs font-bold border border-amber-200/60">
                <FaStar className="text-amber-500" />
                <span>{rating}</span>
                <span className="text-slate-400 font-normal">({reviews} reviews)</span>
              </div>
              <span className="h-4 w-[1px] bg-slate-200"></span>
              <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700">
                <span className="h-2 w-2 rounded-full bg-emerald-600 animate-pulse"></span>
                In Stock & Farm Fresh
              </span>
            </div>
          </div>

          {/* Pricing */}
          <div className="flex items-baseline gap-3 p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100/80">
            <span className="text-3xl font-black text-emerald-950 font-heading">
              ₹{price * quantity}
            </span>
            {originalPrice > price && (
              <>
                <span className="text-sm text-slate-400 line-through font-semibold">
                  ₹{originalPrice * quantity}
                </span>
                <span className="text-xs font-bold text-amber-700 bg-amber-100/80 px-2 py-0.5 rounded-md">
                  Save ₹{(originalPrice - price) * quantity}
                </span>
              </>
            )}
          </div>

          {/* Short Description */}
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            {description}
          </p>

          {/* Pack Size Selector */}
          {packWeights && packWeights.length > 0 && (
            <div>
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
                Select Pack Size: <strong className="text-emerald-800">{selectedWeight}</strong>
              </span>
              <div className="flex flex-wrap gap-2.5">
                {packWeights.map((w: string) => (
                  <button
                    key={w}
                    type="button"
                    onClick={() => setSelectedWeight(w)}
                    className={`py-2 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer ${selectedWeight === w
                        ? "bg-emerald-800 text-white shadow-md shadow-emerald-900/20 scale-102"
                        : "bg-white text-slate-700 border border-slate-200 hover:border-emerald-300"
                      }`}
                  >
                    {w}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity & CTA Buttons */}
          <div className="flex flex-wrap items-center gap-4 pt-2">
            {/* Quantity Counter */}
            <div className="flex items-center border border-slate-200 rounded-2xl p-1 bg-white shadow-2xs">
              <button
                type="button"
                onClick={() => quantity > 1 && setQuantity(quantity - 1)}
                className="h-9 w-9 rounded-xl flex items-center justify-center text-slate-600 hover:bg-slate-100 text-base font-bold transition cursor-pointer"
              >
                -
              </button>
              <span className="px-4 font-extrabold text-sm text-slate-800 font-heading">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity(quantity + 1)}
                className="h-9 w-9 rounded-xl flex items-center justify-center text-slate-600 hover:bg-slate-100 text-base font-bold transition cursor-pointer"
              >
                +
              </button>
            </div>

            {/* Add To Cart */}
            <button
              type="button"
              onClick={handleCart}
              className="flex-1 bg-emerald-800 hover:bg-emerald-900 active:scale-98 text-white font-bold py-3 px-6 rounded-2xl text-xs sm:text-sm shadow-md shadow-emerald-900/20 flex items-center justify-center gap-2 cursor-pointer transition duration-150"
            >
              <HiOutlineShoppingBag className="text-lg text-amber-300" />
              <span>Add to Harvest Bag</span>
            </button>

            {/* Wishlist Button */}
            <button
              type="button"
              onClick={handleToggleWishlist}
              className={`h-12 w-12 rounded-2xl border flex items-center justify-center text-lg transition cursor-pointer ${isWishlisted
                  ? "bg-red-50 border-red-200 text-red-500 shadow-2xs"
                  : "bg-white border-slate-200 text-slate-400 hover:text-red-500 hover:border-red-200"
                }`}
              aria-label="Add to Wishlist"
            >
              {isWishlisted ? <FaHeart /> : <FaRegHeart />}
            </button>
          </div>

          {/* Trust Badges */}
          <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-100 text-[11px] text-slate-600 font-medium">
            <div className="flex items-center gap-2">
              <FaTruck className="text-emerald-700 text-sm shrink-0" />
              <span>2-Hour Express Delivery</span>
            </div>
            <div className="flex items-center gap-2">
              <FaShieldAlt className="text-emerald-700 text-sm shrink-0" />
              <span>100% Quality Guaranteed</span>
            </div>
          </div>

          {/* Share on Socials */}
          <div className="flex items-center gap-3 pt-2">
            <span className="text-xs font-semibold text-slate-400">Share:</span>
            <div className="flex items-center gap-2">
              {socialLinks.map((item, idx) => (
                <Link
                  key={idx}
                  to={item.link}
                  target="_blank"
                  rel="noreferrer"
                  className="h-8 w-8 rounded-full bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 text-slate-600 flex items-center justify-center text-xs transition"
                >
                  {item.icon}
                </Link>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default ProductView;