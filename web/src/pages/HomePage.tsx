import { useMemo, useState } from "react";
import type { Project } from "../types";
import { useProjects } from "../ProjectsContext";
import { ProjectCard } from "../components/ProjectCard";
import { FilterBar, type FilterKey } from "../components/FilterBar";

function matchesFilter(p: Project, f: FilterKey): boolean {
  if (f === "all") return true;
  return p.categories.includes(f);
}

export function HomePage() {
  const { projects, loading, error } = useProjects();
  const [filter, setFilter] = useState<FilterKey>("all");

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
          <span className="mono">dwani-ai</span>. On the server, Traefik serves the catalog at{" "}
          <span className="mono">hub.your-domain</span> and one subdomain per project
          container. Regenerate the manifest with{" "}
          <span className="mono">DOMAIN=… npm run gen:manifest</span> so{" "}
          <strong>Run in UberApp</strong> targets those URLs.
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

      {loading && !error && <p className="muted-note">Loading catalog…</p>}

      <p className="muted-note">
        Source: <span className="mono">web/public/projects.v1.json</span> — edit in-repo and
        redeploy.
      </p>
    </div>
  );
}
