const cartRepository = require("../../repositories/cart/cart.read.repository");

exports.getCart = async (userId) => {
    return await cartRepository.getCartByUser(userId)
}