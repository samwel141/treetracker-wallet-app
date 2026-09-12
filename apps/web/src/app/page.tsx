"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/KeycloakProvider";
import LoadingSpinner from "@/components/LoadingSpinner";

// KeycloakProvider blocks rendering until init has settled, so `authenticated`
// is already authoritative here. Reading sessionStorage directly instead raced
// tokenAtom's async write and bounced a logged-in user to /login, which
// re-triggered login() and looped.
export default function Page() {
  const router = useRouter();
  const { authenticated } = useAuth();

  useEffect(() => {
    router.replace(authenticated ? "/home" : "/login");
  }, [authenticated, router]);

  return <LoadingSpinner />;
}
