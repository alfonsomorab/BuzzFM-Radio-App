"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { payments, radioStations } from "@/db/schema";
import { eq } from "drizzle-orm";
import { validateAdminSession } from "@/lib/auth-session";
import { z } from "zod";

const paymentSchema = z.object({
  stationId: z.string().uuid("Invalid station ID"),
  amount: z.coerce.number().int().positive("Amount must be positive"),
  paymentDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format"),
  status: z.enum(["pending", "paid", "overdue"]),
  notes: z.string().max(1000).optional(),
  extendSubscriptionDays: z.coerce.number().int().min(0).max(365).optional(),
});

export type ActionState = {
  error?: string;
  errors?: Record<string, string[]>;
  success?: boolean;
  message?: string;
};

/**
 * Server Action: Record a new payment
 */
export async function recordPayment(
  prevState: ActionState | null,
  formData: FormData
): Promise<ActionState> {
  try {
    // Validate admin session
    const adminSession = await validateAdminSession();

    // Extract and validate form data
    const rawData = {
      stationId: formData.get("stationId") as string,
      amount: formData.get("amount"),
      paymentDate: formData.get("paymentDate") as string,
      status: formData.get("status") as string,
      notes: formData.get("notes") as string || undefined,
      extendSubscriptionDays: formData.get("extendSubscriptionDays"),
    };

    const validation = paymentSchema.safeParse(rawData);
    if (!validation.success) {
      return {
        error: "Validation failed. Please check the form for errors.",
        errors: validation.error.flatten().fieldErrors,
      };
    }

    const data = validation.data;

    // Check if station exists
    const [station] = await db
      .select()
      .from(radioStations)
      .where(eq(radioStations.id, data.stationId))
      .limit(1);

    if (!station) {
      return {
        error: "Station not found",
      };
    }

    // Calculate due date (30 days from payment date)
    const paymentDate = new Date(data.paymentDate);
    const dueDate = new Date(paymentDate);
    dueDate.setDate(dueDate.getDate() + 30);
    const dueDateStr = dueDate.toISOString().split('T')[0];

    // Create payment record
    await db.insert(payments).values({
      stationId: data.stationId,
      amount: data.amount,
      paymentDate: data.paymentDate,
      dueDate: dueDateStr,
      status: data.status,
      notes: data.notes || null,
      recordedBy: adminSession.id,
    });

    // If extendSubscriptionDays is provided, update station subscription date
    if (data.extendSubscriptionDays && data.extendSubscriptionDays > 0) {
      const currentDueDate = station.subscriptionDueDate
        ? new Date(station.subscriptionDueDate)
        : new Date();

      // If current due date is in the past, start from today
      const today = new Date();
      const baseDate = currentDueDate > today ? currentDueDate : today;

      baseDate.setDate(baseDate.getDate() + data.extendSubscriptionDays);
      const newSubscriptionDueDate = baseDate.toISOString().split('T')[0];

      await db
        .update(radioStations)
        .set({
          subscriptionDueDate: newSubscriptionDueDate,
          lastPaymentDate: data.paymentDate,
          updatedAt: new Date(),
        })
        .where(eq(radioStations.id, data.stationId));
    }

    revalidatePath("/admin/payments");
    revalidatePath("/admin/stations");

    return {
      success: true,
      message: "Payment recorded successfully",
    };
  } catch (error) {
    console.error("Error recording payment:", error);
    return {
      error: "Failed to record payment. Please try again.",
    };
  }
}
