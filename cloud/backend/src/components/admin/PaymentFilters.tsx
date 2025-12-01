"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";

interface PaymentFiltersProps {
  stations: { id: string; name: string }[];
  currentFilters: {
    status?: string;
    stationId?: string;
    startDate?: string;
    endDate?: string;
  };
}

export function PaymentFilters({ stations, currentFilters }: PaymentFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [status, setStatus] = useState(currentFilters.status || "all");
  const [stationId, setStationId] = useState(currentFilters.stationId || "");
  const [startDate, setStartDate] = useState(currentFilters.startDate || "");
  const [endDate, setEndDate] = useState(currentFilters.endDate || "");

  const handleFilter = () => {
    const params = new URLSearchParams();

    if (status !== "all") params.set("status", status);
    if (stationId) params.set("stationId", stationId);
    if (startDate) params.set("startDate", startDate);
    if (endDate) params.set("endDate", endDate);

    router.push(`/admin/payments?${params.toString()}`);
  };

  const handleReset = () => {
    setStatus("all");
    setStationId("");
    setStartDate("");
    setEndDate("");
    router.push("/admin/payments");
  };

  return (
    <div className="mb-4 p-3 bg-light rounded">
      <div className="row g-3">
        <div className="col-md-3">
          <label className="form-label small fw-bold">Status</label>
          <select
            className="form-select form-select-sm"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
            <option value="overdue">Overdue</option>
          </select>
        </div>

        <div className="col-md-3">
          <label className="form-label small fw-bold">Station</label>
          <select
            className="form-select form-select-sm"
            value={stationId}
            onChange={(e) => setStationId(e.target.value)}
          >
            <option value="">All Stations</option>
            {stations.map((station) => (
              <option key={station.id} value={station.id}>
                {station.name}
              </option>
            ))}
          </select>
        </div>

        <div className="col-md-2">
          <label className="form-label small fw-bold">Start Date</label>
          <input
            type="date"
            className="form-control form-control-sm"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>

        <div className="col-md-2">
          <label className="form-label small fw-bold">End Date</label>
          <input
            type="date"
            className="form-control form-control-sm"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>

        <div className="col-md-2 d-flex align-items-end gap-2">
          <Button
            variant="primary"
            size="sm"
            onClick={handleFilter}
            fullWidth
          >
            <i className="bi bi-funnel me-1"></i>
            Filter
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={handleReset}
          >
            <i className="bi bi-x-lg"></i>
          </Button>
        </div>
      </div>
    </div>
  );
}
