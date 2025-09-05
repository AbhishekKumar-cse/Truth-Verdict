import { LoginForm } from "@/components/auth/login-form";
import { TruthLensIcon } from "@/components/icons";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function LoginPage() {
  return (
    <Card className="w-full max-w-md">
      <CardHeader className="items-center text-center">
        <TruthLensIcon className="mb-2 h-12 w-12 text-primary" />
        <CardTitle className="text-2xl font-bold">Welcome Back to Truth Lens</CardTitle>
      </CardHeader>
      <CardContent>
        <LoginForm />
      </CardContent>
    </Card>
  );
}
