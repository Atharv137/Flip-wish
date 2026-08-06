import mongoose from "mongoose";

const cartSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product"
    },
    quantity: Number
}, {
    toJSON: {
        virtuals: true,
        transform: function (doc, ret) {
            ret.id = ret._id;
            // Also ensure we extract productId correctly if needed by frontend
            ret.productId = ret.product?._id || ret.product;
            ret.userId = ret.user?._id || ret.user;
            delete ret._id;
            delete ret.__v;
        }
    }
});

export default mongoose.model("Cart", cartSchema);
