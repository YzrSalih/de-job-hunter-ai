import type { Job, JobStatus } from "../types/job";
import { JobCard } from "./JobCard";

const COLUMNS: { id: JobStatus; label: string; color: string }[] = [
  { id: "new", label: "New", color: "border-slate-500" },
  { id: "applied", label: "Applied", color: "border-blue-500" },
  { id: "interview", label: "Interview", color: "border-green-500" },
  { id: "rejected", label: "Rejected", color: "border-red-500" },
];

interface Props {
  jobs: Job[];
  onStatusChange: (id: string, status: JobStatus) => void;
}

export function KanbanBoard({ jobs, onStatusChange }: Props) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
      {COLUMNS.map((col) => {
        const columnJobs = jobs.filter((j) => j.status === col.id);
        return (
          <div key={col.id} className="flex flex-col gap-3">
            {/* Column header */}
            <div className={`flex items-center justify-between pb-2 border-b-2 ${col.color}`}>
              <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
                {col.label}
              </h2>
              <span className="bg-slate-700 text-slate-400 text-xs font-medium px-2 py-0.5 rounded-full">
                {columnJobs.length}
              </span>
            </div>

            {/* Cards */}
            <div className="flex flex-col gap-3">
              {columnJobs.length === 0 ? (
                <div className="text-slate-600 text-xs text-center py-8 border border-dashed border-slate-700 rounded-xl">
                  No jobs
                </div>
              ) : (
                columnJobs.map((job) => (
                  <JobCard key={job.job_id} job={job} onStatusChange={onStatusChange} />
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
