const Cart = require('../../models/cartSchema')

class CartRepository {
    async getCartByUser(userId) {
        return await Cart.findOne({ user: userId })
    }

    async findCartByUserId(userId){
        return await Cart.findOne({ user: userId })
    }
}

module.exports = new CartRepository();