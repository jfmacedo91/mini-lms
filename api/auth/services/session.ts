import { CoreProvider } from "../../../core/utils/abstract.ts";
import { AuthQuery } from "../query.ts";
import { randomBytesAsync, sha256 } from "../utils.ts";

type CreateType = {
  userId: number;
  ip: string;
  ua: string;
}

const ttlSec = 60*60*24*15 // 15 Dias
const ttlSec5days = 60*60*24*5 // 5 Dias
export const COOKIE_SID_KEY = "__Secure-sid";

function sidCookie(sid: string, expires: number) {
  return `${ COOKIE_SID_KEY }=${ sid }; Path=/; Max-Age=${ expires }; HttpOnly; Secure; SameSite=Lax`
}

export class SessionService extends CoreProvider {
  query = new AuthQuery(this.db);
  async create({ userId, ip, ua }: CreateType) {
    const sid = (await randomBytesAsync(32)).toString("base64url");
    const sid_hash = sha256(sid);
    const expires_ms = Date.now() + ttlSec * 1000;
    this.query.insertSession({ sid_hash, user_id: userId, expires_ms, ip, ua });
    const cookie = sidCookie(sid, ttlSec);
    return { cookie };
  };
  validate(sid: string) {
    const now = Date.now();
    const sid_hash = sha256(sid);
    const session = this.query.selectSession(sid_hash);

    if(!session || session.revoked === 1) {
      return {
        valid: false,
        cookie: sidCookie("", 0)
      };
    };

    let expires_ms = session.expires_ms;

    if(now >= expires_ms) {
      this.query.revokeSession("sid_hash", sid_hash);
      return {
        valid: false,
        cookie: sidCookie("", 0)
      };
    };

    if(now >= expires_ms - 1000 * ttlSec5days) {
      const expires_ms_update = now + 1000 * ttlSec;
      this.query.updateSessionExpires(sid_hash, expires_ms_update);
      expires_ms = expires_ms_update;
    };

    const user = this.query.selectUserRole(session.user_id);

    if(!user) {
      this.query.revokeSession("sid_hash", sid_hash);
      return {
        valid: false,
        cookie: sidCookie("", 0)
      };
    };

    return {
      valid: true,
      cookie: sidCookie(sid, Math.floor((expires_ms - now) / 1000)),
      session: {
        user_id: session.user_id,
        role: user.role,
        expires_ms
      }
    };
  };
};