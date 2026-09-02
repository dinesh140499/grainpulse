const Cart = require('../../models/cartSchema')

class CartRepository {
    async getCartByUser(userId) {
        return await Cart.findOne({ user: userId }).populate('items.product', "name slug sku pricing images inventory isActive");
    }

    async findCartByUserId(userId){
        return await Cart.findOne({ user: userId })
    }
}

module.exports = new CartRepository();