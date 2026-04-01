import { useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { useProjects } from "../ProjectsContext";

export function ProjectEmbedPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const { projects, loading, error } = useProjects();

  const project = useMemo(
    () => projects.find((p) => p.id === projectId),
    [projects, projectId]
  );

  const liveUrl = project?.liveUrl?.trim();

  if (loading) {
    return (
      <div className="embed-shell">
        <p className="muted-note">Loading…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="embed-shell">
        <div className="error">{error}</div>
        <Link to="/">← Back to catalog</Link>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="embed-shell">
        <p>Project not found.</p>
        <Link to="/">← Back to catalog</Link>
      </div>
    );
  }

  return (
    <div className="embed-layout">
      <div className="embed-topbar">
        <Link to="/" className="embed-back">
          ← Catalog
        </Link>
        <span className="embed-title">{project.title}</span>
        <span className="mono embed-repo">{project.repo}</span>
        <span
          className="mono embed-sub"
          title="Docker Compose service name and Traefik Host subdomain (before your DOMAIN)"
        >
          {project.subdomain ?? project.id}
        </span>
        <div className="embed-topbar-actions">
          {liveUrl ? (
            <a
              className="btn-doc"
              href={liveUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              Open in new tab
            </a>
          ) : null}
          <a
            className="btn-doc"
            href={project.docsUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            Document
          </a>
        </div>
      </div>

      {liveUrl ? (
        <div className="embed-frame-wrap">
          <iframe
            className="embed-frame"
            title={project.title}
            src={liveUrl}
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      ) : (
        <div className="embed-placeholder">
          <p>
            No <span className="mono">liveUrl</span> for this project. Add a hosted URL in{" "}
            <span className="mono">projects.v1.json</span> (or regenerate from{" "}
            <span className="mono">gen-manifest.mjs</span>) to embed it here.
          </p>
          <p>
            <a href={project.docsUrl} target="_blank" rel="noopener noreferrer">
              Open documentation on GitHub →
            </a>
          </p>
        </div>
      )}
    </div>
  );
}
