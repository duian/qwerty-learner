import { DictionaryService } from "../services/dictionary.service";
import type { Request, Response, NextFunction } from "express";

const dictionaryService = new DictionaryService();

export class DictionaryController {
  getAll = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const dictionaries = await dictionaryService.findAll();
      res.json({ success: true, data: dictionaries });
    } catch (err) {
      next(err);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const dict = await dictionaryService.findById(req.params.id);
      if (!dict) {
        return res
          .status(404)
          .json({ success: false, message: "Dictionary not found" });
      }
      res.json({ success: true, data: dict });
    } catch (err) {
      next(err);
    }
  };
}
