import * as Router from 'koa-router';

import { ServiceController } from './controllers/service.controller';

const serviceController = new ServiceController();
const serviceRouter: Router = new Router({ prefix: '/service' });

serviceRouter.put('/register/:name/:version/:port', ctx =>
    ServiceController.register(ctx, serviceController));
serviceRouter.delete('/register/:name/:version/:port', ctx =>
    ServiceController.unregister(ctx, serviceController));
serviceRouter.get('/find/:name/:version', ctx =>
    ServiceController.find(ctx, serviceController));

export { serviceRouter };
