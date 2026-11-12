import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import { headingIds } from "@/lib/blog-text";

// Renders a post's Markdown. Raw HTML in the text is not rendered (react-markdown's
// default), and unsafe link schemes such as javascript: are dropped, so a post can't
// inject anything into the page. Used for the public post and the editor's preview.

function textOf(node: React.ReactNode): string {
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(textOf).join("");
  if (node && typeof node === "object" && "props" in node) {
    return textOf(
      (node as { props: { children?: React.ReactNode } }).props.children,
    );
  }
  return "";
}

const isExternal = (href?: string) =>
  Boolean(href && /^https?:\/\//i.test(href));

const makeComponents = (): Components => {
  const nextId = headingIds();
  return {
    h1: ({ children }) => (
      <h2
        id={nextId(textOf(children))}
        className="mt-12 scroll-mt-24 text-3xl font-bold tracking-tight text-white"
      >
        {children}
      </h2>
    ),
    h2: ({ children }) => (
      <h2
        id={nextId(textOf(children))}
        className="mt-12 scroll-mt-24 text-2xl font-bold tracking-tight text-white"
      >
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3
        id={nextId(textOf(children))}
        className="mt-9 scroll-mt-24 text-xl font-semibold text-white"
      >
        {children}
      </h3>
    ),
    h4: ({ children }) => (
      <h4 className="mt-7 text-lg font-semibold text-white">{children}</h4>
    ),
    p: ({ children }) => (
      <p className="mt-5 leading-8 text-neutral-300">{children}</p>
    ),
    a: ({ href, children }) => (
      <a
        href={href}
        className="text-emerald-400 underline decoration-emerald-400/40 underline-offset-4 transition-colors hover:decoration-emerald-400"
        {...(isExternal(href)
          ? { target: "_blank", rel: "noopener noreferrer nofollow ugc" }
          : {})}
      >
        {children}
      </a>
    ),
    ul: ({ children }) => (
      <ul className="mt-5 list-disc space-y-2 pl-6 leading-8 text-neutral-300 marker:text-neutral-600">
        {children}
      </ul>
    ),
    ol: ({ children }) => (
      <ol className="mt-5 list-decimal space-y-2 pl-6 leading-8 text-neutral-300 marker:text-neutral-500">
        {children}
      </ol>
    ),
    blockquote: ({ children }) => (
      <blockquote className="mt-6 border-l-2 border-emerald-400/60 pl-5 italic text-neutral-400">
        {children}
      </blockquote>
    ),
    hr: () => <hr className="my-10 border-white/10" />,
    strong: ({ children }) => (
      <strong className="font-semibold text-white">{children}</strong>
    ),
    img: ({ src, alt }) =>
      typeof src === "string" ? (
        // eslint-disable-next-line @next/next/no-img-element -- authors can link any image; sizes aren't known
        <img
          src={src}
          alt={alt ?? ""}
          loading="lazy"
          className="mt-6 w-full rounded-xl border border-white/10"
        />
      ) : null,
    pre: ({ children }) => (
      <pre className="mt-6 overflow-x-auto rounded-xl border border-white/10 bg-neutral-950 p-4 text-[13px] leading-6 text-neutral-200">
        {children}
      </pre>
    ),
    code: ({ className, children }) =>
      className ? (
        <code className={`${className} font-mono`}>{children}</code>
      ) : (
        <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-[0.9em] text-emerald-300">
          {children}
        </code>
      ),
    table: ({ children }) => (
      <div className="mt-6 overflow-x-auto">
        <table className="w-full border-collapse text-left text-sm">
          {children}
        </table>
      </div>
    ),
    th: ({ children }) => (
      <th className="border-b border-white/15 px-3 py-2 font-semibold text-white">
        {children}
      </th>
    ),
    td: ({ children }) => (
      <td className="border-b border-white/8 px-3 py-2 text-neutral-300">
        {children}
      </td>
    ),
  };
};

export default function Markdown({ children }: { children: string }) {
  return (
    <div className="[&>*:first-child]:mt-0">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={makeComponents()}>
        {children}
      </ReactMarkdown>
    </div>
  );
}
