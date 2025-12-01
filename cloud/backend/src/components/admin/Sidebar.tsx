"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: "bi-speedometer2" },
  { href: "/admin/stations", label: "Radio Stations", icon: "bi-broadcast" },
  { href: "/admin/payments", label: "Payments", icon: "bi-cash-stack" },
  { href: "/admin/emails", label: "Email Templates", icon: "bi-envelope" },
  { href: "/admin/settings", label: "Settings", icon: "bi-gear" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="bg-dark text-white" style={{ width: "var(--sidebar-width)", minHeight: "100vh" }}>
      <div className="p-4">
        <h4 className="mb-4">
          <i className="bi bi-broadcast me-2"></i>
          Radio Admin
        </h4>
        <nav>
          <ul className="nav flex-column">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <li className="nav-item" key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      "nav-link text-white d-flex align-items-center py-2 px-3 rounded",
                      isActive && "bg-primary"
                    )}
                  >
                    <i className={`bi ${item.icon} me-2`}></i>
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </aside>
  );
}
