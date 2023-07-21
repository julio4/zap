import { ParameterizedContext } from 'koa';

export async function logger(
  ctx: ParameterizedContext,
  next: () => Promise<any>
) {
  console.log(
    `-> [${new Date().toString()}] ${ctx.method} ${ctx.url}: ${JSON.stringify(
      ctx.request.body
    )}`
  );
  await next();
  console.log(
    `<- [${new Date().toString()}] ${ctx.method} ${ctx.url}: STATUS ${
      ctx.status
    } ${JSON.stringify(ctx.body)}`
  );
}
