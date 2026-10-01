import { notFound } from "next/navigation";
import { getUserByToken } from "@/lib/db";
import Certificate from "./Certificate";
import RegisterForm from "./RegisterForm";

// Always read fresh state from the database on every request.
export const dynamic = "force-dynamic";

export default async function UserPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const user = getUserByToken(token);

  // Unknown token -> 404. Tokens are long and random, so visitors cannot
  // stumble onto someone else's page by guessing or mistyping a URL.
  if (!user) notFound();

  if (!user.name) {
    return (
      <main className="edition">
        <div className="edition-inner">
          <img
            className="edition-mark"
            src="/imgs/logo-fameme.png"
            alt="FAMEME"
          />
          <img
            className="edition-welcome"
            src="/imgs/logo-welcome.png"
            alt="Welcome to"
          />
          <img
            className="edition-title"
            src="/imgs/logo-durigrance.png"
            alt="Duri-grance"
          />
          <img
            className="edition-tagline"
            src="/imgs/logo-fame-is-a-scent.png"
            alt="Fame is a Scent"
          />
          <p className="edition-claim">Claim Your Artist Edition</p>
          <p className="edition-number">NO. {user.user_number} / 100</p>
          <p className="edition-copy">
            This digital certificate certifies the identity of this unique
            artist edition of Duri-grance: Fame is a Scent, created by FAMEME
            in 2026.
          </p>
          <RegisterForm token={user.token} />
        </div>
      </main>
    );
  }

  return (
    <Certificate
      name={user.name}
      userNumber={user.user_number}
      registeredAt={user.registered_at ?? ""}
    />
  );
}
