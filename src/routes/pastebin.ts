import Router from "koa-tree-router";
import Database from "better-sqlite3";

class PastebinORM {
  db: Database.Database;
  constructor(filename: string) {
    this.db = new Database(filename);

    this.db.exec(`create table if not exists pastebin
(
    id         INTEGER                            not null unique 
        primary key autoincrement,
    name       TEXT,
    createTime TEXT default current_time,
    content    TEXT,
    hash       TEXT default (hex(randomblob(16))) not null
        unique
);`);
  }

  insert(input: Record<string, any>) {
    const keys = Object.keys(input);
    this.db
      .prepare(
        `insert into pastebin(${keys.join(", ")}) values (${keys
          .map((k) => `'${input[k]}'`)
          .join(", ")});`
      )
      .run();
    return this.db.prepare("select last_insert_rowid() from pastebin").run()
      .lastInsertRowid;
  }

  findByRowId(rowId: number | bigint) {
    return this.db
      .prepare(`select name, hash, content from pastebin where id=${rowId}`)
      .get();
  }

  findByHash(hash: string) {
    return this.db
      .prepare(`select name, hash, content from pastebin where hash='${hash}'`)
      .get();
  }
}

export function pastebin(router: Router) {
  const bin = new PastebinORM("./src/pastebin.db");

  router.post("/bin", async (ctx) => {
    const { name, content } = ctx.request.body as {
      name: string;
      content: string;
    };
    const rowid = bin.insert({
      name,
      content,
    });

    ctx.body = bin.findByRowId(rowid);
  });

  router.get("/bin/:hash", async (ctx) => {
    const { hash } = ctx.params;
    const result = bin.findByHash(hash);
    ctx.body = result;
  });
}
