import { NextResponse } from "next/server";
import { performOCR } from "@/lib/services/ocr";
import { runRules } from "@/lib/services/rules";
import { saveScanResults } from "@/lib/services/db";

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

    // 1. Perform OCR
    console.log("Dispatcher: Performing OCR...");
    const extractedData = await performOCR(imageBase64, file.type);

    // 2. Run Rules Engine
    console.log("Dispatcher: Running Rules Engine...");
    const complianceResults = await runRules(extractedData);

    // 3. Save to Database
    console.log("Dispatcher: Saving to Database...");
    const dbResult = await saveScanResults({
      ...extractedData,
      ...complianceResults,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      message: "Processing complete",
      scanId: dbResult.id,
      results: {
        labelInfo: extractedData,
        compliance: complianceResults
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
