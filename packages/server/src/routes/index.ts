import { DictionaryController } from "../controllers/dictionary.controller";
import { WordController } from "../controllers/word.controller";
import { Router } from "express";

const router = Router();
const dictionaryController = new DictionaryController();
const wordController = new WordController();

// Dictionaries
router.get("/dictionaries", dictionaryController.getAll);
router.get("/dictionaries/:id", dictionaryController.getById);

// Words
router.get("/dictionaries/:id/words", wordController.getByChapter);
router.get("/dictionaries/:id/words/search", wordController.search);

export { router };
