# Blog: implementation plan

**Goal:** any signed-in user (admin, member or normal) can write a blog post from the dashboard.
A post appears on the public site only after a reviewer approves it. **Reviewers are admins and
members.**

**Decisions** (answers to the earlier open questions):
1. **Editing a published post:** the **old version stays live** until the edit is approved. The
   edit is kept as a separate *pending revision*.
2. **Categories:** a starting set (Engineering, Design, Career, Campus Life, Tutorial, Other),
   and **anyone writing a post can add a new one from the editor**. Reviewers can remove unused ones.
3. **Review:** admins **and members** can approve, reject, unpublish and feature posts. Only
   admins can delete other people's posts.
4. **Sample posts:** a few are kept, as seeded posts that are easy to find and remove.

**Today:** `/blogs` shows 6 hard-coded sample posts from `src/lib/blogs.ts`, opened in a
modal. There is no backend, no author flow and no way to link to a single post.

---

## 1. How a post moves

**A new post**

```
 draft ──submit──▶ pending ──approve──▶ published
   ▲                 │  └──reject──▶ rejected ──edit + resubmit──▶ pending
   └──── withdraw ───┘                    │
                          published ──unpublish──▶ draft
```

**An edit to a post that is already published** (the live version is never touched until approval)

```
 published ──author edits──▶ revision "draft" ──submit──▶ revision "pending" ──approve──▶ live updated
   (live)                         ▲                              │ └──reject──▶ revision "rejected"
                                  └────────── withdraw ──────────┘            (live still untouched)
```

| Status | Who can see it | Who can change it |
| --- | --- | --- |
| `draft` | Author, reviewers | Author edits, then submits for review |
| `pending` | Author, reviewers (review queue) | A reviewer approves or rejects. The author can withdraw it to a draft. |
| `rejected` | Author (with the reviewer's note), reviewers | Author edits and resubmits |
| `published` | **Everyone** on `/blogs` | Author edits create a *revision*. Reviewers can unpublish, feature or edit the live post directly. |

- **A revision** holds a full copy of the editable fields (title, content, cover, category, tags,
  SEO fields). It has its own state: `draft`, `pending` or `rejected` (with a note). The author can
  discard it at any time. The live post, its URL and its SEO are unchanged until a reviewer approves
  the revision, at which point the revision replaces the live fields.
- **The review queue** shows two kinds of items: *New post* and *Edit of a published post*.
- **Reviewers' own posts** also go through review, but a reviewer can approve their own.
- **A reviewer editing a live post directly** changes it immediately (no revision).

---

## 2. Data model

### `blogs` (new `src/models/Blog.ts`)

| Field | Type | Notes |
| --- | --- | --- |
| `title` | string, 5–150 | |
| `slug` | string, unique, sparse | Made from the title on **first publish**, then fixed so links don't break |
| `excerpt` | string, ≤ 300 | Shown on cards. Generated from the content if left empty. |
| `content` | string, ≤ 50,000 | **Markdown** (headings, lists, links, code blocks, images) |
| `coverImageUrl`, `coverAlt` | string | Uploaded with the Cloudinary signer, or pasted. Alt text is required when there's a cover. |
| `category`, `categoryKey` | string | Display name and its lower-case key (see categories below) |
| `tags` | string[] ≤ 8 | |
| `seoTitle` (≤ 60), `seoDescription` (≤ 160) | string, optional | Override the `<title>` / meta description. They default to the title and excerpt. |
| `authorId` | ObjectId → users | The name and batch are joined when read. A deleted author shows as "Former member". |
| `status` | `draft` \| `pending` \| `rejected` \| `published` | Indexed |
| `reviewNote` | string | The reviewer's reason when rejecting a new post |
| `reviewedBy`, `reviewedAt` | ObjectId, Date | |
| `submittedAt`, `publishedAt` | Date | `publishedAt` orders the public list |
| `publishedUpdatedAt` | Date | When the **live** content last changed. Used for `dateModified` and the sitemap (author drafts don't move it). |
| `revision` | object, optional | Only on a published post with an edit in progress: the editable fields above plus `state` (`draft` \| `pending` \| `rejected`), `reviewNote`, `submittedAt` |
| `featured` | boolean | Reviewers only. Shown in the spotlight on `/blogs`. |
| `readMinutes` | number | From the word count (≈ 200 words a minute), on save |
| `previousSlugs` | string[] | Each permanently redirects (301) to the current slug |
| `seedKey` | string, unique, sparse | Marks seeded sample posts so they can be re-seeded or removed cleanly |
| timestamps | | `createdAt`, `updatedAt` |

**Indexes:** `{ status: 1, publishedAt: -1 }` (public list), `{ authorId: 1, updatedAt: -1 }` (my
posts), `{ status: 1, submittedAt: 1 }` and `{ "revision.state": 1 }` (review queue), unique sparse
`slug` and `seedKey`.

### `blogcategories` (new `src/models/BlogCategory.ts`)

| Field | Notes |
| --- | --- |
| `name` | Display name, 2–30 characters (letters, numbers, spaces, `&`, `-`) |
| `key` | Lower-case slug of the name. **Unique**, so "design" and "Design" are one category. |
| `createdBy`, `createdAt` | |

- The six starting categories are created the first time the list is read.
- **Anyone writing a post can add one** from the category dropdown ("+ Add a new category").
  Adding a name that already exists just selects the existing one. Creation is rate-limited.
- **Reviewers can delete a category** that no post uses. "Other" can't be deleted.
- A post stores the category name and key, so a category never breaks a post.
- The public `/blogs` filter only lists categories that have at least one **published** post.

## 3. API

All routes follow the existing pattern: auth first, zod validation, `{ success, message }`,
paging with `pagedRows`. **Reviewer** means admin or member.

| Route | Methods | Who | Purpose |
| --- | --- | --- | --- |
| `/api/blogs/mine` | GET, POST | any signed-in user | My posts (paged, filter by status). Create a draft. |
| `/api/blogs/mine/[id]` | GET, PATCH, DELETE | author; reviewers for GET/PATCH | Read or edit one post. PATCH on a published post by its **author** saves to the *revision*. A **reviewer** editing a published post changes the live post. An author can delete only drafts and rejected posts. |
| `/api/blogs/mine/[id]/submit` | POST | author | `draft`/`rejected` → `pending`, or revision `draft`/`rejected` → `pending` |
| `/api/blogs/mine/[id]/withdraw` | POST | author | `pending` → `draft`, or revision `pending` → `draft` |
| `/api/blogs/mine/[id]/revision` | DELETE | author | Discard an edit in progress; the live post is untouched |
| `/api/blogs/categories` | GET, POST | any signed-in user | List categories. Add one. |
| `/api/blogs/categories/[id]` | DELETE | reviewer | Delete an unused category |
| `/api/admin/blogs` | GET | reviewer | Review queue (new posts and edits) and all posts: paged, filter by status, search |
| `/api/admin/blogs/[id]` | GET, PATCH, DELETE | reviewer; DELETE admin only | Read the pending version for review. PATCH `{ featured }`. |
| `/api/admin/blogs/[id]/review` | POST | reviewer | `{ action: "approve" \| "reject" \| "unpublish", note? }`. Approve applies to a pending new post **or** a pending revision. |

**Public reads** don't need routes. Server Components call cached functions, tagged `blogs` and
refreshed on approve, unpublish, feature, a reviewer's live edit or a delete:
- `getPublishedBlogs({ page, category, q })`: 9 per page, newest first, cards only (no content).
- `getPublishedBlog(slug)`: one full post with its author (or the slug to redirect to).
- Always the **live** fields. A pending revision is never visible publicly.

**Rules enforced on the server**, not just hidden in the UI:
- An author can't set `status`, `featured` or `slug` directly, and never touches the live content of
  a published post.
- Only the author or a reviewer can read a non-published post. Drafts, pending and rejected posts
  are never returned publicly.
- Creating posts and categories is rate-limited.

## 4. Pages

### Dashboard (new "Blog" tab, visible to every role)
- **My posts:** a list with status chips (Draft / In review / Changes requested / Published) and
  the reviewer's note. A published post with an edit in progress shows **"Published · edit in
  review"** (or "edit draft" / "edit needs changes"). Actions: Edit, Submit, Withdraw, Discard
  edit, Delete.
- **Write / edit** (`/dashboard/blog/new`, `/dashboard/blog/[id]/edit`):
  - Title, excerpt, **category dropdown with "+ Add a new category"**, tags, cover image
    (Cloudinary upload) with alt text, and SEO fields.
  - A Markdown editor with **Write / Preview** tabs and a toolbar (bold, heading, link, code, and an
    image upload that inserts `![](url)`).
  - When editing a published post, a banner says "The live version stays online until a reviewer
    approves your changes."
  - New posts autosave to the browser, and there's an explicit "Save draft" to the server.
  - "Submit for review" saves and submits in one step.
- **Review** (admins **and members**, a second view in the same tab): the queue, oldest first,
  marked *New post* or *Edit of a published post*. Each item opens a full preview with **Approve**
  and **Reject (with a note)**. Published and All lists have Unpublish and Feature. A small
  **Categories** panel lets reviewers delete unused categories.
- The Overview tab shows "N posts awaiting review" to reviewers.

### Public site
- **`/blogs`** keeps the current design but reads the database:
  - The featured post goes in the spotlight.
  - Category chips and search are done on the server, with pages of 9.
  - It shows an empty state if there are no published posts.
- **`/blogs/[slug]`** is a new, real page per post, replacing the modal so posts can be
  shared and found by search engines. It has the title, author and batch, date, read time,
  cover, rendered Markdown, tags, and "More posts".
- A "Latest from the blog" strip on the home page.
- The 6 fabricated sample posts and `src/lib/blogs.ts` are removed.

## 5. SEO

Every published post must be a fast, server-rendered, crawlable page with complete metadata.

### Indexable pages
- **Server-rendered content:** `/blogs/[slug]` renders the article as HTML on the server (a Server
  Component). The text must be in the page source, not loaded by the browser afterwards. This is
  why the modal is replaced.
- **Real status codes:**
  - A missing or unpublished slug returns **HTTP 404**.
  - An old slug returns a **301** to the current one.

  The "not found" check must happen before the page starts streaming. Today `/events/<unknown>`
  shows a not-found page with status **200**, because the check runs inside a `<Suspense>`
  boundary. The blog does the lookup outside any Suspense, and the same fix is applied to the
  event pages.
- **Clean, permanent URLs:**
  - Lower-case slugs, e.g. `/blogs/building-a-rust-cli`.
  - The slug is fixed at first publish, so links and rankings survive title edits.
  - No query strings in post URLs.
- **One canonical URL per page:**
  - `metadataBase` comes from `APP_URL`, so canonicals and OG URLs are absolute.
  - Listing pages use `?page=2` with their own canonical. Page 1 is canonical without `?page`.
  - Search results (`?q=`) are `noindex, follow`.
- **Drafts and previews:** the dashboard preview is behind login. Nothing unpublished is
  reachable by URL.

### Metadata (per post, via `generateMetadata`)
- **`<title>`:** `seoTitle` or the title, then ` | PTSC Blog`.
- **Meta description:** `seoDescription` or the excerpt (≤ 160 chars).
- **Open Graph:** `type: article`, title, description, url, image (the cover), `publishedTime`,
  `modifiedTime`, `authors`, `section` (category), `tags`.
- **Twitter card:** `summary_large_image`.
- **Share image:** if there's no cover, a generated one (`opengraph-image.tsx` using `next/og`:
  title + category + club name), so every post has a share image.

### Structured data (JSON-LD in the page)
- **`BlogPosting`:** `headline`, `description`, `image`, `datePublished`, `dateModified`, `author`
  (`Person`), `publisher` (`Organization`), `mainEntityOfPage`, `keywords`, `articleSection`,
  `wordCount`.
- **`BreadcrumbList`:** Home › Blog › Post.
- **`Blog`** on `/blogs`, listing the posts on the page.

### Site-wide discovery
- **`app/sitemap.ts` → `/sitemap.xml`:** every published post (`lastModified` =
  `publishedUpdatedAt`), plus the static pages and events. The site has no sitemap today.
- **`app/robots.ts` → `/robots.txt`:** allows the public site, disallows `/dashboard`, `/api`,
  `/login`, `/signup` and `/forgot-password`, and points to the sitemap.
- **RSS feed at `/blogs/rss.xml`:** the latest 20 posts, linked from `<head>`.
- **Internal links:** "More posts" from the same category, tag and category chips linking to the
  filtered list, breadcrumbs, and the strip on the home page.

### Content and page quality
- **Semantic HTML:** one `<h1>` (the title) inside `<article>`, `<time dateTime=…>`, an author
  byline. Markdown headings shift down one level, so `#` in a post becomes `<h2>`.
- **The editor helps authors write well:** live counts for the title (≤ 60) and description
  (≤ 160), required cover alt text, a warning under ~300 words, and a search-result preview.
- **Links in posts:** external links get `rel="noopener noreferrer nofollow"`.
- **Core Web Vitals:**
  - Add `res.cloudinary.com` to `images.remotePatterns` so covers go through Next's image
    optimizer.
  - The cover is the LCP image (`priority`, fixed aspect ratio).
  - Images inside the article are lazy-loaded.
  - No client-side JavaScript is needed to read a post.
- **Freshness:** `dateModified` and the sitemap's `lastModified` update when a revision is approved.

## 6. Rendering Markdown safely

- **Libraries:** `react-markdown` + `remark-gfm` (tables, task lists, strikethrough), already
  installed. Raw HTML in posts is **not** rendered, so a post can't inject scripts.
- **Links:** only `http(s)`, `mailto` and site-relative links are kept.
- **Images:** plain `<img loading="lazy">` with a fallback, because next/image only allows
  listed hosts.
- **Code blocks:** monospace styling. Syntax highlighting can come later.

## 7. Order of work

1. Models (`Blog`, `BlogCategory`) + indexes + validation (zod) + helpers (slug, excerpt, read
   time, revision rules).
2. Author API, category API, and reviewer API.
3. Dashboard: My posts, Write/Edit with preview and SEO hints, the Review view, the sidebar tab
   and the Overview notice.
4. Public: `/blogs` from the database, the new `/blogs/[slug]` page, the Markdown renderer, the
   home strip. Remove the static posts.
5. SEO: `generateMetadata` and JSON-LD, the generated share image, `sitemap.ts`, `robots.ts`, the
   RSS feed, Cloudinary in `remotePatterns`, real 404s (including the event pages).
6. Seed the sample posts.
7. Checks:
   - Logic tests (status transitions, revisions, who-can-do-what, slug, read time).
   - API smoke tests: signed out → 401, wrong role → 403.
   - Render the public pages.
   - Manual run-through with your login.

## 8. Testing checklist

- [ ] A normal user can create, edit and submit. They can't approve, feature or see other people's drafts.
- [ ] A member can approve and reject. A member can't delete someone else's post.
- [ ] A pending, draft or rejected post never shows on `/blogs` or `/blogs/[slug]` (404).
- [ ] Approve → it appears on `/blogs` immediately. Unpublish → it disappears immediately.
- [ ] An author edits a published post → **the live post is unchanged**. Approving the revision
      replaces it. Rejecting leaves it as it was.
- [ ] Rejecting requires a note, and the author sees it.
- [ ] A new category can be added from the editor, adding a duplicate reuses the existing one, and
      an in-use category can't be deleted.
- [ ] `<script>` and `javascript:` links in Markdown are not executed.
- [ ] The slug is unique and stays the same after the title changes.
- [ ] Paging, category filter and search on `/blogs`.

**SEO**
- [ ] `curl -I` on an unknown slug → `404`, on an old slug → `301`, on a published post → `200`.
- [ ] The article text is in the raw HTML (`curl`, no JavaScript).
- [ ] Each post has a unique `<title>`, meta description, canonical, `og:*`, `twitter:*` and
      exactly one `<h1>`.
- [ ] The JSON-LD (`BlogPosting`, `BreadcrumbList`) parses and has the required fields.
- [ ] `/sitemap.xml` lists every published post and nothing unpublished. `/robots.txt` disallows
      `/dashboard` and `/api`.
- [ ] `/blogs/rss.xml` is valid RSS 2.0.
- [ ] A post without a cover still gets a generated share image.
- [ ] Lighthouse on a post (production build): SEO 100, and no layout shift from the cover.

## 9. Seeded sample posts

`scripts/seed-blog.ts` adds a few real, useful posts (how to write for the blog, a Git workflow
guide, and a beginner's guide to hackathons) as **published** posts, so the site has content on
day one. They are written for the club, not invented testimonials or numbers.
- They are attributed to an existing admin account, because every post needs an author. Delete
  or replace them whenever real posts arrive.
- They carry a `seedKey`, so re-running the script updates them instead of duplicating, and
  `--remove` deletes exactly those posts.
- The six fabricated sample posts in `src/lib/blogs.ts` are removed.
- The script writes to the target you choose (`MONGODB_URI` by default). Production is a
  separate, explicit step.

## 10. Out of scope for now

Comments, likes, view counts, scheduled publishing, multiple authors per post, renaming
categories, and email notifications to authors on approve or reject. Emails need the mail system
(backend plan, Phase 2); they can be added then.
