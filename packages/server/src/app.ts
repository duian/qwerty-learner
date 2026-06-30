import { errorHandler } from "./middlewares/error-handler";
import { router } from "./routes/index";
import cors from "cors";
import express from "express";

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/v1", router);
app.use(errorHandler);

export { app };
