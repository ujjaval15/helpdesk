import { useNavigate } from "react-router-dom";
import { signOut, useSession } from "../lib/auth-client";

function NavBar() {
  const navigate = useNavigate();
  const { data: session } = useSession();

  async function handleSignOut() {
    await signOut();
    navigate("/login");
  }

  return (
    <header className="border-b border-gray-200 bg-white">
      <nav className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <span className="text-lg font-semibold text-gray-900">Helpdesk</span>

        {session && (
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-700">{session.user.name}</span>
            <button
              onClick={handleSignOut}
              className="rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Sign out
            </button>
          </div>
        )}
      </nav>
    </header>
  );
}

export default NavBar;
