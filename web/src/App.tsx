import { useEffect, useMemo, useState } from "react";
import type { Project, ProjectsManifest } from "./types";
import { ProjectCard } from "./components/ProjectCard";
import { FilterBar, type FilterKey } from "./components/FilterBar";

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

function matchesFilter(p: Project, f: FilterKey): boolean {
  if (f === "all") return true;
  return p.categories.includes(f);
}

export default function App() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [filter, setFilter] = useState<FilterKey>("all");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
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
  }, []);

  const counts = useMemo(() => {
    const web = projects.filter((p) => p.categories.includes("web")).length;
    const ai = projects.filter((p) => p.categories.includes("ai")).length;
    return { all: projects.length, web, ai };
  }, [projects]);

  const visible = useMemo(
    () => projects.filter((p) => matchesFilter(p, filter)),
    [projects, filter]
  );

  return (
    <div className="shell">
      <header>
        <h1>UberApp</h1>
        <p>
          Design and engineering portfolio hub for public web and AI projects from{" "}
          <span className="mono">sachinsshetty</span>,{" "}
          <span className="mono">slabstech</span>, and{" "}
          <span className="mono">dwani-ai</span>. v1 lists the web ∪ AI union; add{" "}
          <span className="mono">liveUrl</span> in the manifest when a demo is deployed.
        </p>
      </header>

      {error && <div className="error">{error}</div>}

      {!loading && !error && (
        <>
          <FilterBar active={filter} onChange={setFilter} counts={counts} />
          <div className="grid">
            {visible.map((p) => (
              <ProjectCard key={p.id} project={p} />
            ))}
          </div>
          {visible.length === 0 && (
            <p className="muted-note">No projects match this filter.</p>
          )}
        </>
      )}

      {loading && !error && (
        <p className="muted-note">Loading catalog…</p>
      )}

      <p className="muted-note">
        Source: <span className="mono">web/public/projects.v1.json</span> — edit in-repo and
        redeploy.
      </p>
    </div>
  );
}
