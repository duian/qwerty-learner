import { WordService } from "../services/word.service";
import type { Request, Response, NextFunction } from "express";

const wordService = new WordService();

export class WordController {
  getByChapter = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const chapter = parseInt(req.query.chapter as string) || 0;
      const pageSize = parseInt(req.query.pageSize as string) || 20;

      const words = await wordService.findByChapter(id, chapter, pageSize);
      // Parse trans JSON string to array
      const parsed = words.map((w) => ({
        ...w,
        trans: JSON.parse(w.trans),
      }));
      res.json({ success: true, data: parsed });
    } catch (err) {
      next(err);
    }
  };

  search = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const keyword = (req.query.keyword as string) || "";
      if (!keyword.trim()) {
        return res.json({ success: true, data: [] });
      }
      const words = await wordService.search(id, keyword);
      const parsed = words.map((w) => ({
        ...w,
        trans: JSON.parse(w.trans),
      }));
      res.json({ success: true, data: parsed });
    } catch (err) {
      next(err);
    }
  };
}
