// scripts/crawl_pages_1_to_71.js
import fs from "fs";
import path from "path";

async function fetchPage(page) {
  const url = `https://ara.jri.ac.ir/Law/Index?layout=True&page=${page}&Slayout=True`;
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(15000) });
    if (!res.ok) {
      console.warn(`Page ${page} failed with status: ${res.status}`);
      return [];
    }
    const html = await res.text();
    const divLaws = html.split("<div class=\"divLaws\">");
    const items = [];

    for (let i = 1; i < divLaws.length; i++) {
      const chunk = divLaws[i];
      const lawIdMatch = chunk.match(/Laws=(\d+)/) || chunk.match(/id="Title(\d+)"/);
      const lawId = lawIdMatch ? lawIdMatch[1] : `p${page}-${i}`;
      const dateMatch = chunk.match(/<span class="font-weight-normal float-left">([^<]*)<\/span>/);
      const date = dateMatch ? dateMatch[1].trim() : "";
      const ilawsMatch = chunk.match(/href="(https:\/\/ilaws\.net\/ViewText\/\d+)"/);
      const ilawsUrl = ilawsMatch ? ilawsMatch[1] : "";
      const titleMatch = chunk.match(/<div id="Title\d+"[^>]*>([\s\S]*?)<\/div>/);
      let title = titleMatch ? titleMatch[1].replace(/<[^>]+>/g, "").trim().replace(/\s+/g, " ") : "";
      
      const numMatch = title.match(/^(\d+)\)\s*(.*)$/);
      let docNumber = "";
      if (numMatch) {
        docNumber = numMatch[1];
        title = numMatch[2];
      }

      const relatedMatch = chunk.match(/href="\/Judge\/Index\?Laws=\d+">(\d+)\)\s*رأی<\/a>/);
      const relatedCount = relatedMatch ? parseInt(relatedMatch[1], 10) : 0;

      let sourceType = "LAW";
      let category = "قوانین و مقررات";
      let isBinding = false;

      if (title.includes("وحدت") || title.includes("دیوان عالی")) {
        sourceType = "UNITY_JUDGMENT";
        category = "آرای وحدت رویه";
        isBinding = true;
      } else if (title.includes("دیوان عدالت") || title.includes("ابطال")) {
        sourceType = "ADMIN_COURT_JUDGMENT";
        category = "دیوان عدالت اداری";
        isBinding = true;
      } else if (title.includes("قانون") || title.includes("آیین‌نامه") || title.includes("تصویب‌نامه")) {
        sourceType = "LAW";
        category = "قوانین و مقررات";
      }

      let authority = "سامانه ملی آرای قضایی (پژوهشگاه قوه قضاییه)";
      if (title.includes("دیوان عالی")) {
        authority = "هیأت عمومی دیوان عالی کشور";
      } else if (title.includes("دیوان عدالت")) {
        authority = "هیأت عمومی دیوان عدالت اداری";
      }

      items.push({
        id: `src-jri-${lawId}`,
        source_type: sourceType,
        title: title || `مستند قانونی شماره ${lawId}`,
        document_number: docNumber || lawId,
        date: date || "نامشخص",
        authority: authority,
        category: category,
        text: `${title}\n\nتاریخ تصویب/صدور: ${date || "نامشخص"}\nمرجع صالح: ${authority}\nتعداد آرای مرتبط استنادی: ${relatedCount} مورد\nمنبع رسمی: سامانه ملی آرای قضایی پژوهشگاه قوه قضاییه (صفحه ${page} از ۷۱)`,
        keywords: [
          "سامانه ملی آرای قضایی",
          "ara.jri.ac.ir",
          `صفحه ${page}`,
          ...title.split(/[\s،؛]+/g).filter(w => w.length > 3).slice(0, 6)
        ],
        metadata: {
          page: page,
          law_id: lawId,
          source_url: url,
          external_view_url: ilawsUrl,
          related_judgments_url: `https://ara.jri.ac.ir/Judge/Index?Laws=${lawId}`,
          related_judgments_count: relatedCount,
          binding: isBinding,
          source_platform: "سامانه ملی آرای قضایی - پژوهشگاه قوه قضاییه"
        },
        created_at: date || "۱۴۰۳/۰۱/۰۱"
      });
    }

    console.log(`✓ Page ${page}/71: ${items.length} items parsed`);
    return items;
  } catch (err) {
    console.error(`✗ Page ${page}/71 error:`, err.message);
    return [];
  }
}

async function run() {
  console.log("Starting crawl of ara.jri.ac.ir pages 1 to 71...");
  const allItems = [];
  const CONCURRENCY = 6;
  const totalPages = 71;

  for (let i = 1; i <= totalPages; i += CONCURRENCY) {
    const batch = [];
    for (let j = i; j < Math.min(i + CONCURRENCY, totalPages + 1); j++) {
      batch.push(fetchPage(j));
    }
    const results = await Promise.all(batch);
    for (const items of results) {
      allItems.push(...items);
    }
    // small pause to be gentle to server
    await new Promise(r => setTimeout(r, 600));
  }

  console.log(`Successfully scraped total of ${allItems.length} items across 71 pages.`);
  
  const outDir = path.join(process.cwd(), "server", "data");
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  const outPath = path.join(outDir, "ara_jri_pages_1_to_71.json");
  fs.writeFileSync(outPath, JSON.stringify(allItems, null, 2), "utf-8");
  console.log(`Saved output to ${outPath} (${(fs.statSync(outPath).size / 1024 / 1024).toFixed(2)} MB)`);
}

run().catch(console.error);
