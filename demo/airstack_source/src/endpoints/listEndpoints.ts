import express, { type Router } from 'express'
import { getListBalances, getListNFTs } from '../controllers/listController.js'
import { validateParams } from '../middlewares/paramsValidations.js'

const router: Router = express.Router()

router.post('/balances', validateParams, getListBalances)
router.post('/nfts', validateParams, getListNFTs)

export default router
