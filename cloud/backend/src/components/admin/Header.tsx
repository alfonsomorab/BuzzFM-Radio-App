import { auth } from "@/lib/auth-config";
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/Button";

export async function Header() {
  const session = await auth();

  return (
    <header className="bg-white border-bottom py-3 px-4">
      <div className="d-flex justify-content-between align-items-center">
        <div>
          <h5 className="mb-0">Welcome, {session?.user?.name || "Admin"}</h5>
          <small className="text-muted">{session?.user?.email}</small>
        </div>
        <div>
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/login" });
            }}
          >
            <Button type="submit" variant="outline-secondary" size="sm">
              <i className="bi bi-box-arrow-right me-2"></i>
              Logout
            </Button>
          </form>
        </div>
      </div>
    </header>
  );
}
