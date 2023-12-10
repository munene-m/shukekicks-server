import { ObjectId } from "mongoose";

declare global {
  namespace Express {
    interface Request {
      admin: {};
      user: {
        id: ObjectId;
      };
    }
  }
}

export {};
