"use client";

import { zodResolver } from "@hookform/resolvers/zod";
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

const passwordResetSchema = z.object({
  email: z.email(),
});

type IPasswordResetForm = z.infer<typeof passwordResetSchema>;

export const ResetPasswordEmailForm = () => {
  const [inProgress, setInProgress] = useState(false);

  const {push} = useRouter();

  const form = useForm<IPasswordResetForm>({
    defaultValues: {
      email: "",
    },
    resolver: zodResolver(passwordResetSchema),
  });

  const onSubmit = async (data: IPasswordResetForm) => {
    setInProgress(true);

    const {error} = await authClient.requestPasswordReset({
      email: data.email,
      redirectTo: `${window.location.origin}/password-reset/change`,
    });

    setInProgress(false);

    if (error) {
      toast.error("Login failed", {
        description: error.message,
      });
    }

    push("/password-reset/confirmed");
  };

  return (
    <Form {...form}>
      <form
        className="flex flex-col gap-8"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <h1 className="text-2xl">Reset password</h1>

        <FormField
          control={form.control}
          name="email"
          render={({field}) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" {...field} />
              </FormControl>

              <FormMessage/>
            </FormItem>
          )}
        />

        <div className="flex flex-wrap justify-end gap-2">
          <Button type="submit" loading={inProgress}>Reset</Button>
        </div>
      </form>
    </Form>
  );
};
