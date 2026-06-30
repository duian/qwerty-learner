import { FavoriteService } from "../services/favorite.service";
import type { Request, Response, NextFunction } from "express";

const favoriteService = new FavoriteService();

export class FavoriteController {
  getAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const dictId = req.query.dictId as string | undefined;
      const favorites = await favoriteService.findAll(dictId);
      res.json({ success: true, data: favorites });
    } catch (err) {
      next(err);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { wordId, dictId } = req.body;
      if (!wordId || !dictId) {
        return res
          .status(400)
          .json({ success: false, message: "wordId and dictId are required" });
      }
      await favoriteService.create(wordId, dictId);
      res.status(201).json({ success: true });
    } catch (err) {
      next(err);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id);
      await favoriteService.delete(id);
      res.json({ success: true });
    } catch (err) {
      next(err);
    }
  };
}
