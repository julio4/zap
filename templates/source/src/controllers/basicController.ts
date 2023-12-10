import { Request, Response } from 'express';
// import { ...Service } from '../service/...';

export const getSomething = async (req: Request, res: Response) => {
  const id = req.params.someId;
  // const anything = await service.getSomething(...);
  // res.json(anything);
};
