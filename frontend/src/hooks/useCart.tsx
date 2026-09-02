import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useDispatch } from "react-redux";
import { get, post } from "../baseUrl";
import { setCartItems, type CartItem } from "../features/cartSlice";
import pulse from "../assets/images/products/pulse.png";

export const mapApiCartToRedux = (cartData: any): CartItem[] => {
  if (!cartData || !Array.isArray(cartData.items)) return [];

  return cartData.items
    .map((item: any) => {
      const product = item.product;
      if (!product) return null;

      const price =
        product.pricing?.discountPrice ||
        product.pricing?.sellingPrice ||
        product.pricing?.mrp ||
        product.price ||
        0;

      const originalPrice =
        product.pricing?.mrp || product.originalPrice || price;

      const rawImg = product.images?.[0];
      const image =
        (typeof rawImg === "string" ? rawImg : rawImg?.url) ||
        product.image ||
        pulse;

      const weight =
        product.specifications?.weight ||
        product.weight ||
        "1 Kg";

      return {
        id: String(product._id || item.product || item._id),
        name: product.name || "Product",
        weight,
        price: Number(price),
        originalPrice: Number(originalPrice),
        quantity: Number(item.quantity || 1),
        image,
      };
    })
    .filter(Boolean) as CartItem[];
};

export const useCart = () => {
  const dispatch = useDispatch();
  const hasToken = typeof window !== "undefined" && Boolean(localStorage.getItem("token"));

  return useQuery({
    queryKey: ["cart"],
    queryFn: async () => {
      const res = await get("default", "cart");
      const mapped = mapApiCartToRedux(res?.cart || res);
      dispatch(setCartItems(mapped));
      return res;
    },
    enabled: hasToken,
    retry: false,
    staleTime: 30000,
  });
};

export const useAddToCart = () => {
  const queryClient = useQueryClient();
  const dispatch = useDispatch();

  return useMutation({
    mutationFn: async ({
      productId,
      quantity = 1,
    }: {
      productId: string;
      quantity?: number;
    }) => {
      return await post("default", "cart", { productId, quantity });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      const mapped = mapApiCartToRedux(data?.cart || data);
      if (mapped.length > 0) {
        dispatch(setCartItems(mapped));
      }
    },
  });
};
