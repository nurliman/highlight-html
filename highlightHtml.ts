// @deno-types="npm:@types/lodash@^4.14.191"
import _ from "npm:lodash";
import { parse, Node, NodeType } from "npm:node-html-parser";
import { spliceString } from "./spliceString.ts";

const walk = (node: Node, fn: (node: Node) => void) => {
  fn(node);
  _.each(node.childNodes, (child) => walk(child, fn));
};

const textEndsWithStartOfWord = (text: string, word: string): string => {
  const match = _(word.length)
    .range()
    .compact()
    .map((i) => word.slice(0, i))
    .find((x) => text.endsWith(x));

  return match || "";
};

const textCompareIgnoreCase = (a: string, b: string): boolean => {
  return a.toLowerCase() === b.toLowerCase();
};

export const highlightHtml = (html: string, word: string): string => {
  if (!word) return html;
  if (!html) return html;

  word = word.trim();

  let result = html;
  let offset = 0;
  let prev: Node | null = null;

  const root = parse(html);

  walk(root, (node) => {
    if (node.nodeType !== NodeType.TEXT_NODE) return;

    let start = node.range[0] + offset;
    let end = node.range[1] + offset;
    let text = result.slice(start, end);

    // highlight split text nodes
    if (prev && prev.nodeType === NodeType.TEXT_NODE) {
      const prevStart = prev.range[0] + offset;
      const prevEnd = prev.range[1] + offset;
      const prevText = result.slice(prevStart, prevEnd);

      const prevWordEnd = textEndsWithStartOfWord(prevText, word);

      if (prevWordEnd) {
        const wordStart = text.slice(0, word.length - prevWordEnd.length);

        if (textCompareIgnoreCase(prevWordEnd + wordStart, word)) {
          // mark previous node
          const newPrevText = spliceString(
            prevText,
            prevText.length - prevWordEnd.length,
            prevWordEnd.length,
            `<mark>${prevWordEnd}</mark>`,
          );

          // update result
          result = spliceString(result, prevStart, prevEnd - prevStart, newPrevText);

          // update offset
          offset += newPrevText.length - prevText.length;

          // update indices
          start = node.range[0] + offset;
          end = node.range[1] + offset;

          // mark current node
          const newText = spliceString(text, 0, wordStart.length, `<mark>${wordStart}</mark>`);

          // update result
          result = spliceString(result, start, end - start, newText);

          // update offset
          offset += newText.length - text.length;

          // update indices
          end = node.range[1] + offset;

          // update text
          text = newText;

          // reset prev
          prev = null;
        }
      }
    }

    // update prev
    prev = node;

    // add <mark> tags
    const marked = text.replace(new RegExp(`(${word})`, "gi"), "<mark>$1</mark>");

    // update result
    result = spliceString(result, start, end - start, marked);

    // update offset
    offset += marked.length - text.length;
  });

  return result;
};

// find and replace text in html
// similar to highlightHtml but without <mark> tags
const findAndReplace = (html: string, find: string, replace: string): string => {
  if (!find) return html;
  if (!html) return html;

  find = find.trim();

  let result = html;
  let offset = 0;

  const root = parse(html);

  walk(root, (node) => {
    if (node.nodeType !== NodeType.TEXT_NODE) return;

    let start = node.range[0] + offset;
    let end = node.range[1] + offset;
    let text = result.slice(start, end);

    // add <mark> tags
    const replaced = text.replace(new RegExp(`(${find})`, "gi"), replace);

    // update result
    result = spliceString(result, start, end - start, replaced);

    // update offset
    offset += replaced.length - text.length;
  });

  return result;
};
