export type ProjectCategory = "web" | "ai";

export interface Project {
  id: string;
  title: string;
  repo: string;
  categories: ProjectCategory[];
  description?: string | null;
  liveUrl?: string | null;
  docsUrl: string;
}

export interface ProjectsManifest {
  /** JSON Schema pointer for editors (optional) */
  $schema?: string;
  version: number;
  projects: Project[];
}
