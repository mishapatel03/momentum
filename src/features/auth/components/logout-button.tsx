import { LogOut } from "lucide-react";

import { Button } from "@/components/ui/button";

import { logout } from "../actions";

export function LogoutButton({ className }: { className?: string }) {
  return (
    <form action={logout}>
      <Button type="submit" variant="outline" className={className}>
        <LogOut aria-hidden />
        Log out
      </Button>
    </form>
  );
}
