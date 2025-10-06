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

  let previewComponent = null;

  if (isLoadingFileMetadata) {
    previewComponent = <p>Ładowanie...</p>;
  } else if (fileMetadata?.mimeType?.includes("pdf")) {
    previewComponent = <PdfPreview projectId={projectId} fileId={fileId}/>;
  } else if (fileMetadata?.mimeType?.includes("image")) {
    previewComponent = (
      <ImagePreview
        projectId={projectId}
        fileId={fileId}
        filePath={fileMetadata.filePath}
      />
    );
  } else if (fileMetadata?.mimeType !== null) {
    previewComponent = <RawPreview projectId={projectId} fileId={fileId}/>;
  } else previewComponent = <p>Nie można podglądnąć tego pliku.</p>;

  return <div className="flex flex-col gap-6 h-full">{previewComponent}</div>;
};
