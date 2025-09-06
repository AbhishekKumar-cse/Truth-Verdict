"use server";

import { z } from "zod";
import { adminDb } from "@/lib/firebase-admin";
import { generateFactCheckReport, GenerateFactCheckReportInput, GenerateFactCheckReportOutput } from "@/ai/flows/generate-fact-check-report";
import { Timestamp } from "firebase-admin/firestore";
import type { User } from "firebase/auth";

const claimSchema = z.object({
  title: z.string(),
  statement: z.string(),
  category: z.string(),
  sourceUrl: z.string().optional(),
});

export async function submitClaim(values: z.infer<typeof claimSchema>, userId: string): Promise<{ success: boolean; data?: GenerateFactCheckReportOutput & { id: string }; error?: string }> {
  try {
    if (!adminDb) {
      throw new Error("Firebase Admin SDK is not initialized. Please ensure your service account key is configured correctly on the server.");
    }
    
    if (!userId) {
      throw new Error("Authentication failed. User not found.");
    }
    
    const validatedValues = claimSchema.parse(values);

    const reportInput: GenerateFactCheckReportInput = {
      ...validatedValues,
      sourceUrl: validatedValues.sourceUrl || undefined,
    };

    const report = await generateFactCheckReport(reportInput);

    const reportData = {
      userId,
      claimTitle: validatedValues.title,
      claimStatement: validatedValues.statement,
      claimCategory: validatedValues.category,
      claimSourceUrl: validatedValues.sourceUrl || "",
      truthScore: report.truthScore,
      verdict: report.verdict,
      supportingSources: report.supportingSources,
      createdAt: Timestamp.now(),
    };

    const docRef = await adminDb.collection("reports").add(reportData);

    return { success: true, data: { ...report, id: docRef.id } };
  } catch (error: any) {
    console.error("Error submitting claim:", error);

    const errorMessage = error.message || "An unexpected response was received from the server.";
    return { success: false, error: errorMessage };
  }
}

export async function createUserProfile(user: User): Promise<{ success: boolean; error?: string }> {
  if (!adminDb) {
    console.error("Firebase Admin SDK not initialized.");
    return { success: false, error: "Server configuration error." };
  }
  if (!user) {
    return { success: false, error: "User not provided." };
  }

  try {
    const userRef = adminDb.collection("users").doc(user.uid);
    await userRef.set({
      uid: user.uid,
      displayName: user.displayName,
      email: user.email,
      photoURL: user.photoURL,
      createdAt: Timestamp.now(),
    }, { merge: true });

    return { success: true };
  } catch (error: any) {
    console.error("Error creating user profile:", error);
    return { success: false, error: "Failed to create user profile." };
  }
}
