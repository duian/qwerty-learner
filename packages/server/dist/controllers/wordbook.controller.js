import { WordbookService } from "../services/wordbook.service";
const wordbookService = new WordbookService();
export class WordbookController {
  constructor() {
    this.getAll = async (_req, res, next) => {
      try {
        const wordbooks = await wordbookService.findAll();
        res.json({ success: true, data: wordbooks });
      } catch (err) {
        next(err);
      }
    };
    this.create = async (req, res, next) => {
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
    this.update = async (req, res, next) => {
      try {
        const id = parseInt(req.params.id);
        const { name, description } = req.body;
        await wordbookService.update(id, { name, description });
        res.json({ success: true });
      } catch (err) {
        next(err);
      }
    };
    this.delete = async (req, res, next) => {
      try {
        const id = parseInt(req.params.id);
        await wordbookService.delete(id);
        res.json({ success: true });
      } catch (err) {
        next(err);
      }
    };
    this.getWords = async (req, res, next) => {
      try {
        const wordbookId = parseInt(req.params.id);
        const words = await wordbookService.getWords(wordbookId);
        const parsed = words.map((w) => ({ ...w, trans: JSON.parse(w.trans) }));
        res.json({ success: true, data: parsed });
      } catch (err) {
        next(err);
      }
    };
    this.addWord = async (req, res, next) => {
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
    this.removeWord = async (req, res, next) => {
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
}
