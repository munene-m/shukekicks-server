import express, { Express, Request, Response } from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import helmet from "helmet";
import cors from "cors";
import { connectDB } from "./config/db";
import logger from "./helpers/logging";
import authRoute from "./routes/authRoute";
import productRoute from "./routes/productRoute";
import cartRoute from "./routes/cartRoute";
import paymentRoute from "./routes/paymentRoute";

const app = express();
const PORT = process.env.PORT || 8080;
dotenv.config();
// Middleware setup
connectDB();
app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(helmet());

app.use("/api/v1/auth", authRoute);
app.use("/api/v1/products", productRoute);
app.use("/api/v1/cart", cartRoute);
app.use("/api/v1/payment", paymentRoute);

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  // logger.info(`Server running on port ${PORT}`)
});

process.on("SIGINT", async () => {
  logger.info("Shutting down...");

  // Close any other resources or servers here
  logger.info("Goodbye!");
  process.exit(0);
});
