import { GoogleGenerativeAI } from "@google/generative-ai";

let genAIInstance: GoogleGenerativeAI | null = null;

export async function performOCR(imageBase64: string, imageType: string = "image/jpeg") {
  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("MISSING_API_KEY");
  }

  if (!genAIInstance) {
    genAIInstance = new GoogleGenerativeAI(apiKey);
  }

  let mime = imageType;
  let pureBase64 = imageBase64;

  if (imageBase64.includes(";base64,")) {
    const parts = imageBase64.split(";base64,");
    const mimeMatch = parts[0].match(/data:(image\/\w+)/);
    if (mimeMatch) mime = mimeMatch[1];
    pureBase64 = parts[1];
  }

  const model = genAIInstance.getGenerativeModel({ 
    model: "gemini-3.1-flash-lite",
    generationConfig: {
      responseMimeType: "application/json",
      temperature: 0.1,
    }
  });

  const prompt = `Extract the following alcohol label information in strict JSON format:
    {
      "brand_name": "string",
      "abv": "string",
      "class_type": "string",
      "net_contents": "string",
      "producer_statement": "string",
      "government_warning": "string",
      "sulfite_declaration": boolean,
      "raw_text": "Full transcription of all text on the label"
    }`;

  const result = await model.generateContent([
    {
      inlineData: {
        mimeType: mime,
        data: pureBase64,
      },
    },
    prompt,
  ]);

  const response = await result.response;
  return JSON.parse(response.text());
}
