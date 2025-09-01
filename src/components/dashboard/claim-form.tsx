"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { submitClaim } from "@/lib/actions";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Loader2, HelpCircle, Lightbulb } from "lucide-react";
import type { ReportWithId } from "@/app/(app)/dashboard/page";
import { useAuth } from "@/hooks/use-auth";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Progress } from "@/components/ui/progress";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogAction } from "@/components/ui/alert-dialog";
import Link from 'next/link';

const formSchema = z.object({
  title: z.string().min(10, "Title must be at least 10 characters.").max(150, "Title must be 150 characters or less."),
  statement: z.string().min(20, "Statement must be at least 20 characters.").max(1000, "Statement must be 1000 characters or less."),
  category: z.string({ required_error: "Please select a category." }),
  sourceUrl: z.string().url("Please enter a valid URL.").optional().or(z.literal('')),
});

type ClaimFormProps = {
  onReportGenerated: (report: ReportWithId) => void;
};

const claimCategories = ["Politics", "Health", "Science", "Technology", "Social Media", "Business", "Other"];

export function ClaimForm({ onReportGenerated }: ClaimFormProps) {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [showConfirmation, setShowConfirmation] = useState(false);
  const { user } = useAuth();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      statement: "",
      sourceUrl: "",
    },
  });

  const statementWordCount = form.watch('statement')?.length || 0;

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user) {
        toast({
            variant: "destructive",
            title: "Authentication Error",
            description: "You must be logged in to submit a claim.",
        });
        return;
    }

    startTransition(async () => {
      try {
        setShowConfirmation(true);
        const result = await submitClaim(values, user.uid);
        if (result.success && result.data) {
          onReportGenerated(result.data);
        } else {
          setShowConfirmation(false);
          throw new Error(result.error || "Failed to generate report.");
        }
      } catch (error: any) {
        setShowConfirmation(false);
        toast({
          variant: "destructive",
          title: "An Error Occurred",
          description: error.message || "Something went wrong. Please try again.",
        });
      }
    });
  }

  return (
    <>
      <Card className="shadow-lg animate-fade-in-up">
        <CardHeader>
          <Progress value={33} className="w-full mb-4" />
          <CardTitle className="text-3xl font-bold text-center">What claim do you want to investigate today?</CardTitle>
          <CardDescription className="text-center">Don’t worry, we’ll guide you step by step.</CardDescription>
        </CardHeader>
        <CardContent>
          <TooltipProvider>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        Claim Title
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <HelpCircle className="h-4 w-4 text-muted-foreground" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Give the claim a short, descriptive title.</p>
                          </TooltipContent>
                        </Tooltip>
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="Write your claim title like a news headline..." {...field} className="focus:ring-2 focus:ring-primary focus:ring-offset-2" />
                      </FormControl>
                      <FormDescription>
                        Example: ‘Bananas cure cancer’
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="statement"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        Full Statement
                         <Tooltip>
                          <TooltipTrigger asChild>
                            <HelpCircle className="h-4 w-4 text-muted-foreground" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Provide the complete text of the claim for a more accurate analysis.</p>
                          </TooltipContent>
                        </Tooltip>
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Provide the full text of the claim here..."
                          className="min-h-[120px] focus:ring-2 focus:ring-primary focus:ring-offset-2"
                          {...field}
                        />
                      </FormControl>
                      <div className="flex justify-between items-center">
                        <FormDescription>
                          Example: "A recent viral post claims that eating three bananas a day can cure all forms of cancer."
                        </FormDescription>
                        <span className="text-xs text-muted-foreground">{statementWordCount}/1000</span>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="focus:ring-2 focus:ring-primary focus:ring-offset-2">
                              <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {claimCategories.map(cat => (
                              <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="sourceUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Source URL (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="https://example.com/article" {...field} className="focus:ring-2 focus:ring-primary focus:ring-offset-2"/>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                 <div className="rounded-lg border bg-slate-50 p-4 dark:bg-slate-800/50">
                    <div className="flex items-center gap-3">
                        <Lightbulb className="h-5 w-5 text-yellow-500" />
                        <h4 className="font-semibold">Did you mean?</h4>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">
                        Based on your input, you might be interested in checking claims about <Link href="#" className="text-primary underline">the health benefits of fruit</Link>.
                    </p>
                </div>
                <Button type="submit" size="lg" className="w-full transition-transform hover:scale-[1.02] hover:shadow-lg" disabled={isPending || !user}>
                  {isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Please wait...
                    </>
                  ) : (
                    "Generate Fact-Check Report"
                  )}
                </Button>
              </form>
            </Form>
          </TooltipProvider>
        </CardContent>
      </Card>

      <footer className="sticky bottom-0 mt-8 text-center text-sm text-muted-foreground p-4 bg-background/50 backdrop-blur-sm rounded-lg">
          Need help? <Link href="#" className="text-primary underline">Contact our support team</Link>.
      </footer>
      
      <AlertDialog open={showConfirmation}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-center">Thanks! Our AI is on the case.</AlertDialogTitle>
            <AlertDialogDescription className="text-center">
              Your claim is being verified. This may take a moment. Please don't close this window.
              <div className="flex justify-center py-4">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row justify-center gap-2">
            <Button variant="outline" disabled>Share on Twitter</Button>
            <Button variant="outline" disabled>Share on LinkedIn</Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
