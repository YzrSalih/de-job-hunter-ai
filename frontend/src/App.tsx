import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Navbar } from "./components/Navbar";
import { DashboardPage } from "./pages/DashboardPage";
import { CVTailorPage } from "./pages/CVTailorPage";
import { isFirebaseConfigured } from "./lib/firebase";

function SetupScreen() {
  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6">
      <div className="bg-slate-800 border border-slate-700 rounded-2xl p-8 max-w-lg w-full">
        <div className="text-4xl mb-4">🇩🇪</div>
        <h1 className="text-white text-xl font-bold mb-2">DE Job Hunter</h1>
        <p className="text-slate-400 text-sm mb-6">
          Firebase web config is missing. Create{" "}
          <code className="bg-slate-700 text-violet-400 px-1.5 py-0.5 rounded text-xs">frontend/.env</code>{" "}
          with the values below.
        </p>
        <div className="bg-slate-900 rounded-xl p-4 font-mono text-xs text-slate-300 leading-relaxed">
          <p className="text-slate-500 mb-2"># frontend/.env</p>
          <p>VITE_FIREBASE_API_KEY=<span className="text-yellow-400">...</span></p>
          <p>VITE_FIREBASE_AUTH_DOMAIN=<span className="text-yellow-400">de-job-hunter-ai.firebaseapp.com</span></p>
          <p>VITE_FIREBASE_PROJECT_ID=<span className="text-yellow-400">de-job-hunter-ai</span></p>
          <p>VITE_FIREBASE_STORAGE_BUCKET=<span className="text-yellow-400">...</span></p>
          <p>VITE_FIREBASE_MESSAGING_SENDER_ID=<span className="text-yellow-400">...</span></p>
          <p>VITE_FIREBASE_APP_ID=<span className="text-yellow-400">...</span></p>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  if (!isFirebaseConfigured) return <SetupScreen />;

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-900 text-slate-100">
        <Navbar />
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/cv-tailor" element={<CVTailorPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
