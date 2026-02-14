import type { UserRole } from "../../core/http/custom-request.ts";
import { Query } from "../../core/utils/abstract.ts";

type UserType = {
  id: number;
  name: string;
  username: string;
  email: string;
  role: UserRole;
  password_hash: string;
  created: string;
  updated: string;
};

type SessionType = {
  sid_hash: Buffer;
  user_id: number;
  created: number;
  expires: number;
  ip: string;
  ua: string;
  revoked: number;
};

type SessionCreate = Omit<SessionType, "created" | "expires" | "revoked"> & {
  expires_ms: number;
}

type UserCreate = Omit<UserType, "id" | "created" | "updated">

export class AuthQuery extends Query {
  insertUser({ name, username, email, role, password_hash }: UserCreate) {
    return this.db.query(/*sql*/`
      INSERT OR IGNORE INTO "users"
        ("name", "username", "email", "role", "password_hash")
      values
        (?, ?, ?, ?, ?);
    `).run(name, username, email, role, password_hash);
  };
  updateUser(user_id: number, key: "password_hash" | "email" | "name", value: string) {
    return this.db.query(/*sql*/`
      UPDATE "users" SET ${ key } = ? WHERE "id" = ?;
    `).run(value, user_id);
  };
  insertSession({ sid_hash, user_id, expires_ms, ip, ua }: SessionCreate) {
    return this.db.query(/*sql*/`
      INSERT OR IGNORE INTO "sessions"
        ("sid_hash", "user_id", "expires", "ip", "ua")
      VALUES
        (?, ?, ?, ?, ?);
    `).run(sid_hash, user_id, Math.floor(expires_ms / 1000), ip, ua);
  };
  selectUser(key: "email" | "username" | "id", value: string | number) {
    return this.db.query(/*sql*/`
      SELECT "id", "password_hash" FROM "users" WHERE ${ key } = ?
    `).get(value) as { "id": number, "password_hash": string } | undefined;
  };
  selectSession(sid_hash: Buffer) {
    return this.db.query(/*sql*/`
      SELECT *, "expires" * 1000 AS "expires_ms" FROM "sessions" WHERE "sid_hash" = ?;
    `).get(sid_hash) as SessionType & { expires_ms: number } | undefined;
  };
  revokeSession(sid_hash: Buffer) {
    return this.db.query(/*sql*/`
      UPDATE "sessions" SET "revoked" = 1 WHERE "sid_hash" = ?;
    `).run(sid_hash);
  };
  revokeSessions(user_id: number) {
    return this.db.query(/*sql*/`
      UPDATE "sessions" SET "revoked" = 1 WHERE "user_id" = ?;
    `).run(user_id);
  };
  updateSessionExpires(sid_hash: Buffer, expires_ms: number) {
    return this.db.query(/*sql*/`
      UPDATE "sessions" SET "expires" = ? WHERE "sid_hash" = ?;
    `).run(Math.floor(expires_ms / 1000), sid_hash);
  };
  selectUserRole(id: number) {
    return this.db.query(/*sql*/`
      SELECT "role" FROM "users" WHERE "id" = ?;
    `).get(id) as { role: UserRole } | undefined;
  };
};