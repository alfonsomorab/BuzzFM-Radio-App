"use client";

import { useActionState, useEffect, useState } from "react";
import { FormField } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";

interface Station {
  id: string;
  name: string;
  contactEmail: string;
  subscriptionDueDate: string | null;
  status: "active" | "suspended";
}

interface EmailReminderFormProps {
  stations: Station[];
  action: (prevState: any, formData: FormData) => Promise<any>;
}

export function EmailReminderForm({ stations, action }: EmailReminderFormProps) {
  const { showToast } = useToast();
  const [state, formAction, isPending] = useActionState(action, null);
  const [selectedStations, setSelectedStations] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (state?.success) {
      showToast(state.message || "Emails sent successfully", "success");
      setSelectedStations(new Set()); // Clear selection
    } else if (state?.error) {
      showToast(state.error, "error");
    }
  }, [state, showToast]);

  const handleSelectAll = () => {
    if (selectedStations.size === stations.length) {
      setSelectedStations(new Set());
    } else {
      setSelectedStations(new Set(stations.map(s => s.id)));
    }
  };

  const handleToggleStation = (id: string) => {
    const newSelected = new Set(selectedStations);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedStations(newSelected);
  };

  return (
    <form action={formAction}>
      <FormField
        label="Email Template"
        name="templateType"
        as="select"
        required
        error={state?.errors?.templateType?.[0]}
      >
        <option value="7-day">7-Day Reminder (7 days before due date)</option>
        <option value="1-day">1-Day Reminder (1 day before due date)</option>
      </FormField>

      <FormField
        label="Custom Message (Optional)"
        name="customMessage"
        as="textarea"
        rows={4}
        placeholder="Add a custom message to append to the email..."
        helpText="This will be added to the end of the template email"
        error={state?.errors?.customMessage?.[0]}
      />

      <div className="mb-3">
        <div className="d-flex justify-content-between align-items-center mb-2">
          <label className="form-label mb-0">
            Select Stations
            <span className="text-danger ms-1">*</span>
          </label>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={handleSelectAll}
          >
            {selectedStations.size === stations.length ? "Deselect All" : "Select All"}
          </Button>
        </div>

        {state?.errors?.stationIds && (
          <div className="text-danger small mb-2">{state.errors.stationIds[0]}</div>
        )}

        <div className="border rounded p-3" style={{ maxHeight: "300px", overflowY: "auto" }}>
          {stations.length === 0 ? (
            <div className="text-muted text-center py-3">
              No stations with upcoming renewals found
            </div>
          ) : (
            <div className="list-group list-group-flush">
              {stations.map((station) => (
                <div key={station.id} className="list-group-item px-0 border-0">
                  <div className="form-check">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      id={`station_${station.id}`}
                      name={`station_${station.id}`}
                      checked={selectedStations.has(station.id)}
                      onChange={() => handleToggleStation(station.id)}
                    />
                    <label
                      className="form-check-label w-100"
                      htmlFor={`station_${station.id}`}
                    >
                      <div className="d-flex justify-content-between">
                        <div>
                          <strong>{station.name}</strong>
                          <br />
                          <small className="text-muted">{station.contactEmail}</small>
                        </div>
                        <div className="text-end">
                          <small className="text-muted">
                            Due: {station.subscriptionDueDate
                              ? new Date(station.subscriptionDueDate).toLocaleDateString()
                              : "N/A"}
                          </small>
                        </div>
                      </div>
                    </label>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        {selectedStations.size > 0 && (
          <div className="form-text">
            {selectedStations.size} station(s) selected
          </div>
        )}
      </div>

      <Button
        type="submit"
        variant="primary"
        loading={isPending}
        disabled={selectedStations.size === 0 || isPending}
      >
        <i className="bi bi-send me-2"></i>
        Send Emails ({selectedStations.size})
      </Button>
    </form>
  );
}
