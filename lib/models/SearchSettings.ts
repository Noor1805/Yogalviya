import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ISearchSettings extends Document {
    categories: Array<{
        name: string;
        slug: string;
        enabled: boolean;
    }>;
    trendingSearches: string[];
    featuredProductIds: string[];
    updatedAt: Date;
}

const searchSettingsSchema = new Schema<ISearchSettings>(
    {
        categories: [
            {
                name: { type: String, required: true },
                slug: { type: String, required: true },
                enabled: { type: Boolean, default: true },
            },
        ],
        trendingSearches: [String],
        featuredProductIds: [{ type: String }],
    },
    { timestamps: true }
);

// Ensure only one document exists
searchSettingsSchema.index({}, { unique: true });

// In development, delete the model from mongoose.models so it can be re-compiled
if (process.env.NODE_ENV === 'development' && mongoose.models.SearchSettings) {
    delete mongoose.models.SearchSettings;
}

const SearchSettings: Model<ISearchSettings> =
    mongoose.models.SearchSettings || mongoose.model<ISearchSettings>('SearchSettings', searchSettingsSchema);

export default SearchSettings;
