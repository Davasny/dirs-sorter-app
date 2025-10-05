import { GroupSelectWrapper } from "@/features/files-groups/components/group-select";
import { FileMetadata } from "@/features/project-files/components/file-metadata";
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
    <div className="flex flex-wrap gap-4 h-full w-full">
      <div className="max-w-3/4 w-full">
        <FilePreview projectId={projectId} fileId={fileId} />
      </div>

      {/* right sidebar */}
      <div className="flex flex-col gap-8">
        <FileMetadata projectId={projectId} fileId={fileId} />
        <GroupSelectWrapper
          projectId={projectId}
          fileId={fileId}
          key={fileId}
        />
      </div>
    </div>
  );
}
