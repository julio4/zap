import express, { type Router } from 'express'
import {
  ethereumAddressArg,
} from '../middlewares/paramsValidations.js'
import { zapMiddleware, evmMiddleware } from '../middlewares/index.js'

import evmEndpoints from './evmEndpoints.js'
import listEndpoints from './listEndpoints.js'

const router: Router = express.Router()

router.use('/list', ethereumAddressArg, listEndpoints)

// Notice: Only /evm endpoints use ZapMiddleware
router.use(
  '/evm',
  zapMiddleware,
  evmMiddleware,
  // ethereumAddressArg, We don't use this middleware because eth address is already validated by EvmMiddleware
  evmEndpoints
)

export default router
