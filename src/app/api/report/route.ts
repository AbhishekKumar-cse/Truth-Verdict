import { NextResponse } from "next/server";
import { adminDB } from "@/lib/firebaseAdmin";  // make sure firebaseAdmin.ts is inside src/lib

export async function GET() {
  try {
    const snapshot = await adminDB.collection("reports").get();
    const reports = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json({ success: true, reports });
  } catch (error) {
    console.error("Error fetching reports:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const docRef = await adminDB.collection("reports").add(body);

    return NextResponse.json({ success: true, id: docRef.id });
  } catch (error) {
    console.error("Error creating report:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
