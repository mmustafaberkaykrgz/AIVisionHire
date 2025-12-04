import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  totalInterviews: { type: Number, default: 0 },
  lastLogin: { type: Date },
}, { timestamps: true });
const User = mongoose.model("User", UserSchema);

export default User;
/*

User

id (PK)

name

email (unique)

passwordHash

createdAt

updatedAt

*/