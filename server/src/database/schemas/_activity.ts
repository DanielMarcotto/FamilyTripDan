import mongoose, { Document, Schema } from "mongoose";

export interface IActivityStop {
    name: string;
    coordinates: { latitude: number; longitude: number };
    duration_minutes: number;
}

export interface IActivity extends Document {
    id: string;
    title: string;
    destination_id: string;
    age_range: string;
    duration_hours: number;
    difficulty: "easy" | "medium" | "hard";
    tags: string[];
    description: string;
    stops: IActivityStop[];
}

const stopSchema = new Schema<IActivityStop>({
    name: { type: String, required: true },
    coordinates: {
        latitude: { type: Number, required: true },
        longitude: { type: Number, required: true },
    },
    duration_minutes: { type: Number, required: true },
});

const activitySchema = new Schema<IActivity>({
    id: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    destination_id: {
        type: String,
        ref: "Destination",
        required: true,
        index: true,
    },
    age_range: { type: String, default: "" },
    duration_hours: { type: Number, default: 0 },
    difficulty: {
        type: String,
        enum: ["easy", "medium", "hard"],
        default: "easy",
    },
    tags: { type: [String], default: [] },
    description: { type: String, default: "" },
    stops: { type: [stopSchema], default: [] },
});

export default mongoose.model<IActivity>("Activity", activitySchema);
