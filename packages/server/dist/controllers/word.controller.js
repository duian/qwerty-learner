import { WordService } from "../services/word.service";
const wordService = new WordService();
export class WordController {
  constructor() {
    this.getByChapter = async (req, res, next) => {
      try {
        const { id } = req.params;
        const chapter = parseInt(req.query.chapter) || 0;
        const pageSize = parseInt(req.query.pageSize) || 20;
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
    this.search = async (req, res, next) => {
      try {
        const { id } = req.params;
        const keyword = req.query.keyword || "";
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
}
