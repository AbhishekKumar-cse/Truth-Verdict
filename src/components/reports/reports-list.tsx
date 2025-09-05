"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import type { Report } from "@/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { AlertTriangle } from "lucide-react";
import Link from 'next/link';

const getVerdictVariant = (verdict: string): "default" | "secondary" | "destructive" | "outline" => {
    const lowerVerdict = verdict.toLowerCase();
    if (lowerVerdict.includes("true")) return "default";
    if (lowerVerdict.includes("false")) return "destructive";
    if (lowerVerdict.includes("misleading") || lowerVerdict.includes("mixed")) return "secondary";
    return "outline";
};

export function ReportsList() {
  const router = useRouter();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const reportsRef = collection(db, "reports");
          const q = query(
            reportsRef,
            where("userId", "==", user.uid),
            orderBy("createdAt", "desc")
          );

          const querySnapshot = await getDocs(q);
          const reportsData = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as Report[];
          
          setReports(reportsData);
        } catch (err: any) {
          console.error("Error fetching reports:", err);
          if (err.code === 'failed-precondition') {
             const indexQuery = `https://console.firebase.google.com/v1/r/project/${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}/firestore/indexes?create_composite=ClBwcm9qZWN0cy90cnV0aC1sZW5zLXo2d3d4L2RhdGFiYXNlcy8oZGVmYXVsdCkvY29sbGVjdGlvbkdyb3Vwcy9yZXBvcnRzL2luZGV4ZXMvXxABGgoKBnVzZXJJZBABGg0KCWNyZWF0ZWRBdBACGgwKCF9fbmFtZV9fEAI`;
             setError(`This query requires a Firestore index. Please create it by clicking the link below, and then refresh this page. This is a one-time setup. Error: ${err.message}. You can create the index here: ${indexQuery}`);
          } else {
             setError(`An error occurred while fetching reports: ${err.message}`);
          }
        } finally {
          setLoading(false);
        }
      } else {
        // Not logged in
        setLoading(false);
        setReports([]);
      }
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    );
  }

  if (error) {
     const urlRegex = /(https?:\/\/[^\s]+)/g;
     const parts = error.split(urlRegex);
     return (
        <Card className="text-center py-12 bg-destructive/10 border-destructive">
            <CardHeader>
                <CardTitle className="text-destructive">An Error Occurred</CardTitle>
                <CardDescription className="text-destructive/80 break-words">
                   {parts.map((part, index) =>
                      urlRegex.test(part) ? (
                        <Link key={index} href={part} target="_blank" className="underline font-bold">
                          Create Index
                        </Link>
                      ) : (
                        part
                      )
                    )}
                </CardDescription>
            </CardHeader>
        </Card>
     )
  }

  if (reports.length === 0) {
    return (
        <Card className="text-center py-12">
            <CardHeader>
                <CardTitle>No Reports Found</CardTitle>
                <CardDescription>You haven't generated any fact-check reports yet.</CardDescription>
            </CardHeader>
        </Card>
    );
  }

  return (
    <Card>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Claim Title</TableHead>
            <TableHead className="hidden md:table-cell">Category</TableHead>
            <TableHead>Verdict</TableHead>
            <TableHead className="hidden sm:table-cell">Date</TableHead>
            <TableHead className="text-right">Score</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {reports.map((report) => (
            <TableRow key={report.id} onClick={() => router.push(`/reports/${report.id}`)} className="cursor-pointer">
              <TableCell className="font-medium max-w-xs truncate">{report.claimTitle}</TableCell>
              <TableCell className="hidden md:table-cell">{report.claimCategory}</TableCell>
              <TableCell>
                <Badge variant={getVerdictVariant(report.verdict)}>{report.verdict}</Badge>
              </TableCell>
              <TableCell className="hidden sm:table-cell">
                {report.createdAt ? new Date(report.createdAt.seconds * 1000).toLocaleDateString() : 'N/A'}
              </TableCell>
              <TableCell className="text-right font-bold">{report.truthScore}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}
