"use client";

import { formatDate } from "@/lib/utils";
import { StatusBadge } from "@/components/ui/Badge";
import Link from "next/link";

interface Payment {
  id: string;
  stationId: string;
  stationName: string | null;
  amount: number;
  paymentDate: string;
  dueDate: string;
  status: "pending" | "paid" | "overdue";
  notes: string | null;
  createdAt: Date;
}

interface PaymentsTableProps {
  payments: Payment[];
}

export function PaymentsTable({ payments }: PaymentsTableProps) {
  if (payments.length === 0) {
    return (
      <div className="text-center py-5 text-muted">
        <i className="bi bi-inbox display-1"></i>
        <p className="mt-3">No payment records found</p>
      </div>
    );
  }

  return (
    <div className="table-responsive">
      <table className="table table-hover">
        <thead>
          <tr>
            <th>Station</th>
            <th>Amount</th>
            <th>Payment Date</th>
            <th>Due Date</th>
            <th>Status</th>
            <th>Notes</th>
            <th className="text-end">Actions</th>
          </tr>
        </thead>
        <tbody>
          {payments.map((payment) => (
            <tr key={payment.id}>
              <td>
                <Link
                  href={`/admin/stations/${payment.stationId}`}
                  className="text-decoration-none"
                >
                  <strong>{payment.stationName || "Unknown"}</strong>
                </Link>
              </td>
              <td>
                <strong>${(payment.amount / 100).toFixed(2)}</strong>
              </td>
              <td>
                <div>
                  {formatDate(payment.paymentDate)}
                  <br />
                  <small className="text-muted">
                    {new Date(payment.paymentDate).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric'
                    })}
                  </small>
                </div>
              </td>
              <td>
                <div>
                  {formatDate(payment.dueDate)}
                  <br />
                  <small className="text-muted">
                    {new Date(payment.dueDate).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric'
                    })}
                  </small>
                </div>
              </td>
              <td>
                <StatusBadge
                  status={payment.status === "paid" ? "active" : "suspended"}
                  customLabel={payment.status === "paid" ? "Paid" : payment.status === "pending" ? "Pending" : "Overdue"}
                />
              </td>
              <td>
                <small className="text-muted">
                  {payment.notes ? (
                    payment.notes.length > 50
                      ? `${payment.notes.substring(0, 50)}...`
                      : payment.notes
                  ) : (
                    <span className="text-muted fst-italic">No notes</span>
                  )}
                </small>
              </td>
              <td className="text-end">
                <Link
                  href={`/admin/stations/${payment.stationId}`}
                  className="btn btn-sm btn-outline-primary"
                  title="View Station"
                >
                  <i className="bi bi-eye"></i>
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
