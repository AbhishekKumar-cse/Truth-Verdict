import { NextResponse } from "next/server";
import { adminDB } from "@/lib/firebase-admin";

// Fetch reports
export async function GET() {
  if (!adminDB) {
    return NextResponse.json({ success: false, error: "Firebase Admin not initialized" }, { status: 500 });
  }
  try {
    const snapshot = await adminDB.collection("reports").get();
    const reports = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
    return NextResponse.json({ success: true, reports });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// Save new report
export async function POST(req: Request) {
  if (!adminDB) {
    return NextResponse.json({ success: false, error: "Firebase Admin not initialized" }, { status: 500 });
  }
  try {
    const body = await req.json();
    const docRef = await adminDB.collection("reports").add(body);
    return NextResponse.json({ success: true, id: docRef.id });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
