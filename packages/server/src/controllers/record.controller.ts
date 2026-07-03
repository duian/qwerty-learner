import { RecordService } from "../services/record.service";
import type { Request, Response, NextFunction } from "express";

const recordService = new RecordService();

export class RecordController {
  addWordRecord = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { word, dict, chapter, timing, wrongCount, mistakes, timeStamp } =
        req.body;
      if (!word || !dict) {
        return res
          .status(400)
          .json({ success: false, message: "word and dict are required" });
      }
      const id = await recordService.addWordRecord({
        word,
        dict,
        chapter: chapter ?? null,
        timing: timing || [],
        wrongCount: wrongCount || 0,
        mistakes: mistakes || {},
        timeStamp: timeStamp || Date.now(),
      });
      res.status(201).json({ success: true, data: { id } });
    } catch (err) {
      next(err);
    }
  };

  getWordErrors = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const dict = req.query.dict as string | undefined;
      const records = await recordService.getWordRecordsWithErrors(dict);
      res.json({ success: true, data: records });
    } catch (err) {
      next(err);
    }
  };

  deleteWordRecords = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { word, dict } = req.query as { word: string; dict: string };
      if (!word || !dict) {
        return res
          .status(400)
          .json({ success: false, message: "word and dict are required" });
      }
      await recordService.deleteWordRecordsByWordAndDict(word, dict);
      res.json({ success: true });
    } catch (err) {
      next(err);
    }
  };

  addChapterRecord = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const id = await recordService.addChapterRecord(req.body);
      res.status(201).json({ success: true, data: { id } });
    } catch (err) {
      next(err);
    }
  };

  getChapterRecords = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { dict, chapter } = req.query as {
        dict?: string;
        chapter?: string;
      };
      const records = await recordService.getChapterRecords(
        dict,
        chapter !== undefined ? Number(chapter) : undefined
      );
      res.json({ success: true, data: records });
    } catch (err) {
      next(err);
    }
  };

  getLatestReview = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const dict = req.query.dict as string;
      if (!dict) {
        return res
          .status(400)
          .json({ success: false, message: "dict is required" });
      }
      const record = await recordService.getLatestReviewRecord(dict);
      res.json({ success: true, data: record });
    } catch (err) {
      next(err);
    }
  };

  upsertReview = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = await recordService.upsertReviewRecord(req.body);
      res.status(201).json({ success: true, data: { id } });
    } catch (err) {
      next(err);
    }
  };
}
