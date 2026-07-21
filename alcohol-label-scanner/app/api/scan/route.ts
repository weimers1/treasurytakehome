import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("label") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    console.log("Dispatcher: Received file", file.name, file.size);

    // Get the base URL for internal API calls
    const origin = new URL(request.url).origin;

    // 1. Call OCR Service
    console.log("Dispatcher: Calling OCR Service...");
    const ocrResponse = await fetch(`${origin}/api/ocr`, {
      method: "POST",
      // In a real scenario, you'd pass the file or a reference to it
      body: JSON.stringify({ fileName: file.name }), 
    });
    const ocrData = await ocrResponse.json();

    if (!ocrData.success) throw new Error("OCR Step Failed");

    // 2. Call Rules Engine
    console.log("Dispatcher: Calling Rules Engine...");
    const rulesResponse = await fetch(`${origin}/api/rules`, {
      method: "POST",
      body: JSON.stringify(ocrData.data),
    });
    const rulesData = await rulesResponse.json();

    if (!rulesData.success) throw new Error("Rules Step Failed");

    // 3. Call Database Service
    console.log("Dispatcher: Calling DB Service...");
    const dbResponse = await fetch(`${origin}/api/db`, {
      method: "POST",
      body: JSON.stringify({
        ...ocrData.data,
        ...rulesData.compliance,
        timestamp: new Date().toISOString(),
      }),
    });
    const dbData = await dbResponse.json();

    if (!dbData.success) throw new Error("DB Step Failed");

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
