"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
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
import { useTRPC } from "@/lib/trpc/client";

const newProjectSchema = z.object({
  name: z.string().nonempty(),
});

type INewProjectForm = z.infer<typeof newProjectSchema>;

export const NewProjectForm = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const { mutateAsync: createProject } = useMutation(
    trpc.projects.createProject.mutationOptions({
      onSuccess: () =>
        queryClient.invalidateQueries(trpc.projects.listProjects.queryFilter()),
    }),
  );

  const form = useForm<INewProjectForm>({
    defaultValues: {
      name: "",
    },
    resolver: zodResolver(newProjectSchema),
  });

  const onSubmit = async (data: INewProjectForm) => {
    try {
      await createProject({ name: data.name });
      form.reset();
    } catch (error) {
      toast.error("Failed to create project", {
        description: (error as Error).message,
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="flex flex-wrap items-end gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>Nowy projekt</FormLabel>
                <FormControl>
                  <Input placeholder="nazwa projektu" {...field} />
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />

          <div>
            <Button type="submit">Dodaj</Button>
          </div>
        </div>
      </form>
    </Form>
  );
};
