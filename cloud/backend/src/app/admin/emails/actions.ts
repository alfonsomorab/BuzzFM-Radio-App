"use server";

import { revalidatePath } from "next/cache";
import { sendSubscriptionReminder } from "@/lib/email";
import { db } from "@/db";
import { radioStations } from "@/db/schema";
import { inArray } from "drizzle-orm";
import { validateAdminSession } from "@/lib/auth-session";
import { z } from "zod";

const emailSchema = z.object({
  stationIds: z.array(z.string().uuid()).min(1, "Select at least one station"),
  templateType: z.enum(["7-day", "1-day"]),
  customMessage: z.string().max(1000).optional(),
});

export type EmailActionState = {
  error?: string;
  errors?: Record<string, string[]>;
  success?: boolean;
  message?: string;
  sentCount?: number;
};

/**
 * Server Action: Send reminder emails to selected stations
 */
export async function sendReminderEmails(
  prevState: EmailActionState | null,
  formData: FormData
): Promise<EmailActionState> {
  try {
    // Validate admin session
    await validateAdminSession();

    // Extract station IDs from form data (checkboxes)
    const stationIds: string[] = [];
    for (const [key, value] of formData.entries()) {
      if (key.startsWith("station_") && value === "on") {
        const id = key.replace("station_", "");
        stationIds.push(id);
      }
    }

    // Extract and validate form data
    const rawData = {
      stationIds,
      templateType: formData.get("templateType") as string,
      customMessage: formData.get("customMessage") as string || undefined,
    };

    const validation = emailSchema.safeParse(rawData);
    if (!validation.success) {
      return {
        error: "Validation failed. Please check the form for errors.",
        errors: validation.error.flatten().fieldErrors,
      };
    }

    const data = validation.data;

    // Fetch selected stations
    const stations = await db
      .select()
      .from(radioStations)
      .where(inArray(radioStations.id, data.stationIds));

    if (stations.length === 0) {
      return {
        error: "No stations found with selected IDs",
      };
    }

    // Send emails to each station
    let sentCount = 0;
    const errors: string[] = [];

    for (const station of stations) {
      try {
        // Skip stations without contact email
        if (!station.contactEmail) {
          console.warn(`Skipping ${station.name}: No contact email`);
          errors.push(`${station.name} (no email)`);
          continue;
        }

        const subscriptionDueDate = station.subscriptionDueDate
          ? new Date(station.subscriptionDueDate)
          : new Date();

        await sendSubscriptionReminder({
          to: station.contactEmail,
          stationName: station.name,
          subscriptionDueDate,
          type: data.templateType as "7-day" | "1-day",
          customMessage: data.customMessage,
        });
        sentCount++;
      } catch (emailError) {
        console.error(`Failed to send email to ${station.name}:`, emailError);
        errors.push(station.name);
      }
    }

    revalidatePath("/admin/emails");

    if (errors.length > 0) {
      return {
        success: true,
        message: `Sent ${sentCount} email(s). Failed to send to: ${errors.join(", ")}`,
        sentCount,
      };
    }

    return {
      success: true,
      message: `Successfully sent ${sentCount} reminder email(s)`,
      sentCount,
    };
  } catch (error) {
    console.error("Error sending reminder emails:", error);
    return {
      error: "Failed to send reminder emails. Please try again.",
    };
  }
}
