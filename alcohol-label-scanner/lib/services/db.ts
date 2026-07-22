export async function saveScanResults(data: any) {
  console.log("Database Service: Writing to Firestore placeholder", data);
  
  // This will eventually write objects of the following type/format to Firestore
  /**
      brand_name: string;
      abv: string;
      class_type: string;
      net_contents: string;
      producer_statement: string;
      government_warning: string;
      sulfite_declaration: boolean;
      raw_text: string;
      isValid: boolean;
      checks: {
          rule: string,
          status: string,
          details: string
      }[];
      score: number;
      timestamp: new Date().toISOString(),
   */
  
  return {
    id: "mock-firestore-id-" + Date.now()
  };
}
