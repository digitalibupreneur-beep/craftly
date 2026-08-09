import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Sparkles, Copy, Check, CopyCheck, MessageSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const pageCounts = [
  "1 Halaman (Cover)", "2 Halaman", "3 Halaman", "4 Halaman", "5 Halaman", 
  "6 Halaman", "7 Halaman", "8 Halaman", "9 Halaman", "10 Halaman", "Custom"
];

const comicStyles = [
  "Islami", "Petualangan", "Action", "Komedi", "Fantasi", 
  "Horor", "Misteri", "Slice of Life", "Edukasi", "Superhero", 
  "Sci-Fi", "Romance", "Custom"
];

const ages = ["Anak", "Remaja", "Dewasa"];
const genders = ["Laki-laki", "Perempuan"];

const illustrationStyles = [
  "Anime", "Chibi", "Manga", "Cartoon", "Semi Realistic", 
  "Realistic", "Manhwa", "Webtoon", "Disney Inspired", "Ghibli Inspired"
];

const dominantColors = [
  "Colorful", "Pastel", "Earth Tone", "Dark", "Monochrome", 
  "Warm", "Cool", "Islamic Green"
];

const languages = [
  "🇮🇩 Indonesia", "🇬🇧 English", "🇸🇦 العربية", "🇯🇵 日本語"
];

const sizes = [
  "1:1", "4:5", "9:16", "16:9 Landscape", 
  "A4 Portrait", "A4 Landscape", "F4 Portrait", "F4 Landscape"
];

export function Komik() {
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
    gayaKomik: comicStyles[0],
    customGayaKomik: '',
    sinopsis: '',
    jumlahHalaman: pageCounts[4], // 5 Halaman
    customJumlahHalaman: 5,
    namaKarakter: '',
    umur: ages[0],
    jenisKelamin: genders[0],
    deskripsiKarakter: '',
    gayaIlustrasi: illustrationStyles[0],
    facelessMode: true,
    warnaDominan: dominantColors[0],
    bahasa: languages[0],
    ukuran: sizes[4] // A4 Portrait
  });

  const getPagesCount = () => {
    if (formData.jumlahHalaman === "Custom") return Math.max(1, formData.customJumlahHalaman || 1);
    const num = parseInt(formData.jumlahHalaman.split(" ")[0]);
    return isNaN(num) ? 1 : num;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
    
    if (e.target.tagName.toLowerCase() === 'textarea') {
      const target = e.target as HTMLTextAreaElement;
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
      triggerToast("Gagal menyalin prompt", "error");
    }
  };

  const handleCopyAll = async () => {
    try {
      const allText = resultPrompts.map((p, i) => {
        const title = i === 0 ? "📖 Cover\n" : `📖 Halaman ${i + 1}\n`;
        return `${title}${p}\n----------------------------\n`;
      }).join("\n");
      await navigator.clipboard.writeText(allText);
      setCopiedAll(true);
      triggerToast("Semua prompt berhasil disalin.");
      setTimeout(() => setCopiedAll(false), 2000);
    } catch (err) {
      triggerToast("Gagal menyalin semua prompt", "error");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.judul) {
      triggerToast("Judul Komik wajib diisi", "error");
      return;
    }
    
    setLoading(true);
    try {
      const pagesCount = getPagesCount();
      
      const payload = {
        ...formData,
        pagesCount
      };

      const response = await fetch('/api/generate-komik', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      setResultPrompts(data.prompts);

      if (window.innerWidth < 1024) {
        setTimeout(() => {
          promptResultRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    } catch (error) {
      console.error('Error generating prompts:', error);
      triggerToast("Gagal membuat prompt. Silakan coba lagi.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-24">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-16 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => navigate('/home')}
                className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-slate-600" />
              </button>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#EC4899] flex items-center justify-center">
                  <MessageSquare className="w-4 h-4 text-white" />
                </div>
                <h1 className="text-xl font-bold text-slate-900">Buku Komik</h1>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Toast Notification */}
      <div className={`fixed top-24 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 ${showToast ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'}`}>
        <div className={`flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg border ${toastType === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
          {toastType === 'success' ? <Check className="w-5 h-5" /> : <span className="w-5 h-5 flex items-center justify-center font-bold">!</span>}
          <p className="font-medium text-sm">{toastMessage}</p>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Kolom Kiri: Form */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200">
              <form onSubmit={handleSubmit} className="space-y-8">
                
                {/* Info Utama */}
                <div className="space-y-5">
                  <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                    <span className="w-6 h-6 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center text-xs font-bold">1</span>
                    <h3 className="font-bold text-slate-800 text-lg">Info Komik</h3>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Judul Komik</label>
                    <input 
                      type="text" 
                      name="judul" 
                      value={formData.judul} 
                      onChange={handleInputChange}
                      placeholder="Contoh: Petualangan Umar di Negeri Cahaya"
                      className="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-xl px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Nama Pembuat (Opsional)</label>
                    <input 
                      type="text" 
                      name="namaPembuat" 
                      value={formData.namaPembuat} 
                      onChange={handleInputChange}
                      placeholder="Contoh: Libria"
                      className="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-xl px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="flex flex-col gap-3">
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Gaya Komik</label>
                        <select name="gayaKomik" value={formData.gayaKomik} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-xl px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all">
                          {comicStyles.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </div>
                      {formData.gayaKomik === "Custom" && (
                        <div>
                          <input 
                            type="text" 
                            name="customGayaKomik" 
                            value={formData.customGayaKomik} 
                            onChange={handleInputChange}
                            placeholder="Nama Gaya Komik"
                            className="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-xl px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                          />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex flex-col gap-3">
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Jumlah Halaman</label>
                        <select name="jumlahHalaman" value={formData.jumlahHalaman} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-xl px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all">
                          {pageCounts.map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                      </div>
                      {formData.jumlahHalaman === "Custom" && (
                        <div>
                          <input 
                            type="number" 
                            min="1"
                            name="customJumlahHalaman" 
                            value={formData.customJumlahHalaman} 
                            onChange={handleInputChange}
                            className="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-xl px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Sinopsis</label>
                    <textarea 
                      name="sinopsis" 
                      value={formData.sinopsis} 
                      onChange={handleInputChange}
                      placeholder="Tuliskan ide singkat cerita. AI akan mengembangkan cerita menjadi komik lengkap."
                      className="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-xl px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all min-h-[100px] resize-y"
                    ></textarea>
                  </div>
                </div>

                {/* Detail Karakter */}
                <div className="space-y-5">
                  <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                    <span className="w-6 h-6 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center text-xs font-bold">2</span>
                    <h3 className="font-bold text-slate-800 text-lg">Detail Karakter</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">Nama Karakter Utama</label>
                      <input 
                        type="text" 
                        name="namaKarakter" 
                        value={formData.namaKarakter} 
                        onChange={handleInputChange}
                        className="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-xl px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Umur</label>
                        <select name="umur" value={formData.umur} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-xl px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all">
                          {ages.map(a => <option key={a} value={a}>{a}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Jenis Kelamin</label>
                        <select name="jenisKelamin" value={formData.jenisKelamin} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-xl px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all">
                          {genders.map(g => <option key={g} value={g}>{g}</option>)}
                        </select>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Deskripsi Karakter</label>
                    <textarea 
                      name="deskripsiKarakter" 
                      value={formData.deskripsiKarakter} 
                      onChange={handleInputChange}
                      placeholder="Contoh: Pemberani, memakai jubah putih, celana coklat, membawa tas kecil."
                      className="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-xl px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all min-h-[100px] resize-y"
                    ></textarea>
                  </div>
                </div>

                {/* Gaya Visual */}
                <div className="space-y-5">
                  <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                    <span className="w-6 h-6 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center text-xs font-bold">3</span>
                    <h3 className="font-bold text-slate-800 text-lg">Gaya Visual</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">Style Ilustrasi</label>
                      <select name="gayaIlustrasi" value={formData.gayaIlustrasi} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-xl px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all">
                        {illustrationStyles.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                    <div className="flex items-end pb-2">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <div className="relative">
                          <input 
                            type="checkbox" 
                            name="facelessMode" 
                            checked={formData.facelessMode} 
                            onChange={handleInputChange} 
                            className="sr-only" 
                          />
                          <div className={`block w-12 h-7 rounded-full transition-colors ${formData.facelessMode ? 'bg-blue-500' : 'bg-slate-300'}`}></div>
                          <div className={`absolute left-1 top-1 bg-white w-5 h-5 rounded-full transition-transform ${formData.facelessMode ? 'translate-x-5' : ''}`}></div>
                        </div>
                        <span className="text-sm font-semibold text-slate-700">Faceless Mode</span>
                      </label>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">Warna Dominan</label>
                      <select name="warnaDominan" value={formData.warnaDominan} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-xl px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all">
                        {dominantColors.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">Bahasa</label>
                      <select name="bahasa" value={formData.bahasa} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-xl px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all">
                        {languages.map(l => <option key={l} value={l}>{l}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">Ukuran</label>
                      <select name="ukuran" value={formData.ukuran} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-xl px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all">
                        {sizes.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
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
                      <div className="h-48 bg-slate-100 rounded-xl w-full"></div>
                    </div>
                  ))}
                </div>
              ) : resultPrompts.length > 0 ? (
                <div className="space-y-6">
                  {resultPrompts.map((prompt, index) => (
                    <div key={index} className="animate-in fade-in duration-500">
                      <h3 className="font-semibold text-slate-800 mb-2 flex items-center gap-2">
                        <MessageSquare className="w-4 h-4 text-pink-500" />
                        {index === 0 ? "Cover (Halaman 1)" : `Halaman ${index + 1}`}
                      </h3>
                      
                      <div className="relative group">
                        <div className="w-full max-h-[400px] min-h-[250px] overflow-y-auto bg-slate-50 border border-slate-200 text-slate-700 rounded-xl p-4 text-[13px] whitespace-pre-wrap font-mono custom-scrollbar">
                          {prompt}
                        </div>
                      </div>
                      
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
                    Isi form di samping lalu klik Generate untuk membuat prompt komik.
                  </p>
                </div>
              )}
            </div>
          </div>
          
        </div>
      </main>
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: #cbd5e1;
          border-radius: 20px;
        }
      `}</style>
    </div>
  );
}
