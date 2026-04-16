import mongoose, { Document, Schema } from "mongoose";

export interface IPreference extends Document {
    id: string;
    label: string;
    examples: string[];
}

const preferenceSchema = new Schema<IPreference>({
    id: { type: String, required: true, unique: true, trim: true },
    label: { type: String, required: true, trim: true },
    examples: { type: [String], default: [] },
});

export default mongoose.model<IPreference>("Preference", preferenceSchema);
