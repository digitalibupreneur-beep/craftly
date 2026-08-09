import fs from 'fs';

let content = fs.readFileSync('src/pages/Amplop.tsx', 'utf8');

// Add "Custom" to elemenDekorasiOptions
content = content.replace(
  /"Vintage Pattern", "No Decoration"/g,
  `"Vintage Pattern", "No Decoration", "Custom"`
);

// Add customElemenDekorasi to formData
content = content.replace(
  /elemenDekorasi: elemenDekorasiOptions\[0\],/g,
  `elemenDekorasi: elemenDekorasiOptions[0],\n    customElemenDekorasi: '',`
);

// Add Custom Input for elemenDekorasi
const customDecorUI = `                {formData.elemenDekorasi === "Custom" && (
                  <div className="animate-in fade-in slide-in-from-top-2">
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Dekorasi Custom</label>
                    <input 
                      type="text"
                      name="customElemenDekorasi"
                      value={formData.customElemenDekorasi}
                      onChange={handleInputChange}
                      placeholder="Masukkan gaya dekorasi Anda..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    />
                  </div>
                )}`;

content = content.replace(
  /<\/select>\n                <\/div>/g,
  (match, offset, string) => {
    // Only replace after the elemenDekorasi select
    if (string.substring(offset - 150, offset).includes('name="elemenDekorasi"')) {
      return match + '\n\n' + customDecorUI;
    }
    return match;
  }
);

fs.writeFileSync('src/pages/Amplop.tsx', content);
console.log("Updated Amplop.tsx with custom decor");

let server = fs.readFileSync('server.ts', 'utf8');

server = server.replace(
  /elemenDekorasi,\n        bahasa/g,
  `elemenDekorasi,\n        customElemenDekorasi,\n        bahasa`
);

server = server.replace(
  /const finalWarnaDominan = warnaDominan === 'Custom' \? customWarnaDominan : warnaDominan;/g,
  `const finalWarnaDominan = warnaDominan === 'Custom' ? customWarnaDominan : warnaDominan;\n      const finalElemenDekorasi = elemenDekorasi === 'Custom' ? customElemenDekorasi : elemenDekorasi;`
);

server = server.replace(
  /\$\{elemenDekorasi\}/g,
  `\${finalElemenDekorasi}`
);

fs.writeFileSync('server.ts', server);
console.log("Updated server.ts with custom decor support");
