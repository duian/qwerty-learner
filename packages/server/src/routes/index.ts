import { DictionaryController } from "../controllers/dictionary.controller";
import { FavoriteController } from "../controllers/favorite.controller";
import { RecordController } from "../controllers/record.controller";
import { WordbookController } from "../controllers/wordbook.controller";
import { WordController } from "../controllers/word.controller";
import { Router } from "express";

const router = Router();
const dictionaryController = new DictionaryController();
const wordController = new WordController();
const favoriteController = new FavoriteController();
const wordbookController = new WordbookController();
const recordController = new RecordController();

// Dictionaries
router.get("/dictionaries", dictionaryController.getAll);
router.get("/dictionaries/:id", dictionaryController.getById);

// Words
router.get("/dictionaries/:id/words", wordController.getByChapter);
router.get("/dictionaries/:id/words/search", wordController.search);

// Favorites
router.get("/favorites", favoriteController.getAll);
router.post("/favorites", favoriteController.create);
router.delete("/favorites/:id", favoriteController.delete);

// Wordbooks
router.get("/wordbooks", wordbookController.getAll);
router.post("/wordbooks", wordbookController.create);
router.put("/wordbooks/:id", wordbookController.update);
router.delete("/wordbooks/:id", wordbookController.delete);
router.get("/wordbooks/:id/words", wordbookController.getWords);
router.post("/wordbooks/:id/words", wordbookController.addWord);
router.delete("/wordbooks/:id/words/:wordId", wordbookController.removeWord);

// Word records
router.post("/records/word", recordController.addWordRecord);
router.get("/records/word/errors", recordController.getWordErrors);
router.delete("/records/word", recordController.deleteWordRecords);

// Chapter records
router.post("/records/chapter", recordController.addChapterRecord);
router.get("/records/chapter", recordController.getChapterRecords);

// Review records
router.get("/records/review/latest", recordController.getLatestReview);
router.post("/records/review", recordController.upsertReview);

// Record stats & queries
router.get("/records/word/range", recordController.getWordRecordsByTimeRange);
router.get("/records/counts", recordController.getRecordCounts);
router.get("/records/word/first", recordController.getFirstWordRecord);
router.get("/records/chapter/total-wrong", recordController.getTotalWrongCount);
router.get("/records/word/revision-count", recordController.getRevisionWordCount);
router.get("/records/export", recordController.exportAllRecords);

export { router };
