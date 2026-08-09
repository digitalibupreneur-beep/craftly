import React, { useState, useRef } from 'react';
import { ArrowLeft, Sparkles, Copy, Check, Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const jenisAmplopOptions = [
  "Amplop Surat", "Amplop Uang", "Amplop Lebaran", "Amplop Angpao",
  "Amplop Undangan", "Amplop Kartu Ucapan", "Amplop Gift Card", "Custom"
];

const ukuranAmplopGroups = [
  {
    label: "Amplop THR / Angpau",
    options: [
      "Small (7 × 9 cm)",
      "Medium (8 × 12 cm)",
      "Large (8 × 16 cm)",
      "Jumbo (8.5 × 16 cm)"
    ]
  },
  {
    label: "Amplop Surat / Undangan",
    options: [
      "11 × 22 cm",
      "13 × 23 cm",
      "15 × 25 cm",
      "17 × 26 cm"
    ]
  },
  {
    label: "Custom",
    options: ["Custom"]
  }
];

const ukuranKertasOptions = [
  "A4 Portrait", "A4 Landscape", "F4 Portrait", "F4 Landscape"
];

const gayaDesainOptions = [
  "Minimalist", "Elegant", "Luxury", "Premium", "Modern", "Floral", 
  "Islamic", "Kids", "Cute", "Rustic", "Vintage", "Corporate", "Plain Template"
];

const warnaDominanOptions = [
  "Putih", "Cream", "Beige", "Hijau", "Emerald", "Gold", "Navy", "Hitam", 
  "Merah", "Pink", "Pastel", "Earth Tone", "Custom"
];

const elemenDekorasiOptions = [
  "Floral", "Islamic Ornament", "Geometric", "Batik", "Watercolor", 
  "Premium Gold", "Simple Border", "Kids Decoration", "Vintage Pattern", "No Decoration", "Custom"
];

const bahasaOptions = ["Indonesia", "English"];

export default function Amplop() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [resultPrompt, setResultPrompt] = useState("");
  const [copied, setCopied] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  
  const promptResultRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState({
    jenisAmplop: jenisAmplopOptions[0],
    customJenisAmplop: '',
    ukuranAmplop: ukuranAmplopGroups[0].options[0],
    customLebar: '',
    customTinggi: '',
    customSatuan: 'mm',
    ukuranKertas: ukuranKertasOptions[0],
    headline: '',
    gayaDesain: gayaDesainOptions[0],
    warnaDominan: warnaDominanOptions[0],
    customWarnaDominan: '',
    elemenDekorasi: elemenDekorasiOptions[0],
    customElemenDekorasi: '',
    bahasa: bahasaOptions[0]
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const target = e.target;
    const name = target.name;
    const value = target.value;
    
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3000);
  };

  const handleCopy = async () => {
    if (!resultPrompt) return;
    try {
      await navigator.clipboard.writeText(resultPrompt);
      setCopied(true);
      triggerToast("Prompt berhasil disalin.");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.jenisAmplop === 'Custom' && !formData.customJenisAmplop) {
      triggerToast("Nama Amplop Custom wajib diisi.");
      return;
    }

    if (formData.ukuranAmplop === 'Custom' && (!formData.customLebar || !formData.customTinggi)) {
      triggerToast("Lebar dan Tinggi Amplop Custom wajib diisi.");
      return;
    }

    try {
      setLoading(true);
      setResultPrompt("");
      setCopied(false);

      const response = await fetch('/api/generate-amplop', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Terjadi kesalahan saat membuat prompt.');
      }

      setResultPrompt(data.prompt);
      
      setTimeout(() => {
        promptResultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    } catch (error: any) {
      triggerToast(error.message || "Gagal menghasilkan prompt.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20 font-sans">
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 animate-in fade-in slide-in-from-top-4">
          <div className="bg-slate-800 text-white px-6 py-3 rounded-xl shadow-xl flex items-center gap-3">
            <Check className="w-5 h-5 text-green-400" />
            <span className="text-sm font-medium">{toastMessage}</span>
          </div>
        </div>
      )}

      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-30 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/home')}
              className="p-2 hover:bg-slate-100 rounded-full transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-slate-600" />
            </button>
            <div>
              <h1 className="text-lg font-bold text-slate-900 leading-tight">Desain Amplop</h1>
              <p className="text-xs text-slate-500 font-medium">Envelope Dieline Template Generator</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-12 gap-8">
          <div className="lg:col-span-5 xl:col-span-4 space-y-6">
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-sm border border-slate-200 p-6 transition-all duration-300 hover:shadow-md">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-2xl bg-blue-100 flex items-center justify-center shadow-inner">
                  <Mail className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Spesifikasi</h2>
                  <p className="text-sm text-slate-500">Atur detail template amplop</p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Jenis Amplop</label>
                  <select 
                    name="jenisAmplop"
                    value={formData.jenisAmplop}
                    onChange={handleInputChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2364748B%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[position:right_12px_center] bg-[length:20px]"
                  >
                    {jenisAmplopOptions.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>

                {formData.jenisAmplop === "Custom" && (
                  <div className="animate-in fade-in slide-in-from-top-2">
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Nama Amplop</label>
                    <input 
                      type="text"
                      name="customJenisAmplop"
                      value={formData.customJenisAmplop}
                      onChange={handleInputChange}
                      placeholder="Contoh: Amplop Surat A5"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Ukuran Amplop</label>
                  <select 
                    name="ukuranAmplop"
                    value={formData.ukuranAmplop}
                    onChange={handleInputChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2364748B%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[position:right_12px_center] bg-[length:20px]"
                  >
                    {ukuranAmplopGroups.map(group => (
                      <optgroup key={group.label} label={group.label}>
                        {group.options.map(opt => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                </div>

                {formData.ukuranAmplop === "Custom" && (
                  <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Lebar (mm)</label>
                      <input 
                        type="number"
                        name="customLebar"
                        value={formData.customLebar}
                        onChange={handleInputChange}
                        placeholder="110"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Tinggi (mm)</label>
                      <input 
                        type="number"
                        name="customTinggi"
                        value={formData.customTinggi}
                        onChange={handleInputChange}
                        placeholder="220"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Ukuran Kertas Cetak</label>
                  <select 
                    name="ukuranKertas"
                    value={formData.ukuranKertas}
                    onChange={handleInputChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2364748B%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[position:right_12px_center] bg-[length:20px]"
                  >
                    {ukuranKertasOptions.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Headline Halaman Depan Amplop (Opsional)</label>
                  <input 
                    type="text"
                    name="headline"
                    value={formData.headline}
                    onChange={handleInputChange}
                    placeholder="Contoh: Selamat Menempuh Hidup Baru"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Gaya Desain</label>
                  <select 
                    name="gayaDesain"
                    value={formData.gayaDesain}
                    onChange={handleInputChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2364748B%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[position:right_12px_center] bg-[length:20px]"
                  >
                    {gayaDesainOptions.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Warna Dominan</label>
                  <select 
                    name="warnaDominan"
                    value={formData.warnaDominan}
                    onChange={handleInputChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2364748B%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[position:right_12px_center] bg-[length:20px]"
                  >
                    {warnaDominanOptions.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>

                {formData.warnaDominan === "Custom" && (
                  <div className="animate-in fade-in slide-in-from-top-2">
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Nama Warna Custom</label>
                    <input 
                      type="text"
                      name="customWarnaDominan"
                      value={formData.customWarnaDominan}
                      onChange={handleInputChange}
                      placeholder="Contoh: Midnight Blue"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Elemen Dekorasi</label>
                  <select 
                    name="elemenDekorasi"
                    value={formData.elemenDekorasi}
                    onChange={handleInputChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2364748B%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[position:right_12px_center] bg-[length:20px]"
                  >
                    {elemenDekorasiOptions.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Bahasa</label>
                  <select 
                    name="bahasa"
                    value={formData.bahasa}
                    onChange={handleInputChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2364748B%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[position:right_12px_center] bg-[length:20px]"
                  >
                    {bahasaOptions.map(lang => (
                      <option key={lang} value={lang}>{lang}</option>
                    ))}
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 px-4 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-blue-600/20 group mt-4"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <Sparkles className="w-5 h-5 group-hover:animate-pulse" />
                  )}
                  {loading ? 'Menghasilkan Prompt...' : '✨ Generate Prompt'}
                </button>
              </form>
            </div>
          </div>

          <div className="lg:col-span-7 xl:col-span-8" ref={promptResultRef}>
            {resultPrompt ? (
              <div className="space-y-4 animate-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center shadow-sm">
                    <Sparkles className="w-5 h-5 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">
                    Generated Prompt
                  </h3>
                </div>
                
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden group hover:shadow-md transition-shadow">
                  <div className="bg-slate-50 border-b border-slate-200 px-4 py-3 flex justify-between items-center">
                    <span className="text-sm font-semibold text-slate-700">Prompt Image</span>
                    <button 
                      onClick={handleCopy}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                        copied 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-blue-600 hover:border-blue-200'
                      }`}
                    >
                      {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      {copied ? 'Copied' : 'Copy Prompt'}
                    </button>
                  </div>
                  <div className="p-0">
                    <div className="max-h-[600px] overflow-y-auto custom-scrollbar">
                      <textarea 
                        readOnly
                        value={resultPrompt}
                        className="w-full p-4 bg-slate-900 text-slate-300 font-mono text-sm leading-relaxed whitespace-pre-wrap selection:bg-blue-500/30 resize-none min-h-[400px] outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-[500px] bg-slate-50 border border-slate-200 border-dashed rounded-3xl flex flex-col items-center justify-center text-center p-8 shadow-sm">
                {loading ? (
                   <div className="space-y-4 w-full max-w-[320px]">
                      <div className="h-6 bg-slate-200 rounded-md animate-pulse w-3/4 mx-auto"></div>
                      <div className="space-y-3 mt-8">
                        <div className="h-4 bg-slate-200 rounded-md animate-pulse w-full"></div>
                        <div className="h-4 bg-slate-200 rounded-md animate-pulse w-11/12 mx-auto"></div>
                        <div className="h-4 bg-slate-200 rounded-md animate-pulse w-5/6 mx-auto"></div>
                        <div className="h-4 bg-slate-200 rounded-md animate-pulse w-4/6 mx-auto"></div>
                      </div>
                   </div>
                ) : (
                  <>
                    <div className="w-16 h-16 bg-blue-100 text-blue-500 rounded-2xl flex items-center justify-center mb-6 shadow-inner">
                      <Sparkles className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">Belum ada prompt</h3>
                    <p className="text-slate-500 max-w-md text-sm leading-relaxed">
                      Isi form di samping lalu klik Generate untuk mendapatkan prompt pembuatan pola amplop profesional yang siap digunakan di Gemini atau ChatGPT.
                    </p>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
