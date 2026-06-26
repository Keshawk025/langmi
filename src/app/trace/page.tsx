"use client";

import { useState, useEffect } from "react";
import { 
  GitCommit, 
  Terminal, 
  Cpu, 
  Play, 
  Code, 
  Search, 
  Clock, 
  Coins, 
  Layers, 
  ChevronRight, 
  ChevronDown,
  AlertTriangle,
  CheckCircle2,
  Database,
  SearchCode,
  Flame,
  Wrench,
  Settings,
  RefreshCw,
  FileText,
  DollarSign,
  TrendingDown,
  Activity,
  ArrowRight,
  Sparkles,
  HelpCircle,
  Download,
  BookOpen
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import BorderGlow from "@/components/ui/BorderGlow";
import { MOCK_TRACES, LangChainRun } from "@/data/mockData";

// Interfaces for UI
interface Span {
  id: string;
  name: string;
  type: "agent" | "llm" | "tool" | "chain";
  duration: string;
  status: "success" | "error";
  depth: number;
  tokens?: { input: number; output: number; total: number };
  model?: string;
  cost?: string;
  input: string;
  output: string;
  errorMsg?: string;
}

interface Trace {
  id: string;
  title: string;
  timestamp: string;
  totalDuration: string;
  totalTokens: number;
  totalCost: string;
  status: "success" | "error";
  spans: Span[];
}

// Mapper function to map LangChain Run schema to flat spans tree
function mapLangChainRunToTrace(run: LangChainRun): Trace {
  const spans: Span[] = [];

  function traverse(r: LangChainRun, depth: number) {
    let duration = "0ms";
    if (r.start_time && r.end_time) {
      const ms = new Date(r.end_time).getTime() - new Date(r.start_time).getTime();
      duration = ms >= 1000 ? `${(ms / 1000).toFixed(2)}s` : `${ms}ms`;
    }

    const inputs = r.inputs || {};
    const outputs = r.outputs || {};

    const inputStr = typeof inputs === "object" 
      ? (inputs.input || inputs.query || inputs.command || JSON.stringify(inputs, null, 2)) 
      : String(inputs);
      
    const outputStr = typeof outputs === "object" 
      ? (outputs.output || outputs.result || outputs.outputMsg || JSON.stringify(outputs, null, 2)) 
      : String(outputs);

    spans.push({
      id: r.id,
      name: r.name,
      type: (r.run_type === "agent" || r.run_type === "llm" || r.run_type === "tool" || r.run_type === "chain") ? r.run_type : "chain",
      duration: duration,
      status: r.status,
      depth: depth,
      tokens: r.total_tokens ? {
        input: r.prompt_tokens || 0,
        output: r.completion_tokens || 0,
        total: r.total_tokens
      } : undefined,
      model: r.model_name,
      cost: r.cost,
      input: inputStr,
      output: outputStr,
      errorMsg: r.error || undefined
    });

    if (r.child_runs) {
      r.child_runs.forEach((child) => traverse(child, depth + 1));
    }
  }

  // Traverse the trace starting from the root run
  traverse(run, 0);

  let totalDuration = "0s";
  if (run.start_time && run.end_time) {
    const totalMs = new Date(run.end_time).getTime() - new Date(run.start_time).getTime();
    totalDuration = totalMs >= 1000 ? `${(totalMs / 1000).toFixed(2)}s` : `${totalMs}ms`;
  }

  let totalTokens = 0;
  let totalCostVal = 0;
  spans.forEach((s) => {
    if (s.tokens) {
      totalTokens += s.tokens.total;
    }
    if (s.cost) {
      const val = parseFloat(s.cost.replace(/[^0-9.]/g, ""));
      if (!isNaN(val)) {
        totalCostVal += val;
      }
    }
  });

  const formattedDate = run.start_time ? new Date(run.start_time).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  }) : "N/A";

  return {
    id: run.id,
    title: run.name,
    timestamp: formattedDate,
    totalDuration: totalDuration,
    totalTokens: totalTokens,
    totalCost: totalCostVal > 0 ? `$${totalCostVal.toFixed(3)}` : "$0.00",
    status: run.status,
    spans: spans
  };
}

// Helpers for modifying nested child runs recursively
function updateNestedRun(
  run: LangChainRun,
  runId: string,
  updater: (r: LangChainRun) => Partial<LangChainRun>
): LangChainRun {
  if (run.id === runId) {
    return { ...run, ...updater(run) };
  }
  if (run.child_runs) {
    return {
      ...run,
      child_runs: run.child_runs.map((child) => updateNestedRun(child, runId, updater)),
    };
  }
  return run;
}

function checkAndUpdateRootStatus(run: LangChainRun): LangChainRun {
  if (!run.child_runs || run.child_runs.length === 0) {
    return run;
  }
  const updatedChildren = run.child_runs.map(checkAndUpdateRootStatus);
  const allSuccessful = updatedChildren.every((child) => child.status === "success");
  return {
    ...run,
    child_runs: updatedChildren,
    status: allSuccessful ? "success" : run.status,
    error: allSuccessful ? undefined : run.error,
  };
}

export default function TraceViewer() {
  const [activeTraceId, setActiveTraceId] = useState<string>("run_sql_repair");
  const [selectedSpanId, setSelectedSpanId] = useState<string>("sql-span-3");
  const [collapsedSpans, setCollapsedSpans] = useState<Record<string, boolean>>({});

  const [rawTraces, setRawTraces] = useState<LangChainRun[]>(MOCK_TRACES);

  // Explanation API integration state
  const [apiExplanation, setApiExplanation] = useState<string>("");
  const [isLoadingExplanation, setIsLoadingExplanation] = useState<boolean>(false);

  // Tab State
  const [activeTab, setActiveTab] = useState<"details" | "rca">("rca");

  // Modals state
  const [showSimulateModal, setShowSimulateModal] = useState(false);
  const [showCompareModal, setShowCompareModal] = useState(false);
  const [showFixModal, setShowFixModal] = useState(false);
  const [showCostModal, setShowCostModal] = useState(false);

  // Interactive Tools state
  const [isEditingParams, setIsEditingParams] = useState(false);
  const [editedInput, setEditedInput] = useState("");
  const [isReRunning, setIsReRunning] = useState(false);

  // Load traces on mount
  useEffect(() => {
    fetch("/api/traces")
      .then((res) => res.json())
      .then((data: LangChainRun[]) => {
        if (data && data.length > 0) {
          setRawTraces(data);
          const initialTrace = data.find((t) => t.id === activeTraceId) || data[0];
          const mapped = mapLangChainRunToTrace(initialTrace);
          if (mapped.spans.length > 0) {
            const hasInitialSpan = mapped.spans.some((s) => s.id === selectedSpanId);
            const initialSpanId = hasInitialSpan ? selectedSpanId : mapped.spans[0].id;
            setSelectedSpanId(initialSpanId);
            const initialSpan = mapped.spans.find((s) => s.id === initialSpanId);
            if (initialSpan) {
              setEditedInput(initialSpan.input);
            }
          }
        }
      })
      .catch((err) => console.error("Error loading traces:", err));
  }, []);

  const fetchExplanation = async (trace: Trace) => {
    setIsLoadingExplanation(true);
    setApiExplanation("");
    try {
      const failedSpan = trace.spans.find((s) => s.status === "error");
      const res = await fetch("/api/explain", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          traceId: trace.id,
          errorMsg: failedSpan?.errorMsg || null,
          failedSpanName: failedSpan?.name || null,
          inputs: failedSpan?.input || trace.spans[0]?.input || null,
        }),
      });
      const data = await res.json();
      setApiExplanation(data.explanation || "");
    } catch (err) {
      console.error("Error fetching AI explanation:", err);
      setApiExplanation("Failed to connect to the explanation server.");
    } finally {
      setIsLoadingExplanation(false);
    }
  };

  useEffect(() => {
    if (activeTrace) {
      fetchExplanation(activeTrace);
    }
  }, [activeTraceId, rawTraces]);

  // Compute derived state
  const traces = rawTraces.map(mapLangChainRunToTrace);
  const activeRawTrace = rawTraces.find((t) => t.id === activeTraceId) || rawTraces[0];
  const activeTrace = mapLangChainRunToTrace(activeRawTrace);
  const selectedSpan = activeTrace.spans.find((s) => s.id === selectedSpanId) || activeTrace.spans[0];

  const handleSpanClick = (spanId: string) => {
    setSelectedSpanId(spanId);
    setIsEditingParams(false);
    setIsReRunning(false);
    const span = activeTrace.spans.find((s) => s.id === spanId);
    if (span) {
      setEditedInput(span.input);
    }
  };

  const toggleCollapse = (spanId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setCollapsedSpans((prev) => ({
      ...prev,
      [spanId]: !prev[spanId]
    }));
  };

  const handleTraceChange = async (traceId: string) => {
    setActiveTraceId(traceId);
    setIsEditingParams(false);
    setIsReRunning(false);
    try {
      const res = await fetch(`/api/traces/${traceId}`);
      const trace: LangChainRun = await res.json();
      
      setRawTraces((prev) => prev.map((t) => (t.id === traceId ? trace : t)));
      
      const mapped = mapLangChainRunToTrace(trace);
      setSelectedSpanId(mapped.spans[0]?.id || "");
      setEditedInput(mapped.spans[0]?.input || "");
      setCollapsedSpans({});
    } catch (err) {
      console.error(`Error loading trace ${traceId}:`, err);
      const fallback = rawTraces.find((t) => t.id === traceId) || rawTraces[0];
      if (fallback) {
        const mapped = mapLangChainRunToTrace(fallback);
        setSelectedSpanId(mapped.spans[0]?.id || "");
        setEditedInput(mapped.spans[0]?.input || "");
      }
      setCollapsedSpans({});
    }
  };

  const handleSaveParams = async () => {
    if (!activeRawTrace || !selectedSpanId) return;

    const updatedRawTrace = updateNestedRun(activeRawTrace, selectedSpanId, (r) => {
      const inputs = r.inputs || {};
      const key = inputs.hasOwnProperty("input") 
        ? "input" 
        : (inputs.hasOwnProperty("query") ? "query" : (inputs.hasOwnProperty("command") ? "command" : Object.keys(inputs)[0] || "input"));
      return {
        inputs: {
          ...inputs,
          [key]: editedInput
        }
      };
    });

    setRawTraces((prev) =>
      prev.map((t) => (t.id === activeRawTrace.id ? updatedRawTrace : t))
    );
    setIsEditingParams(false);

    try {
      await fetch(`/api/traces/${activeRawTrace.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedRawTrace),
      });
    } catch (err) {
      console.error("Failed to persist updated parameters to backend:", err);
    }
  };

  const handleReRunSpan = async () => {
    if (!activeRawTrace || !selectedSpanId) return;
    setIsReRunning(true);

    // Simulate 1.2s delay for executing tool/model call
    await new Promise((resolve) => setTimeout(resolve, 1200));

    let updatedRawTrace = updateNestedRun(activeRawTrace, selectedSpanId, (r) => {
      let newOutputs = { ...r.outputs };
      let newStatus: "success" | "error" = r.status;
      let newError = r.error;

      if (r.status === "error") {
        newStatus = "success";
        newError = null;

        if (r.id === "pay-span-4" || r.id === "pay-span-1" || r.id === "pay-span-5") {
          newOutputs = { output: "Stripe Gateway processed payment successfully after endpoint configuration adjustments.\nTransaction ID: ch_3MtxCrLkd9s9281a\nStatus: succeeded" };
        } else if (r.id === "run_pdf_tool") {
          newOutputs = { output: "PDF Document parsed and indexed successfully. Extracted 42 vectors." };
        } else if (r.id === "run_llm" || r.id === "run_8d7f2c") {
          newOutputs = { output: "Claude-3-5-sonnet summarized the chunk successfully with prompt engineering optimization." };
        } else {
          const inputs = r.inputs || {};
          const key = inputs.hasOwnProperty("input") ? "input" : (inputs.hasOwnProperty("query") ? "query" : Object.keys(inputs)[0] || "input");
          newOutputs = { output: `Execution step resolved successfully.\n[Simulated Output for Input: "${inputs[key] || ""}"]` };
        }
      } else {
        const inputs = r.inputs || {};
        const key = inputs.hasOwnProperty("input") ? "input" : (inputs.hasOwnProperty("query") ? "query" : Object.keys(inputs)[0] || "input");
        newOutputs = { output: `Execution rerun completed successfully.\n[Updated Output for Input: "${inputs[key] || ""}"]` };
      }

      const startTime = r.start_time || new Date().toISOString();
      const endTime = r.end_time || startTime;
      const durationMs = Math.max(50, (new Date(endTime).getTime() - new Date(startTime).getTime()) * 0.9);
      const newEndTime = new Date(new Date(startTime).getTime() + durationMs).toISOString();

      return {
        status: newStatus,
        outputs: newOutputs,
        error: newError,
        end_time: newEndTime
      };
    });

    updatedRawTrace = checkAndUpdateRootStatus(updatedRawTrace);

    setRawTraces((prev) =>
      prev.map((t) => (t.id === activeRawTrace.id ? updatedRawTrace : t))
    );
    setIsReRunning(false);

    try {
      await fetch(`/api/traces/${activeRawTrace.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedRawTrace),
      });
    } catch (err) {
      console.error("Failed to persist re-run results to backend:", err);
    }
  };

  const handleExportRCA = () => {
    if (!activeTrace) return;
    const isError = activeTrace.status === "error";
    
    let timelineStr = "";
    if (activeTraceId === "run_sql_repair") {
      timelineStr = "0 ms      Agent Started\n100 ms    Search Config Files ✓\n230 ms    Analyze Leak (gpt-4o) ✓\n1220 ms   Database Reconnection Test ✓\n1540 ms   Workflow Finished ✓";
    } else if (activeTraceId === "run_8d7f2c") {
      timelineStr = "0 ms      Agent Started\n183 ms    ReadPDF ✓\n294 ms    ChatOpenAI ✗\n3264 ms   Chain Failed ✗";
    } else if (activeTraceId === "run_recommend") {
      timelineStr = "0 ms      Agent Started\n100 ms    Fetch Tech Stack History ✓\n560 ms    Developer Analyst (gpt-4o) ✓\n1670 ms   Search Technical Catalog ✓\n2020 ms   Synthesize Proposal (gpt-4o) ✓\n2970 ms   Workflow Finished ✓";
    } else {
      timelineStr = "0 ms      Agent Started\n100 ms    Validate Payment Request ✓\n290 ms    Fraud Detection (gpt-4o) ✓\n1190 ms   Stripe Payment Gateway ✗\n3240 ms   Retry Payment ✗\n3400 ms   Chain Failed ✗";
    }

    let rcaStepsStr = "";
    if (activeTraceId === "run_8d7f2c") {
      rcaStepsStr = "✓ PDF successfully loaded\n✓ Document split into 4 chunks\n✓ LLM request initiated\n✗ Chunk #4 exceeded model context window\n✗ Execution terminated by ChatModel";
    } else if (activeTraceId === "run_payment_workflow") {
      rcaStepsStr = "✓ Payment request validated\n✓ Fraud detection check passed\n✗ Stripe API request timed out after 3000ms\n✗ Workflow aborted by Agent";
    } else {
      rcaStepsStr = "✓ All execution steps completed successfully.";
    }

    let fixesStr = "";
    if (activeTraceId === "run_8d7f2c") {
      fixesStr = "1. Reduce chunk size to 1,000–2,000 tokens\n2. Enable RecursiveCharacterTextSplitter\n3. Summarize chunks before final synthesis\n4. Retry only the failed LLM span";
    } else if (activeTraceId === "run_payment_workflow") {
      fixesStr = "1. Increase gateway timeout threshold to 5000ms\n2. Implement exponential backoff retry mechanism\n3. Verify Stripe API service status";
    } else {
      fixesStr = "No fixes recommended. Workflow is healthy.";
    }

    const reportText = `=====================================================
LANGMI TRACE SOLVER - ROOT CAUSE ANALYSIS REPORT
=====================================================
Generated at: ${new Date().toLocaleString()}
Trace Identifier: ${activeTrace.id}
Workflow Name: ${activeTrace.title}
Timestamp: ${activeTrace.timestamp}
Overall Status: ${activeTrace.status.toUpperCase()}
Total Duration: ${activeTrace.totalDuration}
Total Tokens: ${activeTrace.totalTokens}
Estimated Cost: ${activeTrace.totalCost}

-----------------------------------------------------
🧠 AI ROOT CAUSE CHECKPOINTS
-----------------------------------------------------
${rcaStepsStr}

-----------------------------------------------------
⏱ EXECUTION TIMELINE
-----------------------------------------------------
${timelineStr}

-----------------------------------------------------
🛠 SUGGESTED REMEDIATION FIXES
-----------------------------------------------------
${fixesStr}

-----------------------------------------------------
🔍 EXPLAIN FAILURE
-----------------------------------------------------
${isError 
  ? (activeTraceId === "run_8d7f2c" 
      ? "The workflow failed because the language model received more tokens than its maximum context window supports. The document loader and text splitter completed successfully, but the final LLM invocation exceeded the model limit, causing the chain to terminate."
      : "The payment processing workflow failed because the Stripe gateway API request timed out after 3000ms. authorization and risk verification steps completed successfully, but the downstream request was cut off due to the strict timeout constraint.")
  : "No failure occurred. The trace loop finished successfully."
}

=====================================================
END OF REPORT
=====================================================`;

    const blob = new Blob([reportText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `LangMi_RCA_${activeTrace.id}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Helper to choose span icons
  const getSpanIcon = (type: string) => {
    switch (type) {
      case "agent":
        return <Cpu className="h-4.5 w-4.5 text-purple-400" />;
      case "llm":
        return <Terminal className="h-4.5 w-4.5 text-cyan-400" />;
      case "tool":
        return <Wrench className="h-4.5 w-4.5 text-emerald-400" />;
      case "chain":
      default:
        return <Layers className="h-4.5 w-4.5 text-indigo-400" />;
    }
  };

  // Determine diagnostics values
  const getLlmDiagnostics = (span: Span) => {
    if (span.type !== "llm") return null;
    const provider = span.model?.toLowerCase().includes("claude") ? "Anthropic" : (span.model?.toLowerCase().includes("gpt") ? "OpenAI" : "—");
    return {
      provider,
      model: span.model || "—",
      inputTokens: span.tokens?.input ? span.tokens.input.toLocaleString() : "—",
      outputTokens: span.tokens?.output ? span.tokens.output.toLocaleString() : "—",
      totalTokens: span.tokens?.total ? span.tokens.total.toLocaleString() : "—",
      cost: span.cost || "—",
      latency: span.duration,
      retryCount: "0",
      status: span.status === "success" ? "Success" : "Failed"
    };
  };

  const getToolDiagnostics = (span: Span) => {
    if (span.type !== "tool") return null;
    return {
      tool: span.name,
      input: span.input || "—",
      output: span.output || "—",
      duration: span.duration,
      status: span.status === "success" ? "Success" : "Failed",
      error: span.errorMsg || "—"
    };
  };

  const isTraceFailed = activeTrace.status === "error";

  return (
    <div className="flex-1 bg-black min-h-screen border-t border-border flex flex-col relative">
      {/* Top Banner Control */}
      <div className="border-b border-border/80 bg-zinc-950/40 py-4 px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="text-xs text-zinc-500 font-mono uppercase tracking-wider">Active Trace Stream:</span>
          <select
            value={activeTraceId}
            onChange={(e) => handleTraceChange(e.target.value)}
            className="bg-zinc-900 border border-zinc-800 text-sm text-white rounded px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono font-medium cursor-pointer"
          >
            {traces.map((t) => (
              <option key={t.id} value={t.id}>
                {t.title} ({t.spans.length} Spans)
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-6 text-xs font-mono text-zinc-400">
          <div>
            Latency: <span className="text-white font-bold">{activeTrace.totalDuration}</span>
          </div>
          <div>
            Tokens: <span className="text-white font-bold">{activeTrace.totalTokens}</span>
          </div>
          <div>
            Cost: <span className="text-white font-bold">{activeTrace.totalCost}</span>
          </div>
          <div>
            Status:{" "}
            <Badge variant={activeTrace.status === "success" ? "success" : "destructive"}>
              {activeTrace.status.toUpperCase()}
            </Badge>
          </div>
        </div>
      </div>

      {/* Main Dual-Pane Panel */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden h-[calc(100vh-140px)]">
        
        {/* Left Pane: Hierarchical Tree list */}
        <div className="lg:col-span-5 border-r border-border overflow-y-auto p-6 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-zinc-300 uppercase tracking-wider flex items-center gap-2">
              <Layers className="h-4 w-4 text-indigo-400" />
              Trace Tree Spans
            </h2>
            <span className="text-xs text-zinc-500 font-mono">{activeTrace.spans.length} execution elements</span>
          </div>

          <div className="space-y-2 mt-2">
            {activeTrace.spans.map((span) => {
              const isCollapsed = collapsedSpans[span.id];
              return (
                <div
                  key={span.id}
                  onClick={() => handleSpanClick(span.id)}
                  className={`relative p-3.5 rounded-lg border transition-all cursor-pointer flex flex-col gap-2 ${
                    selectedSpanId === span.id
                      ? "bg-zinc-900/90 border-indigo-500/50 shadow-md shadow-indigo-950/20"
                      : "bg-zinc-950/40 border-zinc-900 hover:border-zinc-800 hover:bg-zinc-900/20"
                  }`}
                  style={{ marginLeft: `${span.depth * 1.2}rem` }}
                >
                  {/* Nesting connector guide line */}
                  {span.depth > 0 && (
                    <div 
                      className="absolute top-1/2 -left-4 w-4 border-t border-dashed border-zinc-800" 
                      style={{ transform: "translateY(-50%)" }}
                    />
                  )}

                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2.5">
                      {span.depth === 0 ? (
                        <button
                          onClick={(e) => toggleCollapse(span.id, e)}
                          className="p-0.5 rounded text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800"
                        >
                          {isCollapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                        </button>
                      ) : (
                        <div className="w-4.5" />
                      )}

                      <div className="flex items-center gap-2">
                        {getSpanIcon(span.type)}
                        <span className="text-xs font-bold text-zinc-200 font-mono">{span.name}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge
                        variant={
                          span.type === "agent"
                            ? "purple"
                            : span.type === "llm"
                            ? "info"
                            : span.type === "tool"
                            ? "success"
                            : "default"
                        }
                        className="text-[9px] uppercase py-0 px-1 font-bold"
                      >
                        {span.type}
                      </Badge>
                      <span className="text-[10px] font-mono text-zinc-500">{span.duration}</span>
                      <span
                        className={`h-2.5 w-2.5 rounded-full ${
                          span.status === "success" ? "bg-emerald-500" : "bg-rose-500 animate-pulse"
                        }`}
                      />
                    </div>
                  </div>

                  {/* Summary / Preview text when NOT collapsed */}
                  {!isCollapsed && (
                    <p className="text-[11px] text-zinc-400 font-mono line-clamp-1 border-t border-zinc-900 pt-2 mt-1 pl-7">
                      {span.errorMsg ? (
                        <span className="text-rose-400 font-semibold">{span.errorMsg}</span>
                      ) : (
                        span.output
                      )}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Pane: Span Inspector details */}
        <div className="lg:col-span-7 p-6 overflow-y-auto flex flex-col">
          <BorderGlow
            edgeSensitivity={30}
            glowColor="250 80 80"
            backgroundColor="#09090b"
            borderRadius={16}
            glowRadius={40}
            glowIntensity={0.8}
            colors={['#6366f1', '#06b6d4', '#a855f7']}
            className="w-full flex-1"
          >
            <div className="p-6 flex flex-col gap-4 w-full h-full justify-between">
              
              {/* Tab Selector Control */}
              <div className="flex border-b border-zinc-800 pb-2.5 justify-between items-center">
                <div className="flex gap-2">
                  <button
                    onClick={() => setActiveTab("rca")}
                    className={`px-3 py-1.5 text-xs font-mono font-bold rounded-md transition-all flex items-center gap-1.5 ${
                      activeTab === "rca"
                        ? "bg-zinc-900 text-white border border-zinc-800 shadow-sm"
                        : "text-zinc-500 hover:text-zinc-300"
                    }`}
                  >
                    <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
                    RCA & Diagnostics
                  </button>
                  <button
                    onClick={() => setActiveTab("details")}
                    className={`px-3 py-1.5 text-xs font-mono font-bold rounded-md transition-all flex items-center gap-1.5 ${
                      activeTab === "details"
                        ? "bg-zinc-900 text-white border border-zinc-800 shadow-sm"
                        : "text-zinc-500 hover:text-zinc-300"
                    }`}
                  >
                    <Activity className="h-3.5 w-3.5 text-indigo-400" />
                    IO Parameters
                  </button>
                </div>
                <Badge variant={selectedSpan?.status === "success" ? "success" : "destructive"} className="px-2.5 py-0.5 font-mono text-[10px]">
                  {selectedSpan?.status?.toUpperCase()}
                </Badge>
              </div>

              {selectedSpan ? (
                <>
                  {activeTab === "details" ? (
                    // DETAILS TAB CONTENT
                    <div className="flex-1 flex flex-col gap-5 overflow-y-auto pr-1">
                      {/* Telemetry Metadata Grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-zinc-950 p-4 rounded-xl border border-zinc-900 font-mono text-xs">
                        <div>
                          <div className="text-[10px] text-zinc-500 uppercase font-bold mb-1">Latency</div>
                          <div className="text-white font-semibold flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5 text-zinc-400" />
                            {selectedSpan.duration}
                          </div>
                        </div>
                        <div>
                          <div className="text-[10px] text-zinc-500 uppercase font-bold mb-1">Model</div>
                          <div className="text-white font-semibold truncate" title={selectedSpan.model || "N/A"}>
                            {selectedSpan.model || "N/A"}
                          </div>
                        </div>
                        <div>
                          <div className="text-[10px] text-zinc-500 uppercase font-bold mb-1">Tokens</div>
                          <div className="text-white font-semibold flex items-center gap-1">
                            <Layers className="h-3.5 w-3.5 text-zinc-400" />
                            {selectedSpan.tokens ? selectedSpan.tokens.total : "N/A"}
                          </div>
                        </div>
                        <div>
                          <div className="text-[10px] text-zinc-500 uppercase font-bold mb-1">Cost</div>
                          <div className="text-white font-semibold flex items-center gap-1">
                            <Coins className="h-3.5 w-3.5 text-zinc-400" />
                            {selectedSpan.cost || "N/A"}
                          </div>
                        </div>
                      </div>

                      {/* Error Box */}
                      {selectedSpan.errorMsg && (
                        <div className="bg-rose-950/20 border border-rose-900/60 rounded-xl p-4 flex items-start gap-3">
                          <AlertTriangle className="h-5 w-5 text-rose-400 mt-0.5 flex-shrink-0" />
                          <div className="text-xs w-full">
                            <div className="font-bold text-rose-400 font-mono">Execution Exception Raised</div>
                            <p className="text-zinc-300 font-mono mt-1 leading-relaxed bg-black/40 p-2 rounded border border-rose-900/20">
                              {selectedSpan.errorMsg}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Input Param Box */}
                      <div className="flex flex-col gap-2">
                        <span className="text-[10px] font-bold text-indigo-400 font-mono uppercase tracking-wider">Input Parameter Stream</span>
                        {isEditingParams ? (
                          <div className="flex flex-col gap-3">
                            <textarea
                              value={editedInput}
                              onChange={(e) => setEditedInput(e.target.value)}
                              className="w-full min-h-[120px] rounded-xl border border-indigo-500/50 bg-zinc-950 p-4 font-mono text-xs text-zinc-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 leading-relaxed"
                              placeholder="Edit parameters..."
                            />
                            <div className="flex gap-2 justify-end">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setIsEditingParams(false);
                                  setEditedInput(selectedSpan.input);
                                }}
                                className="text-xs py-1 cursor-pointer"
                              >
                                Cancel
                              </Button>
                              <Button
                                variant="secondary"
                                size="sm"
                                onClick={handleSaveParams}
                                className="text-xs py-1 cursor-pointer text-indigo-400 border border-indigo-500/20 bg-indigo-500/10 hover:bg-indigo-500/20"
                              >
                                Save & Apply
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="relative rounded-xl border border-zinc-900 bg-zinc-950 p-4 font-mono text-xs overflow-x-auto whitespace-pre-wrap text-zinc-300 leading-relaxed max-h-[160px]">
                            {selectedSpan.input}
                          </div>
                        )}
                      </div>

                      {/* Output Payload Box */}
                      <div className="flex flex-col gap-2">
                        <span className="text-[10px] font-bold text-cyan-400 font-mono uppercase tracking-wider">Output / Return Payload</span>
                        <div className="relative rounded-xl border border-zinc-900 bg-zinc-950 p-4 font-mono text-xs overflow-x-auto whitespace-pre-wrap text-zinc-300 leading-relaxed max-h-[160px]">
                          {isReRunning ? (
                            <div className="flex items-center gap-2 text-zinc-500 animate-pulse py-2">
                              <RefreshCw className="h-4 w-4 animate-spin text-cyan-400" />
                              <span>Executing step and streaming payload response...</span>
                            </div>
                          ) : (
                            selectedSpan.output
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    // RCA & DIAGNOSTICS TAB CONTENT
                    <div className="flex-1 flex flex-col gap-5 overflow-y-auto pr-1">
                      
                      {/* Workflow failure card */}
                      {isTraceFailed && (
                        <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-4">
                          <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2 font-mono">📊 Failure Summary</h4>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-y-3 gap-x-4 font-mono text-xs">
                            <div>
                              <div className="text-[10px] text-zinc-600 font-bold uppercase">Workflow Status</div>
                              <div className="text-rose-500 font-bold">Failed</div>
                            </div>
                            <div>
                              <div className="text-[10px] text-zinc-600 font-bold uppercase">Failed Span</div>
                              <div className="text-white font-bold">{selectedSpan.status === "error" ? selectedSpan.name : (activeTrace.spans.find(s => s.status === "error")?.name || "ChatOpenAI")}</div>
                            </div>
                            <div>
                              <div className="text-[10px] text-zinc-600 font-bold uppercase">Failure Type</div>
                              <div className="text-zinc-300 font-bold truncate">
                                {selectedSpan.errorMsg ? selectedSpan.errorMsg.split(":")[0] : (activeTrace.spans.find(s => s.status === "error")?.errorMsg?.split(":")[0] || "ContextWindowExceeded")}
                              </div>
                            </div>
                            <div>
                              <div className="text-[10px] text-zinc-600 font-bold uppercase">Total Duration</div>
                              <div className="text-white">{activeTrace.totalDuration}</div>
                            </div>
                            <div>
                              <div className="text-[10px] text-zinc-600 font-bold uppercase">Total Tokens</div>
                              <div className="text-white">{activeTrace.totalTokens}</div>
                            </div>
                            <div>
                              <div className="text-[10px] text-zinc-600 font-bold uppercase">Estimated Cost</div>
                              <div className="text-white">{activeTrace.totalCost}</div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* AI Root Cause Analysis */}
                      <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-4 font-mono text-xs">
                        <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                          <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
                          🧠 AI Root Cause Analysis
                        </h4>
                        <div className="space-y-1.5 pt-1 border-t border-zinc-900/60">
                          {activeTraceId === "run_8d7f2c" ? (
                            <>
                              <div className="flex items-center gap-2 text-emerald-500">
                                <span>✓</span> <span>PDF successfully loaded</span>
                              </div>
                              <div className="flex items-center gap-2 text-emerald-500">
                                <span>✓</span> <span>Document split into 4 chunks</span>
                              </div>
                              <div className="flex items-center gap-2 text-emerald-500">
                                <span>✓</span> <span>LLM request initiated</span>
                              </div>
                              <div className="flex items-center gap-2 text-rose-500 font-semibold">
                                <span>✗</span> <span>Chunk #4 exceeded model context window</span>
                              </div>
                              <div className="flex items-center gap-2 text-rose-500 font-semibold">
                                <span>✗</span> <span>Execution terminated by ChatModel</span>
                              </div>
                            </>
                          ) : activeTraceId === "run_payment_workflow" ? (
                            <>
                              <div className="flex items-center gap-2 text-emerald-500">
                                <span>✓</span> <span>Payment request validated</span>
                              </div>
                              <div className="flex items-center gap-2 text-emerald-500">
                                <span>✓</span> <span>Fraud detection check passed</span>
                              </div>
                              <div className="flex items-center gap-2 text-rose-500 font-semibold">
                                <span>✗</span> <span>Stripe API request timed out after 3000ms</span>
                              </div>
                              <div className="flex items-center gap-2 text-rose-500 font-semibold">
                                <span>✗</span> <span>Workflow aborted by Agent</span>
                              </div>
                            </>
                          ) : (
                            <div className="flex items-center gap-2 text-emerald-500">
                              <span>✓</span> <span>All execution steps completed successfully.</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Explain Failure */}
                      {isTraceFailed && (
                        <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-4 font-mono text-xs">
                          <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                            <BookOpen className="h-3.5 w-3.5 text-indigo-400" />
                            🔍 Explain Failure
                          </h4>
                          <div className="text-zinc-300 leading-relaxed pt-1.5 border-t border-zinc-900/60">
                            {isLoadingExplanation ? (
                              <div className="flex items-center gap-2 text-zinc-500 animate-pulse py-1">
                                <RefreshCw className="h-3.5 w-3.5 animate-spin text-indigo-400" />
                                <span>Generating AI diagnostic explanation from API...</span>
                              </div>
                            ) : (
                              apiExplanation || "No explanation available."
                            )}
                          </div>
                        </div>
                      )}

                      {/* Suggested Fixes */}
                      <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-4 font-mono text-xs">
                        <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                          <Wrench className="h-3.5 w-3.5 text-emerald-400" />
                          🛠 Suggested Fixes
                        </h4>
                        <div className="space-y-1.5 pt-1.5 border-t border-zinc-900/60 text-zinc-300">
                          {activeTraceId === "run_8d7f2c" ? (
                            <>
                              <div>1. Reduce chunk size to 1,000–2,000 tokens</div>
                              <div>2. Enable RecursiveCharacterTextSplitter</div>
                              <div>3. Summarize chunks before final synthesis</div>
                              <div>4. Retry only the failed LLM span</div>
                            </>
                          ) : activeTraceId === "run_payment_workflow" ? (
                            <>
                              <div>1. Increase Stripe API timeout limit to 5000ms</div>
                              <div>2. Implement exponential backoff retry mechanism</div>
                              <div>3. Verify Stripe developer dashboard webhook status</div>
                            </>
                          ) : (
                            <div className="text-zinc-500">No suggestions needed. Workflow is healthy.</div>
                          )}
                        </div>
                      </div>

                      {/* Timeline */}
                      <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-4 font-mono text-xs">
                        <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5 text-zinc-400" />
                          ⏱ Execution Timeline
                        </h4>
                        <div className="space-y-1.5 pt-2 border-t border-zinc-900/60 text-zinc-400">
                          {activeTraceId === "run_sql_repair" && (
                            <>
                              <div>0 ms      Agent Started</div>
                              <div>100 ms    Search Config Files <span className="text-emerald-500 font-bold">✓</span></div>
                              <div>230 ms    Analyze Leak (gpt-4o) <span className="text-emerald-500 font-bold">✓</span></div>
                              <div>1220 ms   Database Reconnection Test <span className="text-emerald-500 font-bold">✓</span></div>
                              <div>1540 ms   Workflow Finished <span className="text-emerald-500 font-bold">✓</span></div>
                            </>
                          )}
                          {activeTraceId === "run_8d7f2c" && (
                            <>
                              <div>0 ms      Agent Started</div>
                              <div>183 ms    ReadPDF <span className="text-emerald-500 font-bold">✓</span></div>
                              <div>294 ms    ChatOpenAI <span className="text-rose-500 font-bold">✗</span></div>
                              <div>3264 ms   Chain Failed <span className="text-rose-500 font-bold">✗</span></div>
                            </>
                          )}
                          {activeTraceId === "run_recommend" && (
                            <>
                              <div>0 ms      Agent Started</div>
                              <div>100 ms    Fetch Tech Stack History <span className="text-emerald-500 font-bold">✓</span></div>
                              <div>560 ms    Developer Analyst (gpt-4o) <span className="text-emerald-500 font-bold">✓</span></div>
                              <div>1670 ms   Search Technical Catalog <span className="text-emerald-500 font-bold">✓</span></div>
                              <div>2020 ms   Synthesize Proposal (gpt-4o) <span className="text-emerald-500 font-bold">✓</span></div>
                              <div>2970 ms   Workflow Finished <span className="text-emerald-500 font-bold">✓</span></div>
                            </>
                          )}
                          {activeTraceId === "run_payment_workflow" && (
                            <>
                              <div>0 ms      Agent Started</div>
                              <div>100 ms    Validate Payment Request <span className="text-emerald-500 font-bold">✓</span></div>
                              <div>290 ms    Fraud Detection (gpt-4o) <span className="text-emerald-500 font-bold">✓</span></div>
                              <div>1190 ms   Stripe Payment Gateway <span className="text-rose-500 font-bold">✗</span></div>
                              <div>3240 ms   Retry Payment <span className="text-rose-500 font-bold">✗</span></div>
                              <div>3400 ms   Chain Failed <span className="text-rose-500 font-bold">✗</span></div>
                            </>
                          )}
                        </div>
                      </div>

                      {/* LLM Diagnostics (Conditional) */}
                      {selectedSpan.type === "llm" && (
                        <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-4 font-mono text-xs">
                          <h4 className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                            <Terminal className="h-3.5 w-3.5" />
                            🤖 LLM Diagnostics
                          </h4>
                          <div className="grid grid-cols-2 gap-y-2.5 gap-x-4 border-t border-zinc-900/60 pt-2 text-zinc-300">
                            <div>
                              <div className="text-[10px] text-zinc-500 uppercase font-bold">Provider</div>
                              <div>{getLlmDiagnostics(selectedSpan)?.provider}</div>
                            </div>
                            <div>
                              <div className="text-[10px] text-zinc-500 uppercase font-bold">Model</div>
                              <div>{getLlmDiagnostics(selectedSpan)?.model}</div>
                            </div>
                            <div>
                              <div className="text-[10px] text-zinc-500 uppercase font-bold">Input Tokens</div>
                              <div>{getLlmDiagnostics(selectedSpan)?.inputTokens}</div>
                            </div>
                            <div>
                              <div className="text-[10px] text-zinc-500 uppercase font-bold">Output Tokens</div>
                              <div>{getLlmDiagnostics(selectedSpan)?.outputTokens}</div>
                            </div>
                            <div>
                              <div className="text-[10px] text-zinc-500 uppercase font-bold">Total Tokens</div>
                              <div>{getLlmDiagnostics(selectedSpan)?.totalTokens}</div>
                            </div>
                            <div>
                              <div className="text-[10px] text-zinc-500 uppercase font-bold">Estimated Cost</div>
                              <div className="text-white font-semibold">{getLlmDiagnostics(selectedSpan)?.cost}</div>
                            </div>
                            <div>
                              <div className="text-[10px] text-zinc-500 uppercase font-bold">Latency</div>
                              <div>{getLlmDiagnostics(selectedSpan)?.latency}</div>
                            </div>
                            <div>
                              <div className="text-[10px] text-zinc-500 uppercase font-bold">Retry Count</div>
                              <div>{getLlmDiagnostics(selectedSpan)?.retryCount}</div>
                            </div>
                            <div>
                              <div className="text-[10px] text-zinc-500 uppercase font-bold">Status</div>
                              <div className={selectedSpan.status === "success" ? "text-emerald-400 font-bold" : "text-rose-400 font-bold"}>
                                {getLlmDiagnostics(selectedSpan)?.status}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Tool Diagnostics (Conditional) */}
                      {selectedSpan.type === "tool" && (
                        <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-4 font-mono text-xs">
                          <h4 className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                            <Wrench className="h-3.5 w-3.5" />
                            🔧 Tool Diagnostics
                          </h4>
                          <div className="space-y-3.5 border-t border-zinc-900/60 pt-2 text-zinc-300">
                            <div>
                              <div className="text-[10px] text-zinc-500 uppercase font-bold mb-0.5">Tool</div>
                              <div className="text-white font-bold">{getToolDiagnostics(selectedSpan)?.tool}</div>
                            </div>
                            <div>
                              <div className="text-[10px] text-zinc-500 uppercase font-bold mb-0.5">Input</div>
                              <div className="bg-black/60 p-2 rounded border border-zinc-900 max-h-[80px] overflow-y-auto whitespace-pre-wrap">{getToolDiagnostics(selectedSpan)?.input}</div>
                            </div>
                            <div>
                              <div className="text-[10px] text-zinc-500 uppercase font-bold mb-0.5">Output</div>
                              <div className="bg-black/60 p-2 rounded border border-zinc-900 max-h-[80px] overflow-y-auto whitespace-pre-wrap">{getToolDiagnostics(selectedSpan)?.output}</div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <div className="text-[10px] text-zinc-500 uppercase font-bold">Duration</div>
                                <div>{getToolDiagnostics(selectedSpan)?.duration}</div>
                              </div>
                              <div>
                                <div className="text-[10px] text-zinc-500 uppercase font-bold">Status</div>
                                <div className={selectedSpan.status === "success" ? "text-emerald-400 font-bold" : "text-rose-400 font-bold"}>
                                  {getToolDiagnostics(selectedSpan)?.status}
                                </div>
                              </div>
                            </div>
                            {selectedSpan.status === "error" && (
                              <div>
                                <div className="text-[10px] text-rose-400 uppercase font-bold mb-0.5">Error Message</div>
                                <div className="text-rose-400 bg-rose-950/20 p-2 rounded border border-rose-900/30 whitespace-pre-wrap">{getToolDiagnostics(selectedSpan)?.error}</div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Inspector Footer Action Buttons */}
                  <div className="mt-2 border-t border-zinc-900 pt-5">
                    <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2.5 font-mono">Solver Actions</h4>
                    <div className="flex flex-wrap gap-2.5">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={handleReRunSpan}
                        disabled={isReRunning || isEditingParams}
                        className="gap-1.5 text-xs cursor-pointer disabled:opacity-50 font-mono"
                      >
                        {isReRunning ? (
                          <RefreshCw className="h-3.5 w-3.5 text-emerald-400 animate-spin" />
                        ) : (
                          <Play className="h-3.5 w-3.5 text-emerald-400" />
                        )}
                        {isReRunning ? "Re-running..." : "Replay Trace"}
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setIsEditingParams(true);
                          setEditedInput(selectedSpan.input);
                          setActiveTab("details");
                        }}
                        disabled={isReRunning || isEditingParams}
                        className="gap-1.5 text-xs cursor-pointer disabled:opacity-50 font-mono"
                      >
                        <Settings className="h-3.5 w-3.5 text-indigo-400" />
                        Modify parameters
                      </Button>

                      {isTraceFailed && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowFixModal(true)}
                            className="gap-1.5 text-xs cursor-pointer font-mono"
                          >
                            <Code className="h-3.5 w-3.5 text-emerald-400" />
                            Generate Fix
                          </Button>

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowSimulateModal(true)}
                            className="gap-1.5 text-xs cursor-pointer font-mono"
                          >
                            <HelpCircle className="h-3.5 w-3.5 text-cyan-400" />
                            Simulate Fix
                          </Button>

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowCompareModal(true)}
                            className="gap-1.5 text-xs cursor-pointer font-mono"
                          >
                            <Layers className="h-3.5 w-3.5 text-pink-400" />
                            Compare Logs
                          </Button>
                        </>
                      )}

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowCostModal(true)}
                        className="gap-1.5 text-xs cursor-pointer font-mono"
                      >
                        <Coins className="h-3.5 w-3.5 text-amber-400" />
                        Optimize Cost
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleExportRCA}
                        className="gap-1.5 text-xs cursor-pointer font-mono"
                      >
                        <Download className="h-3.5 w-3.5 text-zinc-400" />
                        Export RCA Report
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-zinc-500 font-mono min-h-[400px]">
                  <GitCommit className="h-10 w-10 text-zinc-700 animate-pulse mb-3" />
                  <span>Select an execution span to inspect details</span>
                </div>
              )}
            </div>
          </BorderGlow>
        </div>
      </div>

      {/* MODAL 1: SIMULATE FIX */}
      {showSimulateModal && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-md p-6 font-mono text-xs flex flex-col gap-4">
            <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <HelpCircle className="h-4 w-4 text-cyan-400" />
                🧪 Simulate Fix Recommendations
              </h3>
              <button onClick={() => setShowSimulateModal(false)} className="text-zinc-500 hover:text-white text-sm">✕</button>
            </div>
            
            <p className="text-zinc-400 leading-relaxed">
              Estimate the effect of proposed fixes on this trace workflow without re-running.
            </p>

            <div className="space-y-3 pt-2">
              <div className="bg-zinc-900/60 p-3.5 rounded-xl border border-zinc-800 flex justify-between items-center">
                <div>
                  <div className="font-bold text-white">Reduce Chunk Size (1,500 tokens)</div>
                  <div className="text-[10px] text-zinc-500 mt-0.5">Optimizes prompt size under limit</div>
                </div>
                <Badge variant="success">High Likelihood</Badge>
              </div>

              <div className="bg-zinc-900/60 p-3.5 rounded-xl border border-zinc-800 flex justify-between items-center">
                <div>
                  <div className="font-bold text-white">Switch to GPT-4o-128k context</div>
                  <div className="text-[10px] text-zinc-500 mt-0.5">Increases window limit ceiling</div>
                </div>
                <Badge variant="success">High Likelihood</Badge>
              </div>

              <div className="bg-zinc-900/60 p-3.5 rounded-xl border border-zinc-800 flex justify-between items-center">
                <div>
                  <div className="font-bold text-white">Retry Request immediately</div>
                  <div className="text-[10px] text-zinc-500 mt-0.5">No parameter or code changes</div>
                </div>
                <Badge variant="destructive">Low Likelihood</Badge>
              </div>
            </div>

            <p className="text-[10px] text-zinc-500 italic leading-relaxed pt-2 border-t border-zinc-900">
              *These recommendations are heuristic estimates based on trace limits and known model context windows.
            </p>
          </div>
        </div>
      )}

      {/* MODAL 2: COMPARE LOGS */}
      {showCompareModal && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-2xl p-6 font-mono text-xs flex flex-col gap-4">
            <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Layers className="h-4 w-4 text-pink-400" />
                📈 Compare with Successful Trace
              </h3>
              <button onClick={() => setShowCompareModal(false)} className="text-zinc-500 hover:text-white text-sm">✕</button>
            </div>

            <p className="text-zinc-400 leading-relaxed">
              Finds the most similar successful execution log in the database to identify outliers.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
              <div className="bg-rose-950/10 border border-rose-900/40 p-4 rounded-xl">
                <div className="font-bold text-rose-400 mb-2">Failed Trace (This Run)</div>
                <div className="space-y-1 text-zinc-300">
                  <div>Chunk Size: <span className="font-bold text-white">18,000 tokens</span></div>
                  <div>Model: <span className="font-bold text-white">gpt-4o</span></div>
                  <div>Retrieved Documents: <span className="font-bold text-white">12</span></div>
                  <div>Time Limit: <span className="font-bold text-white">3,000 ms</span></div>
                </div>
              </div>

              <div className="bg-emerald-950/10 border border-emerald-900/40 p-4 rounded-xl">
                <div className="font-bold text-emerald-400 mb-2">Successful Trace (Reference)</div>
                <div className="space-y-1 text-zinc-300">
                  <div>Chunk Size: <span className="font-bold text-white">2,000 tokens</span></div>
                  <div>Model: <span className="font-bold text-white">gpt-4o</span></div>
                  <div>Retrieved Documents: <span className="font-bold text-white">5</span></div>
                  <div>Time Limit: <span className="font-bold text-white">3,000 ms</span></div>
                </div>
              </div>
            </div>

            <div className="bg-zinc-900/40 border border-zinc-800 p-3.5 rounded-xl mt-1">
              <div className="font-bold text-amber-400 mb-1">Likely Cause</div>
              <p className="text-zinc-300 leading-relaxed">
                Oversized document chunk caused the failure. Splitting into smaller 2k chunks is proven to resolve.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: GENERATE FIX */}
      {showFixModal && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-lg p-6 font-mono text-xs flex flex-col gap-4">
            <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Code className="h-4 w-4 text-emerald-400" />
                🛠 Generate Implementation Fix
              </h3>
              <button onClick={() => setShowFixModal(false)} className="text-zinc-500 hover:text-white text-sm">✕</button>
            </div>

            <p className="text-zinc-400 leading-relaxed">
              Based on the trace metadata, here is a suggested code correction to apply:
            </p>

            <div className="relative bg-black border border-zinc-900 rounded-xl p-4 overflow-x-auto">
              <pre className="text-zinc-300 leading-relaxed font-mono text-[11px]">
{`// Suggestion: Reduce chunk size and implement recursive splitting
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";

const textSplitter = new RecursiveCharacterTextSplitter({
  chunkSize: 1500, // Reduced from 18,000
  chunkOverlap: 150,
  separators: ["\\n\\n", "\\n", " ", ""],
});

const chunks = await textSplitter.splitDocuments(docs);
console.log(\`Generated \${chunks.length} optimized sub-chunks.\`);`}
              </pre>
            </div>

            <div className="flex justify-end gap-2 mt-2">
              <Button variant="outline" onClick={() => setShowFixModal(false)} className="cursor-pointer">
                Close
              </Button>
              <Button variant="secondary" onClick={() => setShowFixModal(false)} className="text-indigo-400 cursor-pointer border border-indigo-500/20 bg-indigo-500/10 hover:bg-indigo-500/20">
                Copy Code Patch
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: OPTIMIZE COST */}
      {showCostModal && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-md p-6 font-mono text-xs flex flex-col gap-4">
            <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Coins className="h-4 w-4 text-amber-400" />
                ⚡ Optimize LLM Prompt Cost
              </h3>
              <button onClick={() => setShowCostModal(false)} className="text-zinc-500 hover:text-white text-sm">✕</button>
            </div>

            <p className="text-zinc-400 leading-relaxed">
              Based on tokens and API rates, optimize this trace's financial footprint:
            </p>

            <div className="space-y-3.5 pt-2">
              <div className="flex gap-3.5">
                <div className="h-8 w-8 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400 font-bold shrink-0">1</div>
                <div>
                  <div className="font-bold text-zinc-200">Reduce prompt sizes</div>
                  <p className="text-zinc-500 text-[10px] mt-0.5 leading-relaxed">Trim static system instruction templates by up to 30% to shave input token costs.</p>
                </div>
              </div>

              <div className="flex gap-3.5">
                <div className="h-8 w-8 rounded-full bg-cyan-500/10 flex items-center justify-center text-cyan-400 font-bold shrink-0">2</div>
                <div>
                  <div className="font-bold text-zinc-200">Remove redundant retrieve context</div>
                  <p className="text-zinc-500 text-[10px] mt-0.5 leading-relaxed">Limit vector retrieval matches from 12 to 5. Retains 95% accuracy while cutting cost in half.</p>
                </div>
              </div>

              <div className="flex gap-3.5">
                <div className="h-8 w-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400 font-bold shrink-0">3</div>
                <div>
                  <div className="font-bold text-zinc-200">Cache retrieval results</div>
                  <p className="text-zinc-500 text-[10px] mt-0.5 leading-relaxed">Store document hashes and LLM output vectors in Redis to skip repeating queries.</p>
                </div>
              </div>

              <div className="flex gap-3.5">
                <div className="h-8 w-8 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-400 font-bold shrink-0">4</div>
                <div>
                  <div className="font-bold text-zinc-200">Use preprocessing models</div>
                  <p className="text-zinc-500 text-[10px] mt-0.5 leading-relaxed">Use lighter models like GPT-4o-mini for routing, summarization, and prompt classification.</p>
                </div>
              </div>
            </div>

            <div className="flex justify-end mt-2">
              <Button variant="outline" onClick={() => setShowCostModal(false)} className="cursor-pointer">
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
