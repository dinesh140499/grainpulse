const Cart = require('../../models/cartSchema')


class CreateCategoryRepository {
    async create(cartData) {
        const { userId, productId, quantity } = cartData;
        await Cart.create({
            user: userId,
            items: [{
                product: productId,
                quantity: quantity
            }]
        })
    }

    async save(cart) {
        return await cart.save();
    }
}

module.exports = new CreateCategoryRepository()