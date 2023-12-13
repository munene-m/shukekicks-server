import mongoose from "mongoose";
const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
    },
    image: {
      type: String,
      required: [true, "Product image is required"],
    },
    description: {
      type: String,
      required: [true, "Product description is required"],
    },
    size: {
      type: String,
      required: [true, "Product size is required"],
    },
    price: {
      type: Number,
      required: [true, "Product price is required"],
    },
  },
  { timestamps: true }
);

export default mongoose.model("shukekicks-products", productSchema);
