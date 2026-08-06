import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    name: String,
    title: String,
    description: String,
    brand: String,
    category: String,
    price: Number,
    originalPrice: Number,
    discount: Number,
    stock: Number,
    rating: { type: Number, default: 0 },
    reviews: { type: Number, default: 0 },
    image: String,
    deliveryDate: String,
    featured: Boolean
}, {
    toJSON: {
        virtuals: true,
        transform: function (doc, ret) {
            ret.id = ret._id;
            ret.title = ret.title || ret.name; // Fallback to name if title is not present
            delete ret._id;
            delete ret.__v;
        }
    }
});

export default mongoose.model("Product", productSchema);
