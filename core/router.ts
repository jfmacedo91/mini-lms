import type { CustomRequest } from "./http/custom-request.ts";
import type { CustomResponse } from "./http/custom-response.ts";

export type Handler = (req: CustomRequest, res: CustomResponse) => Promise<void> | void;
export type Middleware = (req: CustomRequest, res: CustomResponse) => Promise<void> | void;

type Routes = {
  [method: string]: {
    [pathname: string]: {
      handler: Handler;
      middlewares: Middleware[];
    }
  }
}

export class Router {
  routes: Routes = {
    GET: {},
    POST: {},
    PUT: {},
    DELETE: {},
    HEAD: {}
  };
  middlewares: Middleware[] = [];
  get(route: string, handler: Handler, middlewares: Middleware[] = []) {
    this.routes["GET"][route] = { handler, middlewares };
  };
  post(route: string, handler: Handler, middlewares: Middleware[] = []) {
    this.routes["POST"][route] = { handler, middlewares };
  };
  put(route: string, handler: Handler, middlewares: Middleware[] = []) {
    this.routes["PUT"][route] = { handler, middlewares };
  };
  delete(route: string, handler: Handler, middlewares: Middleware[] = []) {
    this.routes["DELETE"][route] = { handler, middlewares };
  };
  head(route: string, handler: Handler, middlewares: Middleware[] = []) {
    this.routes["HEAD"][route] = { handler, middlewares };
  };
  use(middlewares: Middleware[]) {
    this.middlewares.push(...middlewares);
  };
  find(method: string, pathname: string) {
    const routesByMethod = this.routes[method];
    if(!routesByMethod) return null;

    const matchedRoute = routesByMethod[pathname];
    if(matchedRoute) return { route: matchedRoute, params: {} };

    const pathnameParts = pathname.split("/").filter(Boolean);

    for(const route of Object.keys(routesByMethod)) {
      if(!route.includes(":")) continue;

      const routeParts = route.split("/").filter(Boolean);
      if(routeParts.length !== pathnameParts.length) continue;
      if(pathnameParts[0] !== routeParts[0]) continue;

      const params: Record<string, string> = {};
      let ok = true;

      for(let index = 0; index < pathnameParts.length; index++) {
        const segment = routeParts[index];
        const value = pathnameParts[index];
        if(segment.startsWith(":")) {
          params[segment.slice(1)] = value;
        } else if(segment !== value) {
          ok = false;
          break;
        };
      };

      if(ok) {
        return { route: routesByMethod[route], params };
      };
    };

    return null;
  };
};