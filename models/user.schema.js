import mongoose from "mongoose";
const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    googleId: {
      type: String,
      unique: true,
      sparse: true, // This allows multiple null values
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      validate: {
        validator: function(v) {
          // If no googleId, password must be present
          return this.googleId || v;
        },
        message: 'Password is required for non-Google authentication'
      }
    },
    username: {
      type: String,
      required: true,
    },
    avatar_url: {
      type: String,
      default: "default.image",
    },
    language: {
      type: String,
      default: "en",
    },
    theme: {
      type: String,
      default: "light",
    },
    dob: {
      type: Date,
      default: Date.now,
    },
  },
  {
    versionKey: false,
    timestamps: true,
    collection: "User",
  }
);

userSchema.set("strict", true);

const User = mongoose.model("User", userSchema);
export default User;