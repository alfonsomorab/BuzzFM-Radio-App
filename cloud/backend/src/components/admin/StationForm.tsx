"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FormField, TextAreaField } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { useToast } from "@/components/ui/Toast";
import type { RadioStation } from "@/db/schema";
import { formatDateForInput, slugify } from "@/lib/utils";

interface StationFormProps {
  station?: RadioStation;
  action: (prevState: any, formData: FormData) => Promise<any>;
}

export function StationForm({ station, action }: StationFormProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const [state, formAction, isPending] = useActionState(action, null);

  useEffect(() => {
    if (state?.success) {
      showToast(state.message, "success");
      router.push("/admin/stations");
    } else if (state?.error) {
      showToast(state.error, "error");
    }
  }, [state, showToast, router]);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nameInput = e.target;
    const slugInput = document.getElementById("slug") as HTMLInputElement;
    if (slugInput && !station) {
      // Auto-generate slug only for new stations
      slugInput.value = slugify(nameInput.value);
    }
  };

  return (
    <form action={formAction}>
      <div className="row">
        {/* Basic Information */}
        <div className="col-md-6">
          <Card className="mb-4">
            <CardHeader>
              <h5 className="mb-0">Basic Information</h5>
            </CardHeader>
            <CardBody>
              <FormField
                label="Station Name"
                name="name"
                defaultValue={station?.name || ""}
                required
                error={state?.errors?.name?.[0]}
                onChange={handleNameChange}
              />
              <FormField
                label="Slug"
                name="slug"
                id="slug"
                defaultValue={station?.slug || ""}
                required
                helpText="URL-friendly identifier (lowercase, hyphens only)"
                error={state?.errors?.slug?.[0]}
              />
              <FormField
                label="Address"
                name="address"
                defaultValue={station?.address || ""}
                error={state?.errors?.address?.[0]}
              />
              <TextAreaField
                label="Description"
                name="description"
                rows={3}
                defaultValue={station?.description || ""}
                error={state?.errors?.description?.[0]}
              />
              <FormField
                label="Music Genre"
                name="musicGenre"
                defaultValue={station?.musicGenre || ""}
                error={state?.errors?.musicGenre?.[0]}
              />
            </CardBody>
          </Card>
        </div>

        {/* Contact Information */}
        <div className="col-md-6">
          <Card className="mb-4">
            <CardHeader>
              <h5 className="mb-0">Contact Information</h5>
            </CardHeader>
            <CardBody>
              <FormField
                label="Contact Email"
                name="contactEmail"
                type="email"
                defaultValue={station?.contactEmail || ""}
                required
                error={state?.errors?.contactEmail?.[0]}
              />
              <FormField
                label="Contact Phone"
                name="contactPhone"
                type="tel"
                defaultValue={station?.contactPhone || ""}
                error={state?.errors?.contactPhone?.[0]}
              />
            </CardBody>
          </Card>

          <Card className="mb-4">
            <CardHeader>
              <h5 className="mb-0">Subscription</h5>
            </CardHeader>
            <CardBody>
              <FormField
                label="Subscription Due Date"
                name="subscriptionDueDate"
                type="date"
                defaultValue={formatDateForInput(station?.subscriptionDueDate || new Date())}
                required
                error={state?.errors?.subscriptionDueDate?.[0]}
              />
            </CardBody>
          </Card>
        </div>

        {/* Stream URLs */}
        <div className="col-12">
          <Card className="mb-4">
            <CardHeader>
              <h5 className="mb-0">Stream Configuration</h5>
            </CardHeader>
            <CardBody>
              <div className="row">
                <div className="col-md-6">
                  <FormField
                    label="Primary Stream URL"
                    name="streamUrlPrimary"
                    type="url"
                    defaultValue={station?.streamUrlPrimary || ""}
                    required
                    error={state?.errors?.streamUrlPrimary?.[0]}
                    helpText="Main radio stream URL"
                  />
                </div>
                <div className="col-md-6">
                  <FormField
                    label="Backup Stream URL"
                    name="streamUrlBackup"
                    type="url"
                    defaultValue={station?.streamUrlBackup || ""}
                    error={state?.errors?.streamUrlBackup?.[0]}
                    helpText="Backup stream URL (optional)"
                  />
                </div>
              </div>
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
                  <FormField
                    label="Primary Color"
                    name="brandingPrimaryColor"
                    type="color"
                    defaultValue={station?.branding?.primaryColor || "#0d6efd"}
                    error={state?.errors?.brandingPrimaryColor?.[0]}
                  />
                </div>
                <div className="col-md-4">
                  <FormField
                    label="Secondary Color"
                    name="brandingSecondaryColor"
                    type="color"
                    defaultValue={station?.branding?.secondaryColor || "#6c757d"}
                    error={state?.errors?.brandingSecondaryColor?.[0]}
                  />
                </div>
                <div className="col-md-4">
                  <FormField
                    label="Logo URL"
                    name="brandingLogoUrl"
                    type="url"
                    defaultValue={station?.branding?.logoUrl || ""}
                    error={state?.errors?.brandingLogoUrl?.[0]}
                  />
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>

      {/* Form Actions */}
      <div className="d-flex gap-2">
        <Button type="submit" variant="primary" loading={isPending}>
          <i className="bi bi-check-lg me-2"></i>
          {station ? "Update Station" : "Create Station"}
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
