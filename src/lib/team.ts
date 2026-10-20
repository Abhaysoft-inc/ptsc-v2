export interface TeamMember {
  id: string;
  name: string;
  role: string;
  batch: "2026" | "2027" | "2028" | "2029";
  subdomain?: "Core" | "Tech" | "Design" | "Operations" | "Community";
  bio: string;
  avatar?: string;
  github?: string;
  twitter?: string;
  linkedin?: string;
}

export const teamBatches = ["All", "2026", "2027", "2028", "2029"] as const;

export const teamMembers: TeamMember[] = [
  // BATCH 2026 (Founders & Final Year Mentors)
  {
    id: "member-1",
    name: "Abhay Sharma",
    role: "President & Community Founder",
    batch: "2026",
    subdomain: "Core",
    bio: "Full-stack engineer, indie hacker, and community architect leading campus tech initiatives.",
    github: "https://github.com",
    twitter: "https://x.com",
    linkedin: "https://linkedin.com",
  },
  {
    id: "member-2",
    name: "Ananya Deshmukh",
    role: "Vice President & AI Lead",
    batch: "2026",
    subdomain: "Core",
    bio: "Building generative AI pipelines and mentoring members on LLM application architecture.",
    github: "https://github.com",
    twitter: "https://x.com",
    linkedin: "https://linkedin.com",
  },
  {
    id: "member-3",
    name: "Karan Verma",
    role: "Technical Advisor",
    batch: "2026",
    subdomain: "Tech",
    bio: "Distributed systems enthusiast and past hackathon winner passionate about open-source tooling.",
    github: "https://github.com",
    twitter: "https://x.com",
    linkedin: "https://linkedin.com",
  },

  // BATCH 2027 (Core Tech & Design Leads)
  {
    id: "member-4",
    name: "Rohan Patel",
    role: "Full-Stack Web Lead",
    batch: "2027",
    subdomain: "Tech",
    bio: "Next.js, Tailwind, and Supabase builder orchestrating internal platform engineering.",
    github: "https://github.com",
    twitter: "https://x.com",
    linkedin: "https://linkedin.com",
  },
  {
    id: "member-5",
    name: "Meera Nair",
    role: "Design & UX Director",
    batch: "2027",
    subdomain: "Design",
    bio: "Crafting polished visual systems, design tokens, and fluid interactive web experiences.",
    github: "https://github.com",
    twitter: "https://x.com",
    linkedin: "https://linkedin.com",
  },
  {
    id: "member-6",
    name: "Aditya Kulkarni",
    role: "DevOps & Cloud Lead",
    batch: "2027",
    subdomain: "Tech",
    bio: "Automating CI/CD pipelines, container orchestration, and serverless infrastructure.",
    github: "https://github.com",
    twitter: "https://x.com",
    linkedin: "https://linkedin.com",
  },
  {
    id: "member-7",
    name: "Tanvi Saxena",
    role: "Head of Events & Operations",
    batch: "2027",
    subdomain: "Operations",
    bio: "Managing hackathons, guest speaker workshops, and campus developer meetups.",
    github: "https://github.com",
    twitter: "https://x.com",
    linkedin: "https://linkedin.com",
  },

  // BATCH 2028 (Associate Builders & Hackers)
  {
    id: "member-8",
    name: "Siddharth Rao",
    role: "Frontend Engineer & Mentor",
    batch: "2028",
    subdomain: "Tech",
    bio: "React & TypeScript developer building micro-apps and teaching web development fundamentals.",
    github: "https://github.com",
    twitter: "https://x.com",
    linkedin: "https://linkedin.com",
  },
  {
    id: "member-9",
    name: "Pooja Hegde",
    role: "Community Evangelist",
    batch: "2028",
    subdomain: "Community",
    bio: "Engaging student founders, managing campus outreach, and organizing demo critique circles.",
    github: "https://github.com",
    twitter: "https://x.com",
    linkedin: "https://linkedin.com",
  },
  {
    id: "member-10",
    name: "Vikram Malhotra",
    role: "Mobile Apps Developer",
    batch: "2028",
    subdomain: "Tech",
    bio: "Flutter and React Native developer exploring cross-platform utilities and campus tools.",
    github: "https://github.com",
    twitter: "https://x.com",
    linkedin: "https://linkedin.com",
  },

  // BATCH 2029 (Freshmen Apprentices & Rising Stars)
  {
    id: "member-11",
    name: "Arya Sen",
    role: "Apprentice Developer",
    batch: "2029",
    subdomain: "Tech",
    bio: "Eager learner diving deep into JavaScript, Git workflows, and building first side projects.",
    github: "https://github.com",
    twitter: "https://x.com",
    linkedin: "https://linkedin.com",
  },
  {
    id: "member-12",
    name: "Ishita Roy",
    role: "Design Apprentice",
    batch: "2029",
    subdomain: "Design",
    bio: "Figma enthusiast exploring UI design, typography, and community visual branding.",
    github: "https://github.com",
    twitter: "https://x.com",
    linkedin: "https://linkedin.com",
  },
  {
    id: "member-13",
    name: "Nikhil Joshi",
    role: "Competitive Programming Enthusiast",
    batch: "2029",
    subdomain: "Tech",
    bio: "Data structures and algorithms enthusiast solving algorithmic challenges and contests.",
    github: "https://github.com",
    twitter: "https://x.com",
    linkedin: "https://linkedin.com",
  },
];
