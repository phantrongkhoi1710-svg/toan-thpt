import { useMemo } from "react";
import katex from "katex";
import "katex/dist/katex.min.css";

function unescapeTex(tex: string) {
  return tex
    .replace(/&nbsp;/g, " ")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");
}

export function renderMathHtml(html: string) {
  return html.replace(/\\\(([\s\S]+?)\\\)/g, (_, tex: string) =>
    katex.renderToString(unescapeTex(tex), { throwOnError: false }),
  );
}

type MathTag = "div" | "p" | "span" | "li" | "h2" | "h3";

export function MathHtml({
  html,
  as = "div",
  className,
}: {
  html: string;
  as?: MathTag;
  className?: string;
}) {
  const rendered = useMemo(() => renderMathHtml(html), [html]);
  const Tag = as;
  return <Tag className={className} dangerouslySetInnerHTML={{ __html: rendered }} />;
}
