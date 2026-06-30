import type { Request, Response, NextFunction } from "express";

export class DictionaryController {
  getAll = async (_req: Request, res: Response, _next: NextFunction) => {
    res.json({ success: true, data: [] });
  };

  getById = async (req: Request, res: Response, _next: NextFunction) => {
    res.json({ success: true, data: { id: req.params.id } });
  };
}
