import { CoreProvider } from "../../../core/utils/abstract.ts";
import { AuthQuery } from "../query.ts";
import { randomBytesAsync, sha256 } from "../utils.ts";

type CreateType = {
  userId: number;
  ip: string;
  ua: string;
}

export class SessionService extends CoreProvider {
  query = new AuthQuery(this.db);
  async create({ userId, ip, ua }: CreateType) {
    const sid = (await randomBytesAsync(32)).toString("base64url");
    const sid_hash = sha256(sid);
    const expires_ms = Date.now() + 60*60*24*15 * 1000;
    this.query.insertSession({ sid_hash, user_id: userId, expires_ms, ip, ua });
    return { sid };
  };
};