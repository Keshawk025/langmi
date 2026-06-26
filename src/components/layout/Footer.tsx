import Link from "next/link";
import { Terminal, Cpu } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-border bg-black py-8 md:py-12 mt-auto">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo & Tagline */}
          <div className="md:col-span-2 flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                <Terminal className="h-4 w-4" />
              </div>
              <span className="text-md font-bold tracking-tight text-white">
                Lang<span className="bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">Mi</span>
              </span>
            </div>
            <p className="text-sm text-zinc-400 max-w-xs leading-relaxed">
              A trace solver for AI Agents. Diagnose LLM reasoning steps, instrument tool execution, and optimize agent performance with ease.
            </p>
            <div className="flex items-center gap-3 mt-2">
              <a
                href="https://github.com"
                target="_blank"
                rel="noreferrer"
                className="text-zinc-500 hover:text-zinc-300 transition-colors"
                aria-label="GitHub"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
                  <path d="M9 18c-4.51 2-5-2-7-2" />
                </svg>
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noreferrer"
                className="text-zinc-500 hover:text-zinc-300 transition-colors"
                aria-label="Twitter"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
                </svg>
              </a>
              <span className="flex items-center gap-1.5 rounded-full bg-emerald-950/40 border border-emerald-800/40 px-2 py-0.5 text-[10px] font-medium text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                All Systems Operational
              </span>
            </div>
          </div>


          {/* Links 1 */}
          <div>
            <h3 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-4">Platform</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-sm text-zinc-400 hover:text-zinc-200 transition-colors">
                  Overview
                </Link>
              </li>
              <li>
                <Link href="/analysis" className="text-sm text-zinc-400 hover:text-zinc-200 transition-colors">
                  Analysis
                </Link>
              </li>
              <li>
                <Link href="/trace" className="text-sm text-zinc-400 hover:text-zinc-200 transition-colors">
                  Trace Viewer
                </Link>
              </li>
            </ul>
          </div>

          {/* Links 2 */}
          <div>
            <h3 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-4">Developer Tools</h3>
            <ul className="space-y-2">
              <li>
                <a href="#docs" className="text-sm text-zinc-400 hover:text-zinc-200 transition-colors">
                  Documentation
                </a>
              </li>
              <li>
                <a href="#api" className="text-sm text-zinc-400 hover:text-zinc-200 transition-colors">
                  API Reference
                </a>
              </li>
              <li>
                <a href="#sdk" className="text-sm text-zinc-400 hover:text-zinc-200 transition-colors">
                  SDK Packages
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 md:mt-12 border-t border-border/40 pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-zinc-500">
            &copy; {new Date().getFullYear()} LangMi Inc. All rights reserved.
          </p>
          <div className="flex gap-4">
            <a href="#privacy" className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors">
              Privacy Policy
            </a>
            <a href="#terms" className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors">
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
