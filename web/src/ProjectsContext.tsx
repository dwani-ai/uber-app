import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Project, ProjectsManifest } from "./types";

function isValidCategories(c: unknown): c is Project["categories"] {
  if (!Array.isArray(c) || c.length === 0) return false;
  return c.every((x) => x === "web" || x === "ai");
}

function isManifest(x: unknown): x is ProjectsManifest {
  if (typeof x !== "object" || x === null) return false;
  const o = x as Record<string, unknown>;
  return (
    o.version === 1 &&
    Array.isArray(o.projects) &&
    o.projects.every(
      (p) =>
        typeof p === "object" &&
        p !== null &&
        typeof (p as Project).id === "string" &&
        typeof (p as Project).title === "string" &&
        typeof (p as Project).repo === "string" &&
        isValidCategories((p as Project).categories) &&
        typeof (p as Project).docsUrl === "string"
    )
  );
}

type ProjectsCtx = {
  projects: Project[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
};

const ProjectsContext = createContext<ProjectsCtx | null>(null);

export function ProjectsProvider({ children }: { children: ReactNode }) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  const refetch = useCallback(() => setTick((t) => t + 1), []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/projects.v1.json", { cache: "no-store" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data: unknown = await res.json();
        if (cancelled) return;
        if (!isManifest(data)) {
          setError("Invalid projects manifest.");
          return;
        }
        setProjects(data.projects);
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Failed to load projects.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [tick]);

  const value = useMemo(
    () => ({ projects, loading, error, refetch }),
    [projects, loading, error, refetch]
  );

  return (
    <ProjectsContext.Provider value={value}>{children}</ProjectsContext.Provider>
  );
}

export function useProjects() {
  const ctx = useContext(ProjectsContext);
  if (!ctx) throw new Error("useProjects must be used within ProjectsProvider");
  return ctx;
}
