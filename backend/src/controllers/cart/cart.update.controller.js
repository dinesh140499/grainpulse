exports.updateCart = asyncHandler(async (req, res) => {
    await cartService.updateCart(req.params.id, req.body)

    return res.status(200).json({
        success: true,
        message: "Cart updated successfully"
    })
}) 
