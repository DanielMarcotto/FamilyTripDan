import mongoose, { Document, Schema } from "mongoose";

export interface IDestination extends Document {
    id: string;
    name: string;
    region: string;
    country: string;
    coordinates: {
        latitude: number;
        longitude: number;
    };
    image: string;
    description: string;
}

const destinationSchema = new Schema<IDestination>({
    id: { type: String, required: true, unique: true, trim: true },
    name: { type: String, required: true, trim: true },
    region: { type: String, required: true },
    country: { type: String, required: true },
    coordinates: {
        latitude: { type: Number, required: true },
        longitude: { type: Number, required: true },
    },
    image: { type: String, default: "" },
    description: { type: String, default: "" },
});

export default mongoose.model<IDestination>("Destination", destinationSchema);
