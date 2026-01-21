import { ProductsApi } from "./api/products/index.ts";
import { Core } from "./core/core.ts";
import { logger } from "./core/middlewares/logger.ts";

const core = new Core();

core.router.use([logger]);

new ProductsApi(core).init();

core.init();