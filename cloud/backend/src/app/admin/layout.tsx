import { ReactNode } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import "./admin.css";

interface AdminLayoutPageProps {
  children: ReactNode;
}

export default function AdminLayoutPage({ children }: AdminLayoutPageProps) {
  return <AdminLayout>{children}</AdminLayout>;
}
