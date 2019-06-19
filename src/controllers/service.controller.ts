import * as Router from 'koa-router';
import * as Semver from 'semver';
const debug: any = require('debug')('service-registry:service');

export class ServiceController {
  services:{[key: string]: ServiceModel};
  timeout: number;

  constructor() {
    this.services = {};
    this.timeout = 30;
    debug('Controller created');
  }

  static register(ctx:Router.RouterContext, cnt:ServiceController) {
    // Wrap IPv6 in []
    const ip = ctx.ip.includes('::') ? `[${ctx.ip}]` : ctx.ip;
    const key:string = cnt.getKey(ctx);

    if (!cnt.services[key]) {
      cnt.services[key] = {
        ip,
        port: ctx.params['port'],
        name: ctx.params['name'],
        version: ctx.params['version'],
      };
    }

    cnt.services[key].timestamp = Math.floor(new Date().getTime() / 1000).toString();
    ctx.body = key;
  }

  static unregister(ctx:Router.RouterContext, cnt:ServiceController) {
    delete cnt.services[cnt.getKey(ctx)];
    ctx.body = cnt.getKey(ctx);
  }

  static find(ctx:Router.RouterContext, cnt:ServiceController) {
    const name = ctx.params['name'];
    const version = ctx.params['version'];
    const candidates = Object.values(cnt.services)
      .filter(service => service.name === name && Semver.satisfies(service.version, version));

    if (candidates) {
      // Randomly spread to simulate load balancing
      ctx.body = JSON.stringify(candidates[Math.floor(Math.random() * candidates.length)]);
    } else {
      ctx.status = 404;
    }
  }

  getKey(ctx:Router.RouterContext) {
    // Wrap IPv6 in []
    return ctx.params['name'] + ctx.params['version']
      + (ctx.ip.includes('::') ? `[${ctx.ip}]` : ctx.ip)
      + ctx.params['port'];
  }
}

interface ServiceModel {
  ip: string;
  port: string;
  name: string;
  version: string;
  timestamp?: string;
}
