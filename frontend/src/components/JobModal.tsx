import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import type { Job, JobStatus } from "../types/job";

const RECOMMENDATION_STYLE = {
  apply: "bg-green-500/20 text-green-400 border border-green-500/30",
  maybe: "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30",
  skip: "bg-red-500/20 text-red-400 border border-red-500/30",
};

const STATUSES: JobStatus[] = ["new", "applied", "interview", "rejected"];

interface Props {
  job: Job;
  onClose: () => void;
  onStatusChange: (id: string, status: JobStatus) => void;
}

export function JobModal({ job, onClose, onStatusChange }: Props) {
  const navigate = useNavigate();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const cleanDescription = job.description
    ?.replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  const score = job.analysis?.tech_match_score ?? 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                RECOMMENDATION_STYLE[job.analysis?.recommendation ?? "skip"]
              }`}>
                {job.analysis?.recommendation}
              </span>
              <span className="text-slate-500 text-xs">{job.source}</span>
            </div>
            <h2 className="text-white font-bold text-lg leading-snug">{job.title}</h2>
            <p className="text-slate-400 text-sm mt-0.5">{job.company}</p>
            {job.location && (
              <p className="text-slate-500 text-xs mt-0.5">📍 {job.location}</p>
            )}
            <div className="flex items-center gap-3 flex-wrap mt-1">
              {job.workplace_type && (
                <span className="text-slate-400 text-xs capitalize">
                  {job.workplace_type === "remote" ? "🌐" : job.workplace_type === "hybrid" ? "🔀" : "🏢"} {job.workplace_type}
                </span>
              )}
              {job.salary && (
                <span className="text-emerald-400 text-xs font-medium">💰 {job.salary}</span>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-white transition-colors text-xl shrink-0"
          >
            ✕
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-5">
          {/* Tech match */}
          <div>
            <div className="flex justify-between text-xs text-slate-400 mb-1.5">
              <span>Tech match</span>
              <span className="font-semibold text-white">{score}%</span>
            </div>
            <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-violet-500 rounded-full"
                style={{ width: `${score}%` }}
              />
            </div>
          </div>

          {/* Matched / missing techs */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-slate-400 mb-1.5 font-medium">Matched skills</p>
              <div className="flex flex-wrap gap-1">
                {job.analysis?.matched_techs?.length > 0
                  ? job.analysis.matched_techs.map((t) => (
                      <span key={t} className="bg-violet-500/10 text-violet-400 border border-violet-500/20 text-xs px-2 py-0.5 rounded-full">
                        {t}
                      </span>
                    ))
                  : <span className="text-slate-600 text-xs">None detected</span>
                }
              </div>
            </div>
            <div>
              <p className="text-xs text-slate-400 mb-1.5 font-medium">Missing skills</p>
              <div className="flex flex-wrap gap-1">
                {job.analysis?.missing_techs?.length > 0
                  ? job.analysis.missing_techs.map((t) => (
                      <span key={t} className="bg-red-500/10 text-red-400 border border-red-500/20 text-xs px-2 py-0.5 rounded-full">
                        {t}
                      </span>
                    ))
                  : <span className="text-slate-600 text-xs">None</span>
                }
              </div>
            </div>
          </div>

          {/* AI Summary */}
          {job.analysis?.summary && (
            <div className="bg-slate-800 rounded-xl p-4">
              <p className="text-xs text-slate-400 font-medium mb-1.5">AI Summary</p>
              <p className="text-slate-300 text-sm leading-relaxed">{job.analysis.summary}</p>
            </div>
          )}

          {/* Description */}
          <div>
            <p className="text-xs text-slate-400 font-medium mb-2">Job Description</p>
            <p className="text-slate-400 text-sm leading-relaxed whitespace-pre-line">
              {cleanDescription?.slice(0, 1500)}
              {cleanDescription && cleanDescription.length > 1500 && (
                <a href={job.url} target="_blank" rel="noopener noreferrer"
                  className="text-violet-400 hover:text-violet-300 ml-1">
                  ...read more →
                </a>
              )}
            </p>
          </div>
        </div>

        {/* Footer actions */}
        <div className="p-4 border-t border-slate-800 flex items-center justify-between gap-3">
          <select
            value={job.status}
            onChange={(e) => onStatusChange(job.job_id, e.target.value as JobStatus)}
            className="bg-slate-800 text-slate-300 text-sm rounded-lg px-3 py-2 border border-slate-600 cursor-pointer hover:border-violet-500 transition-colors focus:outline-none focus:border-violet-500"
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </option>
            ))}
          </select>

          <div className="flex items-center gap-2">
            <button
              onClick={() => { navigate("/cv-tailor"); onClose(); }}
              className="bg-slate-700 hover:bg-slate-600 text-slate-300 text-sm font-medium px-4 py-2 rounded-lg transition-colors"
            >
              ✨ Tailor CV
            </button>
            <a
              href={job.url}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
            >
              Apply →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
