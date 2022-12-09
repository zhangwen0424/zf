export const isObject = function (value) {
  return value != null && typeof value === "object";
};

export const isFunction = function (value) {
  return typeof value == "function";
};
