import { Request, Response, NextFunction } from "express";
import { UserService } from "../service/UserService";
import Container from "typedi";
import { User } from "../model/User.model";

const userService = Container.get(UserService);

/**
 * Validate that the request is authenticated
 */
export const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/login");
};

export const restrictGuest = (req: Request, res: Response, next: NextFunction) => {
  if (userService.isGuest(req.user as User)) {
    throw new Error('Guest user not permitted to perform this function');
  }
  return next();
}

export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!userService.isAdmin(req.user as User)) {
    throw new Error('User not permitted to perform this function');
  }
  return next();
}