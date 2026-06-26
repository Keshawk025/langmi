import { NextResponse, type NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { traceId, errorMsg, failedSpanName, inputs } = await request.json();

    // =========================================================================
    // FUTURE LLM API INTEGRATION PLACEHOLDER
    // =========================================================================
    // To connect a live LLM (e.g. Gemini, OpenAI, Anthropic):
    // 
    // 1. Install the SDK:
    //    npm install @google/generative-ai
    // 
    // 2. Implement the API call:
    //    import { GoogleGenerativeAI } from "@google/generative-ai";
    //    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
    //    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    // 
    //    const prompt = `Analyze this LangChain execution trace failure:
    //    Trace ID: ${traceId}
    //    Failed Span: ${failedSpanName}
    //    Error Message: ${errorMsg}
    //    Inputs: ${JSON.stringify(inputs)}
    // 
    //    Provide a concise explanation of what failed and why.`;
    // 
    //    const result = await model.generateContent(prompt);
    //    const explanation = result.response.text();
    //    return NextResponse.json({ explanation });
    // =========================================================================

    // Current Server-Side Mock Fallback Logic
    let explanation = "The workflow failed during step execution. Please review input parameters and network connectivity.";

    if (errorMsg) {
      const errorLower = errorMsg.toLowerCase();
      if (errorLower.includes("contextwindowexceeded") || errorLower.includes("context length") || errorLower.includes("token count")) {
        explanation = "The workflow failed because the language model received more tokens than its maximum context window supports. The document loader and text splitter completed successfully, but the final LLM invocation exceeded the model limit, causing the chain to terminate.";
      } else if (errorLower.includes("paymentgatewaytimeout") || errorLower.includes("timed out") || errorLower.includes("stripe")) {
        explanation = "The payment processing workflow failed because the Stripe gateway API request timed out after 3000ms. Pre-authorization and risk verification steps completed successfully, but the downstream request was cut off due to the strict timeout constraint.";
      } else {
        explanation = `The workflow encountered an issue at the "${failedSpanName || "unknown"}" execution step. The error raised was: "${errorMsg}".`;
      }
    } else {
      explanation = "No execution exceptions detected. All pipeline stages completed successfully.";
    }

    return NextResponse.json({ explanation });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to generate explanation", details: error.message },
      { status: 500 }
    );
  }
}
