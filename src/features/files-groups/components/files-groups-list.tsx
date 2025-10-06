"use client";

import { useQuery } from "@tanstack/react-query";
import { useRef } from "react";
import { Textarea } from "@/components/ui/textarea";
import type { IFilesGroup } from "@/features/files-groups/db";
import { useTRPC } from "@/lib/trpc/client";

const FilesInGroup = ({
  group,
  projectId,
}: {
  group: IFilesGroup;
  projectId: string;
}) => {
  const trpc = useTRPC();
  const { data: files } = useQuery({
    ...trpc.filesGroups.listFilesInGroup.queryOptions({
      projectId,
      groupId: group.id,
    }),
    refetchOnMount: true,
  });

  const areaRef = useRef<HTMLTextAreaElement | null>(null);

  // Extract only directories (everything before the last '/')
  const directories = Array.from(
    new Set(
      (files || [])
        .map((f) => {
          const parts = f.filePath.split("/");
          parts.pop(); // remove filename
          return parts.join("/");
        })
        .filter((dir) => dir.length > 0),
    ),
  );

  const content = directories.join("\n") || "Brak katalogów";

  return (
    <div className="w-full">
      <div className="flex gap-2 items-center text-sm ">
        <span>Grupa:</span>
        <span>{group.name}</span>
      </div>

      <Textarea
        ref={areaRef}
        value={content}
        readOnly
        className="w-full max-h-50 select-all"
        onClick={() => areaRef.current?.select()}
      />
    </div>
  );
};

export const FilesGroupsList = ({ projectId }: { projectId: string }) => {
  const trpc = useTRPC();
  const { data: groups } = useQuery(
    trpc.filesGroups.listGroups.queryOptions({ projectId }),
  );

  return (
    <div className="flex flex-col w-full gap-8">
      {groups?.map((group) => (
        <FilesInGroup group={group} projectId={projectId} key={group.id} />
      ))}
    </div>
  );
};
