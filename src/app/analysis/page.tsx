"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  BarChart3, 
  Clock, 
  Coins, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowUpRight, 
  ArrowDownRight, 
  Activity, 
  Filter,
  RefreshCw,
  Terminal,
  ChevronRight
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import BorderGlow from "@/components/ui/BorderGlow";
import { MetricData, FailedRun } from "@/data/mockData";

// Mock Data for different time ranges
const RANGE_DATA = {
  "1h": {
    latency: "840ms",
    latencyDiff: "-12.4%",
    latencyUp: false,
    runs: "12,408",
    runsDiff: "+8.2%",
    runsUp: true,
    cost: "$18.42",
    costDiff: "+4.1%",
    costUp: true,
    success: "99.1%",
    successDiff: "+0.2%",
    successUp: true,
    points: [45, 55, 30, 60, 40, 75, 50, 85, 60, 95, 70, 80],
    modelCost: [
      { name: "gpt-4o", cost: "$12.80", tokens: "840k", percent: 70 },
      { name: "claude-3-5-sonnet", cost: "$4.12", tokens: "190k", percent: 22 },
      { name: "llama-3-70b", cost: "$1.50", tokens: "1.2M", percent: 8 }
    ]
  },
  "24h": {
    latency: "1.12s",
    latencyDiff: "+2.1%",
    latencyUp: true,
    runs: "248,912",
    runsDiff: "+15.3%",
    runsUp: true,
    cost: "$384.20",
    costDiff: "+11.8%",
    costUp: true,
    success: "98.4%",
    successDiff: "-0.4%",
    successUp: false,
    points: [60, 75, 65, 80, 70, 90, 85, 110, 95, 120, 100, 112],
    modelCost: [
      { name: "gpt-4o", cost: "$270.50", tokens: "18.2M", percent: 70 },
      { name: "claude-3-5-sonnet", cost: "$92.10", tokens: "4.1M", percent: 24 },
      { name: "llama-3-70b", cost: "$21.60", tokens: "16.8M", percent: 6 }
    ]
  },
  "7d": {
    latency: "1.24s",
    latencyDiff: "-4.5%",
    latencyUp: false,
    runs: "1.84M",
    runsDiff: "+22.4%",
    runsUp: true,
    cost: "$2,642.10",
    costDiff: "+18.9%",
    costUp: true,
    success: "98.2%",
    successDiff: "+0.6%",
    successUp: true,
    points: [120, 110, 130, 125, 140, 135, 150, 142, 138, 145, 130, 124],
    modelCost: [
      { name: "gpt-4o", cost: "$1,824.00", tokens: "124M", percent: 69 },
      { name: "claude-3-5-sonnet", cost: "$642.50", tokens: "28.5M", percent: 24 },
      { name: "llama-3-70b", cost: "$175.60", tokens: "140M", percent: 7 }
    ]
  },
  "30d": {
    latency: "1.31s",
    latencyDiff: "+8.9%",
    latencyUp: true,
    runs: "7.92M",
    runsDiff: "+42.1%",
    runsUp: true,
    cost: "$11,248.50",
    costDiff: "+34.5%",
    costUp: true,
    success: "97.9%",
    successDiff: "-1.2%",
    successUp: false,
    points: [100, 115, 110, 125, 120, 135, 128, 142, 135, 148, 142, 131],
    modelCost: [
      { name: "gpt-4o", cost: "$7,840.00", tokens: "520M", percent: 70 },
      { name: "claude-3-5-sonnet", cost: "$2,680.00", tokens: "119M", percent: 24 },
      { name: "llama-3-70b", cost: "$728.50", tokens: "580M", percent: 6 }
    ]
  }
};

const FAILED_RUNS = [
  {
    id: "run-e83",
    timestamp: "2 mins ago",
    agent: "SQLWriterAgent",
    error: "DatabaseConnectionTimeout: pool limit reached (20/20)",
    severity: "critical",
    traceId: "trace-9a8f2"
  },
  {
    id: "run-x12",
    timestamp: "8 mins ago",
    agent: "CodeExecutor",
    error: "ToolSandboxError: SIGTERM code execution took >15s",
    severity: "warning",
    traceId: "trace-1f20b"
  },
  {
    id: "run-p50",
    timestamp: "14 mins ago",
    agent: "CustomerSupportBot",
    error: "LLMRateLimitException: 429 Too Many Requests (gpt-4o)",
    severity: "critical",
    traceId: "trace-4c8d1"
  },
  {
    id: "run-m09",
    timestamp: "24 mins ago",
    agent: "ReportSummarizer",
    error: "ContextWindowExceeded: token count 134,204 > 128,000 limit",
    severity: "warning",
    traceId: "trace-7e5f9"
  }
];

export default function Analysis() {
  const [timeRange, setTimeRange] = useState<"1h" | "24h" | "7d" | "30d">("24h");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [data, setData] = useState<{ metrics: MetricData; failedRuns: FailedRun[] } | null>(null);

  useEffect(() => {
    let isMounted = true;
    fetch(`/api/analysis?timeRange=${timeRange}`)
      .then((res) => res.json())
      .then((resData) => {
        if (isMounted) {
          setData(resData);
        }
      })
      .catch((err) => {
        console.error("Error loading analysis data:", err);
      });
    return () => {
      isMounted = false;
    };
  }, [timeRange]);

  const activeData = data?.metrics || RANGE_DATA[timeRange];
  const activeFailedRuns = data?.failedRuns || FAILED_RUNS;

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch(`/api/analysis?timeRange=${timeRange}`);
      const resData = await res.json();
      setData(resData);
    } catch (err) {
      console.error("Error refreshing analysis data:", err);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Convert points to SVG polyline format
  const generateSvgPoints = (points: number[]) => {
    const width = 600;
    const height = 150;
    const maxVal = Math.max(...points) * 1.15;
    const minVal = Math.min(...points) * 0.85;
    const valRange = maxVal - minVal;
    
    return points.map((p, idx) => {
      const x = (idx / (points.length - 1)) * width;
      const y = height - ((p - minVal) / valRange) * (height - 20) - 10;
      return `${x},${y}`;
    }).join(" ");
  };

  return (
    <div className="flex-1 bg-black min-h-screen border-t border-border">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-8">
        
        {/* Dashboard Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/60 pb-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              <BarChart3 className="h-6 w-6 text-indigo-400" />
              Observability Analysis
            </h1>
            <p className="text-sm text-zinc-400 mt-1">
              Trace telemetry diagnostics and resource metrics for agent deployments.
            </p>
          </div>

          {/* Filters & Actions */}
          <div className="flex items-center gap-3">
            <div className="flex bg-zinc-950 p-1 rounded-lg border border-border">
              {(["1h", "24h", "7d", "30d"] as const).map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                    timeRange === range
                      ? "bg-zinc-900 text-indigo-400 border border-zinc-800 shadow"
                      : "text-zinc-400 hover:text-zinc-200 border border-transparent"
                  }`}
                >
                  {range.toUpperCase()}
                </button>
              ))}
            </div>

            <Button variant="outline" size="sm" onClick={handleRefresh} className="gap-2 cursor-pointer">
              <RefreshCw className={`h-3.5 w-3.5 text-zinc-400 ${isRefreshing ? "animate-spin text-indigo-400" : ""}`} />
              Sync
            </Button>
          </div>
        </div>

        {/* Metric Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Average Latency */}
          <BorderGlow
            edgeSensitivity={30}
            glowColor="250 80 80"
            backgroundColor="#09090b"
            borderRadius={12}
            glowRadius={30}
            glowIntensity={0.8}
            colors={['#6366f1', '#06b6d4', '#a855f7']}
            className="w-full"
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-500 font-sans">Avg Latency</span>
                <div className="h-8 w-8 rounded bg-indigo-500/10 text-indigo-400 flex items-center justify-center border border-indigo-500/20">
                  <Clock className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-3xl font-bold tracking-tight text-white font-mono">{activeData.latency}</span>
                <span className={`flex items-center text-xs font-semibold ${
                  activeData.latencyUp ? "text-rose-400" : "text-emerald-400"
                }`}>
                  {activeData.latencyUp ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                  {activeData.latencyDiff}
                </span>
              </div>
              <p className="text-xs text-zinc-500 mt-1 font-sans">vs previous time range</p>
            </CardContent>
          </BorderGlow>

          {/* Total Runs */}
          <BorderGlow
            edgeSensitivity={30}
            glowColor="200 80 80"
            backgroundColor="#09090b"
            borderRadius={12}
            glowRadius={30}
            glowIntensity={0.8}
            colors={['#06b6d4', '#6366f1', '#a855f7']}
            className="w-full"
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-500 font-sans">Total runs</span>
                <div className="h-8 w-8 rounded bg-cyan-500/10 text-cyan-400 flex items-center justify-center border border-cyan-500/20">
                  <Activity className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-3xl font-bold tracking-tight text-white font-mono">{activeData.runs}</span>
                <span className={`flex items-center text-xs font-semibold ${
                  activeData.runsUp ? "text-emerald-400" : "text-rose-400"
                }`}>
                  {activeData.runsUp ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                  {activeData.runsDiff}
                </span>
              </div>
              <p className="text-xs text-zinc-500 mt-1 font-sans">total span evaluations</p>
            </CardContent>
          </BorderGlow>

          {/* Total LLM Cost */}
          <BorderGlow
            edgeSensitivity={30}
            glowColor="140 80 80"
            backgroundColor="#09090b"
            borderRadius={12}
            glowRadius={30}
            glowIntensity={0.8}
            colors={['#10b981', '#06b6d4', '#6366f1']}
            className="w-full"
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-500 font-sans">LLM Token Cost</span>
                <div className="h-8 w-8 rounded bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                  <Coins className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-3xl font-bold tracking-tight text-white font-mono">{activeData.cost}</span>
                <span className={`flex items-center text-xs font-semibold ${
                  activeData.costUp ? "text-rose-400" : "text-emerald-400"
                }`}>
                  {activeData.costUp ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                  {activeData.costDiff}
                </span>
              </div>
              <p className="text-xs text-zinc-500 mt-1 font-sans">across integrated models</p>
            </CardContent>
          </BorderGlow>

          {/* Success Rate */}
          <BorderGlow
            edgeSensitivity={30}
            glowColor="280 80 80"
            backgroundColor="#09090b"
            borderRadius={12}
            glowRadius={30}
            glowIntensity={0.8}
            colors={['#a855f7', '#6366f1', '#06b6d4']}
            className="w-full"
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-500 font-sans">Success Rate</span>
                <div className="h-8 w-8 rounded bg-purple-500/10 text-purple-400 flex items-center justify-center border border-purple-500/20">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-3xl font-bold tracking-tight text-white font-mono">{activeData.success}</span>
                <span className={`flex items-center text-xs font-semibold ${
                  activeData.successUp ? "text-emerald-400" : "text-rose-400"
                }`}>
                  {activeData.successUp ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                  {activeData.successDiff}
                </span>
              </div>
              <p className="text-xs text-zinc-500 mt-1 font-sans">resolved spans without error</p>
            </CardContent>
          </BorderGlow>
        </div>

        {/* Charts & Cost Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Latency History Chart (SVG based) */}
          <Card className="lg:col-span-8">
            <CardHeader>
              <CardTitle className="text-sm">Latency & Performance Trend</CardTitle>
              <CardDescription>Visualized latency curves across consecutive epoch markers.</CardDescription>
            </CardHeader>
            <CardContent className="p-6 pt-0 flex flex-col justify-end h-[240px]">
              <div className="relative w-full h-[180px] border-b border-l border-zinc-900 bg-zinc-950/40 rounded-sm">
                
                {/* Horizontal Guide Lines */}
                <div className="absolute inset-0 flex flex-col justify-between pointer-events-none p-2">
                  <span className="border-t border-zinc-900/60 w-full h-0 text-[10px] text-zinc-600 font-mono">1.8s</span>
                  <span className="border-t border-zinc-900/60 w-full h-0 text-[10px] text-zinc-600 font-mono">1.2s</span>
                  <span className="border-t border-zinc-900/60 w-full h-0 text-[10px] text-zinc-600 font-mono">600ms</span>
                  <span className="w-full h-0 text-[10px] text-zinc-600 font-mono">0ms</span>
                </div>

                {/* SVG Graph Line */}
                <svg className="w-full h-full" viewBox="0 0 600 150" preserveAspectRatio="none">
                  {/* Glow shadow filter */}
                  <defs>
                    <linearGradient id="chart-grad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#6366f1" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
                    </linearGradient>
                  </defs>

                  {/* Gradient Area */}
                  <path
                    d={`M 0,150 L ${generateSvgPoints(activeData.points)} L 600,150 Z`}
                    fill="url(#chart-grad)"
                  />

                  {/* Line */}
                  <polyline
                    fill="none"
                    stroke="#6366f1"
                    strokeWidth="2.5"
                    points={generateSvgPoints(activeData.points)}
                    strokeLinecap="round"
                    className="transition-all duration-500 ease-in-out"
                  />

                  {/* Highlight dots on coordinates */}
                  {activeData.points.map((p, idx) => {
                    const width = 600;
                    const height = 150;
                    const maxVal = Math.max(...activeData.points) * 1.15;
                    const minVal = Math.min(...activeData.points) * 0.85;
                    const valRange = maxVal - minVal;
                    const x = (idx / (activeData.points.length - 1)) * width;
                    const y = height - ((p - minVal) / valRange) * (height - 20) - 10;
                    return (
                      <circle
                        key={idx}
                        cx={x}
                        cy={y}
                        r="3.5"
                        className="fill-indigo-400 stroke-black stroke-2 hover:r-5 cursor-pointer transition-all"
                      />
                    );
                  })}
                </svg>
              </div>
              <div className="flex justify-between mt-3 text-[10px] text-zinc-500 font-mono px-2">
                <span>Start Epoch</span>
                <span>Midpoint</span>
                <span>Active Interval</span>
              </div>
            </CardContent>
          </Card>

          {/* Model Token/Cost Breakdown */}
          <Card className="lg:col-span-4">
            <CardHeader>
              <CardTitle className="text-sm">Model Distribution</CardTitle>
              <CardDescription>Share of cost & token usage per model.</CardDescription>
            </CardHeader>
            <CardContent className="p-6 pt-0 flex flex-col gap-5">
              {activeData.modelCost.map((model) => (
                <div key={model.name} className="flex flex-col gap-2">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-zinc-300 font-medium">{model.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-white font-bold">{model.cost}</span>
                      <span className="text-zinc-500">({model.tokens})</span>
                    </div>
                  </div>
                  {/* Progress bar */}
                  <div className="h-2 w-full rounded bg-zinc-900 overflow-hidden border border-zinc-800/40">
                    <div 
                      className="h-full bg-gradient-to-r from-indigo-500 to-cyan-500 transition-all duration-500 rounded" 
                      style={{ width: `${model.percent}%` }}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Failed Runs / Recent Exceptions */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-sm">Recent Exception Logs</CardTitle>
              <CardDescription>Real-time stream of failed agent traces and execution bottlenecks.</CardDescription>
            </div>
            <Badge variant="destructive" className="flex items-center gap-1">
              <AlertTriangle className="h-3 w-3" />
              {activeFailedRuns.length} Exceptions Active
            </Badge>
          </CardHeader>
          <CardContent className="p-0 border-t border-border/40 overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="border-b border-border bg-zinc-950/20 text-[10px] text-zinc-500 font-mono uppercase">
                  <th className="p-4 font-bold">Timestamp</th>
                  <th className="p-4 font-bold">Agent / Runner</th>
                  <th className="p-4 font-bold">Exception Details</th>
                  <th className="p-4 font-bold text-center">Severity</th>
                  <th className="p-4 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900/60 font-mono text-xs">
                {activeFailedRuns.map((run) => (
                  <tr key={run.id} className="hover:bg-zinc-900/10 transition-colors">
                    <td className="p-4 text-zinc-400 whitespace-nowrap">{run.timestamp}</td>
                    <td className="p-4 text-white font-medium flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-rose-500" />
                      {run.agent}
                    </td>
                    <td className="p-4 text-zinc-300 max-w-[320px] truncate" title={run.error}>
                      {run.error}
                    </td>
                    <td className="p-4 text-center">
                      <Badge variant={run.severity === "critical" ? "destructive" : "warning"}>
                        {run.severity.toUpperCase()}
                      </Badge>
                    </td>
                    <td className="p-4 text-right">
                      <Link href="/trace">
                        <Button variant="ghost" size="sm" className="gap-1 text-[11px] h-7 px-2 border border-zinc-900 hover:border-zinc-800">
                          Solve Trace
                          <ChevronRight className="h-3 w-3 text-zinc-500" />
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
