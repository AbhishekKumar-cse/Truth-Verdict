"use client";

import Link from "next/link";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScoreCircle } from "./score-circle";
import { ExternalLink, FileDown, Twitter, Linkedin } from "lucide-react";
import type { ReportWithId } from "@/app/(app)/dashboard/page";
import { Button } from "../ui/button";

type ReportDisplayProps = {
  report: ReportWithId;
};

const getVerdictVariant = (verdict: string): "default" | "secondary" | "destructive" | "outline" => {
    const lowerVerdict = verdict.toLowerCase();
    if (lowerVerdict.includes("true")) return "default";
    if (lowerVerdict.includes("false")) return "destructive";
    if (lowerVerdict.includes("misleading") || lowerVerdict.includes("mixed")) return "secondary";
    return "outline";
};

export function ReportDisplay({ report }: ReportDisplayProps) {

  const handlePrint = () => {
    const printWindow = window.open(`/reports/${report.id}?print=true`, '_blank');
    printWindow?.addEventListener('load', () => {
        printWindow?.print();
    });
  };

  const shareText = `This claim was rated with a TruthScore of ${report.truthScore}/100. See the full report.`;
  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
  
  const twitterShareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
  const linkedinShareUrl = `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent("Fact-Check Report")}&summary=${encodeURIComponent(shareText)}`;

  return (
    <Card className="w-full shadow-lg" id="report-content">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4">
          <ScoreCircle score={report.truthScore} />
        </div>
        <CardTitle className="text-3xl font-bold">Fact-Check Report</CardTitle>
        <CardDescription className="text-lg">Analysis of the submitted claim</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-center">
            <h3 className="text-sm font-semibold uppercase text-muted-foreground">Verdict</h3>
            <Badge variant={getVerdictVariant(report.verdict)} className="text-xl px-4 py-1">
                {report.verdict}
            </Badge>
        </div>
        
        <div>
            <h3 className="mb-2 text-lg font-semibold border-b pb-2">Supporting Sources</h3>
            {report.supportingSources.length > 0 ? (
                <ul className="space-y-2">
                    {report.supportingSources.map((source, index) => (
                    <li key={index} className="flex items-start gap-2">
                        <ExternalLink className="h-4 w-4 mt-1 shrink-0 text-primary" />
                        <a 
                            href={source} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="text-primary hover:underline break-all"
                        >
                            {source}
                        </a>
                    </li>
                    ))}
                </ul>
            ) : (
                <p className="text-muted-foreground">No specific sources were identified by the AI.</p>
            )}
        </div>
      </CardContent>
      <CardFooter className="flex-col sm:flex-row justify-center gap-2">
         <Button variant="outline" onClick={handlePrint} className="transition-transform hover:scale-105 hover:shadow-lg">
            <FileDown className="mr-2 h-4 w-4" />
            Download as PDF
        </Button>
         <Button asChild variant="outline" className="transition-transform hover:scale-105 hover:shadow-lg">
            <a href={twitterShareUrl} target="_blank" rel="noopener noreferrer">
                <Twitter className="mr-2 h-4 w-4" />
                Share on Twitter
            </a>
        </Button>
         <Button asChild variant="outline" className="transition-transform hover:scale-105 hover:shadow-lg">
            <a href={linkedinShareUrl} target="_blank" rel="noopener noreferrer">
                <Linkedin className="mr-2 h-4 w-4" />
                Share on LinkedIn
            </a>
        </Button>
      </CardFooter>
    </Card>
  );
}
