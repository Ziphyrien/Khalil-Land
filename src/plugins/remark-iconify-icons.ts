import type { Root } from "mdast";
import type { Plugin } from "unified";
import { iconHtml } from "../lib/iconify-icons.ts";

interface MarkdownNode {
  type: string;
  value?: string;
  name?: string;
  attributes?: Record<string, unknown> | null;
  children?: MarkdownNode[];
}

const iconPattern = /::((?:iconify\s+)?[\w-]+:[\w-]+(?:\s+=[^\s:]+)?(?:\s+\/[^\s:]+)?)::/g;
const ignoredNodeTypes = new Set(["code", "html", "inlineCode"]);

function transformText(value: string): MarkdownNode[] | null {
  const children: MarkdownNode[] = [];
  let cursor = 0;
  iconPattern.lastIndex = 0;

  for (const match of value.matchAll(iconPattern)) {
    const spec = match[1];
    if (!spec) continue;

    const index = match.index ?? 0;
    if (index > cursor) children.push({ type: "text", value: value.slice(cursor, index) });
    children.push({ type: "html", value: iconHtml(spec) });
    cursor = index + match[0].length;
  }

  if (cursor === 0) return null;
  if (cursor < value.length) children.push({ type: "text", value: value.slice(cursor) });
  return children;
}

function directiveText(node: MarkdownNode): string | null {
  if (node.type !== "textDirective" || !node.name) return null;
  if ((node.children?.length ?? 0) > 0 || Object.keys(node.attributes ?? {}).length > 0)
    return null;
  return `:${node.name}`;
}

function transformChildren(node: MarkdownNode): void {
  if (!Array.isArray(node.children) || ignoredNodeTypes.has(node.type)) return;

  const children: MarkdownNode[] = [];
  let textNodes: MarkdownNode[] = [];

  const flushText = () => {
    if (textNodes.length === 0) return;
    const value = textNodes
      .map((child) => (child.type === "text" ? (child.value ?? "") : (directiveText(child) ?? "")))
      .join("");
    children.push(...(transformText(value) ?? textNodes));
    textNodes = [];
  };

  for (const child of node.children) {
    if (child.type === "text" || directiveText(child) !== null) {
      textNodes.push(child);
      continue;
    }

    flushText();
    transformChildren(child);
    children.push(child);
  }

  flushText();
  node.children = children;
}

const remarkIconifyIcons: Plugin<[], Root> = () => (tree) => {
  transformChildren(tree as unknown as MarkdownNode);
};

export default remarkIconifyIcons;
