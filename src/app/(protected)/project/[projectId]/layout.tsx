import type { ReactNode } from "react";
import { AppBreadcrumb } from "@/components/app-breadcrumb";
import { Separator } from "@/components/ui/separator";
import { LogoutButton } from "@/features/auth/components/logout-button";
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
    <div className="flex flex-wrap gap-4 h-full">
      <div className="flex flex-col gap-8 w-1/5 px-2 py-4 h-full overflow-hidden">
        <DirectoryUploader projectId={projectId} />

        <Separator />

        <ProjectFilesList projectId={projectId} />
      </div>

      <div className="flex flex-1 h-full p-2 flex-col gap-2">
        <div className="flex gap-2 justify-between">
          <AppBreadcrumb/>

          <LogoutButton/>
        </div>

        <div className="bg-[var(--sidebar)] border-1 border-[var(--sidebar-border)] h-full rounded-xl p-4 flex flex-wrap gap-4 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
}
