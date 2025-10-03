import { fileUploaderRouter } from "@/features/file-uploader/router";
import { router } from "@/lib/trpc/trpc";
import { projectsRouter } from "@/features/projects/router";

export const appRouter = router({
  fileUpload: fileUploaderRouter,
  projects: projectsRouter,
});

export type AppRouter = typeof appRouter;
