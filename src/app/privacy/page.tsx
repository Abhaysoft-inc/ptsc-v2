import Link from "next/link";
import LegalPage, { type LegalSection } from "@/components/site/LegalPage";

export const metadata = {
  title: "Privacy | PTSC Club",
  description:
    "What the Programming and Tech Skills Club website collects, why, who can see it, and how to ask for changes.",
};

const sections: LegalSection[] = [
  {
    id: "overview",
    title: "Overview",
    content: (
      <>
        <p>
          This page explains what information the Programming and Tech Skills Club (&ldquo;the
          club&rdquo;, &ldquo;we&rdquo;) collects through this website, why we collect it, and what
          you can do about it. We&apos;re a student club, so we keep things simple and collect only
          what we need to run our events and members&apos; accounts.
        </p>
      </>
    ),
  },
  {
    id: "what-we-collect",
    title: "What we collect",
    content: (
      <>
        <p>
          <strong>If you create an account:</strong>
        </p>
        <ul>
          <li>Your first and last name, username, email address and mobile number.</li>
          <li>Your graduation year (batch), and your position in the club if you have one.</li>
          <li>
            A password. We store only a scrambled (hashed) version, so nobody, including the team,
            can read it.
          </li>
          <li>Whether your account is approved, and your role (member, admin or normal).</li>
        </ul>
        <p>
          <strong>If you register for an event:</strong>
        </p>
        <ul>
          <li>
            Your name, gender, roll number, mobile number and email address. If you register as a
            team, the same for each team member, plus the team name.
          </li>
          <li>
            Your branch and year, which we work out from your roll number, and your answers to any
            extra questions the event asks.
          </li>
          <li>Whether you were checked in at the event, and when.</li>
        </ul>
        <p>
          <strong>Automatically:</strong>
        </p>
        <ul>
          <li>
            A short-lived counter based on your IP address (and, when signing in, the email you
            typed) that limits repeated attempts and protects the site from abuse. It deletes
            itself after a short time.
          </li>
          <li>
            A record of emails we send you about events, such as confirmations and certificates,
            and whether they were delivered.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: "how-we-use-it",
    title: "How we use it",
    content: (
      <>
        <ul>
          <li>To run events: manage registrations, check people in and issue certificates.</li>
          <li>To approve new members and let them sign in.</li>
          <li>To contact you about events you registered for, or about your account.</li>
          <li>To keep the website secure and working.</li>
        </ul>
        <p>We don&apos;t use your information for advertising, and the site has no ad trackers.</p>
      </>
    ),
  },
  {
    id: "who-can-see-it",
    title: "Who can see it",
    content: (
      <>
        <ul>
          <li>
            <strong>Registrations and accounts</strong> can be seen by the club&apos;s admins and
            members who run events. They are not public.
          </li>
          <li>
            <strong>The Team page</strong> is public. It shows the name, position, batch and
            photo (if one was added) of approved members.
          </li>
        </ul>
        <p>
          Other registrants are never shown your details. After you register, you only see your own
          confirmation.
        </p>
      </>
    ),
  },
  {
    id: "services",
    title: "Services we use",
    content: (
      <>
        <p>
          To run the website we rely on other services that handle data on our behalf: a database
          and hosting provider that stores the information above, an email service that delivers
          our messages, and Cloudinary, which stores images organisers upload (such as event cover
          pictures). They only process data for us and don&apos;t use it for their own purposes.
        </p>
        <p>We don&apos;t sell your information.</p>
      </>
    ),
  },
  {
    id: "cookies",
    title: "Cookies and browser storage",
    content: (
      <>
        <p>
          When you sign in we set one cookie, <code>ptsc_session</code>, to keep you signed in. It
          can&apos;t be read by scripts on the page. It lasts until you close your browser, or up to
          30 days if you choose &ldquo;remember me&rdquo;. Signing out removes it.
        </p>
        <p>
          We don&apos;t use advertising or analytics cookies. Organisers&apos; browsers also keep a
          half-finished &ldquo;create event&rdquo; form on their own device so it isn&apos;t lost.
          It is never sent anywhere until the event is created.
        </p>
      </>
    ),
  },
  {
    id: "keeping-it",
    title: "How long we keep it",
    content: (
      <>
        <p>
          We keep account details while your account exists. We keep event registrations and
          attendance so we can run the event, answer questions about it and issue certificates
          afterwards. A registration removed by an admin is moved to a trash first and isn&apos;t
          deleted straight away.
        </p>
      </>
    ),
  },
  {
    id: "your-choices",
    title: "Your choices",
    content: (
      <>
        <p>
          You can ask us to show you what we hold about you, correct it, or delete your account or
          registrations. Contact a club coordinator (you&apos;ll find them on the{" "}
          <Link href="/team">Team page</Link>) and tell us which email or roll number you used.
        </p>
      </>
    ),
  },
  {
    id: "security",
    title: "Security",
    content: (
      <>
        <p>
          Passwords are hashed, the sign-in cookie is protected from scripts, and access to
          registrations is limited to the people who run events. No website can promise perfect
          security, so please use a strong password you don&apos;t use elsewhere and tell us if you
          notice anything wrong.
        </p>
      </>
    ),
  },
  {
    id: "changes",
    title: "Changes to this page",
    content: (
      <>
        <p>
          If we change how we handle information, we&apos;ll update this page and the date at the
          top. For questions about it, contact a club coordinator as described above. You can also
          read our <Link href="/terms">Terms</Link>.
        </p>
      </>
    ),
  },
];

export default function PrivacyPage() {
  return (
    <LegalPage
      path="privacy"
      title="Privacy"
      lead="What we collect, why we collect it, and what you can do about it, in plain language."
      updated="11 November 2026"
      sections={sections}
    />
  );
}
