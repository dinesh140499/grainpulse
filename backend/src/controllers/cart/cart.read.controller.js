const asyncHandler = require('../../utils/asyncHandler')
const cartService = require('../../services/cart/cart.read.service')

exports.getCart = asyncHandler(async (req, res) => {
    const cart = await cartService.getCart(req.user._id)

    console.log(cart)

    res.status(200).json({
        success: true,
        cart
    })
})
