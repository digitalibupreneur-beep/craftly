import fs from 'fs';

let content = fs.readFileSync('server.ts', 'utf8');

content = content.replace(
  /facelessMode,\s*bahasa,\s*ukuran\s*\} = req.body;/g,
  "facelessMode,\n        bahasa,\n        ukuran,\n        smartRecommendation\n      } = req.body;"
);

// We need to specifically edit the /api/generate-kartu-undangan route
// In the prompt building:
// If smartRecommendation is true, we change the prompt structure slightly to say:
// - Decorative Elements: [Auto-selected by AI based on Event Type and Design Style]
// - Illustration: [Auto-selected by AI based on Event Type and Design Style]
content = content.replace(
  /- Decorative Elements: \$\{elemenDekorasi\}\n- Illustration: \$\{ilustrasi\}/,
  "- Decorative Elements: ${smartRecommendation ? '[AI MUST AUTO-SELECT BASED ON STYLE]' : elemenDekorasi}\n- Illustration: ${smartRecommendation ? '[AI MUST AUTO-SELECT BASED ON STYLE]' : ilustrasi}"
);

const newIntelligence = `DESIGN INTELLIGENCE SYSTEM:
You are acting as a Professional Invitation Designer.
\${smartRecommendation ? 
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
- Khitanan (Circumcision) -> cheerful Muslim kids vibe, child-friendly illustrations, soft colors, yet polite/respectful.`;

content = content.replace(
  /DESIGN INTELLIGENCE:\nYou are acting as a Professional Invitation Designer\.\nYou MUST choose the layout, composition, typography, colors, illustrations, and ornaments that perfectly match the Event Type \(".*"\) and the Design Style \(".*"\)\.\nThe design MUST look like a professional designer's work, not a basic template\.\nYou MUST pay attention to:\n- Clear typographic hierarchy\.\n- Balanced visual composition\.\n- Sufficient white space\.\n- Professional margins\.\n- Harmonious color selection\.\n- Ornaments should not be excessive\.\n- Main focus is on the event information\.\n- Premium and print-ready quality\.\nEvery type of invitation MUST have a distinct visual character\. Examples:\n- Ulang Tahun Anak \(Kids Birthday\) -> cheerful, colorful, cute illustrations, balloons, confetti, child characters, playful typography\.\n- Pernikahan \(Wedding\) -> elegant, luxury, premium typography, floral or gold ornaments, exclusive composition\.\n- Seminar -> modern, professional, clean, typography dominant with minimal icons\.\n- Pengajian \(Islamic Gathering\) -> graceful Islamic vibe with geometric ornaments and subtle calligraphy\.\n- Khitanan \(Circumcision\) -> cheerful Muslim kids vibe, child-friendly illustrations, soft colors, yet polite\/respectful\./,
  newIntelligence
);

fs.writeFileSync('server.ts', content);
console.log("Done");
