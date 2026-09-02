const express = require('express')
const router = express.Router()
const { protect } = require('../../middleware/auth.middleware')
const { getCart } = require('../../controllers/cart/cart.read.controller')
const { addToCart } = require('../../controllers/cart/createCart.controller')

router.use(protect)

router.route('/')
    .get(getCart).post(addToCart)

module.exports = router