import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const songSchema = new Schema({
    title: {
        type: String,
        required: true,
    },
    singer_ids: {
        type: [String],
        required: true,
    }, 
    author_ids: {
        type: [String],
        required: true,
    }, 
    genre_ids: {
        type: [String],
        required: true,
    },
    lyric: {
        type: String,
        required: true,
    },
    is_premium: {
        type: Boolean,
        default: false,
    },
    like_count: {
        type: Number,
        default: 0,
    }, 
    mp3_url: {
        type: String,
        required: true,
    },
    image_url: {
        type: String,
        required: true,
    },
}, 
{
    versionKey: false,
    timestamps: true,
    collection: 'Song',
});

songSchema.set('strict', true);

const Song = mongoose.model('Song', songSchema);
export default Song;
