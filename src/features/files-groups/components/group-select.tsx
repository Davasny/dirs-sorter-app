"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import { EditGroupsFieldArray } from "@/features/files-groups/components/edit-groups-field-array";
import { GroupSelectSection } from "@/features/files-groups/components/group-select-section";
import { NewGroupForm } from "@/features/files-groups/components/new-group-form";
import type { IFilesGroup } from "@/features/files-groups/db";
import { groupSchema } from "@/features/files-groups/schemas";
import type { IProjectFile } from "@/features/project-files/db";
import { useTRPC } from "@/lib/trpc/client";

export type IGroupEditForm = {
  groups: Array<{ name: string; id?: string }>;
};

const GroupSelect = ({
  projectId,
  fileMetadata,
  groups,
}: {
  projectId: string;
  fileMetadata: IProjectFile;
  groups: IFilesGroup[];
}) => {
  const [inEditMode, setInEditMode] = useState(false);

  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { mutateAsync: update } = useMutation(
    trpc.filesGroups.updateGroups.mutationOptions({
      onSuccess: () =>
        queryClient.invalidateQueries(
          trpc.filesGroups.listGroups.queryOptions({ projectId }),
        ),
    }),
  );

  const form = useForm<IGroupEditForm>({
    defaultValues: {
      groups: groups,
    },
    resolver: zodResolver(z.object({ groups: z.array(groupSchema).min(1) })),
  });

  const onSubmit = async (values: IGroupEditForm) => {
    try {
      await update({
        groups: values.groups,
        projectId,
      });

      setInEditMode(false);
    } catch (error) {
      toast.error("Nie udało się zaktualizować grup", {
        description: (error as Error).message,
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="flex flex-col gap-2 flex-1 h-full">
          <div className="flex gap-2 justify-between items-center">
            <Label>Grupa plików</Label>

            {inEditMode ? (
              <div className="flex gap-1">
                <Button
                  variant="outline"
                  size="xs"
                  onClick={() => {
                    setInEditMode(!inEditMode);
                    form.reset();
                  }}
                >
                  anuluj
                </Button>

                <Button variant="outline" size="xs" type="submit">
                  zapisz
                </Button>
              </div>
            ) : (
              <Button
                variant="outline"
                size="xs"
                onClick={() => setInEditMode(!inEditMode)}
              >
                edytuj
              </Button>
            )}
          </div>

          {inEditMode && groups ? (
            <EditGroupsFieldArray />
          ) : groups ? (
            <GroupSelectSection
              projectId={projectId}
              fileMetadata={fileMetadata}
              groups={groups}
            />
          ) : null}
        </div>
      </form>
    </Form>
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
  const { data: fileMetadata, isLoading: isLoadingFileMetadata } = useQuery({
    ...trpc.projectFiles.getFileMetadata.queryOptions({ projectId, fileId }),
    refetchOnMount: true,
  });

  const { data: groups } = useQuery(
    trpc.filesGroups.listGroups.queryOptions({ projectId }),
  );

  if (isLoadingFileMetadata) return <p>Ładowanie...</p>;
  if (!fileMetadata) return <p>Nie znaleziono metadanych pliku</p>;

  return (
    <div className="flex flex-col gap-2">
      <GroupSelect
        key={JSON.stringify(groups)}
        projectId={projectId}
        fileMetadata={fileMetadata}
        groups={groups || []}
      />

      <NewGroupForm projectId={projectId} />
    </div>
  );
};
