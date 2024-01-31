import { type Request, type Response, type NextFunction } from 'express'
import {
  ethereumAddressArg,
  ethereumSignatureArg
} from '../middlewares/paramsValidations.js'
import { ethers } from 'ethers'

export const normalizeAddress = (address: string) => {
  return ethers.getAddress(address)
}

// This evm middleware authenticates a request by checking a signature against a ethereum address
export const evmMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Validate both args.address and args.signature
  const validations = [ethereumAddressArg, ethereumSignatureArg]
  for (const validation of validations) {
    const result = await validation.run(req)
    if (!result.isEmpty()) {
      return res.status(400).send(result.array()[0].msg)
    }
  }

  const address = normalizeAddress(req.body.args.address)
  const { signature } = req.body.args

  // Verify the signature
  const signerAddr = normalizeAddress(
    ethers.verifyMessage(`I am ${address}`, signature)
  )

  if (address !== signerAddr) {
    return res.status(401).send('Invalid signature')
  }

  next()
}
