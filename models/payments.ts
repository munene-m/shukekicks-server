import mongoose, { Schema } from "mongoose";

const paymentSchema = new Schema(
  {
    amount: {
      type: Number,
      trim: true,
    },
    phoneNumber: {
      type: String,
      trim: true,
    },
    paymentDetails: {
      type: Object,
    },
  },
  { timestamps: true }
);
export default mongoose.model("shukekicks-payments", paymentSchema);
