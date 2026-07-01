import { FavoriteService } from "../services/favorite.service";
const favoriteService = new FavoriteService();
export class FavoriteController {
  constructor() {
    this.getAll = async (req, res, next) => {
      try {
        const dictId = req.query.dictId;
        const favorites = await favoriteService.findAll(dictId);
        res.json({ success: true, data: favorites });
      } catch (err) {
        next(err);
      }
    };
    this.create = async (req, res, next) => {
      try {
        const { wordId, dictId } = req.body;
        if (!wordId || !dictId) {
          return res.status(400).json({
            success: false,
            message: "wordId and dictId are required",
          });
        }
        await favoriteService.create(wordId, dictId);
        res.status(201).json({ success: true });
      } catch (err) {
        next(err);
      }
    };
    this.delete = async (req, res, next) => {
      try {
        const id = parseInt(req.params.id);
        await favoriteService.delete(id);
        res.json({ success: true });
      } catch (err) {
        next(err);
      }
    };
  }
}
