import mongoose from "mongoose";
import { config } from "../server/config/env";

const connectDB = async () => {
    try {
        if (!config.mongoUri) {
            console.log("No MongoDB URI provided. Running with local database fallback.");
            return;
        }
        await mongoose.connect(config.mongoUri, {
            serverSelectionTimeoutMS: 5000,
        });
        console.log("MongoDB Connected");
    } catch (err) {
        console.warn("MongoDB Connection Warning:", err.message);
        // Do not call process.exit(1) so the HTTP server continues running
    }
};

export default connectDB;

