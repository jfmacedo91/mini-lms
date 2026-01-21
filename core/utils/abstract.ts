import type { Core } from "../core.ts";
import type { Handler } from "../router.ts";

export abstract class CoreProvider {
  core: Core;
  router: Core["router"];
  db: Core["db"];
  constructor(core: Core) {
    this.core = core;
    this.router = core.router;
    this.db = core.db;
  };
};

export abstract class Api extends CoreProvider {
  /**Use to create routes handlers*/
  handlers: Record<string, Handler> = {};
  /**Use to create tables*/
  tables() {};
  /**Use to create routes*/
  routes() {};
  init() {
    this.tables();
    this.routes();
  };
};