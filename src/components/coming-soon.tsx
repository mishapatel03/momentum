import type { LucideIcon } from "lucide-react";

export function ComingSoon({ icon: Icon, text }: { icon: LucideIcon; text: string }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed px-4 py-16 text-center text-muted-foreground">
      <Icon className="size-8" aria-hidden />
      <p>{text}</p>
    </div>
  );
}
