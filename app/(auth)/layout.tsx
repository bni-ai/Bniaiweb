import type { ReactNode } from "react";

import { Card } from "../../components/ui/card";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-surface-2 p-6">
      <Card className="w-full max-w-lg p-8">{children}</Card>
    </main>
  );
}
