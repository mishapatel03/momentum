import { Suspense } from "react";

import { LogoutButton } from "@/features/auth/components/logout-button";
import { requireUser } from "@/features/auth/session";

export default function HomePage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 p-4 text-center">
      <h1 className="text-3xl font-semibold tracking-tight">Momentum</h1>
      <Suspense fallback={<p className="text-muted-foreground">Loading…</p>}>
        <SignedInAs />
      </Suspense>
    </main>
  );
}

async function SignedInAs() {
  const user = await requireUser();

  return (
    <>
      <p className="text-muted-foreground">Signed in as {user.email}</p>
      <LogoutButton />
    </>
  );
}
