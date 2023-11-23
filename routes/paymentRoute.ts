import express from "express";
const router = express.Router();

import {
  makePayment,
  handleCallback,
  getCallbackResponse,
} from "../controllers/paymentController";

router.route("/stk").post(makePayment);
router.route("/callback").post(handleCallback);
router.route("/getPayments").get(getCallbackResponse);

export default router;
