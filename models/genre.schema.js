import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const genreSchema = new Schema({ 
    name: {
        type: String,
        required: true,
    }, 
    description: {
        type: String, 
        default: ""
    }, 
    image_url: {
        type: String, 
        default: ""
    },  
}, {
    versionKey: false, 
    timestamps: true, 
    collection: "Genre"
});

genreSchema.set("strict", true);

const Genre = mongoose.model("Genre", genreSchema);
export default Genre;
