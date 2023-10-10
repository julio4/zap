import { ParameterizedContext } from 'koa';

export async function errorHandler(
  ctx: ParameterizedContext,
  next: () => Promise<any>
) {
  try {
    await next();
  } catch (error: any) {
    ctx.status = error.status || 500;
    ctx.body = {
      error: {
        message: error.message || 'Internal Server Error',
      },
    };
  }
}
