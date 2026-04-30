import { useState } from "react";
import type { Job, JobStatus } from "../types/job";
import { JobCard } from "./JobCard";
import { JobModal } from "./JobModal";

const SIDE_COLUMNS: { id: JobStatus; label: string; color: string }[] = [
  { id: "applied", label: "Applied", color: "border-blue-500" },
  { id: "interview", label: "Interview", color: "border-green-500" },
  { id: "rejected", label: "Rejected", color: "border-red-500" },
];

interface Props {
  jobs: Job[];
  onStatusChange: (id: string, status: JobStatus) => void;
}

export function KanbanBoard({ jobs, onStatusChange }: Props) {
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  const newJobs = jobs.filter((j) => j.status === "new");

  return (
    <>
      {selectedJob && (
        <JobModal
          job={selectedJob}
          onClose={() => setSelectedJob(null)}
          onStatusChange={(id, status) => {
            onStatusChange(id, status);
            setSelectedJob(null);
          }}
        />
      )}

      <div className="flex flex-col gap-5">
        {/* NEW — full width, 3-column grid */}
        <div>
          <div className="flex items-center justify-between pb-2 border-b-2 border-slate-500 mb-4">
            <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
              New
            </h2>
            <span className="bg-slate-700 text-slate-400 text-xs font-medium px-2 py-0.5 rounded-full">
              {newJobs.length}
            </span>
          </div>

          {newJobs.length === 0 ? (
            <div className="text-slate-600 text-xs text-center py-8 border border-dashed border-slate-700 rounded-xl">
              No new jobs
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
              {newJobs.map((job) => (
                <JobCard
                  key={job.job_id}
                  job={job}
                  onStatusChange={onStatusChange}
                  onClick={() => setSelectedJob(job)}
                />
              ))}
            </div>
          )}
        </div>

        {/* APPLIED / INTERVIEW / REJECTED — 3 equal columns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {SIDE_COLUMNS.map((col) => {
            const colJobs = jobs.filter((j) => j.status === col.id);
            return (
              <div key={col.id} className="flex flex-col gap-3">
                <div className={`flex items-center justify-between pb-2 border-b-2 ${col.color}`}>
                  <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
                    {col.label}
                  </h2>
                  <span className="bg-slate-700 text-slate-400 text-xs font-medium px-2 py-0.5 rounded-full">
                    {colJobs.length}
                  </span>
                </div>
                <div className="flex flex-col gap-3">
                  {colJobs.length === 0 ? (
                    <div className="text-slate-600 text-xs text-center py-6 border border-dashed border-slate-700 rounded-xl">
                      No jobs
                    </div>
                  ) : (
                    colJobs.map((job) => (
                      <JobCard
                        key={job.job_id}
                        job={job}
                        onStatusChange={onStatusChange}
                        onClick={() => setSelectedJob(job)}
                      />
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
