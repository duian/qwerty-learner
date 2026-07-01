import type { Request, Response, NextFunction } from "express";
export declare class DictionaryController {
  getAll: (_req: Request, res: Response, next: NextFunction) => Promise<void>;
  getById: (
    req: Request,
    res: Response,
    next: NextFunction
  ) => Promise<Response<any, Record<string, any>> | undefined>;
}
