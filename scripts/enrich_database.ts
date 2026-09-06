import fs from "fs";
import path from "path";
import { buildEnrichedLegalSource } from "../server/enrichAllPages";

const dataFilePath = path.join(process.cwd(), "server", "data", "ara_jri_pages_1_to_71.json");

console.log("Reading:", dataFilePath);
const rawData = JSON.parse(fs.readFileSync(dataFilePath, "utf-8"));
console.log("Original records count:", rawData.length);

const enrichedData = rawData.map((item: any, idx: number) => {
  return buildEnrichedLegalSource(item, idx);
});

console.log("Enriched records count:", enrichedData.length);

// Verify samples
console.log("\n--- Sample 1: Page 1 ---");
console.log("Title:", enrichedData[0].title);
console.log("Text preview:", enrichedData[0].text.slice(0, 150) + "...");

console.log("\n--- Sample 2: Page 5 ---");
const p5 = enrichedData.find((d: any) => d.metadata?.page === 5);
if (p5) {
  console.log("Title:", p5.title);
  console.log("Text preview:", p5.text.slice(0, 150) + "...");
}

console.log("\n--- Sample 3: Page 71 ---");
const p71 = enrichedData.find((d: any) => d.metadata?.page === 71);
if (p71) {
  console.log("Title:", p71.title);
  console.log("Text preview:", p71.text.slice(0, 150) + "...");
}

fs.writeFileSync(dataFilePath, JSON.stringify(enrichedData, null, 2), "utf-8");
console.log("\nSuccessfully wrote enriched data to server/data/ara_jri_pages_1_to_71.json!");
