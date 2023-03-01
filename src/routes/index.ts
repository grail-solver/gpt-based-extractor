import { Router } from 'express';
import gpt3Query from './gpt3_helper';

const routes = Router();

routes.use('', gpt3Query);

export { routes };
