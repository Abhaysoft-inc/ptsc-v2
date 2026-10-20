export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string[];
  coverImage: string;
  category: "Engineering" | "Startups" | "Design" | "Campus Life";
  author: {
    name: string;
    role: string;
    batch: string;
    avatar: string;
  };
  date: string;
  readTime: string;
  featured?: boolean;
  tags: string[];
}

export const blogPosts: BlogPost[] = [
  {
    id: "post-1",
    slug: "zero-to-one-shipping-campus-saas",
    title: "Zero to One: How We Shipped a Campus Micro-SaaS to 1,200 Students in 72 Hours",
    excerpt:
      "A raw, transparent breakdown of our stack, database architecture, viral distribution loops, and the PostgreSQL connection spikes that nearly crashed our launch night.",
    content: [
      "Building for your own peers is both the easiest and hardest distribution challenge in software. When we set out to build a centralized campus marketplace, we gave ourselves an aggressive deadline: three days from initial whiteboard session to production deployment.",
      "Our core philosophy was relentless subtraction. Every feature that didn't directly facilitate a peer-to-peer transaction was cut. We chose Next.js with Server Components, Supabase for authentication and realtime Postgres subscriptions, and deployed on Vercel with edge caching.",
      "At 11:30 PM on launch night, a WhatsApp broadcast triggered an unexpected surge of 450 concurrent users. Our free-tier connection pool immediately maxed out. Here is how we implemented connection pooling with PgBouncer, tuned edge revalidation, and stabilized the platform before dawn.",
      "The key takeaway for student founders: speed is your only moat against inertia. Don't wait for permission or institutional backing. Build the smallest possible thing that delivers undeniable utility."
    ],
    coverImage: "/featured-saas.jpg",
    category: "Startups",
    author: {
      name: "Abhay Sharma",
      role: "Founder & Full Stack Lead",
      batch: "Batch of 2026",
      avatar: "/bg.jpg",
    },
    date: "Oct 14, 2026",
    readTime: "6 min read",
    featured: true,
    tags: ["SaaS", "Next.js", "PostgreSQL", "Distribution"],
  },
  {
    id: "post-2",
    slug: "rust-vs-typescript-systems-engine",
    title: "Rewriting Our Event Ticket Engine in Rust: 40x Throughput at Zero Idle Cost",
    excerpt:
      "When flash registrations for PTSC Hackathon caused high latency in our Node runtime, we benchmarked and extracted the QR verification engine into an ultra-lean Rust microservice.",
    content: [
      "During our annual campus hackathon, over 800 applicants tried checking in within a 20-minute arrival window. Our monolithic Node.js API began queuing crypto signature checks, leading to gate delays and frustrated attendees.",
      "We decided to isolate cryptographic verification into a dedicated binary. By using Tokio and Axum with compile-time zero-copy deserialization, we eliminated garbage collection pauses entirely.",
      "In simulated stress tests with vegeta, latency dropped from 340ms to 4.2ms at p99 under a load of 5,000 requests per second. The memory footprint shrank from 180MB to just 14MB of resident RAM.",
      "Systems engineering isn't just for enterprise giants; mastering low-level concurrency early gives college builders superpowers when architectural bottlenecks inevitably arise."
    ],
    coverImage: "/featured-launch.jpg",
    category: "Engineering",
    author: {
      name: "Rohan Varma",
      role: "Systems Architect",
      batch: "Batch of 2026",
      avatar: "/featured-collab.jpg",
    },
    date: "Oct 08, 2026",
    readTime: "8 min read",
    tags: ["Rust", "Systems", "Tokio", "Performance"],
  },
  {
    id: "post-3",
    slug: "designing-dark-mode-design-systems",
    title: "Dark Mode Isn't Inverted Light Mode: Engineering High-Contrast Interfaces",
    excerpt:
      "Why pure #000000 causes eye strain, how we calibrated our #080809 dark palette, and the subtle art of luminous borders and ambient depth in modern web apps.",
    content: [
      "Most digital design systems treat dark mode as a tokenized afterthought: swap white for black, swap dark text for white text. The result is almost always visually harsh, with excessive contrast vibrating against the retina.",
      "When rebuilding the PTSC design system, we started from physical optics. True black (#000000) creates hard edges that cause haloing on high-refresh OLED panels. We opted for a deep charcoal foundation (#080809) paired with 8% to 15% opacity white borders.",
      "By using CSS backdrop-blur and radial gradient overlays, we create perceived depth and ambient glow without resorting to heavy box shadows that look unnatural against dark surfaces.",
      "Great typography in dark interfaces requires adjusting letter-spacing and font-weight downward to compensate for optical irradiation—where light text visually bleeds outward on dark backgrounds."
    ],
    coverImage: "/featured-collab.jpg",
    category: "Design",
    author: {
      name: "Tanvi Saxena",
      role: "Design Lead",
      batch: "Batch of 2027",
      avatar: "/collage.png",
    },
    date: "Sep 28, 2026",
    readTime: "5 min read",
    tags: ["Design Systems", "UI/UX", "Tailwind", "Accessibility"],
  },
  {
    id: "post-4",
    slug: "from-freshman-to-first-open-source-pr",
    title: "From Freshman to First Merged Open Source PR: An Unfiltered Roadmap",
    excerpt:
      "A first-year guide to overcoming impostor syndrome, finding good-first-issues in large codebases, and communicating with senior maintainers respectfully.",
    content: [
      "Opening GitHub for the first time and looking at a 50,000-line repository is terrifying. You wonder how anyone ever understands enough code to make a meaningful change.",
      "The secret is that nobody understands the entire codebase. Senior engineers understand module boundaries and search tools. In this article, I share the exact step-by-step workflow that helped me get my first pull request merged into a popular open-source CLI.",
      "We will cover git interactive rebase, crafting clean commit messages, setting up local development containers with zero headaches, and writing test cases that make PR approvals effortless."
    ],
    coverImage: "/bg.jpg",
    category: "Campus Life",
    author: {
      name: "Aditya Nair",
      role: "Open Source Contributor",
      batch: "Batch of 2028",
      avatar: "/featured-saas.jpg",
    },
    date: "Sep 19, 2026",
    readTime: "4 min read",
    tags: ["Open Source", "Git", "Career", "Freshmen"],
  },
  {
    id: "post-5",
    slug: "hackathon-survival-guide-36-hours",
    title: "The 36-Hour Hackathon Survival Manual: From Idea Pivot to Winning Pitch",
    excerpt:
      "Lessons from winning 4 national collegiate hackathons: pitch deck anatomy, fake-door MVPs, presentation timing, and keeping team energy high at 4:00 AM.",
    content: [
      "Hackathons are rarely won by the team that writes the most code. They are won by the team that clearly identifies a painful problem, demonstrates a working prototype that solves it, and tells an unforgettable story in 3 minutes.",
      "Having competed in and judged dozens of campus hackathons, our team compiled this playbook: how to avoid the 'idea paralysis' trap in the first 4 hours, how to assign clear roles between frontend, backend, and pitch design, and why sleeping for 3 hours beats pulling an all-nighter every single time."
    ],
    coverImage: "/collage.png",
    category: "Startups",
    author: {
      name: "Ishaan Mehta",
      role: "Hackathon Lead",
      batch: "Batch of 2026",
      avatar: "/bg.jpg",
    },
    date: "Sep 05, 2026",
    readTime: "7 min read",
    tags: ["Hackathons", "Pitching", "Prototyping", "Teamwork"],
  },
  {
    id: "post-6",
    slug: "building-ai-agents-with-tool-use",
    title: "Beyond Chatbots: Building Autonomous LLM Tool-Use Loops with TypeScript",
    excerpt:
      "How to design deterministic agentic loops, schema-enforced JSON validation, and error recovery workflows for AI assistants that actually do work.",
    content: [
      "The transition from conversational chatbots to autonomous agents happens the moment an LLM can invoke external tools: querying databases, executing shell commands, or interacting with web APIs.",
      "In this tutorial, we implement a lightweight agent runtime from scratch using TypeScript and Zod. We explore re-act loops, token-budget management, and how to prevent cascading prompt hallucinations through deterministic guardrails."
    ],
    coverImage: "/featured-launch.jpg",
    category: "Engineering",
    author: {
      name: "Siddharth Rao",
      role: "AI Lead",
      batch: "Batch of 2027",
      avatar: "/featured-collab.jpg",
    },
    date: "Aug 22, 2026",
    readTime: "9 min read",
    tags: ["AI", "TypeScript", "LLM", "Agents"],
  },
];
