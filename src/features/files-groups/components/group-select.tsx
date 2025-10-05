"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { NewGroupForm } from "@/features/files-groups/components/new-group-form";
import type { IProjectFile } from "@/features/project-files/db";
import { useTRPC } from "@/lib/trpc/client";

const GroupSelect = ({
  projectId,
  fileMetadata,
}: {
  projectId: string;
  fileMetadata: IProjectFile;
}) => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const { data: groups } = useQuery(
    trpc.filesGroups.listGroups.queryOptions({ projectId }),
  );

  const { mutateAsync: assignFiles } = useMutation(
    trpc.filesGroups.assignAllFolderFilesToGroup.mutationOptions({
      onSuccess: () => {
        void queryClient.invalidateQueries(
          trpc.projectFiles.listFiles.queryOptions({ projectId }),
        );

        void queryClient.invalidateQueries(
          trpc.projectFiles.getFileMetadata.queryOptions({
            projectId,
            fileId: fileMetadata.id,
          }),
        );
      },
    }),
  );

  const onGroupChange = async (groupId: string) => {
    try {
      await assignFiles({ fileId: fileMetadata.id, groupId, projectId });
      toast.success("Pliki zostały przypisany do grupy");
    } catch (error) {
      toast.error("Nie udało się przypisać pliku do grupy", {
        description: (error as Error).message,
      });
    }
  };

  return (
    <div className="flex flex-col gap-2 flex-1 h-full">
      <Label>Grupa plików</Label>

      <RadioGroup
        className="w-full max-w-96 gap-0 -space-y-px rounded-md"
        onValueChange={onGroupChange}
        defaultValue={fileMetadata.groupId || ""}
      >
        {groups?.map((group) => (
          <div
            key={group.id}
            className="border-input has-data-[state=checked]:border-primary/50 has-data-[state=checked]:bg-accent relative flex flex-col gap-4 border p-4 outline-none first:rounded-t-md last:rounded-b-md has-data-[state=checked]:z-10"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <RadioGroupItem
                  id={group.id}
                  value={group.id}
                  className="after:absolute after:inset-0"
                />

                <Label className="inline-flex items-center" htmlFor={group.id}>
                  {group.name}
                </Label>
              </div>
            </div>
          </div>
        ))}
      </RadioGroup>

      <NewGroupForm projectId={projectId} />
    </div>
  );
};

export const GroupSelectWrapper = ({
  projectId,
  fileId,
}: {
  projectId: string;
  fileId: string;
}) => {
  const trpc = useTRPC();
  const { data: fileMetadata, isLoading: isLoadingFileMetadata } = useQuery(
    {
      ...trpc.projectFiles.getFileMetadata.queryOptions({ projectId, fileId }),
      refetchOnMount: true,
    }
  );

  if (isLoadingFileMetadata) return <p>Ładowanie...</p>;
  if (!fileMetadata) return <p>Nie znaleziono metadanych pliku</p>;

  return <GroupSelect projectId={projectId} fileMetadata={fileMetadata} />;
};
