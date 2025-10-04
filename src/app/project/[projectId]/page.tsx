import { DirectoryUploader } from "@/features/file-uploader/components/directory-uploader";

export default async function Page({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;

  return (
    <div>
      project id: {projectId}
      <DirectoryUploader projectId={projectId} />
    </div>
  );
}
