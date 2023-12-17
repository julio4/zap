import express, { Router } from 'express';
import exampleEndpoints from './exampleEndpoints';
import { validateParams } from '../middlewares/paramsValidations';

const router: Router = express.Router();

// This 'hello' endpoint can be used to test the connection to the server
// And the validation rules for all endpoints
router.use('/hello', validateParams, (req, res) => {
  res.send('Hello World!');
})

router.use('/example', exampleEndpoints);

export default router;