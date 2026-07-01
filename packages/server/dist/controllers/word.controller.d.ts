import type { Request, Response, NextFunction } from "express";
export declare class WordController {
  getByChapter: (
    req: Request,
    res: Response,
    next: NextFunction
  ) => Promise<void>;
  search: (
    req: Request,
    res: Response,
    next: NextFunction
  ) => Promise<Response<any, Record<string, any>> | undefined>;
}
