"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { authClient } from "@/features/auth/lib/auth-client";
import { passwordSchema } from "@/features/auth/schemas/password-schema";

const signupSchema = z
  .object({
    email: z.email(),
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type ISignUpForm = z.infer<typeof signupSchema>;

export const SignUpForm = () => {
  const [inProgress, setInProgress] = useState(false);

  const form = useForm<ISignUpForm>({
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
    },
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = async (data: ISignUpForm) => {
    setInProgress(true);

    const {error} = await authClient.signUp.email({
      email: data.email,
      password: data.password,
      name: data.email,
    });

    setInProgress(false);

    if (error) {
      toast.error("Failed to create account", {
        description: error.message,
      });
    }
  };

  return (
    <Form {...form}>
      <form
        className="flex flex-col gap-8"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <h1 className="text-2xl">Sign up</h1>

        <FormField
          control={form.control}
          name="email"
          render={({field}) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>

              <FormMessage/>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({field}) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
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
              <FormLabel>Confirm password</FormLabel>
              <FormControl>
                <Input type="password" {...field} />
              </FormControl>

              <FormMessage/>
            </FormItem>
          )}
        />

        <div className="flex flex-wrap gap-2 justify-between items-center">
          <Link href="/signin" className="text-sm">
            Back to login
          </Link>

          <div className="flex flex-wrap justify-end gap-2">
            <Button type="submit" loading={inProgress}>Register</Button>
          </div>
        </div>
      </form>
    </Form>
  );
};
