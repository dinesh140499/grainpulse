const Cart = require('../../models/cartSchema')

class CartRepository {
    async findCartById(cartId) {
        return await Cart.findById(cartId)
    }

    async deleteCart(cartId) {
        return await Cart.deleteOne({_id: cartId})
    }

    async 
}

module.exports = new CartRepository()