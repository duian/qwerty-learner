import { WordbookService } from "../services/wordbook.service";
import type { Request, Response, NextFunction } from "express";

const wordbookService = new WordbookService();

export class WordbookController {
  getAll = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const wordbooks = await wordbookService.findAll();
      res.json({ success: true, data: wordbooks });
    } catch (err) {
      next(err);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { name, description } = req.body;
      if (!name) {
        return res
          .status(400)
          .json({ success: false, message: "name is required" });
      }
      await wordbookService.create(name, description);
      res.status(201).json({ success: true });
    } catch (err) {
      next(err);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id);
      const { name, description } = req.body;
      await wordbookService.update(id, { name, description });
      res.json({ success: true });
    } catch (err) {
      next(err);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id);
      await wordbookService.delete(id);
      res.json({ success: true });
    } catch (err) {
      next(err);
    }
  };

  getWords = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const wordbookId = parseInt(req.params.id);
      const words = await wordbookService.getWords(wordbookId);
      const parsed = words.map((w) => ({ ...w, trans: JSON.parse(w.trans) }));
      res.json({ success: true, data: parsed });
    } catch (err) {
      next(err);
    }
  };

  addWord = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const wordbookId = parseInt(req.params.id);
      const { wordId } = req.body;
      if (!wordId) {
        return res
          .status(400)
          .json({ success: false, message: "wordId is required" });
      }
      await wordbookService.addWord(wordbookId, wordId);
      res.status(201).json({ success: true });
    } catch (err) {
      next(err);
    }
  };

  removeWord = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const wordbookId = parseInt(req.params.id);
      const wordId = parseInt(req.params.wordId);
      await wordbookService.removeWord(wordbookId, wordId);
      res.json({ success: true });
    } catch (err) {
      next(err);
    }
  };
}
