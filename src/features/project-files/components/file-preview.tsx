"use client";

import { useQuery } from "@tanstack/react-query";
import { ImagePreview } from "@/features/project-files/components/image-preview";
import { PdfPreview } from "@/features/project-files/components/pdf-preview";
import { RawPreview } from "@/features/project-files/components/raw-preview";
import { useTRPC } from "@/lib/trpc/client";

export const FilePreview = ({
  projectId,
  fileId,
}: {
  projectId: string;
  fileId: string;
}) => {
  const trpc = useTRPC();
  const { data: fileMetadata, isLoading: isLoadingFileMetadata } = useQuery(
    trpc.projectFiles.getFileMetadata.queryOptions({ projectId, fileId }),
  );

  if (isLoadingFileMetadata) {
    return  (
      <div>Ładowanie...</div>
    )
  }

  if (fileMetadata?.mimeType?.includes("pdf")) {
    return <PdfPreview fileId={fileId} />;
  }

  if (fileMetadata?.mimeType?.includes("image")) {
    return <ImagePreview fileId={fileId} filePath={fileMetadata.filePath} />;
  }

  return <RawPreview fileId={fileId} />;
};
