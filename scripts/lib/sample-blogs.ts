// Sample posts for `npm run db:seed-blog`. They are real, useful posts about how the
// club works and about skills members ask for, not placeholder text.

export interface SampleBlog {
  /** Stable id, so re-running the seed updates the post instead of duplicating it. */
  seedKey: string;
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  tags: string[];
  seoTitle?: string;
  seoDescription?: string;
  featured?: boolean;
  /** Days before now that it counts as published, so the list isn't all one date. */
  daysAgo: number;
  content: string;
}

export const SAMPLE_BLOGS: SampleBlog[] = [
  {
    seedKey: "sample-write-for-ptsc",
    slug: "how-to-write-for-the-ptsc-blog",
    title: "How to write for the PTSC blog",
    excerpt:
      "Anyone in the club can publish here. This is how a post goes from a rough idea to the front page, and what reviewers look for.",
    category: "Campus Life",
    tags: ["writing", "community", "guide"],
    seoTitle: "How to write for the PTSC blog: a guide for club members",
    seoDescription:
      "How to write, submit and publish a post on the PTSC blog: the editor, Markdown basics, the review process and what reviewers look for.",
    featured: true,
    daysAgo: 2,
    content: `Every member of the club can write here, and so can anyone who has signed up on the site. You do not need to be an expert. Some of the most useful posts come from someone who learned a thing last week and still remembers what was confusing.

## What makes a good post

A good post answers one question for one kind of reader. "How I debugged a memory leak in my Node project" is a post. "Everything about Node" is not. Before you start, finish this sentence: *after reading this, the reader can ___*.

Some things that work well:

- **Tutorials** that take a reader from nothing to a working result.
- **Write-ups** of a project, a hackathon or an internship, including what went wrong.
- **Opinions with reasons**, such as why your team picked one framework over another.
- **Campus life**: placement prep, how to balance exams and side projects, how to run an event.

## Writing the post

Open the dashboard, go to **Blog** and choose **Write a post**. The editor uses Markdown, which is plain text with a few symbols:

\`\`\`md
## A heading
Some **bold** text, some *italic* text and \`inline code\`.

- a bullet
- another bullet

[A link](https://example.com)
\`\`\`

Use the **Preview** tab to see how it will look. Your draft is also saved in your browser as you type, so a closed tab does not lose your work.

A few habits that help readers:

1. Put the point in the first paragraph. People decide in seconds whether to keep reading.
2. Use headings every few paragraphs so the post can be skimmed.
3. Show code in code blocks, and say which version of a tool you used.
4. Add a cover image and write alt text that describes it. Alt text is read aloud by screen readers.

## Search settings

Under **Search & sharing** you can set the title and description that appear on Google and when the link is shared. If you leave them empty, the post title and excerpt are used. Keep the title under about 60 characters and the description under about 160 so they are not cut off.

## Review

When you press **Submit for review**, the post goes to a queue. An admin or a member of the club reads it and either publishes it or sends it back with a note saying what to change. Nothing appears on the site before that.

Reviewers look for the same few things: is it accurate, is it clear, is it your own work, and is it kind. Credit your sources and link to them.

## Editing a published post

You can edit a post after it is live. Your changes are saved as a new version and sent for review, and **the live post stays exactly as it is until the new version is approved.** If it is rejected, the old version keeps running and you can fix the new one.

That is all there is to it. Pick a small topic and write the first draft today.`,
  },
  {
    seedKey: "sample-git-workflow",
    slug: "a-git-workflow-for-student-teams",
    title: "A Git workflow for student teams that doesn't end in tears",
    excerpt:
      "Branches, small commits and pull requests: a simple routine that keeps a four-person project from turning into merge-conflict roulette.",
    category: "Tutorial",
    tags: ["git", "teamwork", "beginners"],
    seoTitle: "A simple Git workflow for student teams",
    seoDescription:
      "A practical Git routine for college project teams: feature branches, small commits, pull requests and how to fix merge conflicts without panic.",
    daysAgo: 9,
    content: `Almost every team project in college hits the same wall. Two people edit the same file, someone force-pushes, and an hour before the demo the working version is gone. Git can prevent all of this. It only needs a routine the whole team follows.

## The routine in one picture

1. \`main\` always works. Nobody commits to it directly.
2. Every task gets its own **branch**.
3. You push the branch and open a **pull request** (PR).
4. A teammate looks at it, and then it is merged into \`main\`.
5. Everyone pulls \`main\` again before starting the next task.

## Step by step

Start from an up-to-date \`main\`:

\`\`\`bash
git switch main
git pull
git switch -c add-login-form
\`\`\`

Name the branch after the task, not after yourself. Now work, and commit often:

\`\`\`bash
git add src/LoginForm.tsx
git commit -m "Add login form with email and password fields"
\`\`\`

A commit is a save point. Small commits with a clear message are easy to review and easy to undo. "fix stuff" tells nobody anything; "Validate email before submit" does.

When the task is done, push the branch:

\`\`\`bash
git push -u origin add-login-form
\`\`\`

GitHub then offers a button to open a pull request. Write two lines on what changed and why, and ask one teammate to review it.

## Staying in sync

While you work, \`main\` moves. Bring those changes into your branch regularly instead of once at the end:

\`\`\`bash
git fetch
git merge origin/main
\`\`\`

Small, frequent merges mean small conflicts.

## When a merge conflict happens

A conflict is not an error. Git is telling you that two people changed the same lines and it needs a human to choose. The file will contain markers:

\`\`\`text
<<<<<<< HEAD
const title = "Sign in";
=======
const title = "Log in";
>>>>>>> origin/main
\`\`\`

Edit the file so it contains only the version you want, delete the three marker lines, then:

\`\`\`bash
git add src/LoginForm.tsx
git commit
\`\`\`

If the choice is not obvious, ask the person who wrote the other side. It takes a minute.

## Rules worth agreeing on

- Never use \`git push --force\` on a shared branch.
- Never commit secrets such as \`.env\` files. Add them to \`.gitignore\` first.
- Keep PRs small. One that changes 20 lines gets read; one that changes 2,000 gets approved without reading.
- If you are stuck, \`git status\` tells you what state you are in.

## If you made a mistake

Most mistakes can be undone. \`git restore <file>\` throws away changes to a file you have not committed. \`git revert <commit>\` adds a new commit that cancels an old one without rewriting history. Ask before reaching for \`git reset --hard\`, because that one really does delete work.

Git feels clumsy for the first few weeks and then becomes the thing you cannot work without. Start with this routine on your next project.`,
  },
  {
    seedKey: "sample-first-hackathon",
    slug: "your-first-hackathon-a-practical-guide",
    title: "Your first hackathon: a practical guide",
    excerpt:
      "How to pick a team, choose an idea you can finish, split the work and present something that works, from people who have been through a few.",
    category: "Career",
    tags: ["hackathon", "career", "teamwork"],
    seoTitle: "Your first hackathon: team, idea, build and demo",
    seoDescription:
      "A practical guide to your first college hackathon: forming a team, scoping an idea you can finish, splitting work, and giving a demo that lands.",
    daysAgo: 16,
    content: `Your first hackathon will probably feel chaotic, and that is normal. The teams that do well are rarely the ones with the best programmers. They are the ones who picked something small, kept it working and could explain it clearly.

## Before the event

**Form a team of three or four.** Try to cover different strengths: someone comfortable with the backend, someone who likes building the interface, someone who will keep the design and the story tidy. One person should be the point of contact for the organisers.

**Agree on tools in advance.** Pick the stack you already know. A hackathon is a bad place to learn a new framework from scratch. If you want to try something new, limit it to one piece.

**Set up the repository and the accounts.** Create the Git repository, invite everyone, and sort out hosting and API keys before the clock starts. Our post on a [Git workflow for student teams](/blogs/a-git-workflow-for-student-teams) covers the routine.

## Choosing an idea

Judges see many ideas that are too big. Pick one that you could build in a third of the time you have, because everything takes longer than planned.

A useful test: *can we describe it in one sentence, and can one person use it in under a minute?* If yes, it is probably the right size.

Start from a real problem you or your friends have, such as finding a free classroom, splitting bills, or tracking club attendance. Real problems are easier to explain and easier to demo.

## During the build

1. **Build the thinnest working version first.** One screen, one action, end to end. Then improve it.
2. **Split work by feature, not by layer,** so people are not blocked waiting for each other.
3. **Merge to main often.** A working demo at hour 10 is worth more than a perfect one that breaks at hour 23.
4. **Write down what is out of scope.** It stops arguments at 3 a.m.
5. **Sleep a little.** Tired teams make bugs.

## The demo matters as much as the code

Reserve the last quarter of your time for the presentation. A strong demo has a simple shape:

- The problem, in one or two sentences.
- A live walkthrough of one real use, not a tour of every button.
- What you would build next, and why it matters.

Prepare a backup in case the network fails: a short screen recording of the happy path works well. Rehearse it out loud at least twice.

## After it ends

Whether or not you win, write down what you learned and put the project on GitHub with a readable README. Employers and seniors notice finished things. If something went well, consider writing it up here on the blog, because the next person to join a hackathon will be glad to read it.

Go in with a small idea, a working demo and a team that is still talking to each other at the end. That is a good first hackathon.`,
  },
];
