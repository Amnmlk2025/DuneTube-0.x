import { useMemo } from "react";

type FilterOption = {
  id: string;
  label: string;
};

type FiltersBarProps = {
  filters: FilterOption[];
  activeFilter: string;
  onChange: (next: string) => void;
  className?: string;
};

const FiltersBar = ({ filters, activeFilter, onChange, className }: FiltersBarProps) => {
  const computedFilters = useMemo(() => filters ?? [], [filters]);

  return (
    <div className={["flex items-center gap-2 overflow-x-auto pb-2", className].filter(Boolean).join(" ")}>
      {computedFilters.map((filter) => {
        const isActive = filter.id === activeFilter;
        return (
          <button
            key={filter.id}
            type="button"
            onClick={() => onChange(filter.id)}
            className={[
              "whitespace-nowrap rounded-full border px-4 py-1.5 text-sm font-medium transition",
              isActive
                ? "border-brand-deep bg-brand-deep text-white"
                : "border-slate-200 bg-white text-slate-600 hover:border-brand-deep/40 hover:text-brand-deep",
            ].join(" ")}
          >
            {filter.label}
          </button>
        );
      })}
    </div>
  );
};

export type { FilterOption };
export default FiltersBar;
