import { FilePreview } from "@/features/project-files/components/file-preview";

export default async function Page({
  params,
}: {
  params: Promise<{
    projectId: string;
    fileId: string;
  }>;
}) {
  const { fileId, projectId } = await params;

  return (
      <div className="max-w-[600px]">
        <FilePreview projectId={projectId} fileId={fileId} />
      </div>
  );
}
