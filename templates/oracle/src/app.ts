import Koa from 'koa';
import cors from '@koa/cors';
import Router from '@koa/router';
import { koaBody } from 'koa-body';
import helmet from 'koa-helmet';

/// Middlewares
import {
  errorHandler,
  logger,
  signResponse,
} from './middlewares';

/// Endpoints
import {
  handleHelloWorld
} from './endpoints';

import * as dotenv from 'dotenv';
dotenv.config();

/**
 * Returns a Koa application instance with middleware and routes configured.
 * @returns {Promise<Koa>} A Promise that resolves to a Koa application instance.
 */
export const getApp = async (): Promise<Koa> => {
  const app = new Koa();
  const router = new Router();

  router.prefix('/api');

  /// # Register new routes here
  router.post('/hello', handleHelloWorld);
  /// router.post('/endpoint', endpointHandler);

  /// # If there's a need to verify something for every endpoints,
  /// # you can register additional middleware here (e.g. verify signature)

  app
    .use(cors())
    .use(helmet())
    .use(koaBody())
    .use(logger)
    .use(errorHandler)
    /// .use(verifyAdditionalItems)
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
