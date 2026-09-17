const cartRepository = require("../../repositories/cart/createCart.repository");
const cartReadRepository = require("../../repositories/cart/cart.read.repository");
const productReadRepository = require("../../repositories/product/product.read.repository");
const ErrorHandler = require("../../utils/errorHandler");

exports.addToCart = async (userId, cartData) => {
    const { productId, quantity } = cartData;
    const existingCart = await cartReadRepository.findCartByUserId(userId);
    const productExist = await productReadRepository.findById(productId);

    if (!productExist) {
        throw new ErrorHandler("Product not found", 404);
    }

    if (!existingCart) {
        await cartRepository.create({ userId, productId, quantity: Number(quantity) });

        return {
            message: "Product added to cart successfully",
            existingCart
        }
    } else {
        const existingProduct = existingCart.items.find(
            (item) => item.product.toString() === productId.toString()
        );

        existingProduct.quantity += Number(quantity)
        await existingCart.save()

        return {
            message: "Product updated in cart successfully",
            existingCart
        }
    }

    return await cartReadRepository.getCartByUser(userId);
};
