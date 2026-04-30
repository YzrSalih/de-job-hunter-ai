import { NavLink } from "react-router-dom";

export function Navbar() {
  return (
    <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur sticky top-0 z-10">
      <div className="max-w-screen-2xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🇩🇪</span>
          <div>
            <h1 className="text-base font-bold text-white">DE Job Hunter</h1>
            <p className="text-xs text-slate-400">AI-filtered jobs in Germany</p>
          </div>
        </div>

        <nav className="flex items-center gap-1">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-violet-600 text-white"
                  : "text-slate-400 hover:text-white hover:bg-slate-800"
              }`
            }
          >
            Dashboard
          </NavLink>
          <NavLink
            to="/cv-tailor"
            className={({ isActive }) =>
              `px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-violet-600 text-white"
                  : "text-slate-400 hover:text-white hover:bg-slate-800"
              }`
            }
          >
            CV Tailor
          </NavLink>
        </nav>
      </div>
    </header>
  );
}
