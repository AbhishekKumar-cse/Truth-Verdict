import { SignupForm } from "@/components/auth/signup-form";
import { TruthLensIcon } from "@/components/icons";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function SignupPage() {
  return (
    <Card className="w-full max-w-md">
      <CardHeader className="items-center text-center">
        <TruthLensIcon className="mb-2 h-12 w-12 text-primary" />
        <CardTitle className="text-2xl font-bold">Create an Account</CardTitle>
        <CardDescription>Start your journey with Truth Lens today.</CardDescription>
      </CardHeader>
      <CardContent>
        <SignupForm />
      </CardContent>
    </Card>
  );
}
