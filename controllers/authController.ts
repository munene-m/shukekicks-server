import Auth from "../models/auth";
import { Request, Response } from "express";
import logger from "../helpers/logging";
import {
  validateUserFields,
  validateLoginFields,
  validateAdminRegistration,
} from "../helpers/validator";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { ObjectId } from "mongoose";

const bcryptSalt = process.env.BCRYPT_SALT;

export async function createUser(req: Request, res: Response) {
  try {
    const { username, email, password } = req.body;

    const validationError = validateUserFields(email, password);
    if (validationError) {
      return res.status(400).json(validationError);
    }

    const userExists = await Auth.findOne({ email });
    if (userExists) {
      return res.status(403).json({ message: "Forbiden. User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, Number(bcryptSalt));

    const user = await Auth.create({
      username,
      email,
      password: hashedPassword,
    });
    if (user) {
      res.status(201).json({
        _id: user.id,
        username: user.username,
        email: user.email,
        token: generateToken(user.id),
      });
      logger.info(`User - ${email} account created successfully`);
    }
  } catch (error) {
    logger.error("Error occurred when creating account: ", error);
    return res.status(400).json(error);
  }
}

export async function loginUser(req: Request, res: Response) {
  try {
    const { email, password } = req.body;

    const validationError = validateLoginFields(email, password);
    if (validationError) {
      return res.status(400).json({ error: validationError });
    }
    const user = await Auth.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ message: "Invalid password" });
    }
    const token = generateToken(user.id);
    res.status(200).json({
      _id: user.id,
      email: user.email,
      token,
    });
    logger.info(`Successful login by ${user.email}`);
  } catch (error) {
    res.status(400).json({ message: "An error occurred." });
  }
}

export async function registerAdmin(req: Request, res: Response) {
  const { username, phoneNumber, email, password } = req.body;
  const validationError = validateAdminRegistration(
    phoneNumber,
    email,
    password
  );
  if (validationError) {
    return res.status(400).json(validationError);
  }
  try {
    const existingPhoneNumber = await Auth.findOne({ phoneNumber });
    if (existingPhoneNumber) {
      return res
        .status(403)
        .json({ message: "Forbidden. Phone number already exists" });
    }
    const userExists = await Auth.findOne({ email });
    if (userExists) {
      return res.status(403).json({ message: "Forbiden. User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, Number(bcryptSalt));

    const admin = new Auth({
      username: username,
      email: email,
      password: hashedPassword,
      phoneNumber: phoneNumber,
      isAdmin: true,
    });
    await admin.save();
    logger.info(`Admin account created - ${admin.email}`);

    res.status(201).json({
      _id: admin.id,
      username: admin.username,
      email: admin.email,
      phoneNumber: admin.phoneNumber,
      isAdmin: admin.isAdmin,
      token: generateToken(admin.id),
    });
  } catch (error) {
    logger.error("Error registering admin:", error);
    res
      .status(400)
      .json({ message: "An error occurred while registering admin" });
  }
}

export async function loginAdmin(req: Request, res: Response) {
  try {
    const { email, password } = req.body;

    const validationError = validateLoginFields(email, password);
    if (validationError) {
      return res.status(400).json({ error: validationError });
    }
    const user = await Auth.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ message: "Invalid password" });
    }
    const token = generateToken(user.id);
    res.status(200).json({
      _id: user.id,
      email: user.email,
      isAdmin: user.isAdmin,
      token,
    });
    logger.info(`Successful admin login by ${user.email}`);
  } catch (error) {
    res.status(400).json({ message: "An error occurred." });
  }
}

export async function getUsers(req: Request, res: Response) {
  try {
    const items = await Auth.find().select("-password");

    res.status(200).json(items);
  } catch (error) {
    logger.error("There are no users at this time");
    res.status(400).json({ message: "There are no users at this time" });
  }
}

export async function deleteUser(req: Request, res: Response) {
  try {
    const user = await Auth.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: "User not found " });
    } else {
      await Auth.findByIdAndDelete(req.params.id);
      logger.info(`User - ${user.username} deleted successfully`);
      res
        .status(200)
        .json({
          message: `User - ${user.username}'s account deleted successfully`,
        });
    }
  } catch (error) {
    logger.error("User not found");
    res.status(400).json({ message: "User not found" });
  }
}

const generateToken = (id: ObjectId) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || "", {
    expiresIn: "1d",
  });
};
