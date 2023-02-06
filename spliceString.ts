// @deno-types="npm:@types/lodash@^4.14.191"
import _ from "npm:lodash";

export const spliceString = (
  str: string,
  index: number,
  count: number,
  insert: string
): string => {
  const array = _.toArray(str);
  array.splice(index, count, insert);
  return array.join("");
};
