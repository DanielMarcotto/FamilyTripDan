import mongoose, { Document, Schema } from "mongoose";

export interface IFavorite extends Document {
    user_id: string; // Reference to Account _id or email
    poi_id: string; // Reference to POI id
    createdAt: Date;
    updatedAt: Date;
}

const favoriteSchema = new Schema<IFavorite>(
    {
        user_id: {
            type: String,
            required: true,
            index: true,
        },
        poi_id: {
            type: String,
            required: true,
            index: true,
        },
    },
    {
        timestamps: true, // Automatically adds createdAt and updatedAt
    }
);

// Compound index to ensure one favorite per user per POI
favoriteSchema.index({ user_id: 1, poi_id: 1 }, { unique: true });

export default mongoose.model<IFavorite>("Favorite", favoriteSchema);

