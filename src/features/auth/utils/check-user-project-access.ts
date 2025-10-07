import { and, eq } from "drizzle-orm";
import { projectsTable } from "@/features/projects/db";
import { db } from "@/lib/db/client";

export const checkUserProjectAccess = async ({
  userId,
  projectId,
}: {
  userId: string;
  projectId: string;
}): Promise<boolean> => {
  const [project] = await db
    .select()
    .from(projectsTable)
    .where(
      and(eq(projectsTable.id, projectId), eq(projectsTable.ownerId, userId)),
    );

  return !!project;
};
