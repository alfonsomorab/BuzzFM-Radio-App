import Link from "next/link";
import { db } from "@/db";
import { radioStations } from "@/db/schema";
import { desc } from "drizzle-orm";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { StationsTable } from "@/components/admin/StationsTable";

export default async function StationsPage() {
  const stations = await db.select().from(radioStations).orderBy(desc(radioStations.createdAt));

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Radio Stations</h1>
        <Link href="/admin/stations/new">
          <Button variant="primary">
            <i className="bi bi-plus-lg me-2"></i>
            Add New Station
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <div className="d-flex justify-content-between align-items-center">
            <h5 className="mb-0">All Stations ({stations.length})</h5>
            <div className="text-muted small">
              <i className="bi bi-info-circle me-1"></i>
              Click on a station to view details
            </div>
          </div>
        </CardHeader>
        <CardBody className="p-0">
          <StationsTable stations={stations} />
        </CardBody>
      </Card>
    </div>
  );
}
