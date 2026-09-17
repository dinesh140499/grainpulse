const asyncHandler = require('../../utils/asyncHandler')
const cartService = require('../../services/')

exports.removeFromCart = asyncHandler(async (req, res) => {
    await cartService.deleteCart(req.params.id)

    return res.status(200).json({
        success: true,
        message: "Cart deleted successfully"
    })
})