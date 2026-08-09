import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Sparkles, Copy, Check, CopyCheck, BookHeart, Files } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const doaTypes = [
  "Doa Harian", "Doa Anak Muslim", "Doa Pilihan", "Dzikir Harian", "Custom"
];

const pageCounts = [
  "1 Halaman (Cover)", "2 Halaman", "3 Halaman", "4 Halaman", "5 Halaman",
  "6 Halaman", "7 Halaman", "8 Halaman", "9 Halaman", "10 Halaman", "Custom"
];

const targetAges = [
  "Anak 2–5 Tahun", "Anak 6–10 Tahun", "Remaja", "Dewasa", "Keluarga"
];

const designStyles = [
  "Amigurumi", "Paper Craft", "Plushie", "Kids Islamic", 
  "Modern Islamic", "Premium Islamic", "Minimalist", 
  "Elegant", "Soft Pastel", "Luxury Gold", "Watercolor", "Flat Illustration"
];

const illustrationStyles = [
  "Cute Muslim Character", "Muslim Faceless", "Cartoon Islamic", 
  "3D Illustration", "Realistic", "Watercolor Illustration", 
  "Kawaii", "Minimal Illustration", "No Illustration"
];

const dominantColors = [
  "Pastel", "Hijau Islami", "Cream", "Beige", "Gold Luxury", 
  "Blue", "Pink", "Earth Tone", "Monochrome"
];

const sizes = [
  "1:1 (Instagram)", "4:5 (Instagram Feed)", "9:16 (Story/Reels)", 
  "16:9 Landscape", "A4 Portrait (Print Ready)", "A4 Landscape (Print Ready)", 
  "F4 Portrait (Print Ready)", "F4 Landscape (Print Ready)"
];

export function BukuDoa() {
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
    judulBuku: '',
    namaPembuat: '',
    jenisBukuDoa: doaTypes[0],
    customJenisBukuDoa: '',
    jumlahHalaman: pageCounts[4], // 5 Halaman
    customJumlahHalaman: 5,
    targetPembaca: targetAges[1],
    gayaDesain: designStyles[3],
    gayaIlustrasi: illustrationStyles[0],
    facelessMode: true,
    warnaDominan: dominantColors[0],
    ukuran: sizes[4]
  });

  const [doaList, setDoaList] = useState(Array.from({ length: 4 }, () => ({ namaDoa: '', materiDoa: '' })));

  // Update doaList when jumlahHalaman changes
  useEffect(() => {
    let count = 0;
    if (formData.jumlahHalaman === 'Custom') {
      count = Math.max(1, formData.customJumlahHalaman) - 1;
    } else {
      const match = formData.jumlahHalaman.match(/\d+/);
      if (match) {
        count = parseInt(match[0]) - 1;
      }
    }
    
    setDoaList(prev => {
      if (prev.length === count) return prev;
      if (prev.length < count) {
        return [...prev, ...Array.from({ length: count - prev.length }, () => ({ namaDoa: '', materiDoa: '' }))];
      } else {
        return prev.slice(0, count);
      }
    });
  }, [formData.jumlahHalaman, formData.customJumlahHalaman]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const target = e.target;
    const name = target.name;
    const value = target.type === 'checkbox' ? (target as HTMLInputElement).checked : target.value;
    
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDoaChange = (index: number, field: 'namaDoa' | 'materiDoa', value: string) => {
    setDoaList(prev => {
      const newList = [...prev];
      newList[index] = { ...newList[index], [field]: value };
      return newList;
    });
    
    // Auto resize textarea
    const target = document.getElementById(`materiDoa-${index}`);
    if (target && target.tagName.toLowerCase() === 'textarea') {
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
      triggerToast("Gagal menyalin text", "error");
    }
  };

  const handleCopyAll = async () => {
    if (resultPrompts.length === 0) return;
    
    const allText = resultPrompts.map((p, i) => 
      i === 0 ? `📖 Cover\n${p}` : `📖 Doa Halaman ${i + 1}\n${p}`
    ).join('\n\n----------------\n\n');
    
    try {
      await navigator.clipboard.writeText(allText);
      setCopiedAll(true);
      triggerToast("Semua prompt berhasil disalin.");
      setTimeout(() => setCopiedAll(false), 2000);
    } catch (err) {
      triggerToast("Gagal menyalin text", "error");
    }
  };

  const handleGenerate = async () => {
    try {
      setLoading(true);
      setResultPrompts([]);
      setCopiedIndex(null);
      setCopiedAll(false);

      const actualHalaman = formData.jumlahHalaman === 'Custom' 
        ? formData.customJumlahHalaman 
        : parseInt(formData.jumlahHalaman.match(/\d+/)?.[0] || '1');

      const response = await fetch('/api/generate-buku-doa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          actualHalaman,
          doaList
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Gagal menghasilkan prompt');
      }
      setResultPrompts(data.prompts || []);
      
      triggerToast("Berhasil membuat prompt!");

      setTimeout(() => {
        promptResultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);

    } catch (error) {
      console.error(error);
      triggerToast(error instanceof Error ? error.message : 'Terjadi kesalahan saat membuat prompt.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-8 lg:p-12 max-w-7xl mx-auto">
      {/* Toast Notification */}
      {showToast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl shadow-lg border flex items-center gap-3 animate-in fade-in slide-in-from-top-5 ${toastType === 'success' ? 'bg-white border-green-200 text-slate-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${toastType === 'success' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
            {toastType === 'success' ? <Check className="w-5 h-5" /> : <span className="font-bold">!</span>}
          </div>
          <p className="font-medium text-sm">{toastMessage}</p>
        </div>
      )}

      {/* Header */}
      <header className="mb-10 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/home')}
            className="w-10 h-10 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2.5 mb-1">
              <div className="w-8 h-8 bg-rose-500 rounded-lg flex items-center justify-center shadow-md shadow-rose-500/25">
                <BookHeart className="w-4.5 h-4.5 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Buku Doa</h1>
            </div>
            <p className="text-sm text-slate-500 font-medium ml-[42px]">AI Prompt Generator</p>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        {/* Left Column - Form */}
        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200/60 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-rose-50 rounded-full blur-3xl -z-10 opacity-60 translate-x-1/2 -translate-y-1/2"></div>
          
          <div className="space-y-8 relative z-10">
            {/* Basic Info */}
            <div className="space-y-5">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <div className="w-1.5 h-6 bg-rose-500 rounded-full"></div>
                <h2 className="text-lg font-bold text-slate-800">Informasi Buku</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Judul Buku Doa</label>
                  <input 
                    type="text" 
                    name="judulBuku"
                    value={formData.judulBuku}
                    onChange={handleInputChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all placeholder:text-slate-400"
                    placeholder="Kumpulan Doa Harian Anak Muslim"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Nama Pembuat</label>
                  <input 
                    type="text" 
                    name="namaPembuat"
                    value={formData.namaPembuat}
                    onChange={handleInputChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all placeholder:text-slate-400"
                    placeholder="Libria"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Jenis Buku Doa</label>
                  <select 
                    name="jenisBukuDoa"
                    value={formData.jenisBukuDoa}
                    onChange={handleInputChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2364748B%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[position:right_12px_center] bg-[length:20px]"
                  >
                    {doaTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                {formData.jenisBukuDoa === 'Custom' && (
                  <div className="md:col-span-2 animate-in slide-in-from-top-2">
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Nama Jenis Buku Doa</label>
                    <input 
                      type="text" 
                      name="customJenisBukuDoa"
                      value={formData.customJenisBukuDoa}
                      onChange={handleInputChange}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all placeholder:text-slate-400"
                      placeholder="Masukkan jenis buku doa..."
                    />
                  </div>
                )}
                
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Jumlah Halaman</label>
                  <select 
                    name="jumlahHalaman"
                    value={formData.jumlahHalaman}
                    onChange={handleInputChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2364748B%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[position:right_12px_center] bg-[length:20px]"
                  >
                    {pageCounts.map(count => (
                      <option key={count} value={count}>{count}</option>
                    ))}
                  </select>
                </div>
                
                {formData.jumlahHalaman === 'Custom' && (
                  <div className="animate-in slide-in-from-top-2">
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Total Halaman</label>
                    <input 
                      type="number" 
                      min="1"
                      max="100"
                      name="customJumlahHalaman"
                      value={formData.customJumlahHalaman}
                      onChange={handleInputChange}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all placeholder:text-slate-400"
                      placeholder="Contoh: 15"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* List of Doa */}
            {doaList.length > 0 && (
              <div className="space-y-5">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                  <div className="w-1.5 h-6 bg-rose-500 rounded-full"></div>
                  <h2 className="text-lg font-bold text-slate-800">Daftar Doa</h2>
                </div>
                
                <p className="text-xs text-slate-500 -mt-2">Halaman 1 selalu Cover Buku Doa.</p>

                <div className="space-y-4">
                  {doaList.map((doa, idx) => (
                    <div key={idx} className="p-4 bg-slate-50/80 border border-slate-100 rounded-xl space-y-3 relative">
                      <div className="absolute -left-2 -top-2 w-7 h-7 bg-white border border-slate-200 rounded-full flex items-center justify-center text-xs font-bold text-slate-600 shadow-sm">
                        {idx + 2}
                      </div>
                      <div className="ml-2">
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">Nama Doa {idx + 1}</label>
                        <input 
                          type="text" 
                          value={doa.namaDoa}
                          onChange={(e) => handleDoaChange(idx, 'namaDoa', e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all placeholder:text-slate-400"
                          placeholder="Contoh: Doa Sebelum Tidur"
                        />
                      </div>
                      <div className="ml-2">
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex justify-between items-end">
                          Materi Doa
                          <span className="text-[10px] text-slate-400 font-normal">Opsional</span>
                        </label>
                        <textarea 
                          id={`materiDoa-${idx}`}
                          value={doa.materiDoa}
                          onChange={(e) => handleDoaChange(idx, 'materiDoa', e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all placeholder:text-slate-400 min-h-[60px] resize-none overflow-hidden"
                          placeholder="Contoh: Doa sebelum tidur..."
                          rows={2}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Design & Target */}
            <div className="space-y-5">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <div className="w-1.5 h-6 bg-rose-500 rounded-full"></div>
                <h2 className="text-lg font-bold text-slate-800">Desain & Visual</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Target Pembaca</label>
                  <select 
                    name="targetPembaca"
                    value={formData.targetPembaca}
                    onChange={handleInputChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2364748B%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[position:right_12px_center] bg-[length:20px]"
                  >
                    {targetAges.map(age => (
                      <option key={age} value={age}>{age}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Gaya Desain</label>
                  <select 
                    name="gayaDesain"
                    value={formData.gayaDesain}
                    onChange={handleInputChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2364748B%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[position:right_12px_center] bg-[length:20px]"
                  >
                    {designStyles.map(style => (
                      <option key={style} value={style}>{style}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Gaya Ilustrasi</label>
                  <select 
                    name="gayaIlustrasi"
                    value={formData.gayaIlustrasi}
                    onChange={handleInputChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2364748B%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[position:right_12px_center] bg-[length:20px]"
                  >
                    {illustrationStyles.map(style => (
                      <option key={style} value={style}>{style}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-3">Mode Faceless</label>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      name="facelessMode" 
                      checked={formData.facelessMode} 
                      onChange={handleInputChange}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-rose-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-600"></div>
                    <span className="ml-3 text-sm font-medium text-slate-700">
                      {formData.facelessMode ? 'ON' : 'OFF'} <span className="text-slate-400 font-normal ml-1">(Tanpa detail wajah)</span>
                    </span>
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Warna Dominan</label>
                  <select 
                    name="warnaDominan"
                    value={formData.warnaDominan}
                    onChange={handleInputChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2364748B%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[position:right_12px_center] bg-[length:20px]"
                  >
                    {dominantColors.map(color => (
                      <option key={color} value={color}>{color}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Ukuran</label>
                  <select 
                    name="ukuran"
                    value={formData.ukuran}
                    onChange={handleInputChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2364748B%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[position:right_12px_center] bg-[length:20px]"
                  >
                    {sizes.map(size => (
                      <option key={size} value={size}>{size}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Generate Button */}
            <div className="pt-2">
              <button
                onClick={handleGenerate}
                disabled={loading}
                className="w-full bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-xl py-4 flex items-center justify-center gap-2 transition-all shadow-lg shadow-rose-500/30 disabled:opacity-70 disabled:cursor-not-allowed group"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <Sparkles className="w-5 h-5 group-hover:scale-110 transition-transform" />
                )}
                {loading ? 'Membuat Prompt...' : 'Generate Prompt'}
              </button>
            </div>
          </div>
        </div>

        {/* Right Column - Results */}
        <div className="md:sticky md:top-8 space-y-6" ref={promptResultRef}>
          {resultPrompts.length > 0 ? (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                  <div className="w-2 h-6 bg-rose-500 rounded-full"></div>
                  Hasil Prompt
                </h3>
                
                {resultPrompts.length > 1 && (
                  <button 
                    onClick={handleCopyAll}
                    className="flex items-center gap-1.5 text-sm font-medium text-rose-600 bg-rose-50 hover:bg-rose-100 px-3 py-1.5 rounded-lg transition-colors border border-rose-100"
                  >
                    {copiedAll ? <CopyCheck className="w-4 h-4" /> : <Files className="w-4 h-4" />}
                    {copiedAll ? 'Tersalin!' : 'Copy All'}
                  </button>
                )}
              </div>
              
              <div className="space-y-6">
                {resultPrompts.map((prompt, idx) => (
                  <div key={idx} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden group">
                    <div className="bg-slate-50 border-b border-slate-200 px-4 py-3 flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-white border border-slate-200 flex items-center justify-center text-xs font-bold text-slate-500">
                          {idx === 0 ? "📖" : "📖"}
                        </div>
                        <span className="text-sm font-semibold text-slate-700">
                          {idx === 0 ? "Cover" : `Doa Halaman ${idx + 1}`}
                        </span>
                      </div>
                      <button 
                        onClick={() => handleCopy(prompt, idx)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                          copiedIndex === idx 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-rose-600 hover:border-rose-200'
                        }`}
                      >
                        {copiedIndex === idx ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        {copiedIndex === idx ? 'Copied' : 'Copy'}
                      </button>
                    </div>
                    <div className="p-0">
                      <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                        <div className="p-4 bg-slate-900 text-slate-300 font-mono text-sm leading-relaxed whitespace-pre-wrap selection:bg-rose-500/30">
                          {prompt}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-[400px] bg-slate-50/50 border border-slate-200 border-dashed rounded-3xl flex flex-col items-center justify-center text-center p-8">
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm mb-4">
                <BookHeart className="w-8 h-8 text-rose-300" />
              </div>
              <h3 className="text-lg font-bold text-slate-700 mb-2">Belum ada prompt</h3>
              <p className="text-slate-500 text-sm max-w-[250px]">
                Isi form di samping dan klik Generate untuk membuat prompt buku doa Anda.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
