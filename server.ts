import express from "express";
import path from "path";
import { GoogleGenAI } from "@google/genai";

async function startServer() {
  
async function generateContentWithRetry(params, maxRetries = 3) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('401: Kunci API Gemini tidak valid atau belum diatur. Silakan masukkan Gemini API Key di environment variables.');
  }
  const ai = new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await ai.models.generateContent(params);
    } catch (error) {
      const is503 = error.status === 503 || (error.message && error.message.includes('503'));
      const is429 = error.status === 429 || (error.message && error.message.includes('429')) || (error.message && error.message.includes('Quota exceeded'));
      
      if (is503 || is429) {
        console.warn(`Gemini API error (503/429), retrying (${i + 1}/${maxRetries})...`);
        if (i === maxRetries - 1) throw error;
        
        // If it's a 429, wait longer since rate limit resets might take time
        let delay = is429 ? 16000 : 2000 * (i + 1);
        
        // Try to extract exact wait time if available in error message
        if (is429 && error.message) {
          const match = error.message.match(/retry in ([\d\.]+)s/);
          if (match && match[1]) {
            delay = Math.ceil(parseFloat(match[1])) * 1000 + 1000;
          }
        }
        
        await new Promise(res => setTimeout(res, delay));
      } else {
        throw error;
      }
    }
  }
}

const app = express();

  const PORT = 3000;

  app.use(express.json());

  app.post("/api/generate-prompt", async (req, res) => {
    try {
      const {
        jenisPlanner,
        temaPlanner,
        styleIlustrasi,
        warnaDominan,
        bahasa,
        targetPengguna,
        ukuran,
        resolusi,
        elemenTambahan,
        judulPlanner,
        subtitle,
        isiPlanner
      } = req.body;


      const prompt = `
Create a highly detailed, professional text prompt for an AI image generator (like Midjourney, DALL-E, or Gemini) to generate a planner design.

User specifications:
- Planner Type: ${jenisPlanner}
- Theme: ${temaPlanner}
- Illustration Style: ${styleIlustrasi}
- Dominant Color: ${warnaDominan}
- Language: ${bahasa}
- Target Audience: ${targetPengguna}
- Size/Aspect Ratio: ${ukuran}
- Resolution/Quality: ${resolusi}
- Additional Elements: ${elemenTambahan?.join(', ') || 'None'}
- Title: ${judulPlanner}
- Subtitle: ${subtitle}
- Content Details: ${isiPlanner}

CRITICAL RULES for the generated text prompt:
1. The generated prompt MUST be written in English.
2. The generated prompt MUST explicitly instruct the AI image generator to use the exact selected language (${bahasa}) for ALL text, labels, headings, days, months, notes, checklists, and any other written elements in the planner design.
3. If the selected language is 'Bahasa Indonesia' or 'Indonesia', explicitly state in the prompt: "All text, days (Senin, Selasa, etc.), months (Januari, Februari, etc.), and labels MUST be in strictly Bahasa Indonesia. No English words. Use 'Rp' for currency (e.g., Rp 10.000, Rp 50.000) and NEVER use $, USD, or Dollar."
4. If the selected language is 'English', explicitly state in the prompt: "All text, days (Monday, Tuesday, etc.), months (January, February, etc.), and labels MUST be in English. Use '$' for currency."
5. If the selected language is 'Jepang' or 'Japanese', explicitly state in the prompt to use '¥' for currency.
6. If the selected language is 'Arab' or 'Arabic', explicitly state in the prompt to use Arabic currency/format.
7. For any financial planners (budget, expense, savings, cash flow, debt, money tracker), strictly enforce the currency symbol based on the selected language (${bahasa}) as defined above.
8. Ensure consistency: no mixed languages in the planner design.
9. The output MUST BE ONLY THE PROMPT TEXT itself, ready to copy-paste.
10. Make it highly descriptive. Include layout structure, style details, color palette, typography style, decorative elements, composition, print-ready quality, high detail, professional design, white background (if applicable), clean layout, editable style, high resolution, 300 DPI, perfect spacing, premium printable planner, and modern composition.
11. Do not include conversational text like "Here is your prompt:". Just output the prompt directly.
`;

      const response = await generateContentWithRetry({
        model: "gemini-3.1-flash-lite",
        contents: prompt,
      });

      res.json({ prompt: response.text });
    } catch (error) {
      console.error("Error generating prompt:", error);
      if (error.status === 401 || (error.message && error.message.includes('401'))) { return res.status(401).json({ error: 'Kunci API Gemini tidak valid atau belum diatur. Silakan masukkan Gemini API Key yang benar melalui menu Pengaturan (ikon gir di pojok).' }); } if (error.status === 503 || (error.message && error.message.includes('503'))) { return res.status(503).json({ error: 'Server AI sedang sibuk (kapasitas penuh). Silakan coba lagi dalam beberapa saat.' }); }
      res.status(500).json({ error: 'Failed to generate prompt. ' + (error.message || '') });
    }
  });

  app.post("/api/generate-buku-aktivitas", async (req, res) => {
    try {
      const {
        jenisHalaman,
        judulBuku,
        subJudul,
        temaBuku,
        gayaIlustrasi,
        warnaDominan,
        ukuran,
        usiaTarget,
        jumlahHalaman,
        jenisAktivitas,
        customAktivitas,
        isiMateri,
        bahasa
      } = req.body;


      const facelessInstruction = gayaIlustrasi.includes('Faceless') ? 
        "\n- CRITICAL FOR FACELESS STYLE: The prompt MUST explicitly instruct generating a faceless Muslim character (no eyes, nose, or mouth). Expressions must be conveyed through body posture and gestures. Characters should wear modest clothing following Islamic values. Avoid elements contrary to Islamic values. Keep the style cute, child-friendly, and consistent." : "";

      let languageInstruction = `\n- The text/language used inside the generated image design MUST BE in ${bahasa}. All titles, instructions, labels, and questions must use this language consistently.`;
      if (bahasa.includes('Arab')) {
        languageInstruction += " Ensure correct Right-to-Left (RTL) Arabic script layout.";
      } else if (bahasa.includes('Jepang')) {
        languageInstruction += " Use appropriate Japanese characters (Hiragana/Katakana/Kanji) suitable for the content.";
      }

      let promptText = "";
      if (jenisHalaman === 'cover') {
        promptText = `
Create a highly detailed, professional text prompt for an AI image generator (like Midjourney, DALL-E, or Gemini) to generate a children's activity book cover.

User specifications:
- Title: ${judulBuku}
- Subtitle: ${subJudul}
- Theme: ${temaBuku}
- Illustration Style: ${gayaIlustrasi}
- Dominant Color: ${warnaDominan}
- Size/Aspect Ratio: ${ukuran}
- Target Audience Age: ${usiaTarget}
- Language inside the book: ${bahasa}

Requirements for the generated prompt:
- The output MUST BE ONLY THE PROMPT TEXT itself, ready to copy-paste.
- It must be in English.
- Make it highly descriptive. Include layout structure, style details, color palette, typography style, child-friendly composition, cute illustration style, white background (if applicable), high resolution, professional design, print-ready quality (300 DPI if A4/F4), premium worksheet design, clear spacing, age appropriate, and high detail.
- Do not include conversational text like "Here is your prompt:". Just output the prompt directly.${languageInstruction}
`;
      } else {
        const pages = parseInt(jumlahHalaman.charAt(0));
        const actualAktivitas = jenisAktivitas === 'Custom' ? customAktivitas : jenisAktivitas;
        const materiString = Array.isArray(isiMateri) ? isiMateri.map((m, i) => `Page ${i + 1}: ${m}`).join(' | ') : isiMateri;
        
        promptText = `
Create highly detailed, professional text prompts for an AI image generator to generate children's activity book pages.
Generate exactly ${pages} distinct prompt(s). 

User specifications:
- Activity Type: ${actualAktivitas}
- Content / Material per page: ${materiString}
- Theme: ${temaBuku}
- Illustration Style: ${gayaIlustrasi}
- Dominant Color: ${warnaDominan}
- Size/Aspect Ratio: ${ukuran}
- Target Audience Age: ${usiaTarget}
- Language inside the book: ${bahasa}

Requirements:
- The output MUST BE A JSON ARRAY of strings, where each string is the prompt for a single page.
- DO NOT wrap the output in markdown code blocks, just output the raw JSON array like: ["prompt 1", "prompt 2"]
- Each prompt must be distinct but characters, colors, and illustration style MUST remain strictly consistent across all pages to form a cohesive activity book.
- English only.
- Include layout structure, style details, color palette, typography style, educational purpose, child-friendly composition, printable worksheet design, high resolution, professional design, print-ready quality (300 DPI), premium worksheet, clear spacing, age-appropriate, and high detail.${languageInstruction}
`;
      }

      const response = await generateContentWithRetry({
        model: "gemini-3.1-flash-lite",
        contents: promptText,
      });

      let results: string[] = [];
      if (jenisHalaman === 'cover') {
        results = [response.text?.trim() || ""];
      } else {
        try {
            const jsonText = (response.text || "").replace(/```json/gi, '').replace(/```/g, '').trim();
            results = JSON.parse(jsonText);
            if (!Array.isArray(results)) {
                results = [response.text || ""];
            }
        } catch (e) {
            results = [response.text || ""];
        }
      }

      res.json({ prompts: results });
    } catch (error) {
      console.error("Error generating prompt:", error);
      if (error.status === 401 || (error.message && error.message.includes('401'))) { return res.status(401).json({ error: 'Kunci API Gemini tidak valid atau belum diatur. Silakan masukkan Gemini API Key yang benar melalui menu Pengaturan (ikon gir di pojok).' }); } if (error.status === 503 || (error.message && error.message.includes('503'))) { return res.status(503).json({ error: 'Server AI sedang sibuk (kapasitas penuh). Silakan coba lagi dalam beberapa saat.' }); }
      res.status(500).json({ error: 'Failed to generate prompt. ' + (error.message || '') });
    }
  });

  app.post("/api/generate-infografis", async (req, res) => {
    try {
      const {
        judul,
        topik,
        jenis,
        customJenis,
        targetAudiens,
        gayaIlustrasi,
        warnaDominan,
        customWarna,
        bahasa,
        ukuran,
        tingkatDetail,
        gayaWarna,
        tambahkanIkon,
        tambahkanIlustrasi
      } = req.body;


      const actualJenis = jenis === 'Custom' ? customJenis : jenis;
      const actualWarna = warnaDominan === 'Custom' ? customWarna : warnaDominan;
      
      let facelessInstruction = "";
      if (gayaIlustrasi.includes('Faceless')) {
        facelessInstruction = "\n- CRITICAL FOR FACELESS STYLE: The prompt MUST explicitly instruct generating a faceless Muslim character (no eyes, nose, or mouth). Expressions must be conveyed through body posture and gestures. Characters should wear modest clothing following Islamic values. Avoid elements contrary to Islamic values. Keep the style modern, professional, and consistent.";
      }
      
      let realisticInstruction = "";
      if (gayaIlustrasi === "Realistic") {
        realisticInstruction = "\n- CRITICAL FOR REALISTIC STYLE: The prompt MUST explicitly instruct generating a highly realistic illustration, photorealistic details, high-end 3D render or photographic quality.";
      }

      let languageInstruction = `\n- The text/language used inside the generated infographic MUST BE in ${bahasa}. All titles, labels, and content must use this language consistently.`;
      if (bahasa.includes('Arab')) {
        languageInstruction += " Ensure correct Right-to-Left (RTL) Arabic script layout.";
      } else if (bahasa.includes('Jepang')) {
        languageInstruction += " Use appropriate Japanese characters (Hiragana/Katakana/Kanji) suitable for the content.";
      }
      
      let elements = [];
      if (tambahkanIkon) elements.push("icon style");
      if (tambahkanIlustrasi) elements.push("illustration style");

      const promptText = `
Create a highly detailed, professional text prompt for an AI image generator to generate an educational infographic.

User specifications:
- Title: ${judul}
- Topic / Content: ${topik}
- Infographic Type: ${actualJenis}
- Target Audience: ${targetAudiens}
- Illustration Style: ${gayaIlustrasi}
- Dominant Color: ${actualWarna}
- Language inside infographic: ${bahasa}
- Aspect Ratio / Output Size: ${ukuran}
- Detail Level: ${tingkatDetail}
- Color Style: ${gayaWarna}
- Additional Elements: ${elements.join(", ") || "None"}

Requirements for the generated prompt:
- The output MUST BE ONLY THE PROMPT TEXT itself, ready to copy-paste.
- It must be in English.
- Make it highly descriptive. Automatically include the following terms based on instructions: infographic title, infographic type, educational layout, clean composition, modern layout, professional spacing, ${tambahkanIkon ? 'icon style, ' : ''}${tambahkanIlustrasi ? 'illustration style, ' : ''}typography, color palette, white background, premium infographic, editable style, highly detailed, high quality, professional graphic design, aspect ratio matching ${ukuran}, ${ukuran.includes('Print Ready') ? 'print ready, 300 DPI, ' : ''}readable typography, balanced composition, premium infographic design.
- Do not include conversational text like "Here is your prompt:". Just output the prompt directly.${realisticInstruction}${languageInstruction}
`;

      const response = await generateContentWithRetry({
        model: "gemini-3.1-flash-lite",
        contents: promptText,
      });

      res.json({ prompt: response.text?.trim() || "" });
    } catch (error) {
      console.error("Error generating prompt:", error);
      if (error.status === 401 || (error.message && error.message.includes('401'))) { return res.status(401).json({ error: 'Kunci API Gemini tidak valid atau belum diatur. Silakan masukkan Gemini API Key yang benar melalui menu Pengaturan (ikon gir di pojok).' }); } if (error.status === 503 || (error.message && error.message.includes('503'))) { return res.status(503).json({ error: 'Server AI sedang sibuk (kapasitas penuh). Silakan coba lagi dalam beberapa saat.' }); }
      res.status(500).json({ error: 'Failed to generate prompt. ' + (error.message || '') });
    }
  });

  app.post("/api/generate-buku-cerita", async (req, res) => {
    try {
      const {
        judul,
        namaPembuat,
        temaCerita,
        customTema,
        jumlahHalaman,
        customJumlahHalaman,
        sinopsis,
        ceritaLengkap,
        namaKarakter,
        deskripsiKarakter,
        facelessMode,
        gayaIlustrasi,
        warnaDominan,
        bahasa,
        usiaPembaca,
        ukuran
      } = req.body;


      const actualTema = temaCerita === 'Custom' ? customTema : temaCerita;
      const actualHalaman = jumlahHalaman === 'Custom' ? parseInt(customJumlahHalaman) : parseInt(jumlahHalaman.charAt(0));
      const pagesCount = isNaN(actualHalaman) || actualHalaman < 1 ? 1 : actualHalaman;
      
      let facelessInstruction = "";
      if (facelessMode) {
        facelessInstruction = "\n- CRITICAL FOR FACELESS STYLE: The prompt MUST explicitly instruct generating faceless characters (no facial features, no eyes, no nose, no mouth). Expressions must be conveyed through body language only. All female characters MUST wear modest hijab. All characters wear modest Islamic clothing (loose, neat, child-friendly, no tight or revealing clothes). The style remains cute, warm, child-friendly, and colorful. The character design must be strictly consistent across every page. Additionally, you MUST automatically append the following exact phrase to every generated prompt: 'faceless characters, no facial features, no eyes, no nose, no mouth, expressions through body language only, all female characters wear modest hijab, modest Islamic clothing, child-friendly illustration, consistent character design across every page, colorful children\\'s book illustration, high detail, premium storybook style'.";
      }
      
      let languageInstruction = `\n- The text/language used inside the generated illustration (e.g. for book title or page text spaces) MUST BE in ${bahasa}. All titles and labels must use this language.`;
      if (bahasa.includes('Arab')) {
        languageInstruction += " Ensure correct Right-to-Left (RTL) Arabic script layout.";
      } else if (bahasa.includes('Jepang')) {
        languageInstruction += " Use appropriate Japanese characters (Hiragana/Katakana/Kanji).";
      }

      let authorInstruction = "";
      if (namaPembuat && namaPembuat.trim() !== "") {
        authorInstruction = `\n- CRITICAL FOR PAGE 1 (COVER): Display the author's name below the title using smaller typography with the text "oleh ${namaPembuat}". DO NOT include the author name "${namaPembuat}" on any page other than Page 1.`;
      }

      let coverInstruction = `\n- CRITICAL FOR PAGE 1 (COVER): The first page MUST be a Book Cover, not an interior page. It MUST NOT display any story text, paragraphs, dialogue, captions, speech bubbles, moral messages, or interior page elements. Automatically append this exact phrase to the image prompt for Page 1: "Create a professional children's storybook cover only. Do NOT include any story text, paragraphs, dialogue, captions, speech bubbles, moral messages, or page content. The cover must contain only the book title${namaPembuat && namaPembuat.trim() !== "" ? ", the author's name," : ""} and a beautiful full-page illustration representing the story. Use a clean, premium children's book cover layout with balanced composition, large readable title typography, attractive cover illustration, and plenty of clean space. No interior page elements. No body text. Print-ready quality."`;

      const promptText = `
Create highly detailed, professional text prompts for an AI image generator to generate a children's storybook.

User specifications:
- Book Title: ${judul}
- Author Name: ${namaPembuat || 'None'}
- Story Theme: ${actualTema}
- Total Pages: ${pagesCount}
- Synopsis: ${sinopsis}
- Main Character Name: ${namaKarakter}
- Main Character Description: ${deskripsiKarakter}
- Illustration Style: ${gayaIlustrasi}
- Dominant Color: ${warnaDominan}
- Book Language: ${bahasa}
- Target Reader Age: ${usiaPembaca}
- Aspect Ratio / Output Size: ${ukuran}

Requirements for the generated prompts:
- The output MUST BE A JSON ARRAY of strings, where each string is the prompt for a single page.
- DO NOT wrap the output in markdown code blocks, just output the raw JSON array like: ["prompt 1", "prompt 2"]
- The array MUST have exactly ${pagesCount} items.
- PAGE 1 MUST BE THE BOOK COVER: The prompt for page 1 must explicitly instruct a "Premium children's book cover", include the book title, main character, story theme, beautiful composition, large title area, attractive layout, and professional book cover design.
- PAGES 2 TO ${pagesCount} MUST BE STORY ILLUSTRATIONS: You MUST develop the "Synopsis" into an engaging, natural, and easy-to-understand narrative. Each page must illustrate its corresponding story segment with a different scene, composition, background, and character pose, BUT MUST strictly maintain consistency in the main character's design, clothing color, illustration style, character age, and proportions across all pages. Provide space in the illustration for text placement.

STORY TEXT RULES (Pages 2 to ${pagesCount}):
- Write the Story Text using the chosen language (${bahasa}), appropriate for the target reader age (${usiaPembaca}).
- Develop the narrative progressively across pages: Introduction to characters/setting -> Initial conflict -> Conflict development -> Climax -> Resolution -> Satisfying ending -> Moral message (if applicable to the theme).
- Length: Minimum 20 words, Maximum 80 words per page.
- Each page MUST continue the story from the previous page smoothly, forming a cohesive book.
- DO NOT repeat the same sentences on consecutive pages.

FORMAT FOR EACH PAGE (Each string in the JSON array MUST contain two sections exactly like this):

Story Text
[Insert the exact story text for this page in ${bahasa}. For the cover (Page 1), this is just the book title${namaPembuat ? ` and "oleh ${namaPembuat}"` : ''}]

Image Prompt
[Insert the highly descriptive image generation prompt in English here. It MUST describe the scene in the Story Text.]

- FOR PAGES 2 TO ${pagesCount} (INTERIOR PAGES): You MUST include instructions to generate a complete page, not just an illustration. Automatically append this exact phrase to the image prompt for Pages 2 to ${pagesCount}: "Design a complete children's storybook page combining both illustration and fully rendered story text in one layout, leaving adequate margins and white space so the text is highly readable. Professional page layout, safe text margins, readable font, high readability, consistent character, consistent clothing, consistent illustration style, consistent background style, ready to print."
- Aspect ratio for all pages must match ${ukuran}.
- English only for the image prompt text itself.
- Make each image prompt highly descriptive.${coverInstruction}${authorInstruction}${languageInstruction}
`;

      const response = await generateContentWithRetry({
        model: "gemini-3.1-flash-lite",
        contents: promptText,
      });

      let results: string[] = [];
      try {
          const jsonText = (response.text || "").replace(/```json/gi, '').replace(/```/g, '').trim();
          results = JSON.parse(jsonText);
          if (!Array.isArray(results)) {
              results = [response.text || ""];
          }
      } catch (e) {
          results = [response.text || ""];
      }

      res.json({ prompts: results });
    } catch (error) {
      console.error("Error generating prompt:", error);
      if (error.status === 401 || (error.message && error.message.includes('401'))) { return res.status(401).json({ error: 'Kunci API Gemini tidak valid atau belum diatur. Silakan masukkan Gemini API Key yang benar melalui menu Pengaturan (ikon gir di pojok).' }); } if (error.status === 503 || (error.message && error.message.includes('503'))) { return res.status(503).json({ error: 'Server AI sedang sibuk (kapasitas penuh). Silakan coba lagi dalam beberapa saat.' }); }
      res.status(500).json({ error: 'Failed to generate prompt. ' + (error.message || '') });
    }
  });

  app.post("/api/generate-buku-resep", async (req, res) => {
    try {
      const {
        judul,
        namaPembuat,
        pagesCount,
        recipes,
        gayaDesain,
        gayaFoto,
        sudutGambar,
        warnaDominan,
        customWarnaDominan,
        bahasa,
        ukuran
      } = req.body;

      if (!judul) {
        return res.status(400).json({ error: "Judul Buku Resep wajib diisi." });
      }

      if (!process.env.GEMINI_API_KEY) {
        // Return dummy response if no API key
        console.warn("GEMINI_API_KEY is not set. Returning dummy prompts.");
        const prompts = [];
        prompts.push(`Story Text\n${judul}\n\nImage Prompt\nCover design for ${judul}...`);
        for (let i = 2; i <= pagesCount; i++) {
          prompts.push(`Story Text\nRecipe ${i}\n\nImage Prompt\nRecipe illustration...`);
        }
        return res.json({ prompts });
      }


      let recipesText = "";
      if (pagesCount > 1 && recipes && recipes.length > 0) {
        recipes.forEach((r: any, idx: number) => {
          recipesText += `\nPage ${idx + 2} Recipe Name: ${r.nama || 'Auto generate'}`;
          if (r.deskripsi) {
            recipesText += `\nPage ${idx + 2} Recipe Description/Instructions: ${r.deskripsi}`;
          }
        });
      }

      const authorInstruction = namaPembuat ? `\n- Author Name: ${namaPembuat}` : "";
      const languageInstruction = `\n- Output Language: ${bahasa}`;

      const actualWarnaDominan = warnaDominan === "Custom" ? (customWarnaDominan || "Custom") : warnaDominan;

      let extraStyleInstructions = "";
      if (gayaFoto.includes("Photography") || gayaFoto.includes("Restaurant") || gayaFoto.includes("Cafe")) {
        extraStyleInstructions = "- Ensure the image prompt requests realistic food photography with professional lighting, clear food textures, attractive plating, and professional culinary photography quality.";
      } else if (gayaFoto === "Children's Cookbook Illustration") {
        extraStyleInstructions = "- Ensure the image prompt requests illustrations that are cheerful, colorful, child-friendly, and easily recognizable.";
      } else if (gayaFoto.includes("Illustration") || gayaFoto.includes("Drawn") || gayaFoto.includes("Sketch")) {
        extraStyleInstructions = "- Ensure the image prompt requests an illustration in the chosen style, maintaining accurate and attractive food shapes.";
      }
      
      if (gayaFoto.includes("Islamic") || gayaFoto.includes("Halal")) {
        extraStyleInstructions += "\n- Ensure the image prompt requests an elegant Islamic atmosphere, warm colors, tasteful Islamic ornaments, and only depicts Halal food.";
      }

      const prompt = `You are an expert cookbook designer, food stylist, and AI prompt engineer.
Your task is to generate image generation prompts for a cookbook titled "${judul}".
Total pages required: ${pagesCount}.

Style Guidelines:
- Design Style: ${gayaDesain}
- Photography/Illustration Style: ${gayaFoto}
${extraStyleInstructions}
- Camera Angle: ${sudutGambar}
- Dominant Color: ${actualWarnaDominan}
- Aspect Ratio: ${ukuran}
${authorInstruction}
${languageInstruction}

RECIPE INFORMATION FOR PAGES 2 TO ${pagesCount}:
${recipesText}

INSTRUCTIONS FOR THE OUTPUT:
- You MUST return ONLY a valid JSON array of strings. 
- DO NOT wrap the output in markdown code blocks, just output the raw JSON array like: ["prompt 1", "prompt 2"]
- The array MUST have exactly ${pagesCount} items.
- PAGE 1 MUST BE THE COOKBOOK COVER: The prompt for page 1 must explicitly instruct a "Cookbook cover", include the book title${namaPembuat ? ` and author "${namaPembuat}"` : ''}, beautiful food photography or illustration, large title area, attractive layout, and professional cookbook cover design.
- PAGES 2 TO ${pagesCount} MUST BE RECIPE PAGES: You MUST develop the recipe based on the provided recipe name and description. 
  - If a description is provided, you MUST use it as the main reference.
  - If the description is empty, you MUST automatically develop the recipe using common culinary knowledge, making logical cooking steps, complete and realistic ingredients.
  - Each page must contain ONLY ONE recipe.
  - Provide space in the illustration/layout for text placement.

STORY TEXT (RECIPE CONTENT) RULES (Pages 2 to ${pagesCount}):
- Write the Recipe Text using the chosen language (${bahasa}).
- Each recipe MUST include:
  1. Recipe Title
  2. Complete Ingredients List
  3. Step-by-step Cooking Instructions (Clear, sequential, easy to understand)
- DO NOT add any conversational filler, introductory phrases (like 'Berikut adalah...'), or general explanations of the food (e.g. DO NOT explain "Es campur adalah..."). Output ONLY the recipe title, ingredients, and cooking process directly.

FORMAT FOR EACH PAGE (Each string in the JSON array MUST contain two sections exactly like this):

Judul
[Insert the exact text for this page in ${bahasa}. For the cover (Page 1), this is just the book title${namaPembuat ? ` and "oleh ${namaPembuat}"` : ''}. For interior pages, this is the fully formatted recipe starting directly with the title.]

Image Prompt
[Insert the highly descriptive image generation prompt in English here. It MUST describe the food and layout.]

- FOR PAGES 2 TO ${pagesCount} (INTERIOR PAGES): You MUST include instructions to generate a complete page, not just an illustration. Automatically append this exact phrase to the image prompt for Pages 2 to ${pagesCount}: "Complete cookbook page including recipe title, ingredients list, step-by-step cooking instructions, beautiful food photography or illustration, clean cookbook layout, readable typography, premium cookbook design, balanced composition, high detail, print ready, space between image and text, elegant page layout."
- Aspect ratio for all pages must match ${ukuran}.
- English only for the image prompt text itself.
- Make each image prompt highly descriptive.`;

      const response = await generateContentWithRetry({
        model: "gemini-3.1-flash-lite",
        contents: prompt,
        config: {
          temperature: 0.7,
        }
      });

      const text = response.text;
      if (!text) {
        throw new Error("Empty response from Gemini API");
      }

      let parsedPrompts: string[] = [];
      try {
        const cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim();
        parsedPrompts = JSON.parse(cleanedText);
      } catch (parseError) {
        console.error("Failed to parse JSON response:", text);
        // Attempt to extract array using regex
        const arrayMatch = text.match(/\[([\s\S]*)\]/);
        if (arrayMatch) {
          try {
            parsedPrompts = JSON.parse(arrayMatch[0]);
          } catch (e) {
             throw new Error("Failed to parse the prompt output from Gemini API.");
          }
        } else {
           throw new Error("Failed to parse the prompt output from Gemini API.");
        }
      }

      if (!Array.isArray(parsedPrompts) || parsedPrompts.length !== pagesCount) {
        console.warn(`Expected ${pagesCount} prompts, got ${parsedPrompts.length}`);
      }

      res.json({ prompts: parsedPrompts });

    } catch (error) {
      console.error("Error generating cookbook prompts:", error);
      if (error.status === 401 || (error.message && error.message.includes('401'))) { return res.status(401).json({ error: 'Kunci API Gemini tidak valid atau belum diatur. Silakan masukkan Gemini API Key yang benar melalui menu Pengaturan (ikon gir di pojok).' }); } if (error.status === 503 || (error.message && error.message.includes('503'))) { return res.status(503).json({ error: 'Server AI sedang sibuk (kapasitas penuh). Silakan coba lagi dalam beberapa saat.' }); }
      res.status(500).json({ error: 'Failed to generate prompts. ' + (error.message || '') });
    }
  });
  app.post("/api/generate-komik", async (req, res) => {
    try {
      const {
        judul,
        namaPembuat,
        gayaKomik,
        customGayaKomik,
        sinopsis,
        pagesCount,
        namaKarakter,
        umur,
        jenisKelamin,
        deskripsiKarakter,
        gayaIlustrasi,
        facelessMode,
        warnaDominan,
        bahasa,
        ukuran
      } = req.body;

      if (!judul) {
        return res.status(400).json({ error: "Judul Komik wajib diisi." });
      }

      if (!process.env.GEMINI_API_KEY) {
        console.warn("GEMINI_API_KEY is not set. Returning dummy prompts.");
        const prompts = [];
        prompts.push(`Story Text\n${judul}\n\nImage Prompt\nCover design for ${judul}...`);
        for (let i = 2; i <= pagesCount; i++) {
          prompts.push(`Story Text\nComic page ${i}\n\nImage Prompt\nComic illustration...`);
        }
        return res.json({ prompts });
      }


      const actualGayaKomik = gayaKomik === "Custom" ? customGayaKomik : gayaKomik;
      
      let facelessInstruction = "";
      if (facelessMode) {
        facelessInstruction = `
- CRITICAL FOR FACELESS MODE: All characters MUST be completely faceless (no eyes, no nose, no mouth). 
- Expressions must be conveyed purely through body language, posture, and gestures.
- ${jenisKelamin === 'Perempuan' ? 'Because the character is female, she MUST wear a hijab/headscarf.' : ''}
- Automatically append this exact phrase to EVERY image prompt: "faceless characters, no facial features, no eyes, no nose, no mouth, expressions through body language only${jenisKelamin === 'Perempuan' ? ', female character wearing modest hijab' : ''}".`;
      } else {
        facelessInstruction = `
- Characters have normal facial features according to the ${gayaIlustrasi} style.`;
      }

      let extraStyleInstruction = "";
      if (actualGayaKomik.toLowerCase().includes("islami")) {
        extraStyleInstruction = `
- ISLAMIC STYLE REQUIREMENTS:
  - Maintain Islamic etiquette (adab).
  - Modest clothing.
  - Female characters MUST wear hijab.
  - No inappropriate or sinful elements (maksiat).
  - Polite dialogue and positive Islamic moral values.
  - Elegant, warm Islamic atmosphere.`;
      } else if (actualGayaKomik.toLowerCase().includes("horor")) {
        extraStyleInstruction = `
- HORROR STYLE REQUIREMENTS:
  - Create a tense, suspenseful atmosphere.
  - NO extreme gore, NO excessive blood, NO extreme sadism.
  - Focus on mystery, shadows, lighting, tension, and atmospheric dread.`;
      }

      const authorInstruction = namaPembuat ? `\n- Author Name: ${namaPembuat}` : "";
      
      const prompt = `You are an expert comic book creator, story writer, manga editor, UI/UX designer, and AI prompt engineer.
Your task is to generate image generation prompts for a comic book titled "${judul}".
Total pages required: ${pagesCount}.

Comic Specifications:
- Title: ${judul}${authorInstruction}
- Comic Genre/Style: ${actualGayaKomik}
- Synopsis: ${sinopsis}
- Dominant Color: ${warnaDominan}
- Output Language: ${bahasa}
- Aspect Ratio: ${ukuran}

Main Character Details:
- Name: ${namaKarakter}
- Age: ${umur}
- Gender: ${jenisKelamin}
- Character Description (Personality, Clothing, Accessories, Hair): ${deskripsiKarakter}

Illustration Style: ${gayaIlustrasi}${extraStyleInstruction}

INSTRUCTIONS FOR THE OUTPUT:
- You MUST return ONLY a valid JSON array of strings. 
- DO NOT wrap the output in markdown code blocks, just output the raw JSON array like: ["prompt 1", "prompt 2"]
- The array MUST have exactly ${pagesCount} items.
- Character consistency is CRITICAL. The main character must look exactly the same across all pages (clothing, colors, proportions, style).

PAGE 1 (COVER) RULES:
- The prompt for page 1 MUST explicitly instruct a "Comic Book Cover".
- The cover must ONLY contain: The Title, Author Name (if provided), Main Character(s), Cover Illustration, and optional volume logo.
- The cover MUST NOT contain: Dialogue, speech bubbles, narration, story content, or comic panels.

PAGES 2 TO ${pagesCount} (COMIC PAGES) RULES:
- You MUST develop the provided synopsis into a full comic story across these pages.
- Each page MUST have a randomly chosen number of panels between 3 and 6 (e.g., page 2 has 4 panels, page 3 has 5 panels, etc.) to keep the visual rhythm interesting.
- Each panel MUST have: A scene, character pose, background, dialogue/narration, expression, and varying camera angles.
- The panels must flow logically to tell the story.
- Generate a cohesive "Story Text" section that outlines the panels and dialogue for that page in ${bahasa}.

FORMAT FOR EACH PAGE (Each string in the JSON array MUST contain two sections exactly like this):

Story Text
[For Page 1: Just the Title and Author. For Pages 2+: Provide the full text content developed from the synopsis in ${bahasa}. Example: 
Panel 1: (Scene description)
Dialog: "..."
Panel 2: (Scene description)
Narration: "..."
...etc.]

Image Prompt
[Insert the highly descriptive image generation prompt in English here. It MUST describe the visual layout and characters in detail.]

- For Pages 2+, automatically append this exact phrase to the image prompt: "Complete comic page including comic panels, speech bubbles, narration boxes, professional comic layout, dynamic composition, cinematic camera angles, readable typography, consistent character design, consistent clothing, consistent background, comic page composition, premium comic book quality, ${ukuran.includes('Print') ? 'print ready' : 'aspect ratio ' + ukuran}."
- English only for the image prompt text itself.
- Make each image prompt highly descriptive.`;

      const response = await generateContentWithRetry({
        model: "gemini-3.1-flash-lite",
        contents: prompt,
        config: {
          temperature: 0.7,
        }
      });

      const text = response.text;
      if (!text) {
        throw new Error("Empty response from Gemini API");
      }

      let parsedPrompts: string[] = [];
      try {
        const cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim();
        parsedPrompts = JSON.parse(cleanedText);
      } catch (parseError) {
        const arrayMatch = text.match(/\[([\s\S]*)\]/);
        if (arrayMatch) {
          try {
            parsedPrompts = JSON.parse(arrayMatch[0]);
          } catch (e) {
             throw new Error("Failed to parse the prompt output from Gemini API.");
          }
        } else {
           throw new Error("Failed to parse the prompt output from Gemini API.");
        }
      }

      res.json({ prompts: parsedPrompts });

    } catch (error) {
      console.error("Error generating comic prompts:", error);
      if (error.status === 401 || (error.message && error.message.includes('401'))) { return res.status(401).json({ error: 'Kunci API Gemini tidak valid atau belum diatur. Silakan masukkan Gemini API Key yang benar melalui menu Pengaturan (ikon gir di pojok).' }); } if (error.status === 503 || (error.message && error.message.includes('503'))) { return res.status(503).json({ error: 'Server AI sedang sibuk (kapasitas penuh). Silakan coba lagi dalam beberapa saat.' }); }
      res.status(500).json({ error: 'Failed to generate prompts. ' + (error.message || '') });
    }
  });

  app.post("/api/generate-buku-doa", async (req, res) => {
    try {
      const {
        judulBuku,
        namaPembuat,
        jenisBukuDoa,
        customJenisBukuDoa,
        jumlahHalaman,
        customJumlahHalaman,
        targetPembaca,
        gayaDesain,
        gayaIlustrasi,
        facelessMode,
        warnaDominan,
        ukuran,
        actualHalaman,
        doaList
      } = req.body;

      const finalJenisBuku = jenisBukuDoa === 'Custom' ? customJenisBukuDoa : jenisBukuDoa;
      const pagesCount = isNaN(actualHalaman) || actualHalaman < 1 ? 1 : actualHalaman;

      let facelessInstruction = "";
      if (facelessMode) {
        facelessInstruction = "\n- CRITICAL FOR FACELESS STYLE: The prompt MUST explicitly instruct generating faceless characters (no facial features, no eyes, no nose, no mouth). Expressions must be conveyed through body language only. All female characters MUST wear modest hijab. All characters wear modest Islamic clothing (loose, neat, child-friendly, no tight or revealing clothes). The style remains cute, warm, child-friendly, and colorful. The character design must be strictly consistent across every page. Additionally, you MUST automatically append the following exact phrase to every generated prompt: 'faceless characters, no facial features, no eyes, no nose, no mouth, expressions through body language only, all female characters wear modest hijab, modest Islamic clothing, child-friendly illustration, consistent character design across every page, colorful children\\'s book illustration, high detail, premium storybook style'.";
      }

      let doaDetails = "";
      doaList.forEach((doa: any, idx: number) => {
         doaDetails += `\nPage ${idx + 2} (Doa ${idx + 1}): Name: ${doa.namaDoa || "Suggest a relevant doa based on the book type"}. Content Guidance: ${doa.materiDoa || "Use the provided Name to generate the actual Arabic text, Latin transliteration, and meaning."}`;
      });

      const prompt = `
Create highly detailed, professional text prompts for an AI image generator (like Midjourney, DALL-E, or Gemini) to generate pages for a Buku Doa (Islamic Prayer Book).

Book Specifications:
- Book Title: ${judulBuku || "Kumpulan Doa"}
- Author: ${namaPembuat || "Not specified"}
- Prayer Book Type: ${finalJenisBuku}
- Target Audience: ${targetPembaca}
- Design Style: ${gayaDesain}
- Illustration Style: ${gayaIlustrasi}
- Dominant Color: ${warnaDominan}
- Output Size/Format: ${ukuran}
- Language for Translation: Indonesian
- Total Pages: ${pagesCount} (Page 1 is ALWAYS the Book Cover)


Doa Details per page:
${doaDetails}

CRITICAL RULES FOR EACH PROMPT:
1. Generate an array of JSON strings, where each element is the image prompt for a specific page.
2. The output MUST BE VALID JSON ARRAY OF STRINGS: \`["prompt for page 1", "prompt for page 2"]\`.
3. Do not include markdown code blocks like \`\`\`json. Just the raw array.
4. Each prompt MUST be highly descriptive, written in ENGLISH, and ready to be copy-pasted into an AI image generator.
5. All text inside the generated image MUST BE accurately described in the prompt.
6. The Arabic text must be generated by the AI image generator, so you must explicitly instruct the image generator to render the exact Arabic text. 
7. DO NOT use conversational text in the output. ONLY return the JSON array of strings.

PAGE 1 (Cover):
- MUST ONLY contain the Book Title, Author Name (if provided), Islamic illustrations, and professional cover design.
- MUST NOT contain any actual prayer text, Arabic, Latin, or translations.

PAGE 2 ONWARDS (Prayer Pages):
- Each page must contain exactly one prayer (Doa).
- Each page MUST explicitly include these 4 elements clearly instructed in the prompt:
  1. The Prayer Title (e.g., "Doa Sebelum Tidur").
  2. The precise Arabic text (with beautiful typography and harakat).
  3. The Latin transliteration.
  4. The translation meaning in Indonesian.
- Include instructions for an illustration matching the prayer theme.
- Include instructions for beautiful Islamic typography, readable text, child-friendly layout (if target is kids), professional design, balanced composition, and print-ready quality.
- If the user provided 'Content Guidance' (Materi Doa) for a page, use it. If it's empty or says "Suggest a relevant doa...", YOU must provide a common and relevant prayer based on the book type.

Example Format for a Page Prompt:
"Complete Islamic prayer book page design. Book Title: [Title]. Prayer Title: [Prayer Title]. Arabic Text: [Actual Arabic Text]. Latin: [Transliteration]. Translation: [Meaning]. Typography: Beautiful Arabic calligraphy, clear readable sans-serif for Latin/Translation. Layout: Professional, balanced, [Style] style. Illustration: [Describe matching illustration]. Colors: [Dominant Color]. Aspect ratio: [Size]."
`;

      const response = await generateContentWithRetry({
        model: "gemini-3.1-flash-lite",
        contents: prompt,
        config: {
          temperature: 0.7,
          responseMimeType: "application/json",
          responseSchema: {
            type: "ARRAY",
            items: {
              type: "STRING"
            }
          }
        }
      });

      const text = response.text;
      if (!text) {
        throw new Error("Empty response from Gemini API");
      }

      let parsedPrompts: string[] = [];
      try {
        const cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim();
        parsedPrompts = JSON.parse(cleanedText);
      } catch (parseError) {
        const arrayMatch = text.match(/\[([\s\S]*)\]/);
        if (arrayMatch) {
          try {
            parsedPrompts = JSON.parse(arrayMatch[0]);
          } catch (e) {
             throw new Error("Failed to parse the prompt output from Gemini API.");
          }
        } else {
           throw new Error("Failed to parse the prompt output from Gemini API.");
        }
      }

      res.json({ prompts: parsedPrompts });

    } catch (error) {
      console.error("Error generating buku doa prompts:", error);
      if (error.status === 401 || (error.message && error.message.includes('401'))) { return res.status(401).json({ error: 'Kunci API Gemini tidak valid atau belum diatur. Silakan masukkan Gemini API Key yang benar melalui menu Pengaturan (ikon gir di pojok).' }); } if (error.status === 503 || (error.message && error.message.includes('503'))) { return res.status(503).json({ error: 'Server AI sedang sibuk (kapasitas penuh). Silakan coba lagi dalam beberapa saat.' }); }
      res.status(500).json({ error: 'Failed to generate prompts. ' + (error.message || '') });
    }
  });

  
  app.post("/api/generate-amplop", async (req, res) => {
    try {
      const {
        jenisAmplop,
        customJenisAmplop,
        ukuranAmplop,
        customLebar,
        customTinggi,
        customSatuan,
        ukuranKertas,
        headline,
        gayaDesain,
        warnaDominan,
        customWarnaDominan,
        elemenDekorasi,
        customElemenDekorasi,
        bahasa
      } = req.body;

      const finalJenisAmplop = jenisAmplop === 'Custom' ? customJenisAmplop : jenisAmplop;

      let finalUkuranAmplop = ukuranAmplop;
      if (ukuranAmplop === 'Custom') {
        finalUkuranAmplop = customLebar + " x " + customTinggi + " " + (customSatuan || "mm");
      } else {
        const match = ukuranAmplop.match(/\((.*?)\)/);
        if (match) {
          finalUkuranAmplop = match[1];
        }
      }

      const finalWarnaDominan = warnaDominan === 'Custom' ? customWarnaDominan : warnaDominan;
      const finalElemenDekorasi = elemenDekorasi === 'Custom' ? customElemenDekorasi : elemenDekorasi;

      const ukuranKertasParts = ukuranKertas.split(' ');
      const paperSize = ukuranKertasParts[0];
      const orientation = ukuranKertasParts[1] || 'Portrait';

      let tinggi = "";
      let lebarDepan = "";
      let glueArea = "";
      let tutupAtas = "";
      let tutupBawah = "";
      let totalUnfolded = "";

      if (finalUkuranAmplop.includes("7 × 9") || finalUkuranAmplop === "7 × 9 cm") {
        tinggi = "9 cm";
        lebarDepan = "7 cm";
        glueArea = "0.8 cm";
        tutupAtas = "2 cm";
        tutupBawah = "1 cm";
        totalUnfolded = "10.6 × 12 cm";
      } else if (finalUkuranAmplop.includes("8 × 12") || finalUkuranAmplop === "8 × 12 cm") {
        tinggi = "12 cm";
        lebarDepan = "8 cm";
        glueArea = "1 cm";
        tutupAtas = "2.5 cm";
        tutupBawah = "1 cm";
        totalUnfolded = "11 × 15.5 cm";
      } else if (finalUkuranAmplop.includes("8.5 × 16") || finalUkuranAmplop === "8.5 × 16 cm" || finalUkuranAmplop.includes("8.5 x 16") || finalUkuranAmplop.includes("8 × 16")) {
        tinggi = "16 cm";
        lebarDepan = "8.5 cm";
        glueArea = "1.5 cm";
        tutupAtas = "3 cm";
        tutupBawah = "1.5 cm";
        totalUnfolded = "18.5 × 20.5 cm";
      } else if (finalUkuranAmplop.includes("110 × 220") || finalUkuranAmplop === "11 × 22 cm" || finalUkuranAmplop.includes("11 x 22") || finalUkuranAmplop.includes("110 x 220")) {
        tinggi = "22 cm";
        lebarDepan = "11 cm";
        glueArea = "1.5 cm";
        tutupAtas = "4 cm";
        tutupBawah = "2 cm";
        totalUnfolded = "16 × 28 cm";
      } else if (finalUkuranAmplop.includes("130 × 230") || finalUkuranAmplop === "13 × 23 cm" || finalUkuranAmplop.includes("13 x 23") || finalUkuranAmplop.includes("130 x 230")) {
        tinggi = "23 cm";
        lebarDepan = "13 cm";
        glueArea = "1.5 cm";
        tutupAtas = "4 cm";
        tutupBawah = "2 cm";
        totalUnfolded = "18 × 29 cm";
      } else if (finalUkuranAmplop.includes("150 × 250") || finalUkuranAmplop === "15 × 25 cm" || finalUkuranAmplop.includes("15 x 25") || finalUkuranAmplop.includes("150 x 250")) {
        tinggi = "25 cm";
        lebarDepan = "15 cm";
        glueArea = "1.5 cm";
        tutupAtas = "4.5 cm";
        tutupBawah = "2 cm";
        totalUnfolded = "20 × 31.5 cm";
      } else if (finalUkuranAmplop.includes("170 × 260") || finalUkuranAmplop === "17 × 26 cm" || finalUkuranAmplop.includes("17 x 26") || finalUkuranAmplop.includes("170 x 260")) {
        tinggi = "26 cm";
        lebarDepan = "17 cm";
        glueArea = "2 cm";
        tutupAtas = "5 cm";
        tutupBawah = "2 cm";
        totalUnfolded = "23 × 33 cm";
      } else {
        let w = customLebar || "Width";
        let h = customTinggi || "Height";
        let unit = customSatuan || "cm";
        if(unit === "mm" && w !== "Width") w = (parseFloat(w) / 10).toString();
        if(unit === "mm" && h !== "Height") h = (parseFloat(h) / 10).toString();
        
        tinggi = `${h} cm`;
        lebarDepan = `${w} cm`;
        glueArea = `≈ 10–12% × Lebar Depan`;
        tutupAtas = `≈ 18–22% × Tinggi`;
        tutupBawah = `≈ 8–10% × Tinggi`;
        totalUnfolded = `Lebar Depan + Area Lem + (Toleransi) × Tinggi + Flap Atas + Flap Bawah`;
      }

      const outputPrompt = `Create a PROFESSIONAL ENGINEERING BLUEPRINT of a REAL UNFOLDED FLAT 2D PRINTABLE DIE-CUT ENVELOPE TEMPLATE viewed from a PERFECT 90° ORTHOGRAPHIC TOP-DOWN VIEW.

IMPORTANT:

This is NOT a mockup.

This is NOT a folded envelope.

This is NOT a 3D render.

This is NOT perspective.

This is a real commercial envelope dieline shown completely unfolded on a clean white background.

Canvas:

${ukuranKertas}

Pure white background

Large clean margins

Ultra high resolution

Print-ready 300 DPI

Vector graphic quality

Crisp black engineering outlines

━━━━━━━━━━━━━━━━━━━━━━

OVERALL LAYOUT

━━━━━━━━━━━━━━━━━━━━━━

The envelope consists of TWO MAIN RECTANGULAR PANELS placed horizontally.

LEFT PANEL (Back Face)

Width exactly ${lebarDepan}

Height exactly ${tinggi}

Background:

${finalWarnaDominan}

Generate a premium back panel design matching the selected style.

If the envelope type requires address information, automatically generate:

From:

____________________

To:

____________________

Otherwise omit the address box.

RIGHT PANEL (Front Face)

Width exactly ${lebarDepan}

Height exactly ${tinggi}

Front cover artwork.

Background:

${finalWarnaDominan}

Theme:

${finalElemenDekorasi}

Illustration Style:

${gayaDesain}

Design Style:

${gayaDesain}

Envelope Type:

${finalJenisAmplop}

Generate professional illustrations that perfectly match the selected theme, style and envelope type.

Use premium vector artwork.

TOP TITLE

Centered near top.

Display:

${headline || 'None'}

Use typography that matches the selected design style.

━━━━━━━━━━━━━━━━━━━━━━

ENVELOPE FLAPS

━━━━━━━━━━━━━━━━━━━━━━

TOP FLAP

Attached above front panel.

Height exactly ${tutupAtas}

Same width as front panel.

Rounded corners if appropriate.

Background automatically follows the selected color palette.

BOTTOM FLAP

Attached below front panel.

Height exactly ${tutupBawah}

Same background.

RIGHT GLUE AREA

Attached vertically on right side.

Width exactly ${glueArea}

Full envelope height.

Background follows selected color palette.

━━━━━━━━━━━━━━━━━━━━━━

FOLD LINES

━━━━━━━━━━━━━━━━━━━━━━

Use thin grey dashed fold lines between:

Back Panel ↔ Front Panel

Front Panel ↔ Top Flap

Front Panel ↔ Bottom Flap

Front Panel ↔ Glue Area

━━━━━━━━━━━━━━━━━━━━━━

DIMENSION LINES

━━━━━━━━━━━━━━━━━━━━━━

Display professional engineering measurement lines with arrowheads.

Show the following dimensions:

Envelope Height:

${tinggi}

Front Width:

${lebarDepan}

Glue Area:

${glueArea}

Top Flap:

${tutupAtas}

Bottom Flap:

${tutupBawah}

Overall Unfolded Size:

${totalUnfolded}

All measurements must correspond exactly to the selected envelope size.

━━━━━━━━━━━━━━━━━━━━━━

HEADER

━━━━━━━━━━━━━━━━━━━━━━

UNFOLDED DIE-CUT ENVELOPE TEMPLATE

Footer:

${ukuranKertas}

True 1:1 real-world scale proportion.

━━━━━━━━━━━━━━━━━━━━━━

STYLE REQUIREMENTS

━━━━━━━━━━━━━━━━━━━━━━

Professional packaging engineering drawing

Precision dieline

Commercial envelope template

Flat vector illustration

Accurate commercial die-cut geometry

Perfect symmetry

Engineering blueprint

Print-ready

300 DPI

Ultra clean vector

Crisp black outlines

High resolution

Professional stationery design

The envelope template MUST be physically foldable after printing.

━━━━━━━━━━━━━━━━━━━━━━

STRICT CONSTRAINTS

━━━━━━━━━━━━━━━━━━━━━━

NO mockup

NO folded envelope

NO closed envelope

NO perspective

NO 3D

NO shadow

NO glossy effect

NO lighting

NO watermark

NO random dimensions

NO incorrect proportions

The generated dieline MUST strictly follow the selected envelope size while preserving the exact engineering proportions.`;

      res.json({ prompt: outputPrompt });
    } catch (error) {error("Error generating amplop prompt:", error);
      res.status(500).json({ error: 'Failed to generate prompt. ' + (error.message || '') });
    }
  });

  app.post("/api/generate-kartu-undangan", async (req, res) => {
    try {
      const {
        jenisUndangan,
        customJenisUndangan,
        judulAcara,
        namaPenyelenggara,
        isiUndangan,
        detailAcara,
        warnaDominan,
        customWarnaDominan,
        gayaDesain,
        elemenDekorasi,
        ilustrasi,
        facelessMode,
        bahasa,
        ukuran,
        smartRecommendation
      } = req.body;

      const finalJenisUndangan = jenisUndangan === 'Custom' ? customJenisUndangan : jenisUndangan;
      const finalWarna = warnaDominan === 'Custom' ? customWarnaDominan : warnaDominan;

      let facelessInstruction = "";
      if (facelessMode && ilustrasi === "Muslim Couple Faceless") {
         facelessInstruction = "\n- CRITICAL FOR FACELESS STYLE: The prompt MUST explicitly instruct generating a faceless couple (no facial features, no eyes, no nose, no mouth). Expressions must be conveyed through body language only. The bride MUST wear a modest hijab. Both characters must wear modest Islamic clothing. You MUST automatically append the following exact phrase to the generated prompt: 'faceless couple, modest Islamic clothing, bride wearing hijab, no facial features, elegant Islamic wedding illustration'.";
      }

      const prompt = `
Create a highly detailed, professional text prompt for an AI image generator (like Midjourney, DALL-E, or Gemini) to generate an invitation card design.

Event Specifications:
- Event Type: ${finalJenisUndangan}
- Event Title: ${judulAcara || "Not specified"}
- Host/Names: ${namaPenyelenggara || "Not specified"}
- Invitation Content: ${isiUndangan || "Not specified"}
- Event Details: ${detailAcara || "Not specified"}
- Dominant Color: ${finalWarna}
- Design Style: ${gayaDesain}
- Decorative Elements: ${smartRecommendation ? '[AI MUST AUTO-SELECT BASED ON STYLE]' : elemenDekorasi}
- Illustration: ${smartRecommendation ? '[AI MUST AUTO-SELECT BASED ON STYLE]' : ilustrasi}
- Language: ${bahasa}
- Aspect Ratio/Format: ${ukuran}



DESIGN INTELLIGENCE SYSTEM:
You are acting as a Professional Invitation Designer.
${smartRecommendation ? 
"SMART RECOMMENDATION IS ON: You MUST automatically select the most appropriate decorative elements and illustrations that perfectly match the Event Type ('" + finalJenisUndangan + "') and the Design Style ('" + gayaDesain + "')." 
: "SMART RECOMMENDATION IS OFF: Use the provided decorative elements and illustration style."}

You MUST pay attention to:
- Clear typographic hierarchy.
- Balanced visual composition.
- Sufficient white space.
- Professional margins.
- Harmonious color selection.
- Ornaments should not be excessive.
- Main focus is on the event information.
- Premium and print-ready quality.

Every type of invitation MUST have a distinct visual character. Examples:
- Ulang Tahun Anak (Kids Birthday) -> cheerful, colorful, cute illustrations, balloons, confetti, child characters, playful typography.
- Pernikahan (Wedding) -> elegant, luxury, premium typography, floral or gold ornaments, exclusive composition.
- Seminar -> modern, professional, clean, typography dominant with minimal icons.
- Pengajian (Islamic Gathering) -> graceful Islamic vibe with geometric ornaments and subtle calligraphy.
- Khitanan (Circumcision) -> cheerful Muslim kids vibe, child-friendly illustrations, soft colors, yet polite/respectful.

CRITICAL RULES FOR THE PROMPT:
1. Generate exactly 1 image prompt string.
2. The prompt MUST be highly descriptive, written in ENGLISH, and ready to be copy-pasted into an AI image generator.
3. The image generator must be instructed to generate the text content precisely. If the user provided 'Event Title', 'Host/Names', 'Invitation Content', or 'Event Details', you MUST instruct the AI to include that exact text in the design, using the selected language (${bahasa}).
4. Include instructions for: beautiful typography, elegant composition, invitation layout, decorative elements, premium design, balanced spacing, readable text, high resolution, print ready, elegant background, luxury style, and aspect ratio matching ${ukuran}.
5. Do not include conversational text like "Here is your prompt:". Just output the raw prompt directly.
${facelessInstruction}


Example Format for the Prompt:
"Professional invitation card design for [Event Type]. Elegant layout featuring [Decorative Elements] and [Illustration]. Color palette centered around [Dominant Color]. Text to include: Title '[Event Title]', Names '[Host/Names]', Content '[Invitation Content]', Details '[Event Details]'. Beautiful typography, premium design, balanced spacing, readable text, high resolution, print ready, elegant background, luxury style. Aspect ratio: [Size]."
`;

      const response = await generateContentWithRetry({
        model: "gemini-3.1-flash-lite",
        contents: prompt,
        config: {
          temperature: 0.7,
        }
      });

      res.json({ prompt: response.text?.trim() || "" });

    } catch (error) {
      console.error("Error generating kartu undangan prompt:", error);
      if (error.status === 401 || (error.message && error.message.includes('401'))) { return res.status(401).json({ error: 'Kunci API Gemini tidak valid atau belum diatur. Silakan masukkan Gemini API Key yang benar melalui menu Pengaturan (ikon gir di pojok).' }); } if (error.status === 503 || (error.message && error.message.includes('503'))) { return res.status(503).json({ error: 'Server AI sedang sibuk (kapasitas penuh). Silakan coba lagi dalam beberapa saat.' }); }
      res.status(500).json({ error: 'Failed to generate prompt. ' + (error.message || '') });
    }
  });

  if (!process.env.VERCEL) {
    if (process.env.NODE_ENV !== "production") {
      const { createServer: createViteServer } = await import("vite");
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: "spa",
      });
      app.use(vite.middlewares);
    } else {
      const distPath = path.join(process.cwd(), 'dist');
      app.use(express.static(distPath));
      app.get('*', (req, res) => {
        res.sendFile(path.join(distPath, 'index.html'));
      });
    }

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  }

  return app;
}

const appPromise = startServer();

if (!process.env.VERCEL) {
  appPromise.catch(console.error);
}

export default async function (req, res) {
  const app = await appPromise;
  app(req, res);
}
