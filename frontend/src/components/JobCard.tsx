import type { Job, JobStatus } from "../types/job";

const RECOMMENDATION_STYLE = {
  apply: "bg-green-500/20 text-green-400 border border-green-500/30",
  maybe: "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30",
  skip: "bg-red-500/20 text-red-400 border border-red-500/30",
};

const SOURCE_LABEL = {
  arbeitsagentur: "Arbeitsagentur",
  indeed: "Indeed",
};

interface Props {
  job: Job;
  onStatusChange: (id: string, status: JobStatus) => void;
}

const STATUSES: JobStatus[] = ["new", "applied", "interview", "rejected"];

export function JobCard({ job, onStatusChange }: Props) {
  const score = job.analysis?.tech_match_score ?? 0;

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 flex flex-col gap-3 hover:border-slate-500 transition-colors">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <a
            href={job.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-white font-semibold text-sm leading-snug hover:text-violet-400 transition-colors line-clamp-2"
          >
            {job.title}
          </a>
          <p className="text-slate-400 text-xs mt-1 truncate">{job.company}</p>
          {job.location && (
            <p className="text-slate-500 text-xs truncate">📍 {job.location}</p>
          )}
        </div>
        <span
          className={`text-xs px-2 py-0.5 rounded-full font-medium whitespace-nowrap ${
            RECOMMENDATION_STYLE[job.analysis?.recommendation ?? "skip"]
          }`}
        >
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
          {job.analysis.matched_techs.map((tech) => (
            <span
              key={tech}
              className="bg-violet-500/10 text-violet-400 border border-violet-500/20 text-xs px-2 py-0.5 rounded-full"
            >
              {tech}
            </span>
          ))}
        </div>
      )}

      {/* Summary */}
      {job.analysis?.summary && (
        <p className="text-slate-400 text-xs leading-relaxed line-clamp-3">
          {job.analysis.summary}
        </p>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-700">
        <span className="text-slate-600 text-xs">
          {SOURCE_LABEL[job.source]}
        </span>
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
