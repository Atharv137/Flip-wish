import mongoose from "mongoose";
import { config } from "../server/config/env";

const connectDB = async () => {
    try {
        await mongoose.connect(config.mongoUri);
        console.log("MongoDB Connected");
    } catch (err) {
        console.log(err.message);
        process.exit(1);
    }
};

export default connectDB;
