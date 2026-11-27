import Link from "next/link";

import { BottomNav } from "@/components/app-shell/bottom-nav";
import { SidebarNav } from "@/components/app-shell/sidebar-nav";
import { LogoutButton } from "@/features/auth/components/logout-button";

export default function AppLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="flex flex-1">
      <aside className="sticky top-0 hidden h-dvh w-60 shrink-0 flex-col gap-6 border-r bg-sidebar p-4 md:flex">
        <Link href="/" className="px-3 text-lg font-semibold tracking-tight">
          Momentum
        </Link>
        <SidebarNav />
        <div className="mt-auto">
          <LogoutButton className="w-full" />
        </div>
      </aside>

      {/* Bottom padding keeps content clear of the fixed bottom nav on mobile. */}
      <div className="flex min-w-0 flex-1 flex-col pb-[calc(4rem+env(safe-area-inset-bottom))] md:pb-0">
        <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 p-4 sm:p-6 md:py-10">
          {children}
        </main>
      </div>

      <BottomNav />
    </div>
  );
}
