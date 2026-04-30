import { useJobs } from "../hooks/useJobs";
import { KanbanBoard } from "../components/KanbanBoard";

export function DashboardPage() {
  const { jobs, loading, error, updateStatus, refetch, lastUpdated, nextRefresh } = useJobs();

  const stats = {
    total: jobs.length,
    apply: jobs.filter((j) => j.analysis?.recommendation === "apply").length,
    avgScore:
      jobs.length > 0
        ? Math.round(
            jobs.reduce((s, j) => s + (j.analysis?.tech_match_score ?? 0), 0) / jobs.length
          )
        : 0,
  };

  return (
    <div className="max-w-screen-2xl mx-auto px-6 py-6">
      {/* Stats + refresh bar */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div className="flex items-center gap-6">
          <div className="text-center">
            <p className="text-2xl font-bold text-white">{stats.total}</p>
            <p className="text-xs text-slate-400">Total</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-400">{stats.apply}</p>
            <p className="text-xs text-slate-400">Apply</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-violet-400">{stats.avgScore}%</p>
            <p className="text-xs text-slate-400">Avg match</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {lastUpdated && (
            <div className="text-right hidden sm:block">
              <p className="text-xs text-slate-500">Updated {lastUpdated}</p>
              <p className="text-xs text-slate-600">Next refresh in {nextRefresh}</p>
            </div>
          )}
          <button
            onClick={refetch}
            disabled={loading}
            className="bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
          >
            {loading ? (
              <><span className="animate-spin inline-block">⟳</span> Loading...</>
            ) : (
              "⟳ Refresh"
            )}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-xl p-4 mb-6">
          {error}
        </div>
      )}

      {loading && jobs.length === 0 ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-slate-500 text-sm">Loading jobs...</div>
        </div>
      ) : (
        <KanbanBoard jobs={jobs} onStatusChange={updateStatus} />
      )}
    </div>
  );
}
