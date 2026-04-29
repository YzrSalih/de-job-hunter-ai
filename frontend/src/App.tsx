import { useJobs } from "./hooks/useJobs";
import { KanbanBoard } from "./components/KanbanBoard";
import { isFirebaseConfigured } from "./lib/firebase";

function SetupScreen() {
  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6">
      <div className="bg-slate-800 border border-slate-700 rounded-2xl p-8 max-w-lg w-full">
        <div className="text-4xl mb-4">🇩🇪</div>
        <h1 className="text-white text-xl font-bold mb-2">DE Job Hunter</h1>
        <p className="text-slate-400 text-sm mb-6">
          Firebase web config is missing. Create{" "}
          <code className="bg-slate-700 text-violet-400 px-1.5 py-0.5 rounded text-xs">
            frontend/.env
          </code>{" "}
          with the values below.
        </p>

        <div className="bg-slate-900 rounded-xl p-4 font-mono text-xs text-slate-300 leading-relaxed mb-6">
          <p className="text-slate-500 mb-2"># frontend/.env</p>
          <p>VITE_FIREBASE_API_KEY=<span className="text-yellow-400">...</span></p>
          <p>VITE_FIREBASE_AUTH_DOMAIN=<span className="text-yellow-400">de-job-hunter-ai.firebaseapp.com</span></p>
          <p>VITE_FIREBASE_PROJECT_ID=<span className="text-yellow-400">de-job-hunter-ai</span></p>
          <p>VITE_FIREBASE_STORAGE_BUCKET=<span className="text-yellow-400">...</span></p>
          <p>VITE_FIREBASE_MESSAGING_SENDER_ID=<span className="text-yellow-400">...</span></p>
          <p>VITE_FIREBASE_APP_ID=<span className="text-yellow-400">...</span></p>
        </div>

        <div className="flex flex-col gap-2 text-sm text-slate-400">
          <p className="font-medium text-slate-300">How to get the config:</p>
          <ol className="list-decimal list-inside space-y-1 text-slate-400">
            <li>Open Firebase Console → your project</li>
            <li>Project Settings → Your Apps</li>
            <li>Add a Web App (or select existing)</li>
            <li>Copy the <code className="bg-slate-700 px-1 rounded text-xs">firebaseConfig</code> object</li>
            <li>Paste the values into <code className="bg-slate-700 px-1 rounded text-xs">frontend/.env</code></li>
            <li>Restart the dev server</li>
          </ol>
        </div>
      </div>
    </div>
  );
}

function Dashboard() {
  const { jobs, loading, error, updateStatus, refetch } = useJobs();

  const stats = {
    total: jobs.length,
    apply: jobs.filter((j) => j.analysis?.recommendation === "apply").length,
    avgScore:
      jobs.length > 0
        ? Math.round(
            jobs.reduce((s, j) => s + (j.analysis?.tech_match_score ?? 0), 0) /
              jobs.length
          )
        : 0,
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur sticky top-0 z-10">
        <div className="max-w-screen-2xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🇩🇪</span>
            <div>
              <h1 className="text-base font-bold text-white">DE Job Hunter</h1>
              <p className="text-xs text-slate-400">AI-filtered jobs in Germany</p>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-6">
            <div className="text-center">
              <p className="text-xl font-bold text-white">{stats.total}</p>
              <p className="text-xs text-slate-400">Total</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold text-green-400">{stats.apply}</p>
              <p className="text-xs text-slate-400">Apply</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold text-violet-400">{stats.avgScore}%</p>
              <p className="text-xs text-slate-400">Avg match</p>
            </div>
          </div>

          <button
            onClick={refetch}
            disabled={loading}
            className="bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            {loading ? "Loading..." : "Refresh"}
          </button>
        </div>
      </header>

      <main className="max-w-screen-2xl mx-auto px-6 py-6">
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-xl p-4 mb-6">
            {error}
          </div>
        )}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-slate-500 text-sm">Loading jobs...</div>
          </div>
        ) : (
          <KanbanBoard jobs={jobs} onStatusChange={updateStatus} />
        )}
      </main>
    </div>
  );
}

export default function App() {
  if (!isFirebaseConfigured) return <SetupScreen />;
  return <Dashboard />;
}
