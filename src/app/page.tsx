import { NewProjectForm } from "@/features/projects/components/new-project-form";
import { ProjectsList } from "@/features/projects/components/projects-list";

export default function Page() {
  return (
    <div className="max-w-md mx-auto p-4 flex flex-col gap-4">
      <ProjectsList />

      <NewProjectForm />
    </div>
  );
}
