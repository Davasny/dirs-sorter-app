import { ResetPasswordChangePasswordForm } from "@/features/auth/components/reset-password-change-password-form";

export default function Page({
                               searchParams,
                             }: {
  searchParams: { token?: string };
}) {
  const {token} = searchParams;

  if (!token) {
    return <div>Invalid url</div>;
  }

  return <ResetPasswordChangePasswordForm token={token}/>;
}
