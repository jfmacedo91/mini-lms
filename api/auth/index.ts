import { Api } from "../../core/utils/abstract.ts";
import { RouteError } from "../../core/utils/route-error.ts";
import { AuthMiddleware } from "./middlewares/auth.ts";
import { AuthQuery } from "./query.ts";
import { COOKIE_SID_KEY, SessionService } from "./services/session.ts";
import { authTables } from "./tables.ts";
import { Password } from "./utils/password.ts";

export class AuthApi extends Api {
  query = new AuthQuery(this.db);
  session = new SessionService(this.core);
  auth = new AuthMiddleware(this.core);
  pass = new Password("segredo");
  handlers = {
    postUser: async (req, res) => {
      const { name, username, email, password } = req.body;

      const emailExists = this.query.selectUser("email", email);
      if(emailExists) {
        throw new RouteError(409, "Email já cadastrado!");
      };

      const usernameExists = this.query.selectUser("username", username);
      if(usernameExists) {
        throw new RouteError(409, "Username já cadastrado!");
      };

      const password_hash = await this.pass.hash(password);
      const writeResult = this.query.insertUser({ name, username, email, role: "user", password_hash });
      if(writeResult.changes === 0) {
        throw new RouteError(400, "Erro ao criar o usuário!");
      };

      res.status(201).json({ title: "Usuário criado com sucesso!" });
    },
    postLogin: async (req, res) => {
      const { email, password } = req.body;
      const user = this.query.selectUser("email", email);
      if(!user) {
        throw new RouteError(404, "Email ou senha incorretos!");
      };

      const validPassword = await this.pass.verify(password, user.password_hash);
      if(!validPassword) {
        throw new RouteError(404, "Email ou senha incorretos!");
      };

      const { cookie } = await this.session.create({ user_id: Number(user.id), ip: req.ip, ua: req.headers["user-agent"] ?? "" })

      res.setCookie(cookie);
      res.status(200).json({ title: "Autenticado!" });
    },
    passwordUpdate: async (req, res) => {
      const { current_password, new_password } = req.body;
      if(!req.session) {
        throw new RouteError(401, "Não autorizado!");
      };

      const user = this.query.selectUser("id", req.session.user_id);
      if(!user) {
        throw new RouteError(404, "Usuário não encontrado!");
      };

      if(!this.pass.verify(current_password, user.password_hash)) {
        throw new RouteError(400, "Senha atual incorreta!");
      };
      
      const new_password_hash = await this.pass.hash(new_password);

      const updateResult = this.query.updateUser(user.id, "password_hash", new_password_hash);
      if(updateResult.changes === 0) {
        throw new RouteError(400, "Erro ao atualizar senha!");
      }

      this.session.invalidateAll(user.id);

      const { cookie } = await this.session.create({ user_id: user.id, ip: req.ip, ua: req.headers["user-agent"] ?? "" });

      res.setCookie(cookie);
      res.status(200).json({ title: "Senha atualizada!" });
    },
    passwordForgot: async (req, res) => {
      const { email } = req.body;
      const user = this.query.selectUser("email", email);
      if(!user) {
        return res.status(200).json({ title: "Verifique seu email!"});
      };

      const { token } = await this.session.resetToken({ user_id: user.id, ip: req.ip, ua: req.headers["user-agent"] ?? "" });
      const resetLink = `${req.baseurl}/password/reset/?token=${ token }`;
      const emailContent = {
        to: user.email,
        subject: "Password Reset",
        body: `Utilize o link abaixo para resetar sua senha: \r\n ${ resetLink }`
      };

      console.log(emailContent);
      res.status(200).json({ title: "Verifique seu email!"})
    },
    passwordReset: async (req, res) => {
      
    },
    getSession: (req, res) => {
      if(!req.session) {
        throw new RouteError(401, "Não autorizado!");
      };

      res.status(200).json({ title: "Sessão válida!" });
    },
    deleteSession: (req, res) => {
      const sid = req.cookies[COOKIE_SID_KEY];
      const { cookie } = this.session.invalidate(sid);
      res.setCookie(cookie);
      res.setHeader("Cache-Control", "private, no-store");
      res.setHeader("Vary", "Cookie");
      res.status(204).json({ title: "Logout!" })
    }
  } satisfies Api["handlers"];
  tables(): void {
    this.db.exec(authTables);
  };
  routes(): void {
    this.router.post("/auth/user", this.handlers.postUser);
    this.router.post("/auth/login", this.handlers.postLogin);
    this.router.post("/auth/password/forgot", this.handlers.passwordForgot);
    this.router.post("/auth/password/reset", this.handlers.passwordReset);

    this.router.put("/auth/password/update", this.handlers.passwordUpdate, [this.auth.guard("user")]);

    this.router.get("/auth/session", this.handlers.getSession, [this.auth.guard("user")]);

    this.router.delete("/auth/logout", this.handlers.deleteSession)
  };
}