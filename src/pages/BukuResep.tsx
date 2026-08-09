import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Sparkles, Copy, Check, CopyCheck, BookOpen, ChefHat } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const pageCounts = [
  "1 Halaman (Cover)", "2 Halaman", "3 Halaman", "4 Halaman", "5 Halaman",
  "6 Halaman", "7 Halaman", "8 Halaman", "9 Halaman", "10 Halaman", "Custom"
];

const designStyles = [
  "Modern Cookbook", "Minimalist", "Rustic", "Premium", "Elegant", 
  "Japanese Style", "Korean Style", "Vintage Cookbook", "Healthy Cookbook", 
  "Islamic Cookbook", "Kids Cookbook"
];

const photoStyles = [
  // Food Photography
  "Realistic Food Photography", "Premium Food Photography", "Editorial Food Photography",
  "Flat Lay Food Photography", "Top View Food Photography", "45 Degree Food Photography",
  "Rustic Food Photography", "Luxury Restaurant Style", "Cafe Style Photography",
  "Dark Moody Food Photography", "Bright & Airy Food Photography", "Minimalist Food Photography",
  "Homemade Food Photography", "Traditional Indonesian Food Photography",
  "Japanese Food Photography", "Korean Food Photography",
  // Food Illustration
  "Watercolor Food Illustration", "Flat Illustration", "Hand Drawn Illustration",
  "Cartoon Food Illustration", "Cute Kawaii Food Illustration", "Children's Cookbook Illustration",
  "Vintage Cookbook Illustration", "Pencil Sketch Illustration", "Colored Pencil Illustration",
  "Vector Food Illustration", "Minimalist Illustration",
  // Islamic Style
  "Halal Food Photography", "Islamic Cookbook Style"
];

const cameraAngles = [
  "Top View", "45° Angle", "Eye Level", "Close Up", "Hero Shot", "Flat Lay", "Isometric"
];

const dominantColors = [
  "Cream", "Beige", "White", "Brown", "Green", "Earth Tone", "Pastel", "Dark Elegant", "Custom"
];

const languages = [
  "🇮🇩 Indonesia", "🇬🇧 English", "🇸🇦 العربية", "🇯🇵 日本語"
];

const sizes = [
  "1:1 (Instagram)", "4:5 (Instagram Feed)", "9:16 (Story / Reels)", 
  "16:9 Landscape", "A4 Portrait (Print Ready)", "A4 Landscape (Print Ready)", 
  "F4 Portrait (Print Ready)", "F4 Landscape (Print Ready)"
];

export function BukuResep() {
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
    jumlahHalaman: pageCounts[4], // 5 Halaman
    customJumlahHalaman: 5,
    gayaDesain: designStyles[0],
    gayaFoto: photoStyles[0],
    sudutGambar: cameraAngles[0],
    warnaDominan: dominantColors[0],
    customWarnaDominan: '',
    bahasa: languages[0],
    ukuran: sizes[4]
  });

  const [recipes, setRecipes] = useState<{nama: string, deskripsi: string}[]>(
    Array.from({ length: 9 }, () => ({ nama: '', deskripsi: '' }))
  );

  const getPagesCount = () => {
    if (formData.jumlahHalaman === "Custom") return Math.max(1, formData.customJumlahHalaman || 1);
    const num = parseInt(formData.jumlahHalaman.split(" ")[0]);
    return isNaN(num) ? 1 : num;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (e.target.tagName.toLowerCase() === 'textarea') {
      const target = e.target as HTMLTextAreaElement;
      target.style.height = 'auto';
      target.style.height = `${target.scrollHeight}px`;
    }
  };

  const handleRecipeChange = (index: number, field: 'nama' | 'deskripsi', value: string) => {
    const newRecipes = [...recipes];
    if (!newRecipes[index]) {
       newRecipes[index] = { nama: '', deskripsi: '' };
    }
    newRecipes[index][field] = value;
    setRecipes(newRecipes);

    if (field === 'deskripsi') {
        const textarea = document.getElementById(`recipe-desc-${index}`) as HTMLTextAreaElement;
        if(textarea) {
            textarea.style.height = 'auto';
            textarea.style.height = `${textarea.scrollHeight}px`;
        }
    }
  };

  useEffect(() => {
    const pages = getPagesCount();
    if (pages - 1 > recipes.length) {
      const additional = Array.from({ length: (pages - 1) - recipes.length }, () => ({ nama: '', deskripsi: '' }));
      setRecipes(prev => [...prev, ...additional]);
    }
  }, [formData.jumlahHalaman, formData.customJumlahHalaman]);

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
    try {
      const combined = resultPrompts.join('\n\n-------------------------\n\n');
      await navigator.clipboard.writeText(combined);
      setCopiedAll(true);
      triggerToast("Semua prompt berhasil disalin.");
      setTimeout(() => setCopiedAll(false), 2000);
    } catch (err) {
      triggerToast("Gagal menyalin prompt.", "error");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.judul) {
      triggerToast("Judul Buku Resep wajib diisi", "error");
      return;
    }
    
    setLoading(true);
    try {
      const pagesCount = getPagesCount();
      const activeRecipes = recipes.slice(0, Math.max(0, pagesCount - 1));

      const payload = {
        ...formData,
        pagesCount,
        recipes: activeRecipes
      };

      const response = await fetch('/api/generate-buku-resep', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      setResultPrompts(data.prompts);

      setTimeout(() => {
        if (window.innerWidth >= 1024 && promptResultRef.current) {
           promptResultRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else if (window.innerWidth < 1024) {
           window.scrollTo({
             top: document.documentElement.scrollHeight,
             behavior: 'smooth'
           });
        }
      }, 100);

    } catch (error) {
      console.error('Error:', error);
      triggerToast("Gagal menghasilkan prompt. Silakan coba lagi.", "error");
    } finally {
      setLoading(false);
    }
  };

  const pagesCount = getPagesCount();

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-24 relative">
      {/* Toast Notification */}
      <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 ${showToast ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'}`}>
        <div className={`flex items-center gap-2 px-5 py-3 rounded-full shadow-lg ${toastType === 'success' ? 'bg-slate-800 text-white' : 'bg-red-500 text-white'}`}>
          {toastType === 'success' ? <Check className="w-4 h-4" /> : <div className="w-4 h-4" />}
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      </div>

      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16 gap-4">
            <button 
              onClick={() => navigate('/home')}
              className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-600 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-teal-100 flex items-center justify-center">
                <ChefHat className="w-5 h-5 text-teal-600" />
              </div>
              <h1 className="text-xl font-bold text-slate-800">Buku Resep Masak</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Kolom Kiri: Form */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200">
              <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* Informasi Dasar */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Judul Buku Resep <span className="text-red-500">*</span></label>
                  <input 
                    type="text" 
                    name="judul" 
                    value={formData.judul} 
                    onChange={handleInputChange}
                    placeholder="Contoh: Kumpulan Resep Nusantara"
                    className="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-xl px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Nama Pembuat</label>
                  <input 
                    type="text" 
                    name="namaPembuat" 
                    value={formData.namaPembuat} 
                    onChange={handleInputChange}
                    placeholder="Contoh: Libria"
                    className="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-xl px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Jumlah Halaman</label>
                  <select 
                    name="jumlahHalaman" 
                    value={formData.jumlahHalaman} 
                    onChange={handleInputChange}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-xl px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all appearance-none"
                  >
                    {pageCounts.map(count => <option key={count} value={count}>{count}</option>)}
                  </select>
                </div>

                {formData.jumlahHalaman === "Custom" && (
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Masukkan Jumlah Halaman</label>
                    <input 
                      type="number" 
                      name="customJumlahHalaman" 
                      value={formData.customJumlahHalaman} 
                      onChange={handleInputChange}
                      min="1"
                      className="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-xl px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                    />
                  </div>
                )}

                {/* Dynamic Recipe Pages */}
                {pagesCount > 1 && (
                  <div className="pt-4 border-t border-slate-100 space-y-5">
                    <h3 className="font-semibold text-slate-800 text-base">Detail Resep</h3>
                    <p className="text-sm text-slate-500 -mt-2">Isi judul dan resep untuk setiap halaman. (Halaman 1 adalah Cover)</p>
                    
                    {Array.from({ length: pagesCount - 1 }).map((_, idx) => (
                      <div key={idx} className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100 space-y-4">
                        <div className="flex items-center gap-2 mb-2">
                           <div className="bg-teal-100 text-teal-700 text-xs font-bold px-2.5 py-1 rounded-md">Halaman {idx + 2}</div>
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-slate-700 mb-1.5">Nama Resep Halaman {idx + 2}</label>
                          <input 
                            type="text" 
                            value={recipes[idx]?.nama || ''}
                            onChange={(e) => handleRecipeChange(idx, 'nama', e.target.value)}
                            placeholder="Contoh: Ayam Penyet Sambal Ijo"
                            className="w-full bg-white border border-slate-200 text-slate-700 rounded-xl px-4 py-3 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-slate-700 mb-1.5">Isi Resep Sendiri (Halaman {idx + 2}) <span className="text-slate-400 font-normal">(Opsional)</span></label>
                          <textarea 
                            id={`recipe-desc-${idx}`}
                            value={recipes[idx]?.deskripsi || ''}
                            onChange={(e) => handleRecipeChange(idx, 'deskripsi', e.target.value)}
                            placeholder="Contoh: Gunakan ayam kampung, rasa pedas sedang, tanpa santan."
                            className="w-full bg-white border border-slate-200 text-slate-700 rounded-xl px-4 py-3 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all text-sm resize-none overflow-hidden"
                            rows={2}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Visual Settings */}
                <div className="pt-4 border-t border-slate-100 space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">Gaya Desain</label>
                      <select name="gayaDesain" value={formData.gayaDesain} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-xl px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all">
                        {designStyles.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">Gaya Foto / Ilustrasi</label>
                      <select name="gayaFoto" value={formData.gayaFoto} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-xl px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all">
                        {photoStyles.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-5">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">Sudut Pengambilan Gambar</label>
                      <select name="sudutGambar" value={formData.sudutGambar} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-xl px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all">
                        {cameraAngles.map(a => <option key={a} value={a}>{a}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="flex flex-col gap-3">
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Warna Dominan</label>
                        <select name="warnaDominan" value={formData.warnaDominan} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-xl px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all">
                          {dominantColors.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>
                      {formData.warnaDominan === "Custom" && (
                        <div>
                          <input 
                            type="text" 
                            name="customWarnaDominan" 
                            value={formData.customWarnaDominan} 
                            onChange={handleInputChange}
                            placeholder="Contoh: Biru Muda"
                            className="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-xl px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                          />
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">Bahasa</label>
                      <select name="bahasa" value={formData.bahasa} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-xl px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all">
                        {languages.map(l => <option key={l} value={l}>{l}</option>)}
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
                    Isi form di samping lalu klik Generate untuk membuat prompt buku resep masak.
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
