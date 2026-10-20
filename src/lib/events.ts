export interface EventData {
  id: string;
  tag: string;
  month: string;
  day: string | number;
  year?: string;
  title: string;
  description: string;
  longDescription?: string;
  image: string;
  locationTitle: string;
  locationSubtitle: string;
  fullAddress?: string;
  time?: string;
  attendees?: number;
  spotsLeft?: number;
  price?: string;
  status?: "upcoming" | "past";
  whatsappLink?: string;
  rulebookUrl?: string;
  speakers?: {
    name: string;
    role: string;
    avatar?: string;
  }[];
  agenda?: {
    time: string;
    activity: string;
    details: string;
  }[];
}

export const eventsList: EventData[] = [
  {
    id: "discovering-peace",
    tag: "Lush and green",
    month: "JAN",
    day: "25",
    year: "2026",
    title: "Discovering Peace",
    description:
      "Far from the city's noise, the green mountains stretch endlessly into the horizon, blanketed with mist and silence.",
    longDescription:
      "Step away from the notification barrage and constant screen fatigue. Discovering Peace is a creator and builder retreat nestled in the Blue Ridge mountains. Spend an intentional day grounding yourself in open nature, engaging in unhurried conversations with fellow founders, and resetting your mental baseline before shipping your next big milestone.",
    image: "/bg.jpg",
    locationTitle: "Blue Ridge",
    locationSubtitle: "Virginia, USA",
    fullAddress: "Blue Ridge Mountain Summit Pavilion, Shenandoah Trails, Virginia, USA",
    time: "10:00 AM – 3:30 PM EST",
    attendees: 112,
    spotsLeft: 14,
    price: "Free Community Event",
    speakers: [
      {
        name: "Abhay Sharma",
        role: "Community Lead & Founder",
      },
      {
        name: "Elena Rostova",
        role: "Mindfulness & Creative Director",
      },
    ],
    agenda: [
      {
        time: "10:00 AM",
        activity: "Check-in & Forest Coffee",
        details: "Warm brews, fresh air, and welcoming conversation at the base lodge.",
      },
      {
        time: "11:15 AM",
        activity: "Nature Trail & Silent Walk",
        details: "Guided scenic hike through panoramic ridge lines and alpine meadows.",
      },
      {
        time: "1:00 PM",
        activity: "Campfire Lunch & Founder Stories",
        details: "Open-air fireside lunch sharing candid lessons from building in public.",
      },
      {
        time: "2:30 PM",
        activity: "Sunset Reflection & Unplugged Jam",
        details: "Closing perspectives, acoustic notes, and quiet mountain silence.",
      },
    ],
  },
  {
    id: "full-stack-ai-saas",
    tag: "Hands-on Workshop",
    month: "NOV",
    day: "04",
    year: "2026",
    title: "Full-Stack AI SaaS",
    description:
      "A deep-dive build session covering Next.js, API integrations, and shipping a monetization-ready micro-SaaS in one evening.",
    longDescription:
      "Join us for an intensive hands-on workshop designed to take you from a blank repo to a live, paid software product in just a few hours. We will cover Next.js App Router architecture, AI model integration, Stripe billing webhooks, authentication, and zero-downtime deployment pipelines.",
    image: "/bg.jpg",
    locationTitle: "Lecture Hall 201",
    locationSubtitle: "Campus Innovation Hub",
    fullAddress: "Lecture Hall 201, 2nd Floor, Campus Innovation Hub & Tech Center",
    time: "4:00 PM – 7:00 PM IST",
    attendees: 84,
    spotsLeft: 6,
    price: "Free for PTSC Members",
    speakers: [
      {
        name: "Marcus Vance",
        role: "Principal SaaS Architect",
      },
      {
        name: "Sara Chen",
        role: "AI Integration Specialist",
      },
    ],
    agenda: [
      {
        time: "4:00 PM",
        activity: "Architecture Breakdown",
        details: "Modern SaaS stack overview: Next.js, Postgres, Stripe, and LLM APIs.",
      },
      {
        time: "4:45 PM",
        activity: "Live Coding Sprint",
        details: "Hands-on build: building the core logic, API routing, and database schema.",
      },
      {
        time: "6:00 PM",
        activity: "Billing & Deployment",
        details: "Configuring webhooks, Stripe checkout sessions, and deploying to Vercel.",
      },
      {
        time: "6:45 PM",
        activity: "Q&A and Code Reviews",
        details: "Live debugging, architecture feedback, and product monetization advice.",
      },
    ],
  },
  {
    id: "indie-demo-night",
    tag: "Community Showcase",
    month: "NOV",
    day: "18",
    year: "2026",
    title: "Indie Demo Night",
    description:
      "5-minute live demos from student founders and indie hackers. Honest feedback, live bug testing, and networking over coffee.",
    longDescription:
      "No slide decks, no buzzwords—just raw product demos. Indie Demo Night is our monthly gathering where indie hackers show what they built in 5 minutes flat. Get live audience reactions, uncover hidden edge cases, and find your earliest adopters and beta testers.",
    image: "/bg.jpg",
    locationTitle: "Main Seminar Hall",
    locationSubtitle: "Hacker Lounge, Block 4",
    fullAddress: "Auditorium Hall, Hacker Lounge Block 4, PTSC Creative Campus",
    time: "5:30 PM – 8:00 PM IST",
    attendees: 140,
    spotsLeft: 22,
    price: "Free Entry",
    speakers: [
      {
        name: "Devon Miller",
        role: "Demo Host & Indie Builder",
      },
    ],
    agenda: [
      {
        time: "5:30 PM",
        activity: "Doors Open & Networking",
        details: "Meet fellow makers, grab refreshments, and claim front-row seats.",
      },
      {
        time: "6:00 PM",
        activity: "10 Live Lightning Demos",
        details: "5 minutes per product followed by 3 minutes of candid audience feedback.",
      },
      {
        time: "7:20 PM",
        activity: "Audience Choice Vote",
        details: "Vote on the most impressive product and celebrate the winning builders.",
      },
      {
        time: "7:40 PM",
        activity: "Open Mixer & Breakout Circles",
        details: "Connect with demoers, discuss collaborations, and celebrate shipping.",
      },
    ],
  },
];

export function getEventById(id: string): EventData | undefined {
  // Support matching by id or fuzzy slug
  const normalized = id.toLowerCase().trim();
  return eventsList.find(
    (event) =>
      event.id.toLowerCase() === normalized ||
      event.id.replace(/-/g, "") === normalized.replace(/-/g, "")
  );
}

export function getHeroFeaturedEvent(): { event: EventData; isUpcoming: boolean } | null {
  if (eventsList.length === 0) return null;
  const upcoming = eventsList.find((e) => e.status !== "past");
  if (upcoming) {
    return { event: upcoming, isUpcoming: true };
  }
  // If there's no upcoming event, fall back to the latest recent event
  return { event: eventsList[0], isUpcoming: false };
}

