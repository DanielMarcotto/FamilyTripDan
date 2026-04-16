import mongoose, { Document, Schema } from "mongoose";

export interface IPOI extends Document {
    id: string;
    name: string;
    category: string;
    address: string;
    latitude: number;
    longitude: number;
    destination_id: string;
    description: string;
    website: string;
    pictures: string[];
    environment: string;
}

const poiSchema = new Schema<IPOI>({
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    category: { type: String, required: true },
    address: { type: String, default: "" },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    destination_id: {
        type: String,
        ref: "Destination",
        required: true,
        index: true,
    },
    description: { type: String, default: "" },
    website: { type: String, default: "" },
    pictures: { type: [String], default: [] },
    environment: { type: String, default: "" },
});

export default mongoose.model<IPOI>("POI", poiSchema);
