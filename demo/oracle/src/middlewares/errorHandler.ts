import { ParameterizedContext } from 'koa';

export interface ErrorHandlerError extends Error {
  status?: number;
}

export async function errorHandler(
  ctx: ParameterizedContext,
  next: () => Promise<void>
) {
  try {
    await next();
  } catch (error) {
    const typedError = error as ErrorHandlerError;
    ctx.status = typedError.status || 500;  // TODO: are we sure we want to return 500 for all errors?
    ctx.body = {
      error: {
        message: typedError.message || 'Internal Server Error',
      },
    };
  }
}
