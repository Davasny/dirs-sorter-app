import type { ReactNode } from "react";
import { DirectoryUploader } from "@/features/file-uploader/components/directory-uploader";
import { ProjectFilesList } from "@/features/project-files/components/project-files-list";

export default async function Layout({
  params,
  children,
}: {
  params: Promise<{ projectId: string }>;
  children: ReactNode;
}) {
  const { projectId } = await params;

  return (
    <div className="flex flex-wrap gap-6 h-full">
      <div className="flex flex-col gap-8 w-1/4">
        <DirectoryUploader projectId={projectId} />

        <ProjectFilesList projectId={projectId} />
      </div>

      <div className="flex-1 h-full">{children}</div>
    </div>
  );
}
