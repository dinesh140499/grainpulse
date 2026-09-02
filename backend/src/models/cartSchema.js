const mongoose = require('mongoose')

const cartItemSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true
    },
    quantity: {
        type: Number,
        default: 1,
        min: 1,
        required: true
    }
})

const cartSchema = new mongoose.Schema(
    {
        // Cart Owner
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true,
            index: true
        },

        // Cart Items
        items: {
            type: [cartItemSchema],
            default: []
        }
    },
    {
        timestamps: true,
    },
)
const cart = mongoose.model("Cart", cartSchema);

module.exports = cart;