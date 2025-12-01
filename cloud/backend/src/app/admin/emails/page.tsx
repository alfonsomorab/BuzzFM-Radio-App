import { db } from "@/db";
import { radioStations } from "@/db/schema";
import { lte } from "drizzle-orm";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { EmailReminderForm } from "@/components/admin/EmailReminderForm";
import { sendReminderEmails } from "./actions";

export default async function EmailsPage() {
  // Get stations with upcoming due dates (within next 30 days)
  const today = new Date().toISOString().split('T')[0];
  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
  const futureDate = thirtyDaysFromNow.toISOString().split('T')[0];

  const stationsWithDueDates = await db
    .select({
      id: radioStations.id,
      name: radioStations.name,
      contactEmail: radioStations.contactEmail,
      subscriptionDueDate: radioStations.subscriptionDueDate,
      status: radioStations.status,
    })
    .from(radioStations)
    .where(lte(radioStations.subscriptionDueDate, futureDate))
    .orderBy(radioStations.subscriptionDueDate);

  return (
    <div>
      <div className="mb-4">
        <h1>Email Management</h1>
        <p className="text-muted mb-0">Send subscription reminder emails to stations</p>
      </div>

      <div className="row">
        <div className="col-lg-8">
          <Card>
            <CardHeader>
              <h5 className="mb-0">Send Reminder Emails</h5>
            </CardHeader>
            <CardBody>
              <EmailReminderForm stations={stationsWithDueDates} action={sendReminderEmails} />
            </CardBody>
          </Card>
        </div>

        <div className="col-lg-4">
          <Card className="mb-4">
            <CardHeader>
              <h6 className="mb-0">
                <i className="bi bi-info-circle me-2"></i>
                Email Templates
              </h6>
            </CardHeader>
            <CardBody>
              <small className="text-muted">
                <p><strong>7-Day Reminder:</strong> Sent 7 days before subscription expires</p>
                <p className="mb-0"><strong>1-Day Reminder:</strong> Sent 1 day before subscription expires</p>
              </small>
            </CardBody>
          </Card>

          <Card className="bg-light">
            <CardHeader>
              <h6 className="mb-0">
                <i className="bi bi-list-check me-2"></i>
                Stations with Upcoming Renewals
              </h6>
            </CardHeader>
            <CardBody>
              <div className="list-group list-group-flush">
                {stationsWithDueDates.length === 0 ? (
                  <div className="text-muted small">No upcoming renewals</div>
                ) : (
                  stationsWithDueDates.slice(0, 5).map((station) => (
                    <div key={station.id} className="list-group-item px-0 py-2 bg-transparent border-0">
                      <div className="d-flex justify-content-between align-items-start">
                        <div className="small">
                          <strong>{station.name}</strong>
                          <br />
                          <span className="text-muted">
                            Due: {station.subscriptionDueDate ? new Date(station.subscriptionDueDate).toLocaleDateString() : "N/A"}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
