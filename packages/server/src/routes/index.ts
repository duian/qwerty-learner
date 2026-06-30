import { DictionaryController } from "../controllers/dictionary.controller";
import { Router } from "express";

const router = Router();
const dictionaryController = new DictionaryController();

router.get("/dictionaries", dictionaryController.getAll);
router.get("/dictionaries/:id", dictionaryController.getById);

export { router };
