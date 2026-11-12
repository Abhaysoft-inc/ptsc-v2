// Plain text helpers for blog posts. No framework or database imports, so the
// editor, the server and the seed script can all use them.

export function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** A category's key: "Campus Life" and "campus  life" are the same category. */
export const categoryKey = (name: string) => slugify(name);

/** Words in a piece of Markdown, ignoring code fences. */
export function countWords(markdown: string) {
  const text = markdown.replace(/```[\s\S]*?```/g, " ").trim();
  return text ? text.split(/\s+/).length : 0;
}

/** About 200 words a minute, and never less than a minute. */
export function readMinutes(markdown: string) {
  return Math.max(1, Math.ceil(countWords(markdown) / 200));
}

/** Plain text from Markdown, for excerpts and descriptions. */
export function stripMarkdown(markdown: string) {
  return markdown
    .replace(/```[\s\S]*?```/g, " ") // code blocks
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ") // images
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1") // links keep their text
    .replace(/<[^>]+>/g, " ") // any HTML
    .replace(/^\s{0,3}(#{1,6}|>|[-*+]|\d+\.)\s+/gm, "") // heading, quote and list markers
    .replace(/[*_~`]+/g, "") // emphasis and inline code marks
    .replace(/\s+/g, " ")
    .trim();
}

/** A short plain-text summary, cut at a word boundary. */
export function makeExcerpt(markdown: string, max = 200) {
  const text = stripMarkdown(markdown);
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  const lastSpace = cut.lastIndexOf(" ");
  return `${(lastSpace > max * 0.6 ? cut.slice(0, lastSpace) : cut).replace(/[\s,.;:!?-]+$/, "")}…`;
}

export interface Heading {
  id: string;
  text: string;
  /** 2 for # and ##, 3 for ###. */
  level: 2 | 3;
}

/** Gives repeated headings distinct ids: "setup", "setup-2", "setup-3". */
export function headingIds() {
  const seen = new Map<string, number>();
  return (text: string) => {
    const base = slugify(text) || "section";
    const count = (seen.get(base) ?? 0) + 1;
    seen.set(base, count);
    return count === 1 ? base : `${base}-${count}`;
  };
}

/** The headings of a post, for its contents list. Ids match the ones the renderer gives. */
export function extractHeadings(markdown: string): Heading[] {
  const nextId = headingIds();
  const headings: Heading[] = [];
  let inFence = false;
  for (const line of markdown.split("\n")) {
    if (/^\s{0,3}(```|~~~)/.test(line)) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;
    const match = /^\s{0,3}(#{1,3})\s+(.+?)\s*#*\s*$/.exec(line);
    if (!match) continue;
    const text = match[2].replace(/[*_`]|\[([^\]]*)\]\([^)]*\)/g, "$1").trim();
    headings.push({ id: nextId(text), text, level: match[1].length === 3 ? 3 : 2 });
  }
  return headings;
}
