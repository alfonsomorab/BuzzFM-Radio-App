import { notFound } from "next/navigation";
import { db } from "@/db";
import { radioStations } from "@/db/schema";
import { eq } from "drizzle-orm";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { StationForm } from "@/components/admin/StationForm";
import { updateStation } from "../../actions";

interface EditStationPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditStationPage({ params }: EditStationPageProps) {
  const { id } = await params;

  const [station] = await db
    .select()
    .from(radioStations)
    .where(eq(radioStations.id, id));

  if (!station) {
    notFound();
  }

  // Bind station id to the action
  const updateStationWithId = updateStation.bind(null, id);

  return (
    <div>
      <div className="mb-4">
        <h1>Edit Station: {station.name}</h1>
        <p className="text-muted">Update station information and configuration.</p>
      </div>

      <StationForm station={station} action={updateStationWithId} />
    </div>
  );
}
