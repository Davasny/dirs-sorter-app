"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useTRPC } from "@/lib/trpc/client";

export const RemoveProjectDialog = ({ projectId }: { projectId: string }) => {
  const { push } = useRouter();

  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { mutateAsync: deleteProject } = useMutation(
    trpc.projects.deleteProject.mutationOptions({
      onSuccess: () =>
        queryClient.invalidateQueries(
          trpc.projects.listProjects.queryOptions(),
        ),
    }),
  );

  const handleDelete = async () => {
    await deleteProject({ projectId });
    toast.warning("Projekt usunięty");
    push("/");
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive">Usuń projekt</Button>
      </AlertDialogTrigger>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Jesteś pewien?</AlertDialogTitle>

          <AlertDialogDescription>
            Usunięcie projektu spowoduje usunięcie wszystkich plików i grup z
            serwera. Ta akcja jest nieodwracalna.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel>Anuluj</AlertDialogCancel>

          <AlertDialogAction
            variant="destructive"
            onClick={() => handleDelete()}
          >
            Usuń
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
