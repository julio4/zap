import { Request, Response, NextFunction } from 'express';

export const exMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Logic
  next();
};