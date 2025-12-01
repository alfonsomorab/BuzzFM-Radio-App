import Link from "next/link";
import { db } from "@/db";
import { radioStations, payments } from "@/db/schema";
import { eq, count, and, gte } from "drizzle-orm";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { isWithinDays, isPast } from "@/lib/utils";

export default async function AdminDashboard() {
  // Fetch statistics
  const [allStations, activeStations, suspendedStations, allPayments] = await Promise.all([
    db.select({ count: count() }).from(radioStations),
    db.select({ count: count() }).from(radioStations).where(eq(radioStations.status, "active")),
    db.select({ count: count() }).from(radioStations).where(eq(radioStations.status, "suspended")),
    db.select().from(payments),
  ]);

  const totalStations = allStations[0].count;
  const activeCount = activeStations[0].count;
  const suspendedCount = suspendedStations[0].count;

  // Calculate payment statistics
  const pendingPayments = allPayments.filter((p) => p.status === "pending").length;
  const overduePayments = allPayments.filter((p) => p.status === "overdue").length;

  // Get stations with subscriptions expiring soon
  const stationsList = await db.select().from(radioStations);
  const expiringStations = stationsList.filter(
    (s) => s.subscriptionDueDate && isWithinDays(s.subscriptionDueDate, 7)
  );
  const expiredStations = stationsList.filter(
    (s) => s.subscriptionDueDate && isPast(s.subscriptionDueDate)
  );

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Dashboard</h1>
        <Link href="/admin/stations/new">
          <Button variant="primary">
            <i className="bi bi-plus-lg me-2"></i>
            Add New Station
          </Button>
        </Link>
      </div>

      {/* Statistics Cards */}
      <div className="row mb-4">
        <div className="col-md-3">
          <Card className="admin-stat-card">
            <CardBody>
              <p className="admin-stat-number">{totalStations}</p>
              <p className="admin-stat-label mb-0">Total Stations</p>
            </CardBody>
          </Card>
        </div>
        <div className="col-md-3">
          <Card className="admin-stat-card success">
            <CardBody>
              <p className="admin-stat-number text-success">{activeCount}</p>
              <p className="admin-stat-label mb-0">Active Stations</p>
            </CardBody>
          </Card>
        </div>
        <div className="col-md-3">
          <Card className="admin-stat-card warning">
            <CardBody>
              <p className="admin-stat-number text-warning">{pendingPayments}</p>
              <p className="admin-stat-label mb-0">Pending Payments</p>
            </CardBody>
          </Card>
        </div>
        <div className="col-md-3">
          <Card className="admin-stat-card danger">
            <CardBody>
              <p className="admin-stat-number text-danger">{overduePayments}</p>
              <p className="admin-stat-label mb-0">Overdue Payments</p>
            </CardBody>
          </Card>
        </div>
      </div>

      {/* Alerts */}
      {expiredStations.length > 0 && (
        <div className="alert alert-danger mb-4">
          <i className="bi bi-exclamation-triangle-fill me-2"></i>
          <strong>{expiredStations.length}</strong> station(s) have expired subscriptions
        </div>
      )}

      {expiringStations.length > 0 && (
        <div className="alert alert-warning mb-4">
          <i className="bi bi-clock-fill me-2"></i>
          <strong>{expiringStations.length}</strong> station(s) have subscriptions expiring within 7 days
        </div>
      )}

      {/* Quick Actions */}
      <div className="row mb-4">
        <div className="col-md-4">
          <Link href="/admin/stations" className="text-decoration-none">
            <Card hover className="quick-action-card">
              <CardBody className="text-center py-4">
                <i className="bi bi-broadcast display-4 text-primary mb-3 d-block"></i>
                <h5>Manage Stations</h5>
                <p className="text-muted mb-0">View and manage all radio stations</p>
              </CardBody>
            </Card>
          </Link>
        </div>
        <div className="col-md-4">
          <Link href="/admin/payments" className="text-decoration-none">
            <Card hover className="quick-action-card">
              <CardBody className="text-center py-4">
                <i className="bi bi-cash-stack display-4 text-success mb-3 d-block"></i>
                <h5>Track Payments</h5>
                <p className="text-muted mb-0">Record and monitor subscription payments</p>
              </CardBody>
            </Card>
          </Link>
        </div>
        <div className="col-md-4">
          <Link href="/admin/emails" className="text-decoration-none">
            <Card hover className="quick-action-card">
              <CardBody className="text-center py-4">
                <i className="bi bi-envelope display-4 text-info mb-3 d-block"></i>
                <h5>Send Emails</h5>
                <p className="text-muted mb-0">Manage email templates and reminders</p>
              </CardBody>
            </Card>
          </Link>
        </div>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <h5 className="mb-0">System Information</h5>
        </CardHeader>
        <CardBody>
          <ul className="list-unstyled mb-0">
            <li className="mb-2">
              <i className="bi bi-info-circle me-2 text-primary"></i>
              Total Stations: {totalStations} ({activeCount} active, {suspendedCount} suspended)
            </li>
            <li className="mb-2">
              <i className="bi bi-calendar-check me-2 text-success"></i>
              Payments: {allPayments.length} total, {pendingPayments} pending, {overduePayments} overdue
            </li>
            <li className="mb-0">
              <i className="bi bi-clock-history me-2 text-info"></i>
              Last updated: {new Date().toLocaleString()}
            </li>
          </ul>
        </CardBody>
      </Card>
    </div>
  );
}
