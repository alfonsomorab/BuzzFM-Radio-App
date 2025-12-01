import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/db";
import { radioStations, programs } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/Badge";
import { CopyButton } from "@/components/admin/CopyButton";
import { formatDate, maskApiKey } from "@/lib/utils";

interface StationDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function StationDetailPage({ params }: StationDetailPageProps) {
  const { id } = await params;

  const [station] = await db
    .select()
    .from(radioStations)
    .where(eq(radioStations.id, id));

  if (!station) {
    notFound();
  }

  const stationPrograms = await db
    .select()
    .from(programs)
    .where(eq(programs.stationId, id))
    .orderBy(programs.dayOfWeek, programs.startTime);

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1>{station.name}</h1>
          <p className="text-muted mb-0">
            <StatusBadge status={station.status as "active" | "suspended"} />
            <span className="ms-2">{station.slug}</span>
          </p>
        </div>
        <div className="d-flex gap-2">
          <Link href={`/admin/stations/${station.id}/edit`}>
            <Button variant="primary">
              <i className="bi bi-pencil me-2"></i>
              Edit Station
            </Button>
          </Link>
          <Link href="/admin/stations">
            <Button variant="secondary">
              <i className="bi bi-arrow-left me-2"></i>
              Back to List
            </Button>
          </Link>
        </div>
      </div>

      <div className="row">
        {/* Basic Information */}
        <div className="col-md-6">
          <Card className="mb-4">
            <CardHeader>
              <h5 className="mb-0">Basic Information</h5>
            </CardHeader>
            <CardBody>
              <dl className="row mb-0">
                <dt className="col-sm-4">Station Name:</dt>
                <dd className="col-sm-8">{station.name}</dd>

                <dt className="col-sm-4">Slug:</dt>
                <dd className="col-sm-8">
                  <code>{station.slug}</code>
                </dd>

                <dt className="col-sm-4">Address:</dt>
                <dd className="col-sm-8">{station.address || "N/A"}</dd>

                <dt className="col-sm-4">Description:</dt>
                <dd className="col-sm-8">{station.description || "N/A"}</dd>

                <dt className="col-sm-4">Music Genre:</dt>
                <dd className="col-sm-8">{station.musicGenre || "N/A"}</dd>

                <dt className="col-sm-4">Status:</dt>
                <dd className="col-sm-8">
                  <StatusBadge status={station.status as "active" | "suspended"} />
                </dd>
              </dl>
            </CardBody>
          </Card>

          <Card className="mb-4">
            <CardHeader>
              <h5 className="mb-0">Contact Information</h5>
            </CardHeader>
            <CardBody>
              <dl className="row mb-0">
                <dt className="col-sm-4">Email:</dt>
                <dd className="col-sm-8">
                  <a href={`mailto:${station.contactEmail}`}>{station.contactEmail}</a>
                </dd>

                <dt className="col-sm-4">Phone:</dt>
                <dd className="col-sm-8">{station.contactPhone || "N/A"}</dd>
              </dl>
            </CardBody>
          </Card>
        </div>

        {/* Technical Information */}
        <div className="col-md-6">
          <Card className="mb-4">
            <CardHeader>
              <h5 className="mb-0">API Configuration</h5>
            </CardHeader>
            <CardBody>
              <dl className="row mb-0">
                <dt className="col-sm-4">API Key:</dt>
                <dd className="col-sm-8">
                  <code className="small">{maskApiKey(station.apiKey)}</code>
                  <CopyButton text={station.apiKey} label="API Key copied to clipboard!" />
                </dd>

                <dt className="col-sm-4">Primary Stream:</dt>
                <dd className="col-sm-8">
                  <a href={station.streamUrlPrimary} target="_blank" rel="noopener noreferrer">
                    {station.streamUrlPrimary}
                  </a>
                </dd>

                <dt className="col-sm-4">Backup Stream:</dt>
                <dd className="col-sm-8">
                  {station.streamUrlBackup ? (
                    <a href={station.streamUrlBackup} target="_blank" rel="noopener noreferrer">
                      {station.streamUrlBackup}
                    </a>
                  ) : (
                    "N/A"
                  )}
                </dd>
              </dl>
            </CardBody>
          </Card>

          <Card className="mb-4">
            <CardHeader>
              <h5 className="mb-0">Subscription</h5>
            </CardHeader>
            <CardBody>
              <dl className="row mb-0">
                <dt className="col-sm-4">Due Date:</dt>
                <dd className="col-sm-8">{formatDate(station.subscriptionDueDate)}</dd>

                <dt className="col-sm-4">Created:</dt>
                <dd className="col-sm-8">{formatDate(station.createdAt)}</dd>

                <dt className="col-sm-4">Last Updated:</dt>
                <dd className="col-sm-8">{formatDate(station.updatedAt)}</dd>
              </dl>
            </CardBody>
          </Card>
        </div>

        {/* Branding */}
        <div className="col-12">
          <Card className="mb-4">
            <CardHeader>
              <h5 className="mb-0">Branding</h5>
            </CardHeader>
            <CardBody>
              <div className="row">
                <div className="col-md-4">
                  <strong>Primary Color:</strong>
                  <div className="d-flex align-items-center mt-2">
                    {station.branding?.primaryColor ? (
                      <>
                        <div
                          className="border"
                          style={{
                            width: "40px",
                            height: "40px",
                            backgroundColor: station.branding.primaryColor,
                            borderRadius: "4px",
                          }}
                        ></div>
                        <code className="ms-2">{station.branding.primaryColor}</code>
                      </>
                    ) : (
                      <span className="text-muted">Not set</span>
                    )}
                  </div>
                </div>
                <div className="col-md-4">
                  <strong>Secondary Color:</strong>
                  <div className="d-flex align-items-center mt-2">
                    {station.branding?.secondaryColor ? (
                      <>
                        <div
                          className="border"
                          style={{
                            width: "40px",
                            height: "40px",
                            backgroundColor: station.branding.secondaryColor,
                            borderRadius: "4px",
                          }}
                        ></div>
                        <code className="ms-2">{station.branding.secondaryColor}</code>
                      </>
                    ) : (
                      <span className="text-muted">Not set</span>
                    )}
                  </div>
                </div>
                <div className="col-md-4">
                  <strong>Logo URL:</strong>
                  <div className="mt-2">
                    {station.branding?.logoUrl ? (
                      <a href={station.branding.logoUrl} target="_blank" rel="noopener noreferrer">
                        View Logo
                      </a>
                    ) : (
                      <span className="text-muted">Not set</span>
                    )}
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Programs */}
        <div className="col-12">
          <Card>
            <CardHeader>
              <h5 className="mb-0">Program Schedule ({stationPrograms.length})</h5>
            </CardHeader>
            <CardBody>
              {stationPrograms.length === 0 ? (
                <p className="text-muted mb-0">No programs scheduled yet.</p>
              ) : (
                <div className="table-responsive">
                  <table className="table table-sm">
                    <thead>
                      <tr>
                        <th>Day</th>
                        <th>Time</th>
                        <th>Program</th>
                        <th>Host</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stationPrograms.map((program) => {
                        const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
                        return (
                          <tr key={program.id}>
                            <td>{days[program.dayOfWeek]}</td>
                            <td>{program.startTime} - {program.endTime}</td>
                            <td>{program.title}</td>
                            <td>{program.hostName}</td>
                            <td>
                              <StatusBadge status={program.isActive ? "active" : "suspended"} />
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
