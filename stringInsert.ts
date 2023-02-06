export const stringInsert = (str: string, position: number, insert: string): string => {
  return str.slice(0, position) + insert + str.slice(position);
};
