import { ReportsList } from "@/components/reports/reports-list";

export default function ReportsPage() {
  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">My Reports</h1>
        <p className="text-muted-foreground">
          Browse all the fact-check reports you have generated.
        </p>
      </div>
      <ReportsList />
    </div>
  );
}
