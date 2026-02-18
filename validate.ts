function string(value: unknown) {
  if(typeof value !== "string" || value.trim().length === 0) return undefined;
  return value;
};

function number(value: unknown) {
  if(typeof value === "number") return Number.isFinite(value) ? value : undefined;
  return undefined;
};

function boolean(value: unknown) {
  if(value === true || value === "true" || value === 1 || value === "1" || value === "on") return true;
  if(value === false || value === "false" || value === 0 || value === "0" || value === "off") return false;
  return undefined;
};