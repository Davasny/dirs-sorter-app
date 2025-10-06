"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { PlusIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useTRPC } from "@/lib/trpc/client";

const newGroupSchema = z.object({
  name: z.string().nonempty(),
});

type INewGroupForm = z.infer<typeof newGroupSchema>;

export const NewGroupForm = ({ projectId }: { projectId: string }) => {
  const form = useForm<z.infer<typeof newGroupSchema>>({
    defaultValues: {
      name: "",
    },
    resolver: zodResolver(newGroupSchema),
  });

  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { mutateAsync: createGroup } = useMutation(
    trpc.filesGroups.createGroup.mutationOptions({
      onSuccess: () => {
        void queryClient.invalidateQueries(
          trpc.filesGroups.listGroups.queryOptions({ projectId }),
        );
      },
    }),
  );

  const onSubmit = async (values: INewGroupForm) => {
    try {
      await createGroup({
        name: values.name,
        projectId,
      });

      form.reset();
    } catch (error) {
      toast.error("Group creation failed", {
        description: (error as Error).message,
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-full">
        <div className="flex flex-wrap items-end gap-2">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormControl>
                  <Input placeholder="nazwa nowej grupy" {...field} />
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />

          <div>
            <Button type="submit" size="icon">
              <PlusIcon />
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
};
