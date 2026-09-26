import { notFound } from "next/navigation";
import { getUserByToken } from "@/lib/db";
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
      <main className="card">
        <span className="user-number">No. {user.user_number}</span>
        <h1>Registration</h1>
        <p className="subtitle">
          Welcome! Please fill in your details below. You only need to do this
          once.
        </p>
        <RegisterForm token={user.token} />
      </main>
    );
  }

  return (
    <main className="card">
      <span className="user-number">No. {user.user_number}</span>
      <h1>Welcome back, {user.name}!</h1>
      <p className="welcome-text">
        Thank you for being part of this event. You are our guest number{" "}
        {user.user_number}, and this page is yours alone — keep your QR code
        handy and show it at the entrance whenever you visit. We are delighted
        to have you with us and hope you enjoy every moment of the experience.
      </p>
    </main>
  );
}
