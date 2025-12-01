"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { StatusBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import { formatDate, formatRelativeDate, maskApiKey } from "@/lib/utils";
import type { RadioStation } from "@/db/schema";
import { suspendStation, activateStation } from "@/app/admin/stations/actions";

interface StationsTableProps {
  stations: RadioStation[];
}

export function StationsTable({ stations }: StationsTableProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const [showModal, setShowModal] = useState(false);
  const [selectedStation, setSelectedStation] = useState<RadioStation | null>(null);
  const [actionType, setActionType] = useState<"suspend" | "activate">("suspend");
  const [loading, setLoading] = useState(false);

  const handleAction = async () => {
    if (!selectedStation) return;

    setLoading(true);
    try {
      if (actionType === "suspend") {
        await suspendStation(selectedStation.id);
        showToast(`Station "${selectedStation.name}" has been suspended`, "success");
      } else {
        await activateStation(selectedStation.id);
        showToast(`Station "${selectedStation.name}" has been activated`, "success");
      }
      setShowModal(false);
      router.refresh(); // Refresh to show updated data
    } catch (error) {
      showToast("Failed to update station status", "error");
    } finally {
      setLoading(false);
    }
  };

  const openSuspendModal = (station: RadioStation) => {
    setSelectedStation(station);
    setActionType("suspend");
    setShowModal(true);
  };

  const openActivateModal = (station: RadioStation) => {
    setSelectedStation(station);
    setActionType("activate");
    setShowModal(true);
  };

  return (
    <>
      <div className="table-responsive">
        <table className="table table-hover">
          <thead>
            <tr>
              <th>Station Name</th>
              <th>Status</th>
              <th>API Key</th>
              <th>Subscription Due</th>
              <th>Contact</th>
              <th className="text-end">Actions</th>
            </tr>
          </thead>
          <tbody>
            {stations.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center text-muted py-4">
                  No stations found. Create your first station to get started.
                </td>
              </tr>
            ) : (
              stations.map((station) => (
                <tr key={station.id}>
                  <td>
                    <div>
                      <strong>{station.name}</strong>
                      <br />
                      <small className="text-muted">{station.slug}</small>
                    </div>
                  </td>
                  <td>
                    <StatusBadge status={station.status as "active" | "suspended"} />
                  </td>
                  <td>
                    <code className="small">{maskApiKey(station.apiKey)}</code>
                  </td>
                  <td>
                    <div>
                      {station.subscriptionDueDate ? (
                        <>
                          {formatDate(station.subscriptionDueDate)}
                          <br />
                          <small className="text-muted">
                            {formatRelativeDate(station.subscriptionDueDate)}
                          </small>
                        </>
                      ) : (
                        <span className="text-muted">Not set</span>
                      )}
                    </div>
                  </td>
                  <td>
                    <div>
                      <i className="bi bi-envelope me-1"></i>
                      {station.contactEmail}
                      {station.contactPhone && (
                        <>
                          <br />
                          <i className="bi bi-telephone me-1"></i>
                          {station.contactPhone}
                        </>
                      )}
                    </div>
                  </td>
                  <td className="text-end">
                    <div className="btn-group btn-group-sm">
                      <Link
                        href={`/admin/stations/${station.id}`}
                        className="btn btn-outline-primary"
                        title="View Details"
                      >
                        <i className="bi bi-eye"></i>
                      </Link>
                      <Link
                        href={`/admin/stations/${station.id}/edit`}
                        className="btn btn-outline-secondary"
                        title="Edit"
                      >
                        <i className="bi bi-pencil"></i>
                      </Link>
                      {station.status === "active" ? (
                        <button
                          onClick={() => openSuspendModal(station)}
                          className="btn btn-outline-warning"
                          title="Suspend"
                        >
                          <i className="bi bi-pause-circle"></i>
                        </button>
                      ) : (
                        <button
                          onClick={() => openActivateModal(station)}
                          className="btn btn-outline-success"
                          title="Activate"
                        >
                          <i className="bi bi-play-circle"></i>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Confirmation Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onConfirm={handleAction}
        title={actionType === "suspend" ? "Suspend Station" : "Activate Station"}
        confirmText={actionType === "suspend" ? "Suspend" : "Activate"}
        confirmVariant={actionType === "suspend" ? "warning" : "success"}
        loading={loading}
      >
        <p>
          Are you sure you want to {actionType} <strong>{selectedStation?.name}</strong>?
        </p>
        {actionType === "suspend" && (
          <div className="alert alert-warning">
            <i className="bi bi-exclamation-triangle me-2"></i>
            Suspending will prevent the mobile app from streaming.
          </div>
        )}
      </Modal>
    </>
  );
}
