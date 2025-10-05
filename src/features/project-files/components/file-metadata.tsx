"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useTRPC } from "@/lib/trpc/client";

export const FileMetadata = ({
  fileId,
  projectId,
}: {
  fileId: string;
  projectId: string;
}) => {
  const trpc = useTRPC();
  const { data: fileMetadata } = useQuery(
    trpc.projectFiles.getFileMetadata.queryOptions({ projectId, fileId }),
  );

  const { data: nextDir } = useQuery(
    trpc.projectFiles.getNextFolderId.queryOptions({
      projectId,
      currentFileId: fileId,
    }),
  );

  const directoryName = fileMetadata?.filePath.split("/")[0];
  const fileName = fileMetadata?.filePath.split("/").pop();

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label>Folder</Label>
        <span className="font-mono text-sm">{directoryName?.trim()}</span>

        <Button asChild>
          <Link
            href={`/project/${projectId}/file/${nextDir}`}
            // className="text-sm text-blue-600 hover:underline"
          >
            Następny folder
          </Link>
        </Button>

      </div>

      <div className="flex flex-col gap-2">
        <Label>Plik</Label>
        <span className="font-mono text-sm">{fileName?.trim()}</span>
      </div>
    </div>
  );
};
