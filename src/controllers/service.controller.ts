import * as Router from 'koa-router';
import * as Semver from 'semver';
const debug: any = require('debug')('service-registry:service');

export class ServiceController {
  services:{[key: string]: ServiceModel};
  timeout: number;

  constructor() {
    this.services = {};
    this.timeout = 30;
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
      debug(`Registered service ${key}`);
    }

    cnt.services[key].timestamp = Math.floor(new Date().getTime() / 1000);
    ctx.body = key;
  }

  static unregister(ctx:Router.RouterContext, cnt:ServiceController) {
    cnt.unregisterService(cnt.getKey(ctx));
    ctx.body = cnt.getKey(ctx);
  }

  static find(ctx:Router.RouterContext, cnt:ServiceController) {
    const name = ctx.params['name'];
    const version = ctx.params['version'];

    cnt.unregisterOldServices();

    const candidates = Object.values(cnt.services)
      .filter(service => service.name === name && Semver.satisfies(service.version, version));

    if (candidates[0]) {
      // Randomly spread to simulate load balancing
      ctx.body = JSON.stringify(candidates[Math.floor(Math.random() * candidates.length)]);
    } else {
      ctx.body = 'Not Found';
      ctx.status = 404;
    }
  }

  unregisterOldServices() {
    const now = Math.floor(new Date().getTime() / 1000);
    Object.keys(this.services).forEach((key) => {
      if (this.services[key].timestamp + this.timeout < now) {
        this.unregisterService(key);
      }
    });
  }

  unregisterService(key:string) {
    delete this.services[key];
    debug(`Unregistered service ${key}`);
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
  timestamp?: number;
}
