import mongoose from "mongoose";

const wishlistSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product"
    }
}, {
    toJSON: {
        virtuals: true,
        transform: function (doc, ret) {
            ret.id = ret._id;
            ret.productId = ret.product?._id || ret.product;
            ret.userId = ret.user?._id || ret.user;
            delete ret._id;
            delete ret.__v;
        }
    }
});

export default mongoose.model("Wishlist", wishlistSchema);
