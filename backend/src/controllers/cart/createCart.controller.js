const asyncHandler = require('../../utils/asyncHandler')
const cartService = require('../../services/cart/createCart.server')

exports.addToCart = asyncHandler(async (req, res) => {
    const { productId, quantity } = req.body

    if (!productId || !quantity) {
        return res.status(400).json({
            success: false,
            message: "Product ID and quantity are required"
        })
    }
    const cart = await cartService.addToCart(req.user._id, req.body)
    res.status(200).json({
        success: true,
        cart
    })
})