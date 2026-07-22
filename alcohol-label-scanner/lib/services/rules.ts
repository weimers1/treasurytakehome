import Fuse from "fuse.js";

const MANDATORY_WARNING = "(1) According to the Surgeon General, women should not drink alcoholic beverages during pregnancy because of the risk of birth defects. (2) Consumption of alcoholic beverages impairs your ability to drive a car or operate machinery, and may cause health problems.";

const TAXONOMY_KEYWORDS = [
  "WHISKEY", "BOURBON", "VODKA", "GIN", "RUM", "TEQUILA", 
  "MALT BEVERAGE", "BEER", "ALE", "WINE", "CABERNET SAUVIGNON",
  "CHARDONNAY", "MERLOT", "PINOT NOIR", "SAUVIGNON BLANC"
];

const PRODUCER_KEYWORDS = ["BOTTLED BY", "DISTILLED BY", "PRODUCED BY", "BREWED BY", "IMPORTED BY"];

export async function runRules(data: any, expected: any = {}) {
  const expectedBrand = expected?.brand_name || data.brand_name;
  const expectedABV = parseFloat(expected?.abv) || null;

  const checks: any[] = [];

  // 1. GOVERNMENT WARNING
  const gw = (data.government_warning || "").toUpperCase().replace(/\s+/g, " ");
  const normalizedWarning = MANDATORY_WARNING.toUpperCase().replace(/\s+/g, " ");
  
  const hasHeader = gw.includes("GOVERNMENT WARNING:");
  // Check if it contains the mandatory text, allowing for slight variations in punctuation/spacing
  const hasText = gw.includes(normalizedWarning) || 
                  (gw.includes("ACCORDING TO THE SURGEON GENERAL") && 
                   gw.includes("WOMEN SHOULD NOT DRINK ALCOHOLIC BEVERAGES") && 
                   gw.includes("RISK OF BIRTH DEFECTS") && 
                   gw.includes("CONSUMPTION OF ALCOHOLIC BEVERAGES IMPAIRS") &&
                   gw.includes("ABILITY TO DRIVE A CAR"));

  checks.push({
    rule: "GOVERNMENT WARNING",
    status: hasHeader && hasText ? "PASS" : "FAIL",
    details: hasHeader && hasText 
      ? "Exact header and mandatory text detected." 
      : `Missing ${!hasHeader ? "header" : ""} ${!hasText ? "mandatory text" : ""}`.trim()
  });

  // 2. BRAND NAME
  const fuse = new Fuse([expectedBrand], { includeScore: true, threshold: 0.4 });
  const brandResult = fuse.search(data.brand_name || "");
  const similarity = brandResult.length > 0 ? (1 - (brandResult[0].score || 0)) : 0;
  checks.push({
    rule: "BRAND NAME",
    status: similarity >= 0.85 ? "PASS" : "FAIL",
    details: `Detected: "${data.brand_name}". Expected: "${expectedBrand}". Similarity: ${(similarity * 100).toFixed(1)}%`
  });

  // 3. ALCOHOL CONTENT / ABV
  const abvMatch = data.abv?.match(/(\d+\.?\d*)/);
  const detectedABV = abvMatch ? parseFloat(abvMatch[1]) : null;
  let abvStatus = "FAIL";
  let abvDetails = "Could not detect ABV.";
  
  if (detectedABV !== null) {
    if (expectedABV === null) {
      abvStatus = "PASS";
      abvDetails = `Detected ABV: ${detectedABV}%. No expected value provided for comparison.`;
    } else {
      const diff = Math.abs(detectedABV - expectedABV);
      abvStatus = diff <= 0.3 ? "PASS" : "FAIL";
      abvDetails = `Detected: ${detectedABV}%. Expected: ${expectedABV}%. Tolerance: +/- 0.3%.`;
    }
  }
  checks.push({ rule: "ALCOHOL CONTENT", status: abvStatus, details: abvDetails });

  // 4. CLASS / TYPE DESIGNATION
  const hasClass = TAXONOMY_KEYWORDS.some(k => data.class_type?.toUpperCase().includes(k) || data.raw_text?.toUpperCase().includes(k));
  checks.push({
    rule: "CLASS / TYPE DESIGNATION",
    status: hasClass ? "PASS" : "WARNING",
    details: hasClass ? `Recognized keyword found: ${data.class_type}` : "No standard TTB designation keyword detected."
  });

  // 5. NET CONTENTS
  const hasVolume = data.net_contents?.match(/(\d+\s*(mL|L|FL\.?\s*OZ\.?))/i);
  checks.push({
    rule: "NET CONTENTS",
    status: hasVolume ? "PASS" : "WARNING",
    details: hasVolume ? `Valid volume detected: ${data.net_contents}` : "No valid volume declaration found."
  });

  // 6. PRODUCER / BOTTLER STATEMENT
  const hasProducer = PRODUCER_KEYWORDS.some(k => data.producer_statement?.toUpperCase().includes(k));
  checks.push({
    rule: "PRODUCER STATEMENT",
    status: hasProducer ? "PASS" : "WARNING",
    details: hasProducer ? `Statement found: ${data.producer_statement}` : "Mandatory operational statement (e.g., 'BOTTLED BY') missing."
  });

  // 7. SULFITE DECLARATION
  const hasSulfites = data.sulfite_declaration === true || data.raw_text?.toUpperCase().includes("CONTAINS SULFITES");
  checks.push({
    rule: "SULFITE DECLARATION",
    status: hasSulfites ? "PASS" : "WARNING",
    details: hasSulfites ? "Sulfite declaration detected." : "No sulfite declaration found (required for wine >= 10ppm)."
  });

  return {
    isValid: checks.every(c => c.status !== "FAIL"),
    checks,
    score: (checks.filter(c => c.status === "PASS").length / checks.length) * 100
  };
}
