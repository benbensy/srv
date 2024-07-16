import Koa from "koa";
import bodyParser from "@koa/bodyparser";
import Router from "koa-tree-router";

import * as routes from "./routes";

function setupRoutes(router: Router, fns: ((router: Router) => void)[]) {
  for (const fn of fns) {
    fn.call(null, router);
  }
}

const app = new Koa();
const router = new Router();

setupRoutes(router, Object.values(routes));

app.use(bodyParser()).use(router.routes());
app.listen(6090);
