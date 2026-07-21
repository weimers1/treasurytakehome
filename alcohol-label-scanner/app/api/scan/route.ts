import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("label") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Convert file to base64 for OCR service
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const imageBase64 = buffer.toString("base64");

    console.log("Dispatcher: Received file", file.name, file.size);

    // Get the base URL for internal API calls
    const origin = new URL(request.url).origin;

    // 1. Call OCR Service
    console.log("Dispatcher: Calling OCR Service...");
    const ocrResponse = await fetch(`${origin}/api/ocr`, {
      method: "POST",
      body: JSON.stringify({ 
        imageBase64, 
        imageType: file.type 
      }),
      headers: { "Content-Type": "application/json" }
    });
    const ocrData = await ocrResponse.json();

    if (!ocrData.success) throw new Error("OCR Step Failed: " + (ocrData.error || "Unknown error"));

    // 2. Call Rules Engine
    console.log("Dispatcher: Calling Rules Engine...");
    const rulesResponse = await fetch(`${origin}/api/rules`, {
      method: "POST",
      body: JSON.stringify({
        data: ocrData.data,
        expected: {} // Future: pass user-provided expected data here
      }),
      headers: { "Content-Type": "application/json" }
    });
    const rulesData = await rulesResponse.json();

    if (!rulesData.success) throw new Error("Rules Step Failed: " + (rulesData.error || "Unknown error"));

    // 3. Call Database Service
    console.log("Dispatcher: Calling DB Service...");
    const dbResponse = await fetch(`${origin}/api/db`, {
      method: "POST",
      body: JSON.stringify({
        ...ocrData.data,
        ...rulesData.compliance,
        timestamp: new Date().toISOString(),
      }),
      headers: { "Content-Type": "application/json" }
    });
    const dbData = await dbResponse.json();

    if (!dbData.success) throw new Error("DB Step Failed: " + (dbData.error || "Unknown error"));

    return NextResponse.json({
      success: true,
      message: "Processing complete",
      scanId: dbData.id,
      results: {
        labelInfo: ocrData.data,
        compliance: rulesData.compliance
      }
    });

  } catch (error: any) {
    console.error("Dispatcher Error:", error);
    return NextResponse.json({ 
      success: false, 
      error: error.message || "Internal Server Error" 
    }, { status: 500 });
  }
}
