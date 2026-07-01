import type { Request, Response, NextFunction } from "express";
export declare class WordbookController {
  getAll: (_req: Request, res: Response, next: NextFunction) => Promise<void>;
  create: (
    req: Request,
    res: Response,
    next: NextFunction
  ) => Promise<Response<any, Record<string, any>> | undefined>;
  update: (req: Request, res: Response, next: NextFunction) => Promise<void>;
  delete: (req: Request, res: Response, next: NextFunction) => Promise<void>;
  getWords: (req: Request, res: Response, next: NextFunction) => Promise<void>;
  addWord: (
    req: Request,
    res: Response,
    next: NextFunction
  ) => Promise<Response<any, Record<string, any>> | undefined>;
  removeWord: (
    req: Request,
    res: Response,
    next: NextFunction
  ) => Promise<void>;
}
