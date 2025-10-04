import { fileUploaderRouter } from "@/features/file-uploader/router";
import { projectFilesRouter } from "@/features/project-files/router";
import { projectsRouter } from "@/features/projects/router";
import { router } from "@/lib/trpc/trpc";

export const appRouter = router({
  fileUpload: fileUploaderRouter,
  projects: projectsRouter,
  projectFiles: projectFilesRouter,
});

export type AppRouter = typeof appRouter;
