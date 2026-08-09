import React, { useState } from 'react';
import { ArrowLeft, Sparkles, Copy, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const plannerTypes = [
  "Daily Planner", "Weekly Planner", "Monthly Planner", "Yearly Planner",
  "Habit Tracker", "Mood Tracker", "Meal Planner", "Budget Planner",
  "Finance Planner", "Business Planner", "Study Planner", "Reading Planner",
  "Quran Planner", "Ramadhan Planner", "Wedding Planner", "Pregnancy Planner",
  "Kids Planner", "Cleaning Planner", "Fitness Planner", "Self Care Planner",
  "Project Planner", "Content Planner", "Social Media Planner", "Goal Planner",
  "Travel Planner", "Custom Planner"
];

const themes = [
  "Minimalist", "Elegant", "Cute", "Kids", "Floral", "Modern", "Professional",
  "Luxury", "Feminine", "Masculine", "Islamic", "Vintage", "Pastel",
  "Scandinavian", "Korean", "Japanese", "Cartoon", "Nature", "Boho", "Custom"
];

const illustrationStyles = [
  "Flat Design", "Watercolor", "Hand Drawn", "Cartoon", "Doodle", "Realistic",
  "Vector", "Isometric", "3D Illustration", "Line Art", "Cute Kawaii",
  "Soft Pastel", "Disney Inspired", "Ghibli Inspired", "No Illustration"
];

const presetColors = [
  { name: 'Blue', value: '#3B82F6' },
  { name: 'Green', value: '#10B981' },
  { name: 'Pink', value: '#EC4899' },
  { name: 'Purple', value: '#8B5CF6' },
  { name: 'Beige', value: '#F5F5DC' },
  { name: 'Brown', value: '#8B4513' },
  { name: 'Black', value: '#000000' },
  { name: 'Gold', value: '#FFD700' },
  { name: 'Pastel', value: '#FFD1DC' },
  { name: 'Earth Tone', value: '#A0522D' },
  { name: 'Monochrome', value: '#808080' },
];

const languages = ["Indonesia", "English"];

const targetAudiences = [
  "Anak", "Remaja", "Dewasa", "Wanita", "Pria", "Muslim", "Guru",
  "Mahasiswa", "Pebisnis", "Freelancer", "Ibu Rumah Tangga"
];

const sizes = [
  "A4 Portrait", "A4 Landscape", "F4 Portrait", "F4 Landscape",
  "4:5", "9:16", "Square 1:1"
];

const resolutions = [
  "High Quality", "Ultra HD", "Print Ready 300 DPI"
];

const elements = [
  "Icon", "Border", "Floral", "Abstract Shape", "Watercolor Decoration",
  "Grid", "Notes", "Checklist", "Calendar", "Quote", "Ribbon", "Sticker",
  "Islamic Ornament", "Gold Accent"
];

export function Planner() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [resultPrompt, setResultPrompt] = useState("");
  const [copied, setCopied] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("success");

  // Form State
  const [formData, setFormData] = useState({
    jenisPlanner: plannerTypes[0],
    temaPlanner: themes[0],
    styleIlustrasi: illustrationStyles[0],
    warnaDominan: presetColors[0].value,
    bahasa: languages[0],
    targetPengguna: targetAudiences[0],
    ukuran: sizes[0],
    resolusi: resolutions[2], // Default Print Ready
    elemenTambahan: [] as string[],
    judulPlanner: "",
    subtitle: "",
    isiPlanner: ""
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (element: string) => {
    setFormData(prev => {
      const current = prev.elemenTambahan;
      return {
        ...prev,
        elemenTambahan: current.includes(element)
          ? current.filter(e => e !== element)
          : [...current, element]
      };
    });
  };

  const handleGenerate = async () => {
    setLoading(true);
    setResultPrompt("");
    try {
      const response = await fetch("/api/generate-prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      if (response.ok) {
        setResultPrompt(data.prompt);
      } else {
        triggerToast(data.error || "Gagal menghasilkan prompt", "error");
      }
    } catch (error) {
      triggerToast("Terjadi kesalahan jaringan", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!resultPrompt) return;
    try {
      await navigator.clipboard.writeText(resultPrompt);
      setCopied(true);
      triggerToast("Prompt berhasil disalin.", "success");
      setTimeout(() => setCopied(false), 1000);
    } catch (err) {
      triggerToast("Gagal menyalin prompt. Silakan coba lagi.", "error");
    }
  };

  const triggerToast = (message: string, type: "success" | "error") => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center gap-4">
          <button 
            onClick={() => navigate('/home')}
            className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-slate-100 transition-colors text-slate-600"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <span className="text-[#2563EB]">Planner</span> Prompt Generator
            </h1>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Left Column - Form */}
          <div className="bg-white/80 backdrop-blur-xl rounded-[24px] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100/60">
            <h2 className="text-lg font-bold text-slate-800 mb-6">Detail Planner</h2>
            
            <div className="space-y-5">
              {/* Jenis & Tema */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Jenis Planner</label>
                  <select name="jenisPlanner" value={formData.jenisPlanner} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-xl px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all">
                    {plannerTypes.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Tema Planner</label>
                  <select name="temaPlanner" value={formData.temaPlanner} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-xl px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all">
                    {themes.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>

              {/* Style & Bahasa */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Style Ilustrasi</label>
                  <select name="styleIlustrasi" value={formData.styleIlustrasi} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-xl px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all">
                    {illustrationStyles.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Bahasa</label>
                  <select name="bahasa" value={formData.bahasa} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-xl px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all">
                    {languages.map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
              </div>

              {/* Target & Ukuran */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Target Pengguna</label>
                  <select name="targetPengguna" value={formData.targetPengguna} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-xl px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all">
                    {targetAudiences.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Ukuran</label>
                  <select name="ukuran" value={formData.ukuran} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-xl px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all">
                    {sizes.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              {/* Resolusi & Warna */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Resolusi</label>
                  <select name="resolusi" value={formData.resolusi} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-xl px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all">
                    {resolutions.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Warna Dominan</label>
                  <div className="flex items-center gap-2">
                    <input 
                      type="color" 
                      name="warnaDominan" 
                      value={formData.warnaDominan} 
                      onChange={handleInputChange} 
                      className="h-11 w-11 rounded-xl cursor-pointer bg-slate-50 border border-slate-200 p-1"
                    />
                    <div className="flex flex-wrap gap-1.5 flex-1">
                      {presetColors.slice(0, 6).map(color => (
                        <button
                          key={color.name}
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, warnaDominan: color.value }))}
                          className="w-6 h-6 rounded-full border border-slate-200 shadow-sm"
                          style={{ backgroundColor: color.value }}
                          title={color.name}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Elemen Tambahan */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Elemen Tambahan</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {elements.map(element => (
                    <label key={element} className="flex items-center gap-2 cursor-pointer group">
                      <div className="relative flex items-center justify-center">
                        <input 
                          type="checkbox" 
                          checked={formData.elemenTambahan.includes(element)}
                          onChange={() => handleCheckboxChange(element)}
                          className="peer appearance-none w-5 h-5 border border-slate-300 rounded-[6px] checked:bg-blue-600 checked:border-blue-600 transition-colors cursor-pointer"
                        />
                        <Check className="absolute w-3.5 h-3.5 text-white pointer-events-none opacity-0 peer-checked:opacity-100" strokeWidth={3} />
                      </div>
                      <span className="text-sm text-slate-600 group-hover:text-slate-900 transition-colors">{element}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Judul & Subtitle */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Judul Planner</label>
                  <input 
                    type="text" 
                    name="judulPlanner" 
                    value={formData.judulPlanner} 
                    onChange={handleInputChange}
                    placeholder="Contoh: My Daily Planner" 
                    className="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-xl px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Subtitle</label>
                  <input 
                    type="text" 
                    name="subtitle" 
                    value={formData.subtitle} 
                    onChange={handleInputChange}
                    placeholder="Contoh: Make today amazing" 
                    className="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-xl px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                  />
                </div>
              </div>

              {/* Isi Planner */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Isi Planner (Struktur)</label>
                <textarea 
                  name="isiPlanner" 
                  value={formData.isiPlanner} 
                  onChange={handleInputChange}
                  rows={4}
                  placeholder="Contoh: Senin, To Do, Priority, Notes, Habit Tracker..." 
                  className="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-xl px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all resize-none"
                ></textarea>
              </div>

            </div>
          </div>

          {/* Right Column - Output */}
          <div className="flex flex-col gap-6">
            <div className="bg-white/80 backdrop-blur-xl rounded-[24px] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100/60 flex-1 flex flex-col">
              <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center justify-between">
                <span>Generated Prompt</span>
                {loading && (
                  <span className="flex items-center gap-2 text-sm font-medium text-blue-600">
                    <Sparkles className="w-4 h-4 animate-spin" />
                    Generating...
                  </span>
                )}
              </h2>
              
              <div className="flex-1 min-h-[300px] mb-6 relative">
                <textarea 
                  readOnly
                  value={resultPrompt}
                  placeholder="Hasil prompt akan muncul di sini..."
                  className="w-full h-full absolute inset-0 bg-slate-50 border border-slate-200 text-slate-700 rounded-xl px-5 py-4 outline-none resize-none leading-relaxed text-[15px]"
                ></textarea>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button 
                  onClick={handleGenerate}
                  disabled={loading}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3.5 px-6 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-lg shadow-blue-500/25"
                >
                  <Sparkles className="w-5 h-5" />
                  <span>{loading ? 'Memproses...' : 'Generate Prompt'}</span>
                </button>
                
                <button 
                  onClick={handleCopy}
                  disabled={!resultPrompt}
                  className={`flex-1 sm:flex-none font-semibold py-3.5 px-6 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-[0.98] ${
                    resultPrompt 
                      ? 'bg-[#10B981] hover:bg-[#059669] text-white shadow-lg shadow-emerald-500/25' 
                      : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                  <span>Copy Prompt</span>
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Toast Notification */}
      <div 
        className={`fixed bottom-6 right-6 px-4 py-3 rounded-xl shadow-xl flex items-center gap-3 transition-all duration-300 transform ${
          showToast ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0 pointer-events-none'
        } ${toastType === 'success' ? 'bg-[#10B981] text-white' : 'bg-red-500 text-white'}`}
      >
        {toastType === 'success' ? '✅' : '❌'}
        <span className="font-medium text-sm">{toastMessage}</span>
      </div>
    </div>
  );
}
