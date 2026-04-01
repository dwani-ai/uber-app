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
          Portfolio entry — set <span className="mono">liveUrl</span> when deployed.
        </p>
      )}
      <div className="actions">
        {hasLive ? (
          <a
            className="btn-live"
            href={project.liveUrl!}
            target="_blank"
            rel="noopener noreferrer"
          >
            Live
          </a>
        ) : (
          <button
            type="button"
            className="btn-live"
            disabled
            title="No deployment URL yet — set liveUrl in the manifest"
          >
            Coming soon
          </button>
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
