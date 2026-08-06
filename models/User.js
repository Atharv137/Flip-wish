import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: String,
    email: {
        type: String,
        unique: true,
        required: true,
        index: true
    },
    password: String
});

export default mongoose.model("User", userSchema);
