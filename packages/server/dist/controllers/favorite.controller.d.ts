import type { Request, Response, NextFunction } from "express";
export declare class FavoriteController {
  getAll: (req: Request, res: Response, next: NextFunction) => Promise<void>;
  create: (
    req: Request,
    res: Response,
    next: NextFunction
  ) => Promise<Response<any, Record<string, any>> | undefined>;
  delete: (req: Request, res: Response, next: NextFunction) => Promise<void>;
}
