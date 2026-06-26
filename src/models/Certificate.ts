import { Schema, model, Document } from "mongoose";
import { IUser } from "./User";

export interface ICertificate extends Document {
  title: string;
  hours: number;
  status: "pending" | "approved" | "rejected";
  studentId: Schema.Types.ObjectId | IUser;
  fileUrl: string;
  fileData: Buffer; // Dados binários do arquivo no MongoDB
  fileName: string; // Nome original do arquivo
  fileMimetype: string; // Mimetype (tipo) do arquivo (ex: application/pdf)
  createdAt: Date;
}

const certificateSchema = new Schema<ICertificate>({
  title: { type: String, required: true },
  hours: { type: Number, required: true },
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
  },
  studentId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  fileUrl: { type: String, required: true },
  fileData: { type: Buffer, required: true, select: false },
  fileName: { type: String, required: true },
  fileMimetype: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

export const Certificate = model<ICertificate>(
  "Certificate",
  certificateSchema,
);
