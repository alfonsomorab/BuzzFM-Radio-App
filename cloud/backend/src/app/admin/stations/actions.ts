"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { radioStations } from "@/db/schema";
import { eq } from "drizzle-orm";
import { validateAdminSession } from "@/lib/auth-session";
import { generateUniqueApiKey } from "@/lib/api-key";
import { stationSchema } from "@/lib/validations";
import { slugify } from "@/lib/utils";

/**
 * Server Action: Create a new radio station
 */
export async function createStation(prevState: any, formData: FormData) {
  // Validate admin session
  await validateAdminSession();

  // Extract form data
  const rawData = {
    name: formData.get("name") as string,
    slug: formData.get("slug") as string,
    address: formData.get("address") as string || null,
    description: formData.get("description") as string || null,
    musicGenre: formData.get("musicGenre") as string || null,
    contactEmail: formData.get("contactEmail") as string,
    contactPhone: formData.get("contactPhone") as string || null,
    streamUrlPrimary: formData.get("streamUrlPrimary") as string,
    streamUrlBackup: formData.get("streamUrlBackup") as string || null,
    subscriptionDueDate: formData.get("subscriptionDueDate") as string,
    brandingPrimaryColor: formData.get("brandingPrimaryColor") as string || null,
    brandingSecondaryColor: formData.get("brandingSecondaryColor") as string || null,
    brandingLogoUrl: formData.get("brandingLogoUrl") as string || null,
  };

  // Validate data
  const validation = stationSchema.safeParse(rawData);
  if (!validation.success) {
    return {
      error: "Validation failed. Please check the form for errors.",
      errors: validation.error.flatten().fieldErrors,
    };
  }

  const data = validation.data;

  try {
    // Generate unique API key
    const apiKey = await generateUniqueApiKey();

    // Build branding JSON
    const branding: { logoUrl?: string; primaryColor?: string; secondaryColor?: string } = {};
    if (data.brandingPrimaryColor) branding.primaryColor = data.brandingPrimaryColor;
    if (data.brandingSecondaryColor) branding.secondaryColor = data.brandingSecondaryColor;
    if (data.brandingLogoUrl) branding.logoUrl = data.brandingLogoUrl;

    // Insert station
    await db.insert(radioStations).values({
      name: data.name,
      slug: data.slug,
      address: data.address,
      description: data.description,
      musicGenre: data.musicGenre,
      contactName: null,
      contactEmail: data.contactEmail,
      contactPhone: data.contactPhone,
      streamUrlPrimary: data.streamUrlPrimary,
      streamUrlBackup: data.streamUrlBackup || null,
      apiKey,
      status: "active",
      subscriptionDueDate: data.subscriptionDueDate,
      lastPaymentDate: null,
      branding,
    });

    revalidatePath("/admin/stations");
    return {
      success: true,
      message: `Station "${data.name}" created successfully!`,
    };
  } catch (error: any) {
    console.error("Failed to create station:", error);

    // Handle unique constraint violations
    if (error.code === "23505") {
      if (error.constraint?.includes("slug")) {
        return {
          error: "A station with this slug already exists.",
          errors: { slug: ["This slug is already in use"] },
        };
      }
    }

    return {
      error: "Failed to create station. Please try again.",
    };
  }
}

/**
 * Server Action: Update an existing radio station
 */
export async function updateStation(stationId: string, prevState: any, formData: FormData) {
  // Validate admin session
  await validateAdminSession();

  // Extract form data
  const rawData = {
    name: formData.get("name") as string,
    slug: formData.get("slug") as string,
    address: formData.get("address") as string || null,
    description: formData.get("description") as string || null,
    musicGenre: formData.get("musicGenre") as string || null,
    contactEmail: formData.get("contactEmail") as string,
    contactPhone: formData.get("contactPhone") as string || null,
    streamUrlPrimary: formData.get("streamUrlPrimary") as string,
    streamUrlBackup: formData.get("streamUrlBackup") as string || null,
    subscriptionDueDate: formData.get("subscriptionDueDate") as string,
    brandingPrimaryColor: formData.get("brandingPrimaryColor") as string || null,
    brandingSecondaryColor: formData.get("brandingSecondaryColor") as string || null,
    brandingLogoUrl: formData.get("brandingLogoUrl") as string || null,
  };

  // Validate data
  const validation = stationSchema.safeParse(rawData);
  if (!validation.success) {
    return {
      error: "Validation failed. Please check the form for errors.",
      errors: validation.error.flatten().fieldErrors,
    };
  }

  const data = validation.data;

  try {
    // Build branding JSON
    const branding: { logoUrl?: string; primaryColor?: string; secondaryColor?: string } = {};
    if (data.brandingPrimaryColor) branding.primaryColor = data.brandingPrimaryColor;
    if (data.brandingSecondaryColor) branding.secondaryColor = data.brandingSecondaryColor;
    if (data.brandingLogoUrl) branding.logoUrl = data.brandingLogoUrl;

    // Update station
    await db
      .update(radioStations)
      .set({
        name: data.name,
        slug: data.slug,
        address: data.address,
        description: data.description,
        musicGenre: data.musicGenre,
        contactEmail: data.contactEmail,
        contactPhone: data.contactPhone,
        streamUrlPrimary: data.streamUrlPrimary,
        streamUrlBackup: data.streamUrlBackup || null,
        subscriptionDueDate: data.subscriptionDueDate,
        branding,
        updatedAt: new Date(),
      })
      .where(eq(radioStations.id, stationId));

    revalidatePath("/admin/stations");
    revalidatePath(`/admin/stations/${stationId}`);
    return {
      success: true,
      message: `Station "${data.name}" updated successfully!`,
    };
  } catch (error: any) {
    console.error("Failed to update station:", error);

    // Handle unique constraint violations
    if (error.code === "23505") {
      if (error.constraint?.includes("slug")) {
        return {
          error: "A station with this slug already exists.",
          errors: { slug: ["This slug is already in use"] },
        };
      }
    }

    return {
      error: "Failed to update station. Please try again.",
    };
  }
}

/**
 * Server Action: Suspend a radio station
 */
export async function suspendStation(stationId: string) {
  await validateAdminSession();

  try {
    await db
      .update(radioStations)
      .set({ status: "suspended", updatedAt: new Date() })
      .where(eq(radioStations.id, stationId));

    revalidatePath("/admin/stations");
    revalidatePath(`/admin/stations/${stationId}`);
  } catch (error) {
    console.error("Failed to suspend station:", error);
    throw new Error("Failed to suspend station");
  }
}

/**
 * Server Action: Activate a radio station
 */
export async function activateStation(stationId: string) {
  await validateAdminSession();

  try {
    await db
      .update(radioStations)
      .set({ status: "active", updatedAt: new Date() })
      .where(eq(radioStations.id, stationId));

    revalidatePath("/admin/stations");
    revalidatePath(`/admin/stations/${stationId}`);
  } catch (error) {
    console.error("Failed to activate station:", error);
    throw new Error("Failed to activate station");
  }
}
