import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const userSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: String,
    username: {
        type: String,
        required: true,
    },
    avatarUrl: {
        type: String,
        default: 'default.image',
    },
    premium: {
        type: Boolean,
        default: false,
    },
    language: {
        type: String,
        default: 'en',
    },
    theme: {
        type: String,
        default: 'light',
    },
}, { 
    versionKey: false,
    timestamps: true,
    collection: 'User'
});

const User = mongoose.model('User', userSchema);
export default User;

