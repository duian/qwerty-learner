import { DictionaryService } from "../services/dictionary.service";
const dictionaryService = new DictionaryService();
export class DictionaryController {
  constructor() {
    this.getAll = async (_req, res, next) => {
      try {
        const dictionaries = await dictionaryService.findAll();
        res.json({ success: true, data: dictionaries });
      } catch (err) {
        next(err);
      }
    };
    this.getById = async (req, res, next) => {
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
}
