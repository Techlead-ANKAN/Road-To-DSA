import { Search, SlidersHorizontal } from 'lucide-react'

const difficulties = ['All', 'Easy', 'Medium', 'Hard']

export const FilterBar = ({ search, onSearchChange, difficulty, onDifficultyChange }) => {
  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-surface-border bg-surface p-4 shadow-card md:flex-row md:items-center md:justify-between">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          type="search"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search problems"
          className="w-full rounded-lg border border-surface-border pl-9 pr-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
      </div>
      <div className="flex items-center gap-3">
        <SlidersHorizontal className="h-4 w-4 text-slate-400" />
        <select
          value={difficulty}
          onChange={(event) => onDifficultyChange(event.target.value)}
          className="rounded-lg border border-surface-border px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
        >
          {difficulties.map((level) => (
            <option key={level} value={level}>
              {level}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}
