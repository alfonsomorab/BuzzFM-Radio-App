import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { StationForm } from "@/components/admin/StationForm";
import { createStation } from "../actions";

export default function NewStationPage() {
  return (
    <div>
      <div className="mb-4">
        <h1>Create New Station</h1>
        <p className="text-muted">
          Add a new radio station to the platform. An API key will be generated automatically.
        </p>
      </div>

      <StationForm action={createStation} />
    </div>
  );
}
