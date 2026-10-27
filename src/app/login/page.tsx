import { Suspense } from "react";
import LoginClient from "./LoginClient";

export const metadata = {
  title: "Sign In | PTSC Club Builder Portal",
  description: "Sign in to your PTSC Network account to access event passes, project showcases, and developer tools.",
};

export default function LoginPage() {
  // LoginClient reads ?next= from the URL, which needs a Suspense boundary.
  return (
    <Suspense fallback={null}>
      <LoginClient />
    </Suspense>
  );
}
