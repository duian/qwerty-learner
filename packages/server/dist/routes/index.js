import { DictionaryController } from "../controllers/dictionary.controller";
import { FavoriteController } from "../controllers/favorite.controller";
import { WordbookController } from "../controllers/wordbook.controller";
import { WordController } from "../controllers/word.controller";
import { Router } from "express";
const router = Router();
const dictionaryController = new DictionaryController();
const wordController = new WordController();
const favoriteController = new FavoriteController();
const wordbookController = new WordbookController();
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
export { router };
