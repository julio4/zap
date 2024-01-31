import { type Request, type Response } from 'express'
import AirstackService from '../services/airstackService.js'
import { type ZapRequestParams } from '@zap/types'
import { type ERC20TokenBalance, type NFTTokenBalance } from 'services/airstack/types.js'

export const getListBalances = async (
  req: Request<ZapRequestParams>,
  res: Response<[ERC20TokenBalance[], ERC20TokenBalance[]]>
) => {
  const { address } = req.body.args
  const tokens = await AirstackService.getAllERC20Tokens(address)
  res.json(tokens)
}

export const getListNFTs = async (
  req: Request<ZapRequestParams>,
  res: Response<[NFTTokenBalance[], NFTTokenBalance[]]>
) => {
  const { address } = req.body.args
  const nfts = await AirstackService.getAllNftTokens(address)
  res.json(nfts)
}
