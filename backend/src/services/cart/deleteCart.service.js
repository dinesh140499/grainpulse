const cartRepository = require('../../repositories/cart')

exports.deleteCart = async (cartId) => {
    const cart = await cartRepository.findCartById(cartId)
    if (!cart) {
        throw new Error('Cart not found')
    }

    return await cartRepository.deleteCart(cartId)
}