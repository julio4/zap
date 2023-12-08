import { ParameterizedContext } from 'koa';
import {
  getHelloWorld
} from './services/index.js';

export async function handleHelloWorld(ctx: ParameterizedContext) {
  try {
    // const { address, args } = ctx.state;
    const response = await getHelloWorld();

    ctx.body = {
      value: response,
      route: '/hello',
    };
  } catch (error) {
    ctx.throw(404);
  }
}
