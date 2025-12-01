import { db } from "@/db";
import { radioStations } from "@/db/schema";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { PaymentForm } from "@/components/admin/PaymentForm";
import { recordPayment } from "../actions";

export default async function NewPaymentPage() {
  const stations = await db
    .select({
      id: radioStations.id,
      name: radioStations.name,
    })
    .from(radioStations)
    .orderBy(radioStations.name);

  return (
    <div>
      <div className="mb-4">
        <h1>Record New Payment</h1>
        <p className="text-muted mb-0">Record a subscription payment for a station</p>
      </div>

      <div className="row">
        <div className="col-lg-8">
          <Card>
            <CardHeader>
              <h5 className="mb-0">Payment Details</h5>
            </CardHeader>
            <CardBody>
              <PaymentForm stations={stations} action={recordPayment} />
            </CardBody>
          </Card>
        </div>

        <div className="col-lg-4">
          <Card className="bg-light">
            <CardHeader>
              <h6 className="mb-0">
                <i className="bi bi-info-circle me-2"></i>
                Payment Information
              </h6>
            </CardHeader>
            <CardBody>
              <small className="text-muted">
                <p><strong>Subscription Period:</strong> 30 days from payment date</p>
                <p><strong>Amount:</strong> Enter amount in cents (e.g., 5000 = $50.00)</p>
                <p><strong>Extend Subscription:</strong> Optional days to add to current due date</p>
                <p className="mb-0"><strong>Status:</strong> Set payment status (paid/pending/overdue)</p>
              </small>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
