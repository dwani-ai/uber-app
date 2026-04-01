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
            : "Coming soon — hosted run is not wired for this project yet."}
        </p>
      )}
      <div className="actions">
        {hasLive ? (
          <Link className="btn-live" to={`/run/${project.id}`}>
            Run in UberApp
          </Link>
        ) : (
          <span
            className="btn-live btn-live-soon"
            title="Not available until this project is deployed in UberApp"
            aria-disabled="true"
          >
            Run in UberApp
          </span>
        )}
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
        ) : (
          <span className="btn-doc btn-soon" title="Not deployed in UberApp yet">
            Coming soon
          </span>
        )}
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
