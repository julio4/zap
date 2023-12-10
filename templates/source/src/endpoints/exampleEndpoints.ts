import express, { Router } from 'express';
import { getNumber } from '../controllers/exampleController';
import { idArg, validateParams } from '../middleware/paramsValidations';

const router: Router = express.Router();

router.get('/nb', idArg, validateParams, getNumber);

export default router;
