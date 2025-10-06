"use client"

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { authClient } from "@/features/auth/lib/auth-client";
import { passwordSchema } from "@/features/auth/schemas/password-schema";

const resetPasswordSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type IResetPasswordForm = z.infer<typeof resetPasswordSchema>;

export const ResetPasswordChangePasswordForm = ({token}: { token: string }) => {
  const [inProgress, setInProgress] = useState(false);

  const form = useForm<IResetPasswordForm>({
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
    resolver: zodResolver(resetPasswordSchema),
  });

  const {push} = useRouter();

  const onSubmit = async (data: IResetPasswordForm) => {
    setInProgress(true);

    const {error} = await authClient.resetPassword({
      token,
      newPassword: data.password,
    });

    setInProgress(false);

    if (error) {
      toast.error("Failed to reset password", {
        description: error.message,
      });
    } else {
      toast.success("Password changed");
      push("/signin");
    }
  };

  return (
    <Form {...form}>
      <form
        className="flex flex-col gap-8"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <h1 className="text-2xl">Zmień hasło</h1>

        <FormField
          control={form.control}
          name="password"
          render={({field}) => (
            <FormItem>
              <FormLabel>Hasło</FormLabel>
              <FormControl>
                <Input type="password" {...field} />
              </FormControl>

              <FormMessage/>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="confirmPassword"
          render={({field}) => (
            <FormItem>
              <FormLabel>Powtórz hasło</FormLabel>
              <FormControl>
                <Input type="password" {...field} />
              </FormControl>

              <FormMessage/>
            </FormItem>
          )}
        />

        <div className="flex flex-wrap gap-2 justify-between items-center">
          <Link href="/signin" className="text-sm">
            Wróć do logowania
          </Link>

          <div className="flex flex-wrap justify-end gap-2">
            <Button type="submit" loading={inProgress}>Zmień hasło</Button>
          </div>
        </div>
      </form>
    </Form>
  );
};
