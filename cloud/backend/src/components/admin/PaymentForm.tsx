"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FormField } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";

interface PaymentFormProps {
  stations: { id: string; name: string }[];
  action: (prevState: any, formData: FormData) => Promise<any>;
}

export function PaymentForm({ stations, action }: PaymentFormProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const [state, formAction, isPending] = useActionState(action, null);

  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    if (state?.success) {
      showToast(state.message || "Payment recorded successfully", "success");
      router.push("/admin/payments");
    } else if (state?.error) {
      showToast(state.error, "error");
    }
  }, [state, showToast, router]);

  return (
    <form action={formAction}>
      <div className="row">
        <div className="col-md-6">
          <FormField
            label="Station"
            name="stationId"
            as="select"
            required
            error={state?.errors?.stationId?.[0]}
          >
            <option value="">Select a station...</option>
            {stations.map((station) => (
              <option key={station.id} value={station.id}>
                {station.name}
              </option>
            ))}
          </FormField>
        </div>

        <div className="col-md-6">
          <FormField
            label="Payment Date"
            name="paymentDate"
            type="date"
            defaultValue={today}
            required
            error={state?.errors?.paymentDate?.[0]}
          />
        </div>
      </div>

      <div className="row">
        <div className="col-md-6">
          <FormField
            label="Amount (in cents)"
            name="amount"
            type="number"
            placeholder="5000"
            helpText="Enter amount in cents (e.g., 5000 = $50.00)"
            required
            error={state?.errors?.amount?.[0]}
          />
        </div>

        <div className="col-md-6">
          <FormField
            label="Status"
            name="status"
            as="select"
            required
            error={state?.errors?.status?.[0]}
          >
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
            <option value="overdue">Overdue</option>
          </FormField>
        </div>
      </div>

      <FormField
        label="Extend Subscription (days)"
        name="extendSubscriptionDays"
        type="number"
        placeholder="30"
        helpText="Optional: Days to extend the subscription from current due date"
        error={state?.errors?.extendSubscriptionDays?.[0]}
      />

      <FormField
        label="Notes"
        name="notes"
        as="textarea"
        rows={3}
        placeholder="Add any notes about this payment..."
        error={state?.errors?.notes?.[0]}
      />

      <div className="d-flex gap-2 mt-4">
        <Button type="submit" variant="primary" loading={isPending}>
          <i className="bi bi-check-lg me-2"></i>
          Record Payment
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={() => router.back()}
          disabled={isPending}
        >
          <i className="bi bi-x-lg me-2"></i>
          Cancel
        </Button>
      </div>
    </form>
  );
}
