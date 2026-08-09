import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Sparkles, Copy, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const infographicTypes = [
  "Edukasi", "Timeline", "Langkah demi Langkah", "Proses", "Perbandingan", 
  "Statistik", "Tips", "Checklist", "Mind Map", "Flowchart", "Fakta Menarik", 
  "Islami", "Kesehatan", "Pendidikan", "Bisnis", "Teknologi", "Keuangan", 
  "Parenting", "Custom"
];

const targetAudiences = [
  "Anak-anak", "Remaja", "Dewasa", "Guru", "Mahasiswa", "Pebisnis", "Orang Tua", "Umum"
];

const illustrationStyles = [
  "Flat Illustration", "Modern Vector", "3D Illustration", "Realistic", 
  "Cartoon", "Cute Cartoon", "Cartoon Muslim Faceless", "Muslim Family Faceless", 
  "Business Illustration", "Hand Drawn", "Watercolor", "Minimalist", 
  "Isometric", "Line Art", "Plushie", "Kawai Japanese Doodle", 
  "Clay Diorama", "Anime Manga", "Flanel", "Paper Quill", "Paper Cut", 
  "No Illustration"
];

const dominantColors = [
  "Biru", "Hijau", "Merah", "Kuning", "Orange", "Ungu", "Pink", "Pastel", 
  "Earth Tone", "Monochrome", "Hitam Putih", "Custom"
];

const languages = [
  "🇮🇩 Indonesia", "🇬🇧 English", "🇸🇦 العربية", "🇯🇵 日本語"
];

const detailLevels = [
  "Sederhana", "Sedang", "Detail", "Sangat Detail"
];

const colorStyles = [
  "Flat Color", "Soft Pastel", "Vibrant", "Professional", "Corporate", 
  "Elegant", "Luxury", "Islamic Theme"
];

export function Infografis() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [resultPrompt, setResultPrompt] = useState<string>('');
  const [copied, setCopied] = useState(false);
  
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("success");

  const promptResultRef = useRef<HTMLDivElement>(null);

  // Form State
  const [formData, setFormData] = useState({
    judul: '',
    topik: '',
    jenis: infographicTypes[0],
    customJenis: '',
    targetAudiens: targetAudiences[7], // Umum
    gayaIlustrasi: illustrationStyles[0],
    warnaDominan: dominantColors[0],
    customWarna: '',
    bahasa: languages[0],
    ukuran: '9:16 (Instagram Story / Reels / TikTok)',
    tingkatDetail: detailLevels[2], // Detail
    gayaWarna: colorStyles[0],
    tambahkanIkon: true,
    tambahkanIlustrasi: true
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (name: string) => {
    setFormData(prev => ({ ...prev, [name]: !(prev as any)[name] }));
  };

  const triggerToast = (msg: string, type: "success" | "error" = "success") => {
    setToastMessage(msg);
    setToastType(type);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleCopy = async () => {
    if (!resultPrompt) return;
    try {
      await navigator.clipboard.writeText(resultPrompt);
      setCopied(true);
      triggerToast("Prompt berhasil disalin.");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      triggerToast("Gagal menyalin prompt.", "error");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.judul.trim() || !formData.topik.trim()) {
      triggerToast("Harap isi Judul dan Topik Infografis.", "error");
      return;
    }
    
    setLoading(true);
    setResultPrompt('');
    
    try {
      const response = await fetch('/api/generate-infografis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate prompt');
      }
      
      setResultPrompt(data.prompt);
      
    } catch (error: any) {
      triggerToast(error.message || "Terjadi kesalahan sistem.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (resultPrompt && promptResultRef.current) {
      promptResultRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [resultPrompt]);

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Navbar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-16 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => navigate('/home')}
                className="w-10 h-10 flex items-center justify-center text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-slate-900">Infografis Edukasi</h1>
                <p className="text-sm text-slate-500 font-medium hidden sm:block">AI Prompt Generator</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Toast */}
      {showToast && (
        <div className={`fixed top-20 right-4 z-50 animate-in slide-in-from-right-5 fade-in duration-300 px-4 py-3 rounded-xl shadow-lg border flex items-center gap-3 ${
          toastType === 'success' ? 'bg-white border-green-100 text-green-700' : 'bg-white border-red-100 text-red-700'
        }`}>
          {toastType === 'success' ? <Check className="w-5 h-5 text-green-500" /> : <div className="w-5 h-5 text-red-500 font-bold flex items-center justify-center">!</div>}
          <p className="font-medium text-sm">{toastMessage}</p>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Kolom Kiri: Form */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-orange-600" />
                </div>
                <h2 className="text-xl font-bold text-slate-900">Form Infografis</h2>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* Judul Infografis */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Judul Infografis</label>
                  <input 
                    type="text" 
                    name="judul" 
                    value={formData.judul} 
                    onChange={handleInputChange}
                    placeholder="Contoh: Pentingnya Minum Air Putih" 
                    className="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-xl px-4 py-2.5 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
                  />
                </div>

                {/* Topik / Materi */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Topik / Materi</label>
                  <textarea 
                    name="topik" 
                    value={formData.topik} 
                    onChange={handleInputChange}
                    placeholder="Contoh: Jelaskan manfaat minum air putih bagi tubuh, waktu terbaik minum air, dan dampak jika kekurangan cairan."
                    className="w-full min-h-[72px] bg-slate-50 border border-slate-200 text-slate-700 rounded-xl px-4 py-2.5 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all resize-y text-sm"
                    rows={3}
                  />
                </div>

                {/* Jenis Infografis */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Jenis Infografis</label>
                    <select name="jenis" value={formData.jenis} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-xl px-4 py-2.5 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all">
                      {infographicTypes.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  {formData.jenis === 'Custom' && (
                    <div className="animate-in fade-in duration-300">
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">Jenis Infografis (Custom)</label>
                      <input 
                        type="text" 
                        name="customJenis" 
                        value={formData.customJenis} 
                        onChange={handleInputChange}
                        placeholder="Masukkan jenis infografis..." 
                        className="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-xl px-4 py-2.5 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
                      />
                    </div>
                  )}
                  {formData.jenis !== 'Custom' && (
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">Target Audiens</label>
                      <select name="targetAudiens" value={formData.targetAudiens} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-xl px-4 py-2.5 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all">
                        {targetAudiences.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                  )}
                </div>
                {formData.jenis === 'Custom' && (
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Target Audiens</label>
                    <select name="targetAudiens" value={formData.targetAudiens} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-xl px-4 py-2.5 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all">
                      {targetAudiences.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Gaya Ilustrasi</label>
                    <select name="gayaIlustrasi" value={formData.gayaIlustrasi} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-xl px-4 py-2.5 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all">
                      {illustrationStyles.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Warna Dominan</label>
                    <select name="warnaDominan" value={formData.warnaDominan} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-xl px-4 py-2.5 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all">
                      {dominantColors.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
                {formData.warnaDominan === 'Custom' && (
                  <div className="animate-in fade-in duration-300">
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Warna Custom</label>
                    <input 
                      type="text" 
                      name="customWarna" 
                      value={formData.customWarna} 
                      onChange={handleInputChange}
                      placeholder="Contoh: Biru muda pastel dan gold" 
                      className="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-xl px-4 py-2.5 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Bahasa</label>
                  <select name="bahasa" value={formData.bahasa} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-xl px-4 py-2.5 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all">
                    {languages.map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Ukuran Output</label>
                    <select name="ukuran" value={formData.ukuran} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-xl px-4 py-2.5 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all">
                      <optgroup label="Sosial Media">
                        <option value="1:1 (Instagram Feed)">1:1 (Instagram Feed)</option>
                        <option value="4:5 (Instagram Feed)">4:5 (Instagram Feed)</option>
                        <option value="9:16 (Instagram Story / Reels / TikTok)">9:16 (Instagram Story / Reels / TikTok)</option>
                      </optgroup>
                      <optgroup label="Landscape">
                        <option value="16:9 Landscape">16:9 Landscape</option>
                        <option value="A4 Landscape (Print Ready)">A4 Landscape (Print Ready)</option>
                        <option value="F4 Landscape (Print Ready)">F4 Landscape (Print Ready)</option>
                      </optgroup>
                      <optgroup label="Portrait">
                        <option value="A4 Portrait (Print Ready)">A4 Portrait (Print Ready)</option>
                        <option value="F4 Portrait (Print Ready)">F4 Portrait (Print Ready)</option>
                      </optgroup>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Tingkat Detail</label>
                    <select name="tingkatDetail" value={formData.tingkatDetail} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-xl px-4 py-2.5 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all">
                      {detailLevels.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Gaya Warna</label>
                  <select name="gayaWarna" value={formData.gayaWarna} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-xl px-4 py-2.5 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all">
                    {colorStyles.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2">
                  <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-xl">
                    <span className="text-sm font-semibold text-slate-700">Tambahkan Ikon</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" checked={formData.tambahkanIkon} onChange={() => handleCheckboxChange('tambahkanIkon')} />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
                    </label>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-xl">
                    <span className="text-sm font-semibold text-slate-700">Tambahkan Ilustrasi</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" checked={formData.tambahkanIlustrasi} onChange={() => handleCheckboxChange('tambahkanIlustrasi')} />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
                    </label>
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={loading}
                  className={`w-full h-14 mt-4 rounded-xl text-white font-semibold flex items-center justify-center gap-2 transition-all ${
                    loading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg'
                  }`}
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Sedang Membuat Prompt...</span>
                    </div>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      <span>Generate Prompt</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Kolom Kanan: Hasil */}
          <div className="lg:col-span-5" ref={promptResultRef}>
            <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200 sticky top-24">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
                  <span className="text-xl">📋</span>
                </div>
                <h2 className="text-xl font-bold text-slate-900">Generated Prompt</h2>
              </div>

              {loading ? (
                <div className="space-y-4">
                  <div className="h-4 bg-slate-100 rounded-full w-3/4 animate-pulse"></div>
                  <div className="h-4 bg-slate-100 rounded-full w-full animate-pulse"></div>
                  <div className="h-4 bg-slate-100 rounded-full w-5/6 animate-pulse"></div>
                  <div className="h-4 bg-slate-100 rounded-full w-4/5 animate-pulse"></div>
                  <div className="h-4 bg-slate-100 rounded-full w-2/3 animate-pulse"></div>
                </div>
              ) : resultPrompt ? (
                <div className="animate-in fade-in duration-500">
                  <textarea 
                    readOnly
                    value={resultPrompt}
                    className="w-full h-[400px] bg-slate-50 border border-slate-200 text-slate-700 rounded-xl px-5 py-4 outline-none resize-none leading-relaxed text-[14px]"
                  ></textarea>
                  
                  <button 
                    onClick={handleCopy}
                    className={`w-full h-14 mt-4 rounded-xl text-white font-semibold flex items-center justify-center gap-2 transition-all ${
                      copied 
                        ? 'bg-emerald-500' 
                        : 'bg-emerald-600 hover:bg-emerald-700 shadow-md hover:shadow-lg'
                    }`}
                  >
                    {copied ? (
                      <>
                        <Check className="w-5 h-5" />
                        <span>Tersalin!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-5 h-5" />
                        <span>Copy Prompt</span>
                      </>
                    )}
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-64 text-center px-4 border-2 border-dashed border-slate-100 rounded-2xl bg-slate-50/50">
                  <Sparkles className="w-10 h-10 text-slate-300 mb-3" />
                  <p className="text-slate-500 font-medium text-sm">
                    Isi form di samping lalu klik Generate untuk membuat prompt infografis.
                  </p>
                </div>
              )}
            </div>
          </div>
          
        </div>
      </main>
    </div>
  );
}
