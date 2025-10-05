"use client";

import { useQuery } from "@tanstack/react-query";
import { useTRPC } from "@/lib/trpc/client";

export const FilePreview = ({
  projectId,
  fileId,
}: {
  projectId: string;
  fileId: string;

}) => {
  const trpc = useTRPC();
  const { data: fileMetadata } = useQuery(
    trpc.projectFiles.getFileMetadata.queryOptions({ projectId, fileId }),
  );

  if (fileMetadata?.mimeType?.includes("pdf")) {
    return (
      <iframe
        src={`/api/files/${fileId}#view=FitH&toolbar=1&navpanes=0`}
        className="h-full aspect-[210/297] border-2"
        title="PDF"
      />
    );
  }

  return (
    <img
      src={`/api/files/${fileId}`}
      alt={fileMetadata?.filePath}
      className="h-full object-contain"
    />
  );
};
