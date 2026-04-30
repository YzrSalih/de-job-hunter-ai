import type { Job, JobStatus } from "../types/job";

const RECOMMENDATION_STYLE = {
  apply: "bg-green-500/20 text-green-400 border border-green-500/30",
  maybe: "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30",
  skip: "bg-red-500/20 text-red-400 border border-red-500/30",
};

interface Props {
  job: Job;
  onStatusChange: (id: string, status: JobStatus) => void;
  onClick: () => void;
}

const STATUSES: JobStatus[] = ["new", "applied", "interview", "rejected"];

export function JobCard({ job, onStatusChange, onClick }: Props) {
  const score = job.analysis?.tech_match_score ?? 0;

  return (
    <div
      className="bg-slate-800 border border-slate-700 rounded-xl p-4 flex flex-col gap-3 hover:border-violet-500/50 hover:bg-slate-800/80 transition-all cursor-pointer"
      onClick={onClick}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-white font-semibold text-sm leading-snug line-clamp-2">
            {job.title}
          </p>
          <p className="text-slate-400 text-xs mt-0.5 truncate">{job.company}</p>
          {job.location && (
            <p className="text-slate-500 text-xs truncate">📍 {job.location}</p>
          )}
          <div className="flex items-center gap-2 flex-wrap mt-0.5">
            {job.workplace_type && (
              <span className="text-slate-500 text-xs capitalize">
                {job.workplace_type === "remote" ? "🌐" : job.workplace_type === "hybrid" ? "🔀" : "🏢"} {job.workplace_type}
              </span>
            )}
            {job.salary && (
              <span className="text-emerald-400 text-xs">💰 {job.salary}</span>
            )}
          </div>
        </div>
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium whitespace-nowrap shrink-0 ${
          RECOMMENDATION_STYLE[job.analysis?.recommendation ?? "skip"]
        }`}>
          {job.analysis?.recommendation ?? "—"}
        </span>
      </div>

      {/* Tech match bar */}
      <div>
        <div className="flex justify-between text-xs text-slate-400 mb-1">
          <span>Tech match</span>
          <span className="font-medium text-white">{score}%</span>
        </div>
        <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-violet-500 rounded-full transition-all"
            style={{ width: `${score}%` }}
          />
        </div>
      </div>

      {/* Matched techs */}
      {job.analysis?.matched_techs?.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {job.analysis.matched_techs.slice(0, 4).map((tech) => (
            <span key={tech} className="bg-violet-500/10 text-violet-400 border border-violet-500/20 text-xs px-2 py-0.5 rounded-full">
              {tech}
            </span>
          ))}
          {job.analysis.matched_techs.length > 4 && (
            <span className="text-slate-500 text-xs px-1 py-0.5">
              +{job.analysis.matched_techs.length - 4}
            </span>
          )}
        </div>
      )}

      {/* Footer */}
      <div
        className="flex items-center justify-between gap-2 pt-1 border-t border-slate-700"
        onClick={(e) => e.stopPropagation()}
      >
        <span className="text-slate-600 text-xs capitalize">{job.source}</span>
        <select
          value={job.status}
          onChange={(e) => onStatusChange(job.job_id, e.target.value as JobStatus)}
          className="bg-slate-700 text-slate-300 text-xs rounded-lg px-2 py-1 border border-slate-600 cursor-pointer hover:border-violet-500 transition-colors focus:outline-none focus:border-violet-500"
        >
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
