import express from "express";
const router = express.Router();
import userProtect from "../middleware/authMiddleware";
import {
  createUser,
  loginUser,
  registerAdmin,
  loginAdmin,
  getUsers,
  deleteUser,
} from "../controllers/authController";
router.route("/register").post(createUser);
router.route("/login").post(loginUser);
router.route("/register-admin").post(registerAdmin);
router.route("/login-admin").post(loginAdmin);
router.route("/").get(userProtect, getUsers);
router.route("/delete/:id").delete(userProtect, deleteUser);

export default router;
