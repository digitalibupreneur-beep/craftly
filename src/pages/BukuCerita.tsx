import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Sparkles, Copy, Check, CopyCheck, BookOpen, Files } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const themes = [
  "Islami", "Persahabatan", "Petualangan", "Hewan", "Pendidikan", 
  "Moral", "Keluarga", "Alam", "Fantasi", "Profesi", "Sains", 
  "Sejarah", "Ramadhan", "Nabi & Rasul", "Dongeng", "Custom"
];

const pageCounts = [
  "1 Halaman (Cover)", "2 Halaman", "3 Halaman", "4 Halaman", "5 Halaman",
  "6 Halaman", "7 Halaman", "8 Halaman", "9 Halaman", "10 Halaman", "Custom"
];

const illustrationStyles = [
  "Cute Cartoon", "Disney Inspired", 
  "Ghibli Inspired", "Story Book Illustration", "Watercolor", 
  "Flat Illustration", "Hand Drawn", "Vector", "Realistic", 
  "Soft Pastel", "Minimalist", "Kawaii"
];

const dominantColors = [
  "Pastel", "Earth Tone", "Colorful", "Soft Blue", "Soft Pink", 
  "Green Nature", "Warm Color", "Islamic Green", "Monochrome"
];

const languages = [
  "🇮🇩 Indonesia", "🇬🇧 English", "🇸🇦 العربية", "🇯🇵 日本語"
];

const targetAges = [
  "2–4 Tahun", "5–7 Tahun", "8–10 Tahun", "11–13 Tahun"
];

const sizes = [
  "1:1 (Instagram)", "4:5 (Instagram Feed)", "9:16 (Story / Reels)", 
  "16:9 Landscape", "A4 Portrait (Print Ready)", "A4 Landscape (Print Ready)", 
  "F4 Portrait (Print Ready)", "F4 Landscape (Print Ready)"
];

export function BukuCerita() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [resultPrompts, setResultPrompts] = useState<string[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);
  
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("success");

  const promptResultRef = useRef<HTMLDivElement>(null);

  // Form State
  const [formData, setFormData] = useState({
    judul: '',
    namaPembuat: '',
    temaCerita: themes[0],
    customTema: '',
    jumlahHalaman: pageCounts[4], // 5 Halaman
    customJumlahHalaman: 5,
    sinopsis: '',
    ceritaLengkap: '',
    namaKarakter: '',
    deskripsiKarakter: '',
    facelessMode: true,
    gayaIlustrasi: illustrationStyles[0],
    warnaDominan: dominantColors[0],
    bahasa: languages[0],
    usiaPembaca: targetAges[1],
    ukuran: sizes[4]
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const target = e.target;
    const name = target.name;
    const value = target.type === 'checkbox' ? (target as HTMLInputElement).checked : target.value;
    
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (target.tagName.toLowerCase() === 'textarea') {
      target.style.height = 'auto';
      target.style.height = `${target.scrollHeight}px`;
    }
  };

  const triggerToast = (msg: string, type: "success" | "error" = "success") => {
    setToastMessage(msg);
    setToastType(type);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleCopy = async (text: string, index: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      triggerToast("Prompt berhasil disalin.");
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (err) {
      triggerToast("Gagal menyalin prompt.", "error");
    }
  };

  const handleCopyAll = async () => {
    if (resultPrompts.length === 0) return;
    
    try {
      const allText = resultPrompts.map((p, i) => `Page ${i + 1}:\n${p}`).join('\n\n-------------------------\n\n');
      await navigator.clipboard.writeText(allText);
      setCopiedAll(true);
      triggerToast("Semua prompt berhasil disalin.");
      setTimeout(() => setCopiedAll(false), 2000);
    } catch (err) {
      triggerToast("Gagal menyalin semua prompt.", "error");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.judul.trim() || !formData.sinopsis.trim()) {
      triggerToast("Harap isi Judul Buku dan Sinopsis Cerita.", "error");
      return;
    }
    
    setLoading(true);
    setResultPrompts([]);
    
    try {
      const response = await fetch('/api/generate-buku-cerita', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate prompt');
      }
      
      setResultPrompts(data.prompts);
      
    } catch (error: any) {
      triggerToast(error.message || "Terjadi kesalahan sistem.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (resultPrompts.length > 0 && promptResultRef.current) {
      promptResultRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [resultPrompts]);

  const isCustomHalaman = formData.jumlahHalaman === 'Custom';

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
                <h1 className="text-xl font-bold text-slate-900">Buku Cerita</h1>
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
                <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-blue-600" />
                </div>
                <h2 className="text-xl font-bold text-slate-900">Form Buku Cerita</h2>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* Judul Buku */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Judul Buku</label>
                    <input 
                      type="text" 
                      name="judul" 
                      value={formData.judul} 
                      onChange={handleInputChange}
                      placeholder="Contoh: Petualangan Ali di Hutan Ajaib" 
                      className="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-xl px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Nama Pembuat <span className="text-slate-400 font-normal">(Opsional)</span></label>
                    <input 
                      type="text" 
                      name="namaPembuat" 
                      value={formData.namaPembuat} 
                      onChange={handleInputChange}
                      placeholder="Contoh: Libria" 
                      className="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-xl px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                    />
                  </div>
                </div>

                {/* Tema Cerita */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Tema Cerita</label>
                    <select name="temaCerita" value={formData.temaCerita} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-xl px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all">
                      {themes.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  
                  {formData.temaCerita === 'Custom' && (
                    <div className="animate-in fade-in duration-300">
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">Tema Custom</label>
                      <input 
                        type="text" 
                        name="customTema" 
                        value={formData.customTema} 
                        onChange={handleInputChange}
                        placeholder="Contoh: Petualangan Luar Angkasa" 
                        className="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-xl px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                      />
                    </div>
                  )}
                  {formData.temaCerita !== 'Custom' && (
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">Jumlah Halaman</label>
                      <select name="jumlahHalaman" value={formData.jumlahHalaman} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-xl px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all">
                        {pageCounts.map(p => <option key={p} value={p}>{p}</option>)}
                      </select>
                    </div>
                  )}
                </div>

                {formData.temaCerita === 'Custom' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 animate-in fade-in duration-300">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">Jumlah Halaman</label>
                      <select name="jumlahHalaman" value={formData.jumlahHalaman} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-xl px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all">
                        {pageCounts.map(p => <option key={p} value={p}>{p}</option>)}
                      </select>
                    </div>
                    {isCustomHalaman && (
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Jumlah Halaman Custom</label>
                        <input 
                          type="number" 
                          name="customJumlahHalaman" 
                          min={1}
                          value={formData.customJumlahHalaman} 
                          onChange={handleInputChange}
                          placeholder="Masukkan jumlah..." 
                          className="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-xl px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                        />
                      </div>
                    )}
                  </div>
                )}
                
                {formData.temaCerita !== 'Custom' && isCustomHalaman && (
                  <div className="animate-in fade-in duration-300">
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Jumlah Halaman Custom</label>
                    <input 
                      type="number" 
                      name="customJumlahHalaman" 
                      min={1}
                      value={formData.customJumlahHalaman} 
                      onChange={handleInputChange}
                      placeholder="Masukkan jumlah..." 
                      className="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-xl px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                    />
                  </div>
                )}

                {/* Sinopsis Cerita */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Sinopsis Cerita</label>
                  <textarea 
                    name="sinopsis" 
                    value={formData.sinopsis} 
                    onChange={handleInputChange}
                    placeholder="Contoh: Ali menemukan pintu ajaib menuju hutan penuh hewan yang bisa berbicara."
                    className="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-xl px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all resize-y min-h-[72px] text-sm"
                    rows={3}
                  />
                </div>


                {/* Karakter */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Nama Karakter Utama</label>
                    <input 
                      type="text" 
                      name="namaKarakter" 
                      value={formData.namaKarakter} 
                      onChange={handleInputChange}
                      placeholder="Contoh: Ali" 
                      className="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-xl px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Deskripsi Karakter</label>
                    <textarea 
                      name="deskripsiKarakter" 
                      value={formData.deskripsiKarakter} 
                      onChange={handleInputChange}
                      placeholder="Contoh: Anak laki-laki Muslim usia 7 tahun, ceria, pemberani, memakai koko hijau dan peci putih."
                      className="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-xl px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all resize-y min-h-[72px] text-sm"
                      rows={2}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-slate-700 mb-3">Mode Faceless</label>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        name="facelessMode" 
                        checked={formData.facelessMode} 
                        onChange={handleInputChange}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      <span className="ml-3 text-sm font-medium text-slate-700">
                        {formData.facelessMode ? 'ON' : 'OFF'} <span className="text-slate-400 font-normal ml-1">(Tanpa detail wajah)</span>
                      </span>
                    </label>
                  </div>
                </div>

                {/* Visual Settings */}
                <div className="pt-4 border-t border-slate-100 space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">Gaya Ilustrasi</label>
                      <select name="gayaIlustrasi" value={formData.gayaIlustrasi} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-xl px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all">
                        {illustrationStyles.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">Warna Dominan</label>
                      <select name="warnaDominan" value={formData.warnaDominan} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-xl px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all">
                        {dominantColors.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">Bahasa</label>
                      <select name="bahasa" value={formData.bahasa} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-xl px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all">
                        {languages.map(l => <option key={l} value={l}>{l}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">Usia Pembaca</label>
                      <select name="usiaPembaca" value={formData.usiaPembaca} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-xl px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all">
                        {targetAges.map(a => <option key={a} value={a}>{a}</option>)}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Ukuran</label>
                    <select name="ukuran" value={formData.ukuran} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-xl px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all">
                      {sizes.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={loading}
                  className={`w-full h-14 mt-6 rounded-xl text-white font-semibold flex items-center justify-center gap-2 transition-all ${
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
                <h2 className="text-xl font-bold text-slate-900">Generated Prompts</h2>
              </div>

              {loading ? (
                <div className="space-y-6">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="animate-pulse">
                      <div className="h-5 w-32 bg-slate-200 rounded-md mb-3"></div>
                      <div className="h-32 bg-slate-100 rounded-xl w-full"></div>
                    </div>
                  ))}
                </div>
              ) : resultPrompts.length > 0 ? (
                <div className="space-y-6">
                  {resultPrompts.map((prompt, index) => (
                    <div key={index} className="animate-in fade-in duration-500">
                      <h3 className="font-semibold text-slate-800 mb-2 flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-blue-500" />
                        {index === 0 ? "Cover (Halaman 1)" : `Halaman ${index + 1}`}
                      </h3>
                      <textarea 
                        readOnly
                        value={prompt}
                        className="w-full h-64 bg-slate-50 border border-slate-200 text-slate-700 rounded-xl px-5 py-4 outline-none resize-y leading-relaxed text-[13px]"
                      ></textarea>
                      
                      <button 
                        onClick={() => handleCopy(prompt, index)}
                        className={`w-full h-11 mt-3 rounded-lg text-white font-semibold flex items-center justify-center gap-2 text-sm transition-all ${
                          copiedIndex === index 
                            ? 'bg-emerald-500' 
                            : 'bg-slate-800 hover:bg-slate-900 shadow-md'
                        }`}
                      >
                        {copiedIndex === index ? (
                          <>
                            <Check className="w-4 h-4" />
                            <span>Tersalin!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4" />
                            <span>Copy Prompt</span>
                          </>
                        )}
                      </button>
                    </div>
                  ))}

                  <div className="pt-6 mt-6 border-t border-slate-100">
                    <button 
                      onClick={handleCopyAll}
                      className={`w-full h-14 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all ${
                        copiedAll 
                          ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' 
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
                      }`}
                    >
                      {copiedAll ? <Check className="w-5 h-5" /> : <CopyCheck className="w-5 h-5" />}
                      <span>Copy All Prompt</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-[60vh] text-center px-4 border-2 border-dashed border-slate-100 rounded-2xl bg-slate-50/50">
                  <Sparkles className="w-10 h-10 text-slate-300 mb-3" />
                  <p className="text-slate-500 font-medium text-sm">
                    Isi form di samping lalu klik Generate untuk membuat prompt ilustrasi buku cerita anak.
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
