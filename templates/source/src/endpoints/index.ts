import express, { Router } from 'express';
import exampleEndpoints from './exampleEndpoints';
import { validateParams } from '../middleware/paramsValidations';

const router: Router = express.Router();

router.use('/', validateParams, (req, res) => {
  res.send('Hello World!');
})

router.use('/example', exampleEndpoints);

export default router;