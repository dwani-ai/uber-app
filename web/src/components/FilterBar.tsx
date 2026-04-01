export type FilterKey = "all" | "web" | "ai";

interface Props {
  active: FilterKey;
  onChange: (f: FilterKey) => void;
  counts: { all: number; web: number; ai: number };
}

const labels: Record<FilterKey, string> = {
  all: "All",
  web: "Web apps",
  ai: "AI applications",
};

export function FilterBar({ active, onChange, counts }: Props) {
  const keys: FilterKey[] = ["all", "web", "ai"];
  return (
    <div className="filters" role="tablist" aria-label="Filter projects">
      {keys.map((key) => (
        <button
          key={key}
          type="button"
          role="tab"
          aria-selected={active === key}
          data-active={active === key}
          onClick={() => onChange(key)}
        >
          {labels[key]} ({counts[key]})
        </button>
      ))}
    </div>
  );
}
