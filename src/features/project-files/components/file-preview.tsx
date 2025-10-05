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

  // Fetch raw file content
  const { data: fileContent, isLoading: isLoadingContent } = useQuery({
    queryKey: ["fileContent", fileId],
    queryFn: async () => {
      const response = await fetch(`/api/files/${fileId}`);
      if (!response.ok) throw new Error("Failed to fetch file");
      return await response.text();
    },
    enabled:
      !!fileId &&
      !fileMetadata?.mimeType?.includes("pdf") &&
      !fileMetadata?.mimeType?.includes("image"),
  });

  if (fileMetadata?.mimeType?.includes("pdf")) {
    return (
      <iframe
        src={`/api/files/${fileId}#view=FitH&toolbar=1&navpanes=0`}
        className="h-full aspect-[210/297] border-2"
        title="PDF"
      />
    );
  }

  if (fileMetadata?.mimeType?.includes("image")) {
    return (
      <img
        src={`/api/files/${fileId}`}
        alt={fileMetadata?.filePath}
        className="h-full object-contain"
      />
    );
  }

  // raw file, probably text
  if (isLoadingContent) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500">Loading file content...</p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto">
      <pre className="p-4 text-sm font-mono whitespace-pre-wrap break-words">
        {fileContent}
      </pre>
    </div>
  );
};
