import { DirectoryUploader } from "@/features/file-uploader/components/directory-uploader";
import { ProjectFilesList } from "@/features/project-files/components/project-files-list";

export default async function Page({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;

  return (
    <div className="flex flex-wrap h-full">
      <div className="flex flex-col gap-8 w-1/4">
      </div>
    </div>
  );
}
