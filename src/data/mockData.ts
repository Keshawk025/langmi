// Mock Database for LangMi Observability (LangChain Run Format)

export interface LangChainRun {
  id: string;
  parent_run_id?: string | null;
  name: string;
  run_type: "chain" | "tool" | "llm" | "agent" | string;
  start_time?: string;
  end_time?: string | null;
  status: "success" | "error";
  inputs?: Record<string, any>;
  outputs?: Record<string, any>;
  error?: string | null;
  events?: Array<{ name: string; time: string }>;
  child_runs?: LangChainRun[];
  model_name?: string;
  prompt_tokens?: number;
  completion_tokens?: number;
  total_tokens?: number;
  cost?: string;
}

export const MOCK_TRACES: LangChainRun[] = [
  {
    id: "run_sql_repair",
    parent_run_id: null,
    name: "SQL Repair Agent Execution",
    run_type: "chain",
    start_time: "2026-06-24T22:15:34.000Z",
    end_time: "2026-06-24T22:15:35.420Z",
    status: "success",
    inputs: {
      input: "Fix connection pool leak in database configs and verify connection integrity."
    },
    outputs: {
      output: "Closed connection pools safely. Added try-finally block in db.ts. Tested successfully with zero leaks."
    },
    events: [
      { name: "on_chain_start", time: "2026-06-24T22:15:34.000Z" },
      { name: "on_tool_start", time: "2026-06-24T22:15:34.100Z" },
      { name: "on_tool_end", time: "2026-06-24T22:15:34.220Z" },
      { name: "on_llm_start", time: "2026-06-24T22:15:34.230Z" },
      { name: "on_llm_end", time: "2026-06-24T22:15:35.210Z" },
      { name: "on_tool_start", time: "2026-06-24T22:15:35.220Z" },
      { name: "on_tool_end", time: "2026-06-24T22:15:35.540Z" }
    ],
    child_runs: [
      {
        id: "sql-span-1",
        parent_run_id: "run_sql_repair",
        name: "Main DB Fixer workflow",
        run_type: "agent",
        start_time: "2026-06-24T22:15:34.000Z",
        end_time: "2026-06-24T22:15:35.420Z",
        status: "success",
        inputs: { input: "User query: Fix connection pool leak in database configs and verify connection integrity." },
        outputs: { output: "Closed connection pools safely. Added try-finally block in db.ts. Tested successfully with zero leaks." }
      },
      {
        id: "sql-span-2",
        parent_run_id: "run_sql_repair",
        name: "Search Config Files",
        run_type: "tool",
        start_time: "2026-06-24T22:15:34.100Z",
        end_time: "2026-06-24T22:15:34.220Z",
        status: "success",
        inputs: { command: "grep -rn 'connection' src/config/" },
        outputs: { result: "Result:\n- src/config/db.ts: Line 15\n- src/config/app.ts: Line 45" }
      },
      {
        id: "sql-span-3",
        parent_run_id: "run_sql_repair",
        name: "Analyze Leak (gpt-4o)",
        run_type: "llm",
        start_time: "2026-06-24T22:15:34.230Z",
        end_time: "2026-06-24T22:15:35.210Z",
        status: "success",
        model_name: "gpt-4o (2024-05-13)",
        prompt_tokens: 2800,
        completion_tokens: 850,
        total_tokens: 3650,
        cost: "$0.038",
        inputs: {
          system: "You are an expert DB administrator...",
          user: "Code:\n```typescript\nexport const getDb = () => {\n  return dbPool.connect();\n}\n```"
        },
        outputs: {
          output: "The database connection isn't closed when an error is thrown. Modify the connection helper to release the client back to the pool:\n```typescript\nexport const runQuery = async (query) => {\n  const client = await dbPool.connect();\n  try {\n    return await client.query(query);\n  } finally {\n    client.release();\n  }\n}\n```"
        }
      },
      {
        id: "sql-span-4",
        parent_run_id: "run_sql_repair",
        name: "Database Reconnection Test",
        run_type: "tool",
        start_time: "2026-06-24T22:15:35.220Z",
        end_time: "2026-06-24T22:15:35.540Z",
        status: "success",
        inputs: { command: "npm run test-db-connections" },
        outputs: { output: "Output:\nPASS - db connection pool size: 5/20\nPASS - leaks: 0/20" }
      }
    ]
  },
  {
    id: "run_8d7f2c",
    parent_run_id: null,
    name: "Doc Ingest Pipeline - Error",
    run_type: "chain",
    start_time: "2026-06-26T10:48:31.218Z",
    end_time: "2026-06-26T10:48:34.482Z",
    status: "error",
    inputs: {
      input: "Summarize policy_2026.pdf"
    },
    outputs: {},
    error: "ContextWindowExceeded: token count 154204 exceeds maximum context length.",
    events: [
      { name: "on_chain_start", time: "2026-06-26T10:48:31.218Z" },
      { name: "on_tool_start", time: "2026-06-26T10:48:31.401Z" },
      { name: "on_tool_end", time: "2026-06-26T10:48:31.512Z" },
      { name: "on_llm_start", time: "2026-06-26T10:48:31.520Z" },
      { name: "on_llm_error", time: "2026-06-26T10:48:34.482Z" }
    ],
    child_runs: [
      {
        id: "run_pdf_tool",
        parent_run_id: "run_8d7f2c",
        name: "ReadPDF",
        run_type: "tool",
        status: "success",
        start_time: "2026-06-26T10:48:31.401Z",
        end_time: "2026-06-26T10:48:31.512Z",
        inputs: { path: "policy_2026.pdf" },
        outputs: { output: "Extracted 4 pages. Total characters: 154,204." }
      },
      {
        id: "run_llm",
        parent_run_id: "run_8d7f2c",
        name: "ChatOpenAI",
        run_type: "llm",
        status: "error",
        model_name: "gpt-4o",
        prompt_tokens: 124500,
        completion_tokens: 0,
        total_tokens: 124500,
        error: "ContextWindowExceeded",
        inputs: {
          system: "Summarize policy details.",
          user: "[Extremely long page content containing raw log structures...]"
        },
        outputs: {
          output: "Model returned API error: 400 Bad Request. Context length exceeded."
        }
      }
    ]
  },
  {
    id: "run_recommend",
    parent_run_id: null,
    name: "Recommender Agent Loop",
    run_type: "chain",
    start_time: "2026-06-24T21:55:00.000Z",
    end_time: "2026-06-24T21:55:02.840Z",
    status: "success",
    inputs: {
      input: "User profile: Developer, interested in Rust, databases, distributed caching."
    },
    outputs: {
      output: "Recommended products:\n1. TiDB Distributed database\n2. Redis Cache Server\n3. Redpanda Kafka replacement"
    },
    events: [
      { name: "on_chain_start", time: "2026-06-24T21:55:00.000Z" }
    ],
    child_runs: [
      {
        id: "rec-span-1",
        parent_run_id: "run_recommend",
        name: "Product Recommendation",
        run_type: "agent",
        start_time: "2026-06-24T21:55:00.000Z",
        end_time: "2026-06-24T21:55:02.840Z",
        status: "success",
        inputs: { input: "User profile: Developer, interested in Rust, databases, distributed caching." },
        outputs: { output: "Recommended products:\n1. TiDB Distributed database\n2. Redis Cache Server\n3. Redpanda Kafka replacement" }
      },
      {
        id: "rec-span-2",
        parent_run_id: "run_recommend",
        name: "Fetch Tech Stack History",
        run_type: "tool",
        start_time: "2026-06-24T21:55:00.100Z",
        end_time: "2026-06-24T21:55:00.550Z",
        status: "success",
        inputs: { query: "db.query('SELECT stack FROM devs WHERE id = 458')" },
        outputs: { output: "Result: ['Rust', 'Postgres', 'Docker']" }
      },
      {
        id: "rec-span-3",
        parent_run_id: "run_recommend",
        name: "Developer Analyst (gpt-4o)",
        run_type: "llm",
        start_time: "2026-06-24T21:55:00.560Z",
        end_time: "2026-06-24T21:55:01.660Z",
        status: "success",
        model_name: "gpt-4o (2024-05-13)",
        prompt_tokens: 3200,
        completion_tokens: 450,
        total_tokens: 3650,
        cost: "$0.032",
        inputs: { query: "Analyze interests based on Rust + Postgres + Cache systems. Generate queries." },
        outputs: { output: "Interest overlaps: Distributed Databases, Caching systems in Rust, High-throughput event queues." }
      },
      {
        id: "rec-span-4",
        parent_run_id: "run_recommend",
        name: "Search Technical Catalog",
        run_type: "tool",
        start_time: "2026-06-24T21:55:01.670Z",
        end_time: "2026-06-24T21:55:02.010Z",
        status: "success",
        inputs: { query: "Vector search: distributed databases rust performance" },
        outputs: { output: "Found: TiDB (Highly compatible), Redpanda (High-throughput), Redis (Caching layer)" }
      },
      {
        id: "rec-span-5",
        parent_run_id: "run_recommend",
        name: "Synthesize Proposal (gpt-4o)",
        run_type: "llm",
        start_time: "2026-06-24T21:55:02.020Z",
        end_time: "2026-06-24T21:55:02.970Z",
        status: "success",
        model_name: "gpt-4o (2024-05-13)",
        prompt_tokens: 4100,
        completion_tokens: 650,
        total_tokens: 4750,
        cost: "$0.057",
        inputs: { query: "Format catalog matches into developer friendly recommendations." },
        outputs: { output: "TiDB, Redis, Redpanda - detailing why they fit a Rust/caching workflow." }
      }
    ]
  },
  {
    id: "run_payment_workflow",
    parent_run_id: null,
    name: "Payment Processing Workflow - Error",
    run_type: "chain",
    start_time: "2026-06-26T10:48:31.000Z",
    end_time: "2026-06-26T10:48:34.270Z",
    status: "error",
    inputs: {
      input: "Process payment of $249.99 for Order #ORD-10482 using saved Visa card."
    },
    outputs: {},
    error: "PaymentGatewayTimeout: Stripe API request exceeded 3000ms timeout.",
    events: [
      { name: "on_chain_start", time: "2026-06-26T10:48:31.000Z" }
    ],
    child_runs: [
      {
        id: "pay-span-1",
        parent_run_id: "run_payment_workflow",
        name: "Payment Processing Workflow",
        run_type: "agent",
        start_time: "2026-06-26T10:48:31.000Z",
        end_time: "2026-06-26T10:48:34.270Z",
        status: "error",
        inputs: { input: "User request: Process payment of $249.99 for Order #ORD-10482 using saved Visa card." },
        outputs: { output: "Workflow aborted after payment gateway failed to respond within timeout threshold." },
        error: "PaymentGatewayTimeout: Stripe API request exceeded 3000ms timeout."
      },
      {
        id: "pay-span-2",
        parent_run_id: "run_payment_workflow",
        name: "Validate Payment Request",
        run_type: "tool",
        start_time: "2026-06-26T10:48:31.100Z",
        end_time: "2026-06-26T10:48:31.280Z",
        status: "success",
        inputs: { orderId: "ORD-10482", customerId: "CUST-8291" },
        outputs: { output: "Validation successful. Payment request is valid." }
      },
      {
        id: "pay-span-3",
        parent_run_id: "run_payment_workflow",
        name: "Fraud Detection (gpt-4o)",
        run_type: "llm",
        start_time: "2026-06-26T10:48:31.290Z",
        end_time: "2026-06-26T10:48:32.180Z",
        status: "success",
        model_name: "gpt-4o (2024-05-13)",
        prompt_tokens: 2600,
        completion_tokens: 420,
        total_tokens: 3020,
        cost: "$0.031",
        inputs: { query: "Analyze transaction risk based on customer history, purchase behavior and payment metadata." },
        outputs: { output: "Risk Score: Low (4/100). Transaction approved for payment processing." }
      },
      {
        id: "pay-span-4",
        parent_run_id: "run_payment_workflow",
        name: "Stripe Payment Gateway",
        run_type: "tool",
        start_time: "2026-06-26T10:48:32.190Z",
        end_time: "2026-06-26T10:48:34.240Z",
        status: "error",
        inputs: { method: "POST /v1/payment_intents", amount: "$249.99", currency: "USD" },
        outputs: { output: "Request timed out while waiting for payment gateway response." },
        error: "PaymentGatewayTimeout: HTTPS request exceeded timeout of 3000ms."
      },
      {
        id: "pay-span-5",
        parent_run_id: "run_payment_workflow",
        name: "Retry Payment",
        run_type: "chain",
        start_time: "2026-06-26T10:48:34.250Z",
        end_time: "2026-06-26T10:48:34.400Z",
        status: "error",
        inputs: { attempt: "Retry attempt #1" },
        outputs: { output: "Retry cancelled because payment session had already expired." },
        error: "PaymentSessionExpired: Session expired after gateway timeout."
      }
    ]
  }
];

export interface ModelCostItem {
  name: string;
  cost: string;
  tokens: string;
  percent: number;
}

export interface MetricData {
  latency: string;
  latencyDiff: string;
  latencyUp: boolean;
  runs: string;
  runsDiff: string;
  runsUp: boolean;
  cost: string;
  costDiff: string;
  costUp: boolean;
  success: string;
  successDiff: string;
  successUp: boolean;
  points: number[];
  modelCost: ModelCostItem[];
}

export const RANGE_DATA: Record<string, MetricData> = {
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

export interface FailedRun {
  id: string;
  timestamp: string;
  agent: string;
  error: string;
  severity: "critical" | "warning";
  traceId: string;
}

export const FAILED_RUNS: FailedRun[] = [
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