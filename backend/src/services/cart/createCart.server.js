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
        await cartRepository.save()
    } else {
        const itemIndex = existingCart.items.findIndex(
            (item) => item.product.toString() === productId.toString()
        );

        if (itemIndex > -1) {
            existingCart.items[itemIndex].quantity += Number(quantity);
        } else {
            existingCart.items.push({ product: productId, quantity: Number(quantity) });
        }
    }

    return await cartReadRepository.getCartByUser(userId);
};
