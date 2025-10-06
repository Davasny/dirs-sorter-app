"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { LogoutButton } from "@/features/auth/components/logout-button";
import { useTRPC } from "@/lib/trpc/client";

export const ProjectsList = () => {
  const trpc = useTRPC();
  const { data: projects } = useQuery(
    trpc.projects.listProjects.queryOptions(),
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between">
        <p className="font-bold">Twoje projekty</p>

        <LogoutButton/>
      </div>

      {projects && projects.length === 0 ? (
        <p>Nie masz jeszcze żadnego projektu</p>
      ) : null}

      <div className="flex flex-col gap-2 max-w-md">
        {projects?.map((project) => (
          <Link
            href={`/project/${project.id}`}
            key={project.id}
            className="bg-secondary px-2 py-1 rounded-md hover:bg-secondary/70"
          >
            {project.name}
          </Link>
        ))}
      </div>
    </div>
  );
};
