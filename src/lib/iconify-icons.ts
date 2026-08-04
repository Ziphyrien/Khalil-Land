import { icons as materialSymbols } from "@iconify-json/material-symbols";
import { icons as mdi } from "@iconify-json/mdi";
import { icons as remixIcons } from "@iconify-json/ri";
import { icons as simpleIcons } from "@iconify-json/simple-icons";
import { getIconData, iconToSVG } from "@iconify/utils";

interface IconOptions {
  size?: string | number;
  color?: string;
}

interface IconSpec {
  name: string;
  size: string | number;
  color?: string;
}

const iconSets = {
  "material-symbols": materialSymbols,
  mdi,
  ri: remixIcons,
  "simple-icons": simpleIcons,
} as const;

const safeCssValue = /^[#(),.%\w\s-]+$/;

function normalizeDimension(value: string | number): string {
  const dimension = String(value).trim();
  return /^\d+(?:\.\d+)?$/.test(dimension) ? `${dimension}px` : dimension;
}

function parseSize(size: string | number = "1em"): { width: string; height: string } {
  const [width = "1em", height] = String(size)
    .split(/\s*x\s*/, 2)
    .map(normalizeDimension);
  return { width, height: height || width };
}

function escapeAttribute(value: unknown): string {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function resolveIcon(name: string) {
  const separator = name.indexOf(":");
  if (separator < 1) throw new Error(`Invalid Iconify name: ${name}`);

  const collection = name.slice(0, separator) as keyof typeof iconSets;
  const iconName = name.slice(separator + 1);
  const iconSet = iconSets[collection];
  const icon = iconSet ? getIconData(iconSet, iconName) : null;

  if (!icon) throw new Error(`Unknown Iconify icon: ${name}`);
  return icon;
}

function iconDataUri(name: string): string {
  const rendered = iconToSVG(resolveIcon(name), { height: "1em" });
  const body = rendered.body.replaceAll("currentColor", "#000");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${rendered.attributes.viewBox}">${body}</svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

export function parseIconSpec(spec: string): IconSpec {
  let value = spec.trim().replace(/^iconify\s+/, "");
  let size: string | number = "1em";
  let color: string | undefined;

  value = value.replace(/(?:^|\s)=([^\s]+)(?=\s|$)/, (_, match: string) => {
    size = match;
    return "";
  });
  value = value.replace(/(?:^|\s)\/([^\s]+)(?=\s|$)/, (_, match: string) => {
    color = match;
    return "";
  });

  const name = value.trim().split(/\s+/, 1)[0];
  if (!name) throw new Error(`Invalid Iconify specification: ${spec}`);
  return { name, size, color };
}

export function iconStyle(name: string, options: IconOptions = {}): string {
  const declarations = [`--wiki-icon:url("${iconDataUri(name)}")`];

  if (options.size) {
    const { width, height } = parseSize(options.size);
    if (safeCssValue.test(width) && safeCssValue.test(height)) {
      declarations.push(`--wiki-icon-width:${width}`, `--wiki-icon-height:${height}`);
    }
  }

  if (options.color && safeCssValue.test(options.color)) {
    declarations.push(`color:${options.color}`);
  }

  return declarations.join(";");
}

export function iconAttrs(name: string, options: IconOptions = {}) {
  return {
    "data-icon": name,
    style: iconStyle(name, options),
  };
}

export function iconHtml(spec: string): string {
  const { name, size, color } = parseIconSpec(spec);
  const style = iconStyle(name, { size, color });
  return `<span class="wiki-icon" data-icon="${escapeAttribute(name)}" aria-hidden="true" style="${escapeAttribute(style)}"></span>`;
}
