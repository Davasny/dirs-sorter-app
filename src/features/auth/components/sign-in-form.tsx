"use client";

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

const signinSchema = z.object({
  email: z.email(),
  password: z.string(),
});

type ISignInForm = z.infer<typeof signinSchema>;

export const SignInForm = () => {
  const [inProgress, setInProgress] = useState(false);

  const { push } = useRouter();

  const form = useForm<ISignInForm>({
    defaultValues: {
      email: "",
      password: "",
    },
    resolver: zodResolver(signinSchema),
  });

  const onSubmit = async (data: ISignInForm) => {
    setInProgress(true);

    const { error } = await authClient.signIn.email({
      email: data.email,
      password: data.password,
    });

    setInProgress(false);

    if (error) {
      toast.error("Login failed", {
        description: error.message,
      });
    } else {
      push("/");
    }
  };

  return (
    <Form {...form}>
      <form
        className="flex flex-col gap-8"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <h1 className="text-2xl">Zaloguj</h1>

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" {...field} />
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Hasło</FormLabel>
              <FormControl>
                <Input type="password" {...field} />
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex flex-col gap-2">
          <div className="flex flex-col gap-2">
            <Link href="/signup" className="text-sm">
              Nie masz konta? Zarejestruj się
            </Link>
          </div>

          <div className="flex flex-col gap-2">
            <Link href="/password-reset" className="text-sm">
              Przypomnij hasło
            </Link>
          </div>
        </div>

        <div className="flex flex-wrap justify-end gap-2">
          <Button loading={inProgress}>Zaloguj</Button>
        </div>
      </form>
    </Form>
  );
};
