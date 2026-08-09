import React, { useState } from 'react';
import { ArrowLeft, Sparkles, Copy, Check, CopyCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const illustrationStyles = [
  "Cute Cartoon", "Cartoon Muslim Faceless", "Cartoon Muslim Boy (Faceless)",
  "Cartoon Muslim Girl (Faceless)", "Kawaii", "Flat Illustration", "Watercolor",
  "Hand Drawn", "Doodle", "Vector", "Minimalist", "Pastel", "Montessori Style",
  "Coloring Book Style", "Line Art", "Outline Only", "Black & White Coloring Page",
  "Cute Animal Cartoon", "Nature Illustration", "Islamic Kids Illustration",
  "No Illustration"
];

const colors = [
  "Pastel", "Soft Blue", "Soft Pink", "Mint", "Purple", "Rainbow", 
  "Earth Tone", "Colorful", "Neutral", "Monochrome"
];

const sizes = [
  "4:5 (Instagram)", "9:16 (Reels / Story)", "A4 Portrait (Print Ready)", "F4 Portrait (Print Ready)"
];

const languages = [
  "🇮🇩 Indonesia",
  "🇬🇧 English",
  "🇸🇦 العربية (Arab)",
  "🇯🇵 日本語 (Jepang)"
];

const targetAges = [
  "2–3 Tahun", "4–5 Tahun", "6–7 Tahun", "8–10 Tahun", "10+ Tahun"
];

const pageCounts = [
  "1 Halaman", "2 Halaman", "3 Halaman", "4 Halaman", "5 Halaman"
];

const activityTypes = [
  "Tracing", "Maze", "Menjodohkan", "Flash Card", "Coding", "Mewarnai", 
  "Tebak Gambar", "Latihan Soal", "Mencari Bayangan", "Menggunting Pola", "Custom"
];

export function BukuAktivitas() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [resultPrompts, setResultPrompts] = useState<string[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);
  
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("success");

  // Form State
  const [formData, setFormData] = useState({
    jenisHalaman: 'cover',
    judulBuku: '',
    subJudul: '',
    temaBuku: '',
    gayaIlustrasi: illustrationStyles[0],
    warnaDominan: colors[0],
    ukuran: sizes[2], // A4 Portrait default
    usiaTarget: targetAges[1], // 4-5 default
    jumlahHalaman: pageCounts[0],
    jenisAktivitas: activityTypes[0],
    customAktivitas: '',
    isiMateri: [''] as string[],
    bahasa: languages[0]
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleJumlahHalamanChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    const pages = parseInt(value.charAt(0)) || 1;
    setFormData(prev => {
      const newIsiMateri = [...prev.isiMateri];
      while (newIsiMateri.length < pages) {
        newIsiMateri.push('');
      }
      return {
        ...prev,
        jumlahHalaman: value,
        isiMateri: newIsiMateri.slice(0, pages)
      };
    });
  };

  const handleIsiMateriChange = (index: number, value: string) => {
    setFormData(prev => {
      const newIsiMateri = [...prev.isiMateri];
      newIsiMateri[index] = value;
      return { ...prev, isiMateri: newIsiMateri };
    });
  };

  const handleRadioChange = (value: 'cover' | 'isi') => {
    setFormData(prev => ({ ...prev, jenisHalaman: value }));
  };

  const handleGenerate = async () => {
    setLoading(true);
    setResultPrompts([]);
    try {
      const response = await fetch("/api/generate-buku-aktivitas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      if (response.ok) {
        setResultPrompts(data.prompts || []);
      } else {
        triggerToast(data.error || "Gagal menghasilkan prompt", "error");
      }
    } catch (error) {
      triggerToast("Terjadi kesalahan jaringan", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async (text: string, index: number) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      triggerToast("Prompt berhasil disalin.", "success");
      setTimeout(() => setCopiedIndex(null), 1000);
    } catch (err) {
      triggerToast("Gagal menyalin prompt. Silakan coba lagi.", "error");
    }
  };

  const handleCopyAll = async () => {
    if (resultPrompts.length === 0) return;
    try {
      const allText = resultPrompts.join('\n\n---\n\n');
      await navigator.clipboard.writeText(allText);
      setCopiedAll(true);
      triggerToast("Semua prompt berhasil disalin.", "success");
      setTimeout(() => setCopiedAll(false), 1000);
    } catch (err) {
      triggerToast("Gagal menyalin semua prompt.", "error");
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
              <span className="text-[#7C3AED]">Buku Aktivitas</span> Prompt Generator
            </h1>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Left Column - Form */}
          <div className="bg-white/80 backdrop-blur-xl rounded-[24px] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100/60">
            <h2 className="text-lg font-bold text-slate-800 mb-6">Detail Buku Aktivitas</h2>
            
            <div className="space-y-6">
              
              {/* Jenis Halaman */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Jenis Halaman</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="radio" 
                      name="jenisHalaman"
                      checked={formData.jenisHalaman === 'cover'}
                      onChange={() => handleRadioChange('cover')}
                      className="w-4 h-4 text-[#7C3AED] focus:ring-[#7C3AED]"
                    />
                    <span className="text-slate-700 font-medium">Cover</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="radio" 
                      name="jenisHalaman"
                      checked={formData.jenisHalaman === 'isi'}
                      onChange={() => handleRadioChange('isi')}
                      className="w-4 h-4 text-[#7C3AED] focus:ring-[#7C3AED]"
                    />
                    <span className="text-slate-700 font-medium">Halaman Isi</span>
                  </label>
                </div>
              </div>

              {/* Tema Buku (Common) */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Tema Buku</label>
                <input 
                  type="text" 
                  name="temaBuku" 
                  value={formData.temaBuku} 
                  onChange={handleInputChange}
                  placeholder="Contoh: Luar Angkasa, Dinosaurus, Hewan, Buah, Kendaraan, Profesi, Huruf Hijaiyah, Alphabet, Angka, Laut..." 
                  className="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-xl px-4 py-2.5 outline-none focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/20 transition-all"
                />
              </div>

              {/* Cover Fields */}
              {formData.jenisHalaman === 'cover' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 animate-in fade-in slide-in-from-top-2 duration-300">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Judul Buku</label>
                    <input 
                      type="text" 
                      name="judulBuku" 
                      value={formData.judulBuku} 
                      onChange={handleInputChange}
                      placeholder="Contoh: My First ABC Book" 
                      className="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-xl px-4 py-2.5 outline-none focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/20 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Sub Judul (Opsional)</label>
                    <input 
                      type="text" 
                      name="subJudul" 
                      value={formData.subJudul} 
                      onChange={handleInputChange}
                      placeholder="Contoh: Belajar menulis dan mewarnai" 
                      className="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-xl px-4 py-2.5 outline-none focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/20 transition-all"
                    />
                  </div>
                </div>
              )}

              {/* Halaman Isi Fields */}
              {formData.jenisHalaman === 'isi' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">Jumlah Halaman</label>
                      <select name="jumlahHalaman" value={formData.jumlahHalaman} onChange={handleJumlahHalamanChange} className="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-xl px-4 py-2.5 outline-none focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/20 transition-all">
                        {pageCounts.map(p => <option key={p} value={p}>{p}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">Jenis Aktivitas</label>
                      <select name="jenisAktivitas" value={formData.jenisAktivitas} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-xl px-4 py-2.5 outline-none focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/20 transition-all">
                        {activityTypes.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                  </div>

                  {formData.jenisAktivitas === 'Custom' && (
                    <div className="animate-in fade-in duration-300">
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">Jenis Aktivitas Custom</label>
                      <input 
                        type="text" 
                        name="customAktivitas" 
                        value={formData.customAktivitas} 
                        onChange={handleInputChange}
                        placeholder="Contoh: Origami Sederhana" 
                        className="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-xl px-4 py-2.5 outline-none focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/20 transition-all"
                      />
                    </div>
                  )}

                  <div className="flex flex-col gap-4">
                    {formData.isiMateri.map((materi, index) => (
                      <div key={index} className="animate-in fade-in duration-300">
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                          Isi Materi {formData.isiMateri.length > 1 ? `Halaman ${index + 1}` : ''}
                        </label>
                        <textarea 
                          value={materi} 
                          onChange={(e) => handleIsiMateriChange(index, e.target.value)}
                          rows={3}
                          placeholder={`Contoh: Mengenal Huruf ${String.fromCharCode(65 + index)}`}
                          className="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-[12px] px-4 py-3 outline-none focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/20 transition-all resize-y min-h-[72px] text-sm"
                        ></textarea>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Common Fields: Gaya, Warna, Ukuran, Usia, Bahasa */}
              <div className="pt-2 border-t border-slate-100 space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Gaya Ilustrasi</label>
                    <select name="gayaIlustrasi" value={formData.gayaIlustrasi} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-xl px-4 py-2.5 outline-none focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/20 transition-all">
                      {illustrationStyles.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Warna Dominan</label>
                    <select name="warnaDominan" value={formData.warnaDominan} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-xl px-4 py-2.5 outline-none focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/20 transition-all">
                      {colors.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Ukuran</label>
                    <select name="ukuran" value={formData.ukuran} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-xl px-4 py-2.5 outline-none focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/20 transition-all">
                      {sizes.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Usia Target</label>
                    <select name="usiaTarget" value={formData.usiaTarget} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-xl px-4 py-2.5 outline-none focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/20 transition-all">
                      {targetAges.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Bahasa</label>
                  <select name="bahasa" value={formData.bahasa} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-xl px-4 py-2.5 outline-none focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/20 transition-all">
                    {languages.map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
              </div>

            </div>
          </div>

          {/* Right Column - Output */}
          <div className="flex flex-col gap-6">
            <div className="bg-white/80 backdrop-blur-xl rounded-[24px] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100/60 flex-1 flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-slate-800">Generated Prompt</h2>
                {loading && (
                  <span className="flex items-center gap-2 text-sm font-medium text-[#7C3AED]">
                    <Sparkles className="w-4 h-4 animate-spin" />
                    Generating...
                  </span>
                )}
              </div>
              
              <div className="flex-1 flex flex-col gap-6 mb-6">
                {resultPrompts.length === 0 && !loading && (
                  <div className="flex-1 min-h-[300px] border border-slate-200 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 p-6 text-center">
                    Hasil prompt akan muncul di sini...
                  </div>
                )}
                
                {loading && resultPrompts.length === 0 && (
                  <div className="flex-1 min-h-[300px] border border-slate-200 rounded-xl bg-slate-50 flex flex-col gap-4 p-6 animate-pulse">
                    <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                    <div className="h-4 bg-slate-200 rounded w-full"></div>
                    <div className="h-4 bg-slate-200 rounded w-5/6"></div>
                    <div className="h-4 bg-slate-200 rounded w-2/3 mt-4"></div>
                  </div>
                )}

                {resultPrompts.length > 0 && !loading && (
                  <div className="flex flex-col gap-6">
                    {resultPrompts.map((promptText, index) => (
                      <div key={index} className="flex flex-col gap-3">
                        <h3 className="font-semibold text-slate-800 text-sm">
                          {formData.jenisHalaman === 'cover' ? 'Cover Prompt' : `Prompt Halaman ${index + 1}`}
                        </h3>
                        <textarea 
                          readOnly
                          value={promptText}
                          className="w-full h-64 bg-slate-50 border border-slate-200 text-slate-700 rounded-xl px-5 py-4 outline-none resize-none leading-relaxed text-[14px]"
                        ></textarea>
                        <button 
                          onClick={() => handleCopy(promptText, index)}
                          className={`self-start font-semibold py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-all active:scale-[0.98] text-sm ${
                            copiedIndex === index 
                              ? 'bg-[#10B981] hover:bg-[#059669] text-white' 
                              : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                          }`}
                        >
                          {copiedIndex === index ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                          <span>Copy Prompt</span>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-3 mt-auto pt-6 border-t border-slate-100">
                <button 
                  onClick={handleGenerate}
                  disabled={loading}
                  className="flex-1 bg-[#7C3AED] hover:bg-[#6D28D9] disabled:bg-purple-300 text-white font-semibold py-3.5 px-6 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-lg shadow-purple-500/25"
                >
                  <Sparkles className="w-5 h-5" />
                  <span>{loading ? 'Memproses...' : 'Generate Prompt'}</span>
                </button>
                
                {formData.jenisHalaman === 'isi' && resultPrompts.length > 1 && (
                  <button 
                    onClick={handleCopyAll}
                    disabled={resultPrompts.length === 0}
                    className={`flex-1 sm:flex-none font-semibold py-3.5 px-6 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-[0.98] ${
                      resultPrompts.length > 0 
                        ? 'bg-[#10B981] hover:bg-[#059669] text-white shadow-lg shadow-emerald-500/25' 
                        : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    {copiedAll ? <Check className="w-5 h-5" /> : <CopyCheck className="w-5 h-5" />}
                    <span>Copy All Prompt</span>
                  </button>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Toast Notification */}
      <div 
        className={`fixed bottom-6 right-6 px-4 py-3 rounded-xl shadow-xl flex items-center gap-3 transition-all duration-300 transform z-50 ${
          showToast ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0 pointer-events-none'
        } ${toastType === 'success' ? 'bg-[#10B981] text-white' : 'bg-red-500 text-white'}`}
      >
        {toastType === 'success' ? '✅' : '❌'}
        <span className="font-medium text-sm">{toastMessage}</span>
      </div>
    </div>
  );
}
