import { Link } from "react-router-dom";
import type { Project } from "../types";

interface Props {
  project: Project;
}

export function ProjectCard({ project }: Props) {
  const hasLive = Boolean(project.liveUrl?.trim());

  return (
    <article className="card">
      <h2>{project.title}</h2>
      <div className="mono repo">{project.repo}</div>
      <div className="badges">
        {project.categories.includes("web") && (
          <span className="badge">Web</span>
        )}
        {project.categories.includes("ai") && (
          <span className="badge ai">AI</span>
        )}
      </div>
      {project.description ? (
        <p className="desc">{project.description}</p>
      ) : (
        <p className="desc" style={{ opacity: 0.5 }}>
          {hasLive
            ? "Embedded in UberApp — use Run in UberApp."
            : "Add liveUrl to embed a hosted preview here."}
        </p>
      )}
      <div className="actions">
        <Link className="btn-live" to={`/run/${project.id}`}>
          Run in UberApp
        </Link>
        {hasLive ? (
          <a
            className="btn-doc"
            href={project.liveUrl!}
            target="_blank"
            rel="noopener noreferrer"
            title="Open deployment in a new tab"
          >
            New tab
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
    </article>
  );
}
