"use client";

import { useState } from "react";
import { ClaimForm } from "@/components/dashboard/claim-form";
import { ReportDisplay } from "@/components/dashboard/report-display";
import type { GenerateFactCheckReportOutput } from "@/ai/flows/generate-fact-check-report";
import { Button } from "@/components/ui/button";

export type ReportWithId = GenerateFactCheckReportOutput & { id: string };

export default function DashboardPage() {
  const [report, setReport] = useState<ReportWithId | null>(null);

  const handleReportGenerated = (generatedReport: ReportWithId) => {
    setReport(generatedReport);
  };

  const handleNewCheck = () => {
    setReport(null);
  }

  return (
    <div className="container mx-auto max-w-4xl py-8 px-4 sm:px-6 lg:px-8">
      {report ? (
        <div className="space-y-6">
            <ReportDisplay report={report} />
            <div className="text-center">
                <Button onClick={handleNewCheck} size="lg" className="transition-transform hover:scale-105 hover:shadow-lg">
                    Check Another Claim
                </Button>
            </div>
        </div>
      ) : (
        <ClaimForm onReportGenerated={handleReportGenerated} />
      )}
    </div>
  );
}
