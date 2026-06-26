"use client";

import Link from "next/link";
import { useState } from "react";
import { 
  Terminal, 
  Cpu, 
  Zap, 
  GitFork, 
  Search, 
  BarChart3, 
  ArrowRight, 
  Play, 
  Check, 
  Flame,
  Code
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import BorderGlow from "@/components/ui/BorderGlow";

// Interactive Trace Mock Data for Hero Page
const HERO_TRACE = [
  {
    id: "span-1",
    name: "LangMi Agent Solver",
    type: "agent",
    duration: "1.42s",
    status: "success",
    depth: 0,
    details: {
      input: "Fix memory leak in src/db.ts and re-verify database connections.",
      output: "Memory leak resolved. Re-verified 5 connection pools successfully. All tests passing."
    }
  },
  {
    id: "span-2",
    name: "Repo Search Tool",
    type: "tool",
    duration: "120ms",
    status: "success",
    depth: 1,
    details: {
      input: "grep -rn 'connection' src/",
      output: "Found 3 files:\n- src/db.ts:12\n- src/app.ts:45\n- src/config.ts:89"
    }
  },
  {
    id: "span-3",
    name: "Resolve Leak (gpt-4o)",
    type: "llm",
    duration: "980ms",
    status: "success",
    depth: 1,
    details: {
      input: "System: You are a senior engineer...\nUser: Code: [db.ts snippet]... Suggest fixes.",
      output: "```typescript\n// Fix: Close connection pools in finally block\nexport async function closePool() {\n  await pool.end();\n}\n```"
    }
  },
  {
    id: "span-4",
    name: "Run Test Suite",
    type: "tool",
    duration: "320ms",
    status: "error",
    depth: 1,
    details: {
      input: "npm run test",
      output: "FAIL: Connection pool timeout (15000ms exceeded). Leak verified."
    }
  }
];

export default function Home() {
  const [selectedSpanId, setSelectedSpanId] = useState("span-1");
  const selectedSpan = HERO_TRACE.find(s => s.id === selectedSpanId) || HERO_TRACE[0];

  const features = [
    {
      icon: <GitFork className="h-6 w-6 text-indigo-400" />,
      title: "Hierarchical Trace Graphs",
      description: "Map agent loops, parallel tool execution, and sub-agent handoffs in a structured tree graph."
    },
    {
      icon: <Flame className="h-6 w-6 text-rose-400" />,
      title: "Critical Path Diagnostics",
      description: "Automatically pinpoint the slowest LLM reasoning step or tool bottleneck in complex multi-agent workflows."
    },
    {
      icon: <Zap className="h-6 w-6 text-cyan-400" />,
      title: "Cost & Token Tracking",
      description: "Real-time auditing of input/output tokens, system instructions, and cash burn rate per trace."
    },
    {
      icon: <Terminal className="h-6 w-6 text-emerald-400" />,
      title: "Interactive Prompt Playgrounds",
      description: "Re-run any node of a failed trace, modify parameters, and hot-swap LLM models directly in the UI."
    }
  ];

  return (
    <div className="relative isolate overflow-hidden bg-black flex flex-col items-center">
      {/* Background Gradients */}
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#0f0f12_1px,transparent_1px),linear-gradient(to_bottom,#0f0f12_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
      <div className="absolute inset-y-0 right-1/2 -z-10 mr-16 w-[200%] origin-bottom-left skew-x-[-30deg] bg-black ring-1 ring-zinc-900/10 [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]" />

      {/* Hero Section */}
      <div className="mx-auto max-w-7xl px-6 pt-16 pb-24 sm:pt-24 lg:px-8 flex flex-col items-center text-center">
        {/* Release / Status Tag */}
        <div className="mb-6 flex animate-fade-in">
          <div className="relative rounded-full px-3 py-1 text-xs leading-6 text-zinc-400 ring-1 ring-zinc-800 bg-zinc-950/60 backdrop-blur hover:ring-zinc-700 transition-all flex items-center gap-2">
            <Badge variant="info" className="text-[10px] py-0 px-1.5 uppercase font-bold">New</Badge>
            <span>Instrument Next.js Agents using our new Node SDK</span>
            <a href="#sdk" className="font-semibold text-indigo-400 flex items-center gap-0.5">
              Install <ArrowRight className="h-3 w-3" />
            </a>
          </div>
        </div>

        {/* Headline */}
        <h1 className="max-w-4xl text-4xl font-extrabold tracking-tight text-white sm:text-6xl bg-gradient-to-b from-white via-zinc-100 to-zinc-500 bg-clip-text text-transparent leading-none">
          A Trace Solver for AI Agents
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-zinc-400">
          LangMi brings full observability, debugging, and tracing to complex LLM orchestrations. Instrument tools, track workflows, and pinpoint execution failures in milliseconds.
        </p>

        {/* CTA Buttons */}
        <div className="mt-10 flex items-center justify-center gap-x-6">
          <Link href="/trace">
            <Button variant="primary" size="lg" className="gap-2 group">
              Start Solving Traces
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
          <Link href="/analysis">
            <Button variant="outline" size="lg" className="gap-2">
              <BarChart3 className="h-4 w-4 text-zinc-400" />
              View Dashboard
            </Button>
          </Link>
        </div>

        {/* Simulated Observability Interface Preview */}
        <BorderGlow
          edgeSensitivity={30}
          glowColor="250 80 80"
          backgroundColor="#09090b"
          borderRadius={12}
          glowRadius={60}
          glowIntensity={1.2}
          coneSpread={25}
          animated={true}
          colors={['#6366f1', '#06b6d4', '#a855f7']}
          className="mt-16 w-full max-w-5xl"
        >
          {/* Mock Window Header */}
          <div className="flex items-center justify-between px-3 py-2 border-b border-zinc-900 bg-black/40 rounded-t-lg">
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-rose-500/70" />
              <span className="h-3 w-3 rounded-full bg-amber-500/70" />
              <span className="h-3 w-3 rounded-full bg-emerald-500/70" />
              <span className="text-xs text-zinc-500 font-mono ml-2">Session: trace_cf8290-dxx</span>
            </div>
            <div className="flex gap-2">
              <span className="text-[10px] text-zinc-500 font-mono uppercase bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">
                latency: 1.42s
              </span>
              <span className="text-[10px] text-zinc-500 font-mono uppercase bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">
                tokens: 4,120
              </span>
            </div>
          </div>

          {/* Interactive Trace Panel Layout */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 text-left font-mono">
            {/* Left Pane - Trace Tree */}
            <div className="md:col-span-6 flex flex-col gap-2">
              <div className="text-xs text-zinc-500 uppercase tracking-wider mb-2 font-sans font-bold flex items-center gap-1.5">
                <Code className="h-3.5 w-3.5" />
                Execution Spans
              </div>
              <div className="space-y-1.5">
                {HERO_TRACE.map((span) => (
                  <button
                    key={span.id}
                    onClick={() => setSelectedSpanId(span.id)}
                    className={`w-full text-left p-3 rounded-lg border transition-all flex items-center justify-between cursor-pointer ${
                      selectedSpanId === span.id
                        ? "bg-zinc-900 border-indigo-500/50 shadow-md shadow-indigo-950/20"
                        : "bg-black/40 border-zinc-900 hover:border-zinc-800 hover:bg-zinc-900/30"
                    }`}
                    style={{ paddingLeft: `${span.depth * 1.25 + 0.75}rem` }}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={`h-2 w-2 rounded-full ${
                          span.status === "success" ? "bg-emerald-500" : "bg-rose-500 animate-pulse"
                        }`}
                      />
                      <span className="text-xs font-medium text-zinc-200">{span.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={
                          span.type === "agent"
                            ? "purple"
                            : span.type === "llm"
                            ? "info"
                            : "default"
                        }
                        className="text-[9px] uppercase py-0 px-1 font-bold"
                      >
                        {span.type}
                      </Badge>
                      <span className="text-[10px] text-zinc-500">{span.duration}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Right Pane - Span Detail Viewer */}
            <div className="md:col-span-6 flex flex-col gap-3 bg-black/40 border border-zinc-900/80 rounded-xl p-4">
              <div className="flex items-center justify-between border-b border-zinc-900 pb-2">
                <span className="text-xs font-semibold text-white">{selectedSpan.name} Details</span>
                <Badge variant={selectedSpan.status === "success" ? "success" : "destructive"}>
                  {selectedSpan.status.toUpperCase()}
                </Badge>
              </div>

              <div className="flex-1 flex flex-col gap-3 overflow-y-auto max-h-[220px] text-xs">
                {/* Input block */}
                <div>
                  <div className="text-[10px] text-indigo-400 font-bold uppercase mb-1">Input Parameters</div>
                  <pre className="bg-zinc-950 p-2.5 rounded border border-zinc-900 text-zinc-300 overflow-x-auto whitespace-pre-wrap font-mono">
                    {selectedSpan.details.input}
                  </pre>
                </div>
                {/* Output block */}
                <div>
                  <div className="text-[10px] text-cyan-400 font-bold uppercase mb-1">Result Output</div>
                  <pre className="bg-zinc-950 p-2.5 rounded border border-zinc-900 text-zinc-300 overflow-x-auto whitespace-pre-wrap font-mono">
                    {selectedSpan.details.output}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </BorderGlow>
      </div>

      {/* Feature Grid Section */}
      <div className="w-full border-t border-zinc-900 bg-zinc-950/20 py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:text-center">
            <h2 className="text-base font-semibold leading-7 text-indigo-400 uppercase tracking-wider">Complete AI Observability</h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Understand what your agents are doing
            </p>
            <p className="mt-6 text-lg leading-8 text-zinc-400">
              When LLM completions are nested inside multiple loops, function calls, and sub-agents, basic logs fail. LangMi helps you dissect exact execution paths.
            </p>
          </div>

          <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
            <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-4">
              {features.map((feature) => (
                <div key={feature.title} className="flex flex-col rounded-xl border border-zinc-900 bg-zinc-950/50 p-6 transition-all hover:border-zinc-800">
                  <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-white">
                    {feature.icon}
                    {feature.title}
                  </dt>
                  <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-zinc-400">
                    <p className="flex-auto text-sm leading-relaxed">{feature.description}</p>
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>

      {/* Modern Developer CTA Panel */}
      <div className="w-full max-w-7xl px-6 pb-24 lg:px-8">
        <div className="relative isolate overflow-hidden bg-gradient-to-r from-indigo-950/30 to-purple-950/20 px-6 py-16 shadow-2xl rounded-3xl sm:px-16 md:py-20 lg:flex lg:items-center lg:gap-x-20 lg:px-24 border border-indigo-900/20">
          <div className="absolute inset-0 -z-10 bg-radial-gradient" />
          <div className="mx-auto max-w-md lg:mx-0 lg:flex-auto">
            <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              Instrument your code in seconds.
            </h2>
            <p className="mt-6 text-sm leading-relaxed text-zinc-400">
              LangMi integrates with LangChain, LlamaIndex, CrewAI, and custom TS/Python decorators. Get deep tracing outputs without changing your application architecture.
            </p>
            <div className="mt-10 flex items-center gap-x-6">
              <Link href="/trace">
                <Button variant="primary" size="md" className="gap-2">
                  Launch Trace Solver
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <a href="#docs" className="text-sm font-semibold leading-6 text-zinc-300 hover:text-white transition-colors">
                Read API docs <span aria-hidden="true">→</span>
              </a>
            </div>
          </div>
          <div className="mt-16 flex-1 rounded-xl bg-black border border-zinc-800 p-4 font-mono text-xs sm:text-sm text-left shadow-lg lg:mt-0 max-w-lg">
            <div className="flex items-center justify-between border-b border-zinc-900 pb-2 mb-3">
              <span className="text-zinc-500">terminal</span>
              <Badge variant="secondary">npm</Badge>
            </div>
            <p className="text-indigo-400"># Install the LangMi SDK</p>
            <p className="text-zinc-300">npm install @langmi/sdk</p>
            <br />
            <p className="text-indigo-400"># Instrument your LLM application</p>
            <p className="text-zinc-300">
              <span className="text-purple-400">import</span> &#123; TraceSolver &#125; <span className="text-purple-400">from</span> <span className="text-emerald-400">&apos;@langmi/sdk&apos;</span>;
            </p>
            <p className="text-zinc-300">
              <span className="text-purple-400">const</span> solver = <span className="text-purple-400">new</span> <span className="text-yellow-400">TraceSolver</span>(&#123; apiKey: process.env.LANGMI_API_KEY &#125;);
            </p>
            <p className="text-zinc-300">
              <span className="text-purple-400">const</span> result = <span className="text-purple-400">await</span> solver.<span className="text-cyan-400">trace</span>(<span className="text-emerald-400">&apos;my_agent_run&apos;</span>, async () =&gt; &#123;
            </p>
            <p className="text-zinc-300">
              &nbsp;&nbsp;<span className="text-purple-400">return await</span> myAgent.execute(prompt);
            </p>
            <p className="text-zinc-300">&#125;);</p>
          </div>
        </div>
      </div>
    </div>
  );
}
