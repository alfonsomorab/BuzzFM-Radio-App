import Link from "next/link";
import { db } from "@/db";
import { payments, radioStations } from "@/db/schema";
import { desc, eq, and, gte, lte } from "drizzle-orm";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { PaymentsTable } from "@/components/admin/PaymentsTable";
import { PaymentFilters } from "@/components/admin/PaymentFilters";

interface PaymentsPageProps {
  searchParams: Promise<{
    status?: string;
    stationId?: string;
    startDate?: string;
    endDate?: string;
  }>;
}

export default async function PaymentsPage({ searchParams }: PaymentsPageProps) {
  const params = await searchParams;
  const { status, stationId, startDate, endDate } = params;

  // Build query conditions
  const conditions = [];

  if (status && status !== "all") {
    conditions.push(eq(payments.status, status as any));
  }

  if (stationId) {
    conditions.push(eq(payments.stationId, stationId));
  }

  if (startDate) {
    conditions.push(gte(payments.paymentDate, startDate));
  }

  if (endDate) {
    conditions.push(lte(payments.paymentDate, endDate));
  }

  // Fetch payments with station details
  const paymentsList = await db
    .select({
      id: payments.id,
      stationId: payments.stationId,
      stationName: radioStations.name,
      amount: payments.amount,
      paymentDate: payments.paymentDate,
      dueDate: payments.dueDate,
      status: payments.status,
      notes: payments.notes,
      createdAt: payments.createdAt,
    })
    .from(payments)
    .leftJoin(radioStations, eq(payments.stationId, radioStations.id))
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(payments.createdAt));

  // Fetch all stations for filter dropdown
  const stations = await db
    .select({
      id: radioStations.id,
      name: radioStations.name,
    })
    .from(radioStations)
    .orderBy(radioStations.name);

  // Calculate statistics
  const totalPayments = paymentsList.length;
  const totalAmount = paymentsList.reduce((sum, p) => sum + Number(p.amount), 0);
  const paidCount = paymentsList.filter(p => p.status === "paid").length;
  const pendingCount = paymentsList.filter(p => p.status === "pending").length;
  const overdueCount = paymentsList.filter(p => p.status === "overdue").length;

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1>Payment Management</h1>
          <p className="text-muted mb-0">Track and manage station subscription payments</p>
        </div>
        <Link href="/admin/payments/new">
          <Button variant="primary">
            <i className="bi bi-plus-lg me-2"></i>
            Record Payment
          </Button>
        </Link>
      </div>

      {/* Statistics Cards */}
      <div className="row mb-4">
        <div className="col-md-3">
          <Card>
            <CardBody>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <div className="text-muted small">Total Payments</div>
                  <div className="h3 mb-0">{totalPayments}</div>
                </div>
                <i className="bi bi-credit-card display-6 text-primary"></i>
              </div>
            </CardBody>
          </Card>
        </div>
        <div className="col-md-3">
          <Card>
            <CardBody>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <div className="text-muted small">Total Amount</div>
                  <div className="h3 mb-0">${(totalAmount / 100).toFixed(2)}</div>
                </div>
                <i className="bi bi-currency-dollar display-6 text-success"></i>
              </div>
            </CardBody>
          </Card>
        </div>
        <div className="col-md-3">
          <Card>
            <CardBody>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <div className="text-muted small">Pending</div>
                  <div className="h3 mb-0">{pendingCount}</div>
                </div>
                <i className="bi bi-clock-history display-6 text-warning"></i>
              </div>
            </CardBody>
          </Card>
        </div>
        <div className="col-md-3">
          <Card>
            <CardBody>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <div className="text-muted small">Overdue</div>
                  <div className="h3 mb-0">{overdueCount}</div>
                </div>
                <i className="bi bi-exclamation-triangle display-6 text-danger"></i>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>

      {/* Filters and Table */}
      <Card>
        <CardHeader>
          <div className="d-flex justify-content-between align-items-center">
            <h5 className="mb-0">Payment Records</h5>
          </div>
        </CardHeader>
        <CardBody>
          <PaymentFilters
            stations={stations}
            currentFilters={params}
          />
          <PaymentsTable payments={paymentsList} />
        </CardBody>
      </Card>
    </div>
  );
}
