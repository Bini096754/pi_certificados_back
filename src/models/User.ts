import { Schema, model, Document } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  role: "student" | "coordinator";
  password: string;
  totalHours: number;
}

// Corrigido: Adicionado <IUser> para vincular a interface ao Schema do Mongoose
const userSchema = new Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, select: false },
  role: { type: String, enum: ["student", "coordinator"], required: true },
  totalHours: { type: Number, default: 0 },
});

export const User = model<IUser>("User", userSchema);
