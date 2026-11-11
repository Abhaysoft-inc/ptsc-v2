import Link from "next/link";
import LegalPage, { type LegalSection } from "@/components/site/LegalPage";

export const metadata = {
  title: "Terms | PTSC Club",
  description:
    "The rules for using the Programming and Tech Skills Club website, creating an account and registering for events.",
};

const sections: LegalSection[] = [
  {
    id: "using-the-site",
    title: "Using this site",
    content: (
      <>
        <p>
          These terms apply when you use the Programming and Tech Skills Club website
          (&ldquo;the club&rdquo;, &ldquo;we&rdquo;). By using the site, creating an account or
          registering for an event, you agree to them. If you don&apos;t agree, please don&apos;t
          use the site. Our <Link href="/privacy">Privacy page</Link> explains how we handle your
          information.
        </p>
      </>
    ),
  },
  {
    id: "accounts",
    title: "Accounts",
    content: (
      <>
        <ul>
          <li>Give accurate details. Your account is for you alone, so don&apos;t share it.</li>
          <li>Keep your password private, and tell us if you think someone else has it.</li>
          <li>
            New accounts are reviewed by an admin. We can decline, suspend or remove an account,
            for example if the details are false or the account is misused.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: "events",
    title: "Event registration",
    content: (
      <>
        <ul>
          <li>
            Use your own details, including your real roll number. Each roll number can register
            once for an event, alone or as part of a team.
          </li>
          <li>
            Places can be limited, and registration closes after the event day. Registering
            doesn&apos;t guarantee entry if the details are wrong or the event is full or changed.
          </li>
          <li>
            Organisers may change, postpone or cancel an event, and will try to let registered
            people know.
          </li>
          <li>Follow the event&apos;s rules and the organisers&apos; instructions on the day.</li>
        </ul>
      </>
    ),
  },
  {
    id: "acceptable-use",
    title: "Acceptable use",
    content: (
      <>
        <p>Please don&apos;t:</p>
        <ul>
          <li>give false information or register for someone else without their knowledge;</li>
          <li>try to get into accounts, data or parts of the site you aren&apos;t allowed to use;</li>
          <li>overload the site or try to get around its limits, for example with automated sign-ups;</li>
          <li>upload or share anything unlawful, harmful or that infringes someone&apos;s rights.</li>
        </ul>
      </>
    ),
  },
  {
    id: "conduct",
    title: "Respect each other",
    content: (
      <>
        <p>
          The club is for everyone. Harassment, discrimination and bullying, online or at events,
          aren&apos;t acceptable. Organisers can remove people from events, and we can remove
          accounts, if this happens.
        </p>
      </>
    ),
  },
  {
    id: "content",
    title: "Content and ownership",
    content: (
      <>
        <p>
          The site&apos;s design, text and logo belong to the club or its contributors. What you
          create, such as your projects, stays yours. If you share something with us to show on the
          site, such as a photo, you&apos;re telling us you&apos;re allowed to share it and that we
          may display it for the club&apos;s purposes.
        </p>
      </>
    ),
  },
  {
    id: "availability",
    title: "Availability",
    content: (
      <>
        <p>
          We&apos;re students running this in our spare time. The site is provided &ldquo;as
          is&rdquo;, and it may be unavailable or change at times. We&apos;ll do our best to keep it
          running and your information safe.
        </p>
      </>
    ),
  },
  {
    id: "liability",
    title: "Liability",
    content: (
      <>
        <p>
          To the extent the law allows, the club and the people who run it aren&apos;t responsible
          for losses that result from using the site or attending an event, apart from anything we
          can&apos;t exclude by law. Nothing here limits your legal rights.
        </p>
      </>
    ),
  },
  {
    id: "changes",
    title: "Changes and contact",
    content: (
      <>
        <p>
          We may update these terms and will change the date above when we do. Using the site after
          an update means you accept the new terms. For questions, contact a club coordinator
          listed on the <Link href="/team">Team page</Link>.
        </p>
      </>
    ),
  },
];

export default function TermsPage() {
  return (
    <LegalPage
      path="terms"
      title="Terms"
      lead="The simple rules for using the website, having an account and joining our events."
      updated="11 November 2026"
      sections={sections}
    />
  );
}
