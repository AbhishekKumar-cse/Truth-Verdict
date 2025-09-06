
"use client";

import { useState, useTransition, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { AnimatePresence, motion } from "framer-motion";
import { submitClaim } from "@/lib/actions";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Loader2, HelpCircle, Lightbulb, ChevronRight, ChevronLeft, Send, Sparkles, Mic, MicOff } from "lucide-react";
import type { ReportWithId } from "@/app/(app)/dashboard/page";
import { useAuth } from "@/hooks/use-auth";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Progress } from "@/components/ui/progress";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogAction } from "@/components/ui/alert-dialog";
import Link from 'next/link';

const claimSchema = z.object({
  title: z.string().min(10, "Title must be at least 10 characters.").max(150, "Title must be 150 characters or less."),
  statement: z.string().min(20, "Statement must be at least 20 characters.").max(1000, "Statement must be 1000 characters or less."),
  category: z.string({ required_error: "Please select a category." }),
  sourceUrl: z.string().url("Please enter a valid URL.").optional().or(z.literal('')),
});

type ClaimFormProps = {
  onReportGenerated: (report: ReportWithId) => void;
};

const claimCategories = ["Politics", "Health", "Science", "Technology", "Social Media", "Business", "Other"];

const formSteps = [
    { id: 'step1', title: 'The Claim', fields: ['title', 'statement'] },
    { id: 'step2', title: 'Context', fields: ['category', 'sourceUrl'] },
    { id: 'step3', title: 'Review & Submit' }
];

// Reference for SpeechRecognition
let recognition: any = null;
if (typeof window !== "undefined") {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (SpeechRecognition) {
    recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.lang = 'en-US';
  }
}

export function ClaimForm({ onReportGenerated }: ClaimFormProps) {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const { user } = useAuth();
  const [isRecording, setIsRecording] = useState(false);
  const [isListening, setIsListening] = useState(false);

  const form = useForm<z.infer<typeof claimSchema>>({
    resolver: zodResolver(claimSchema),
    defaultValues: {
      title: "",
      statement: "",
      sourceUrl: "",
    },
  });
  
  useEffect(() => {
    if (!recognition) return;

    recognition.onresult = (event: any) => {
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        }
      }
      if (finalTranscript) {
        const currentStatement = form.getValues('statement');
        form.setValue('statement', currentStatement ? `${currentStatement} ${finalTranscript.trim()}` : finalTranscript.trim());
      }
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error", event.error);
      toast({
        variant: "destructive",
        title: "Speech Recognition Error",
        description: `An error occurred: ${event.error}. Please try again.`,
      });
      setIsRecording(false);
      setIsListening(false);
    };
    
    recognition.onstart = () => {
        setIsListening(true);
    };

    recognition.onend = () => {
        setIsRecording(false);
        setIsListening(false);
    };

    return () => {
      if (recognition) {
        recognition.stop();
      }
    };
  }, [form, toast]);


  const handleMicClick = () => {
    if (!recognition) {
      toast({
        variant: "destructive",
        title: "Unsupported Browser",
        description: "Your browser does not support voice recognition.",
      });
      return;
    }

    if (isRecording) {
      recognition.stop();
      setIsRecording(false);
      setIsListening(false);
    } else {
      try {
        if(recognition.state === 'inactive') {
            recognition.start();
            setIsRecording(true);
        }
      } catch (e: any) {
          toast({
            variant: "destructive",
            title: "Speech Recognition Error",
            description: e.message || "Could not start voice recognition.",
          });
          setIsRecording(false);
          setIsListening(false);
      }
    }
  };


  const statementWordCount = form.watch('statement')?.length || 0;
  
  async function onSubmit(values: z.infer<typeof claimSchema>) {
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

  const nextStep = async () => {
      const fields = formSteps[currentStep].fields;
      const output = await form.trigger(fields as any, { shouldFocus: true });

      if (!output) return;

      if (currentStep < formSteps.length - 1) {
        setCurrentStep(step => step + 1);
      }
  };

  const prevStep = () => {
      if (currentStep > 0) {
          setCurrentStep(step => step - 1);
      }
  }

  return (
    <>
      <AnimatePresence>
        {isListening && (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center backdrop-blur-sm"
                onClick={handleMicClick}
            >
                <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.5, opacity: 0 }}
                    className="flex flex-col items-center gap-4"
                >
                    <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
                        className="bg-primary/20 rounded-full p-8"
                    >
                        <Mic className="h-24 w-24 text-primary-foreground" />
                    </motion.div>
                    <p className="text-primary-foreground font-medium text-lg">Listening... Click here to stop.</p>
                </motion.div>
            </motion.div>
        )}
      </AnimatePresence>

      <Card className="shadow-lg backdrop-blur-md border-white/20 bg-card animate-in fade-in-0 slide-in-from-bottom-4 duration-500">
        <CardHeader>
          <motion.div
            key="progress"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Progress value={((currentStep + 1) / formSteps.length) * 100} className="w-full mb-4 h-2 [&>div]:bg-gradient-to-r [&>div]:from-blue-400 [&>div]:to-purple-500" />
            <p className="text-sm text-center text-muted-foreground">Step {currentStep + 1} of {formSteps.length}: {formSteps[currentStep].title}</p>
          </motion.div>
          <CardTitle className="text-3xl font-bold text-center mt-2">What claim do you want to investigate today? 🚀</CardTitle>
          <CardDescription className="text-center">Don’t worry, we’ll guide you step by step.</CardDescription>
        </CardHeader>
        <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <AnimatePresence mode="wait">
                 <motion.div
                    key={currentStep}
                    initial={{ x: 30, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: -30, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                 >

                  {currentStep === 0 && (
                    <div className="space-y-8">
                      <FormField
                          control={form.control}
                          name="title"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="flex items-center gap-2">
                                Claim Title
                                <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <HelpCircle className="h-4 w-4 text-muted-foreground" />
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Give the claim a short, descriptive title.</p>
                                  </TooltipContent>
                                </Tooltip>
                                </TooltipProvider>
                              </FormLabel>
                              <FormControl>
                                <Input placeholder="Write your claim title like a news headline..." {...field} />
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
                              <div className="flex justify-between items-center">
                                <FormLabel className="flex items-center gap-2">
                                  Full Statement
                                  <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <HelpCircle className="h-4 w-4 text-muted-foreground" />
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>Provide the complete text of the claim for a more accurate analysis.</p>
                                    </TooltipContent>
                                  </Tooltip>
                                  </TooltipProvider>
                                </FormLabel>
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button type="button" variant="ghost" size="icon" onClick={handleMicClick} className={`h-8 w-8 ${isRecording ? 'text-destructive' : ''}`}>
                                        {isRecording ? <MicOff /> : <Mic />}
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>{isRecording ? 'Stop Recording' : 'Start Recording'}</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              </div>
                              <FormControl>
                                <Textarea
                                  placeholder="Provide the full text of the claim here, or use the microphone to dictate..."
                                  className="min-h-[120px]"
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
                    </div>
                  )}

                  {currentStep === 1 && (
                    <div className="space-y-8">
                        <FormField
                            control={form.control}
                            name="category"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>Category</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger>
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
                                <Input placeholder="https://example.com/article" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                        <motion.div 
                            className="rounded-lg border bg-slate-50/50 p-4 dark:bg-slate-800/50 backdrop-blur-sm"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2, duration: 0.5 }}
                        >
                            <div className="flex items-center gap-3">
                                <Lightbulb className="h-5 w-5 text-yellow-400" />
                                <h4 className="font-semibold">Did you mean?</h4>
                            </div>
                            <p className="mt-2 text-sm text-muted-foreground">
                                Based on your input, you might be interested in checking claims about <Link href="#" className="text-primary underline">the health benefits of fruit</Link>.
                            </p>
                        </motion.div>
                    </div>
                  )}

                  {currentStep === 2 && (
                    <div className="text-center space-y-6 animate-in fade-in-50 duration-500">
                      <Sparkles className="mx-auto h-12 w-12 text-primary" />
                      <h3 className="text-2xl font-bold">Ready to Go?</h3>
                      <p className="text-muted-foreground">
                        You've provided all the necessary details. Let our AI get to work!
                        <br/>
                        Click the button below to generate your report.
                      </p>
                       <Card className="text-left bg-white/10 dark:bg-black/10">
                          <CardHeader>
                            <CardTitle className="text-lg">Review Your Claim</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-2 text-sm">
                            <p><strong>Title:</strong> {form.watch('title')}</p>
                            <p><strong>Category:</strong> {form.watch('category')}</p>
                            <p><strong>Statement:</strong> {form.watch('statement').substring(0, 100)}...</p>
                          </CardContent>
                       </Card>
                    </div>
                  )}
                 </motion.div>
                </AnimatePresence>

                <div className="flex justify-between gap-4 pt-4">
                  <Button type="button" onClick={prevStep} variant="outline" className={`transition-all ${currentStep === 0 ? 'opacity-0' : 'opacity-100'}`} disabled={currentStep === 0}>
                    <ChevronLeft className="mr-2 h-4 w-4"/>
                    Back
                  </Button>
                  
                  {currentStep < formSteps.length - 1 && (
                    <Button type="button" onClick={nextStep} size="lg" className="group">
                        Next Step
                        <ChevronRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Button>
                  )}

                  {currentStep === formSteps.length - 1 && (
                    <Button type="submit" size="lg" className="w-full max-w-xs group" disabled={isPending || !user}>
                      {isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        <>
                          Generate Report
                          <Send className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </form>
            </Form>
        </CardContent>
      </Card>
      
      <AlertDialog open={showConfirmation}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-center">Rolling up the truth... hang tight!</AlertDialogTitle>
            <AlertDialogDescription className="text-center">
              Your claim is being verified. This may take a moment. Please don't close this window.
              <div className="flex justify-center py-4">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
