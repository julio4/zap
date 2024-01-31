import express, { type Router } from 'express'
import {
  getUserBalance,
  getUserNftVolumeSales,
  verifyEnsHolder,
  verifyFarcasterHolder,
  verifyLensHolder,
  verifyNftHolder,
  verifyPoapHolder,
  verifyXMTPenabled
} from '../controllers/evmController.js'
import {
  validateParams,
  erc20AddressArg,
  nftAddressArg,
  poapIdArg,
  blockchainArg
} from '../middlewares/paramsValidations.js'

const router: Router = express.Router()

router.post(
  '/balance',
  erc20AddressArg,
  blockchainArg,
  validateParams,
  getUserBalance
)
router.post('/ens', validateParams, verifyEnsHolder)
router.post('/farcaster', validateParams, verifyFarcasterHolder)
router.post('/lens', validateParams, verifyLensHolder)
router.post(
  '/nft',
  nftAddressArg,
  blockchainArg,
  validateParams,
  verifyNftHolder
)
router.post('/poap', poapIdArg, validateParams, verifyPoapHolder)
router.post('/totalNftVolume', validateParams, getUserNftVolumeSales)
router.post('/xmtpEnabled', validateParams, verifyXMTPenabled)

export default router
