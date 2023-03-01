import { Router } from "express";
import GPTController from "../controllers/GPTController";
const router = Router();

const GPT3 = new GPTController(process.env.OPENAI_API_KEY, "text-davinci-003");

router.post('/data-extraction', GPT3.api);

export default router;
