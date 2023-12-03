import express, { Router } from 'express';
import exEndpoints from './exEndpoints';

const router: Router = express.Router();

router.use('/ex', exEndpoints);

export default router;