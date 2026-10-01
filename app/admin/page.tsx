import { isAdminAuthed } from "@/lib/adminAuth";
import { getAllUsers } from "@/lib/db";
import { guestPageUrl, requestOrigin } from "@/lib/urls";
import { logout, resetUser, saveUser } from "./actions";
import LoginForm from "./LoginForm";
import ResetButton from "./ResetButton";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  if (!(await isAdminAuthed())) {
    return (
      <main className="card">
        <h1>Admin</h1>
        <p className="subtitle">Sign in to manage registrations.</p>
        <LoginForm />
      </main>
    );
  }

  const users = getAllUsers();
  const registered = users.filter((user) => user.name !== null).length;
  const origin = await requestOrigin();

  return (
    <main className="card admin-card">
      <div className="admin-header">
        <div>
          <h1>Registrations</h1>
          <p className="subtitle">
            {registered} of {users.length} registered
          </p>
        </div>
        <form action={logout}>
          <button type="submit" className="btn-secondary">
            Sign out
          </button>
        </form>
      </div>

      {users.map((user) => {
        const pageUrl = guestPageUrl(user.token, origin);
        return (
          <form key={user.user_number} action={saveUser} className="admin-row">
            <input type="hidden" name="user_number" value={user.user_number} />
            <span className="admin-number">{user.user_number}</span>
            <div className="admin-fields">
              <input
                name="name"
                defaultValue={user.name ?? ""}
                placeholder="Name"
              />
              <input
                name="email"
                type="email"
                defaultValue={user.email ?? ""}
                placeholder="Email"
              />
              <a
                className="admin-qr"
                href={pageUrl}
                target="_blank"
                rel="noreferrer"
              >
                {pageUrl}
              </a>
              <span className="admin-date">
                {user.registered_at
                  ? `Registered ${user.registered_at.slice(0, 16)}`
                  : "Not registered"}
              </span>
            </div>
            <span className="admin-actions">
              <button type="submit">Save</button>
              {user.name !== null && (
                <ResetButton action={resetUser} userNumber={user.user_number} />
              )}
            </span>
          </form>
        );
      })}
    </main>
  );
}
