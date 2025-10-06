"use client";

import { useSearchParams } from "next/navigation";
import { ResetPasswordChangePasswordForm } from "@/features/auth/components/reset-password-change-password-form";

export default function Page() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  if (!token) {
    return (
      <div>Invalid url</div>
    )
  }

  return <ResetPasswordChangePasswordForm token={token}/>;
}
