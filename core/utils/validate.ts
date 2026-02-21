import { RouteError } from "./route-error.ts";

/** Não aceita string vazia! */
function string(value: unknown) {
  if(typeof value !== "string" || value.trim().length === 0) return undefined;
    const string = value.trim();
    if(string.length === 0) return undefined;
  return string;
};

/** Se a string for number like, retorna como number! */
function number(value: unknown) {
  if(typeof value === "number") {
    return Number.isFinite(value) ? value : undefined; 
  };

  if(typeof value === "string" && value.trim().length !== 0) {
    const number = Number(value);
    return Number.isFinite(number) ? number : undefined;
  };
  
  return undefined;
};

/** Aceita valores como true, "true", 1, "1" e "on" */
function boolean(value: unknown) {
  if(value === true || value === "true" || value === 1 || value === "1" || value === "on") return true;
  if(value === false || value === "false" || value === 0 || value === "0" || value === "off") return false;
  return undefined;
};

/** Verifica se é um objeto! {} */
function object(value: unknown): Record<string, unknown> | undefined {
  return typeof value === "object" && typeof value !== null && !Array.isArray(value)
  ? value as Record<string, unknown>
  : undefined;
};

const email_regex = /^[^@]+@[^@]+\.[^@]+$/;

/** Transforma em string e testa se está em formato de email! */
function email(value: unknown) {
  const email_string = string(value)?.toLowerCase();
  if(email_string === undefined) return undefined;
  return email_regex.test(email_string) ? email_string : undefined;
};

const password_regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/;

/** A senha deve contar entre 10 e 256 caracteres e pelo menos uma letra maiúscula, uma letra minúscula e um número! */
function password(value: unknown) {
  if(typeof value !== "string") return undefined;
  if(value.length < 10 || value.length > 256) return undefined;
  return password_regex.test(value) ? value : undefined;
};

type Parse<Value> = (param: unknown) => Value | undefined;

function required<Value>(fn: Parse<Value>, error: string) {
  return (param: unknown) => {
    const value = fn(param);
    if(value === undefined) throw new RouteError(422, error);
    return value;
  };
};

export const validate = {
  string: required(string, "Valor deve ser uma string!"),
  number: required(number, "Valor deve ser um número!"),
  boolean: required(boolean, "Valor deve ser um boolean válido!"),
  object: required(object, "Valor deve ser um objeto!"),
  email: required(email, "Valor deve ser um email válido!"),
  password: required(password, "A senha deve atentar ao padrão!"),
  optional: {
    string,
    number,
    boolean,
    object,
    email,
    password,
  }
};