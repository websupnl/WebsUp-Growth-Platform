import { loginAction } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <span className="bg-brand-gradient bg-clip-text font-heading text-3xl font-bold text-transparent">
            WebsUp
          </span>
          <p className="mt-1 text-muted">Growth Platform</p>
        </div>

        <form
          action={loginAction}
          className="rounded-2xl border border-surface-border bg-surface-raised p-6"
        >
          <Label htmlFor="password">Wachtwoord</Label>
          <Input
            id="password"
            name="password"
            type="password"
            autoFocus
            placeholder="Jouw wachtwoord"
          />
          {error && (
            <p className="mt-2 text-sm text-red-400">
              Onjuist wachtwoord, probeer opnieuw.
            </p>
          )}
          <Button type="submit" className="mt-4 w-full">
            Inloggen
          </Button>
        </form>
      </div>
    </div>
  );
}
