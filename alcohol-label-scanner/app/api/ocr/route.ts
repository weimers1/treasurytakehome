import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    // This will eventually handle image processing and OCR
    console.log("OCR Service triggered");
    
    // Placeholder logic
    return NextResponse.json({
      success: true,
      data: {
        detectedText: "Sample alcohol label text",
        brand: "Example Brand",
        abv: "5.0%",
        volume: "750ml"
      }
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: "OCR failed" }, { status: 500 });
  }
}
