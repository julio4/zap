import Koa from 'koa';
import cors from '@koa/cors';
import Router from '@koa/router';
import { koaBody } from 'koa-body';
import helmet from 'koa-helmet';
import {
  errorHandler,
  logger,
  normalizeAddress,
  signResponse,
  verifyEthereumSignature,
} from './middlewares/index.js';
import {
  getListBalances,
  getListNFTs,
  getUserBalance,
  getUserNftVolumeSales,
  verifyEnsHolder,
  verifyFarcasterHolder,
  verifyLensHolder,
  verifyNftHolder,
  verifyPoapHolder,
  verifyXMTPenabled,
} from './endpoints.js';

import * as dotenv from 'dotenv';

dotenv.config();

const skipCertainMiddlewaresForListBalances = async (
  ctx: Koa.ParameterizedContext,
  next: () => any // eslint-disable-line @typescript-eslint/no-explicit-any
) => {
  if (ctx.path === '/api/listBalances' || ctx.path === '/api/listNFTs') {
    const { address } = ctx.request.body;
    const normalizedAddress = normalizeAddress(address);
    ctx.state.address = normalizedAddress;

    await next();
  } else {
    await verifyEthereumSignature(ctx, async () => {
      await signResponse(ctx, next);
    });
  }
};

/**
 * Returns a Koa application instance with middleware and routes configured.
 * @returns {Promise<Koa>} A Promise that resolves to a Koa application instance.
 */
export const getApp = async (): Promise<Koa> => {
  const app = new Koa();
  const router = new Router();

  router.prefix('/api');
  router.post('/listBalances', getListBalances);
  router.post('/listNFTs', getListNFTs);
  router.post('/balance', getUserBalance);
  router.post('/poap', verifyPoapHolder);
  router.post('/nft', verifyNftHolder);
  router.post('/xmtpEnabled', verifyXMTPenabled);
  router.post('/ens', verifyEnsHolder);
  router.post('/lens', verifyLensHolder);
  router.post('/farcaster', verifyFarcasterHolder);
  router.post('/totalNftVolume', getUserNftVolumeSales);
  // TODO Register new endpoints here

  app
    .use(cors())
    .use(helmet())
    .use(koaBody())
    .use(logger)
    .use(errorHandler)
    .use(skipCertainMiddlewaresForListBalances)
    .use(router.routes())
    .use(router.allowedMethods());

  return app;
};

/**
 * Starts the Oracle Koa server instance on the specified port.
 */
export const start = async () => {
  const port = process.env['PORT'] || 3030;

  const app = await getApp();
  app.listen(port);

  console.log(`Oracle server listening on port ${port}`);
};
