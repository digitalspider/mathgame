import { Request, Response, NextFunction } from 'express';

export const ensureAuthenticated = function(
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (req.isAuthenticated()) {
    return next();
  } else {
    //req.flash('error_msg','You are not logged in');
    res.redirect('/login');
  }
}

export const forwardAuthenticated = function(
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (!req.isAuthenticated()) {
    return next();
  }
  res.redirect('/');
};
