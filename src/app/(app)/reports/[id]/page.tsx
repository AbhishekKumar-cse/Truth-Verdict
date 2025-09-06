import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { ReportDisplay } from "@/components/dashboard/report-display";
import type { Report } from "@/types";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import { notFound } from "next/navigation";
import { ReportWithId } from "../dashboard/page";

async function getReport(id: string): Promise<ReportWithId | null> {
  const docRef = doc(db, "reports", id);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as ReportWithId;
  }
  return null;
}


export default async function ReportDetailPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const report = await getReport(params.id);

  if (!report) {
    notFound();
  }

  const isPrintView = searchParams.print === 'true';

  if (isPrintView) {
      return (
        <div className="bg-white text-black p-8">
            <ReportDisplay report={report} />
        </div>
      )
  }

  return (
    <div className="container mx-auto max-w-4xl py-8 px-4 sm:px-6 lg:px-8">
      <ReportDisplay report={report} />
    </div>
  );
}
