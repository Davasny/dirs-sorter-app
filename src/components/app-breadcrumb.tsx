"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { useTRPC } from "@/lib/trpc/client";

export const AppBreadcrumb = () => {
  const { fileId, projectId } = useParams<{
    projectId?: string;
    fileId?: string;
  }>();

  const trpc = useTRPC();
  const { data: projectDetails } = useQuery({
    ...trpc.projects.getProject.queryOptions({ projectId: projectId || "" }),
    enabled: Boolean(projectId),
  });

  const { data: fileMetadata } = useQuery({
    ...trpc.projectFiles.getFileMetadata.queryOptions({
      projectId: projectId || "",
      fileId: fileId || "",
    }),
    enabled: Boolean(projectId && fileId),
  });

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="/">Projekty</BreadcrumbLink>
        </BreadcrumbItem>

        {projectDetails ? (
          <>
            <BreadcrumbSeparator />

            <BreadcrumbItem>
              <BreadcrumbLink href={`/src/app/(protected)/project/${projectDetails.id}/`}>
                {projectDetails.name}
              </BreadcrumbLink>
            </BreadcrumbItem>
          </>
        ) : null}

        {projectDetails && fileMetadata ? (
          <>
            <BreadcrumbSeparator />

            <BreadcrumbItem>
              <BreadcrumbLink
                href={`/src/app/(protected)/project/${projectDetails.id}/file/${fileMetadata.id}`}
              >
                {fileMetadata.filePath}
              </BreadcrumbLink>
            </BreadcrumbItem>
          </>
        ) : null}
      </BreadcrumbList>
    </Breadcrumb>
  );
};
