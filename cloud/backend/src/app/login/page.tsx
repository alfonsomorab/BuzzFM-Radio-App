"use client";

import { useActionState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { FormField } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";

async function loginAction(prevState: any, formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Email and password are required" };
  }

  try {
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      return { error: "Invalid email or password" };
    }

    if (result?.ok) {
      // Redirect will happen automatically by NextAuth
      window.location.href = "/admin";
      return { success: true };
    }

    return { error: "Login failed. Please try again." };
  } catch (error) {
    console.error("Login error:", error);
    return { error: "An unexpected error occurred" };
  }
}

function LoginForm() {
  const searchParams = useSearchParams();
  const { showToast } = useToast();
  const [state, formAction, isPending] = useActionState(loginAction, null);

  const callbackUrl = searchParams.get("callbackUrl");
  const error = searchParams.get("error");

  useEffect(() => {
    if (error === "unauthorized") {
      showToast("You need to be an admin to access this area", "error");
    }
  }, [error, showToast]);

  useEffect(() => {
    if (state?.error) {
      showToast(state.error, "error");
    }
  }, [state, showToast]);

  return (
    <div
      className="d-flex align-items-center justify-content-center"
      style={{ minHeight: "100vh", backgroundColor: "#f8f9fa" }}
    >
      <div style={{ width: "100%", maxWidth: "400px" }}>
        <div className="text-center mb-4">
          <i className="bi bi-broadcast display-1 text-primary"></i>
          <h2 className="mt-3">Radio Admin</h2>
          <p className="text-muted">Sign in to manage your radio stations</p>
        </div>

        <Card>
          <CardHeader>
            <h5 className="mb-0">Login</h5>
          </CardHeader>
          <CardBody>
            <form action={formAction}>
              <FormField
                label="Email Address"
                name="email"
                type="email"
                placeholder="admin@example.com"
                autoComplete="email"
                required
                autoFocus
              />

              <FormField
                label="Password"
                name="password"
                type="password"
                placeholder="Enter your password"
                autoComplete="current-password"
                required
              />

              <Button
                type="submit"
                variant="primary"
                fullWidth
                loading={isPending}
                disabled={isPending}
              >
                <i className="bi bi-box-arrow-in-right me-2"></i>
                Sign In
              </Button>
            </form>
          </CardBody>
        </Card>

        <div className="text-center mt-4 text-muted small">
          <p className="mb-0">
            <i className="bi bi-shield-lock me-1"></i>
            Secure login for administrators only
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="d-flex align-items-center justify-content-center" style={{ minHeight: "100vh" }}><div className="spinner-border text-primary" role="status"><span className="visually-hidden">Loading...</span></div></div>}>
      <LoginForm />
    </Suspense>
  );
}
