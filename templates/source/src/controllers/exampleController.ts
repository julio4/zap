import { Request, Response } from 'express';
import RandomService from '../service/randomService';
import { SupportedValue, ZapRequestParams } from '../types';

export const getNumber = async (req: Request<ZapRequestParams>, res: Response<SupportedValue>) => {
  const id = parseInt(req.body.args.id);
  // We can also get the mina_address that is included in every request
  // const minaAddress = req.body.mina_address;

  const number = await RandomService.getNb(id);

  res.json(number);
};
