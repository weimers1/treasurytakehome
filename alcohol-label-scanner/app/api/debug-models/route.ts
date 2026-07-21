import { NextResponse } from "next/server";

export async function GET() {
  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY || "";

  if (!apiKey) {
    return NextResponse.json({ error: "No API key found in process.env" }, { status: 400 });
  }

  try {
    // Directly query Google's ModelService to list all models available to your API key
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json({ error: "API Key Permission Issue", details: data }, { status: res.status });
    }

    // Filter models that support generateContent
    const availableModels = data.models
      ?.filter((m: any) => m.supportedGenerationMethods?.includes("generateContent"))
      .map((m: any) => m.name.replace("models/", ""));

    return NextResponse.json({
      success: true,
      validModelStrings: availableModels,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}