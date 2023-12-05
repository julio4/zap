import Koa from 'koa';
import cors from '@koa/cors';
import Router from '@koa/router';
import { koaBody } from 'koa-body';
import helmet from 'koa-helmet';
import {
  errorHandler,
  logger,
  signResponse,
  verifyEthereumSignature,
} from './middlewares/index.js';
import {
  getUserBalance,
  getUserNftVolumeSales,
  verifyEnsHolder,
  verifyFarcasterHolder,
  verifyLensHolder,
  verifyNftHolder,
  verifyPoapHolder,
  verifyXMTPenabled,
} from './endpoints.js';
import { init } from "@airstack/node";
import * as dotenv from 'dotenv';

dotenv.config();
if (!process.env.AIRSTACK_API_KEY) {
  throw new Error('AIRSTACK_API_KEY not set');
}

init(process.env.AIRSTACK_API_KEY);

/**
 * Returns a Koa application instance with middleware and routes configured.
 * @returns {Promise<Koa>} A Promise that resolves to a Koa application instance.
 */
export const getApp = async (): Promise<Koa> => {
  const app = new Koa();
  const router = new Router();

  router.prefix('/api');
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
    .use(verifyEthereumSignature) // also set ctx.state TODO maybe move in a separate middleware?
    .use(signResponse)
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
