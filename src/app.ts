// Global setup
require('dotenv').config();
const debug: any = require('debug')('service-registry:app');

// Third party imports
import * as HttpStatus from 'http-status-codes';
import * as Koa from 'koa';
const app:Koa = new Koa();

// My imports
import { serviceRouter } from './routes';

// Generic error handling middleware.
app.use(async (ctx: Koa.Context, next: () => Promise<any>) => {
  try {
    await next();
  } catch (error) {
    ctx.status = error.statusCode || error.status || HttpStatus.INTERNAL_SERVER_ERROR;
    error.status = ctx.status;
    ctx.body = { error };
    ctx.app.emit('error', error, ctx);
  }
});

// Route middleware
app.use(serviceRouter.routes());
app.use(serviceRouter.allowedMethods());

app.use(async (ctx:Koa.Context) => ctx.body = { msg: 'Hello Service Registry!' });

// Application error logging.
app.on('error', console.error);

export default app;
