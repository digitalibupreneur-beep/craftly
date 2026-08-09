import React, { useState, useRef } from 'react';
import { ArrowLeft, Sparkles, Copy, Check, MailOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const invitationTypes = [
  "Pernikahan", "Khitanan", "Aqiqah", "Ulang Tahun", "Wisuda",
  "Pengajian", "Seminar", "Webinar", "Meeting",
  "Grand Opening", "Reuni", "Buka Bersama", "Idul Fitri", "Idul Adha", "Custom"
];

const dominantColors = [
  "Putih", "Cream", "Gold", "Hijau Emerald", "Hijau Islami",
  "Navy", "Burgundy", "Pastel Pink", "Dusty Blue", "Earth Tone",
  "Hitam Elegan", "Custom"
];

const designStylesMap: Record<string, string[]> = {
  "Pernikahan": ["Luxury Wedding", "Elegant Wedding", "Modern Wedding", "Minimalist Wedding", "Islamic Wedding", "Floral Wedding", "Rustic Wedding", "Bohemian Wedding", "Vintage Wedding", "Royal Wedding", "Garden Wedding", "Watercolor Wedding", "Gold Luxury Wedding", "Black & Gold Wedding", "White Elegant Wedding"],
  "Khitanan": ["Kids Islamic", "Cartoon Muslim", "Cute Illustration", "Modern Islamic", "Elegant Islamic", "Soft Pastel", "Premium Islamic", "Minimalist", "Watercolor", "Paper Craft"],
  "Aqiqah": ["Baby Islamic", "Cute Baby", "Soft Pastel", "Watercolor", "Elegant Islamic", "Minimalist", "Premium Islamic", "Floral Baby", "Cartoon Baby", "Modern Baby"],
  "Ulang Tahun": ["Kids Party", "Cute Cartoon", "Chibi", "Kawaii", "Balloon Party", "Princess Theme", "Superhero Theme", "Dinosaur Theme", "Space Theme", "Safari Theme", "Unicorn Theme", "Rainbow Theme", "Candy Theme", "Gaming Theme", "Elegant Birthday", "Luxury Birthday"],
  "Wisuda": ["Academic Elegant", "Modern Graduation", "Premium Graduation", "Gold Graduation", "Minimalist Graduation", "Luxury Black Gold", "Formal Graduation"],
  "Seminar": ["Corporate", "Modern Professional", "Clean Minimalist", "Blue Professional", "Premium Business", "Technology", "AI Modern", "Elegant Formal"],
  "Webinar": ["Modern Digital", "AI Futuristic", "Technology", "Neon Gradient", "Minimal Professional", "Blue Corporate", "Elegant Webinar"],
  "Meeting": ["Corporate", "Executive", "Clean Business", "Minimal Office", "Modern Professional"],
  "Pengajian": ["Islamic Elegant", "Mosque Theme", "Luxury Islamic", "Green Islamic", "Gold Islamic", "Arabic Ornament", "Minimal Islamic", "Premium Islamic"],
  "Buka Bersama": ["Ramadhan Elegant", "Islamic Lantern", "Mosque Theme", "Crescent Moon", "Ramadan Kareem", "Luxury Islamic", "Warm Family", "Modern Islamic"],
  "Idul Fitri": ["Eid Mubarak", "Luxury Islamic", "Green Gold", "Ketupat Theme", "Mosque Theme", "Crescent Theme", "Elegant Islamic"],
  "Idul Adha": ["Eid Al Adha", "Islamic Premium", "Kaaba Theme", "Mosque Theme", "Elegant Islamic", "Green Gold"],
  "Grand Opening": ["Luxury Business", "Premium Corporate", "Modern Opening", "Elegant Gold", "Ribbon Ceremony", "Grand Luxury"],
  "Reuni": ["Vintage Memory", "Elegant Reunion", "Modern Friends", "Nostalgia", "Premium Gathering"],
  "Custom": ["Modern", "Minimalist", "Elegant", "Luxury", "Floral", "Watercolor", "Vintage", "Corporate", "Cute", "Premium"]
};

const getDesignStyles = (jenis: string) => designStylesMap[jenis] || designStylesMap["Custom"];

const decorationElements = [
  "Floral", "Islamic Ornament", "Batik", "Geometric", "Marble",
  "Gold Frame", "Watercolor Flower", "Leaves", "Lantern",
  "Mosque Silhouette", "Simple Border", "No Decoration"
];

const illustrationStyles = [
  "Tanpa Ilustrasi", "Muslim Couple Faceless", "Realistic Couple",
  "Cartoon Couple", "Watercolor Couple", "Floral Only",
  "Mosque Illustration", "Ka'bah Illustration", "Elegant Pattern"
];

const languages = [
  "🇮🇩 Indonesia", "🇬🇧 English", "🇸🇦 العربية", "🇯🇵 日本語"
];

const sizes = [
  "1:1", "4:5", "9:16", "16:9",
  "A4 Portrait", "A4 Landscape",
  "F4 Portrait", "F4 Landscape"
];

export function KartuUndangan() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [resultPrompt, setResultPrompt] = useState<string>("");
  const [copied, setCopied] = useState(false);
  
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("success");

  const promptResultRef = useRef<HTMLDivElement>(null);

  // Form State
  const [formData, setFormData] = useState({
    jenisUndangan: invitationTypes[0],
    customJenisUndangan: '',
    judulAcara: '',
    namaPenyelenggara: '',
    isiUndangan: '',
    detailAcara: '',
    warnaDominan: dominantColors[0],
    customWarnaDominan: '',
    gayaDesain: getDesignStyles(invitationTypes[0])[0],
    elemenDekorasi: decorationElements[0],
    ilustrasi: illustrationStyles[0],
    facelessMode: true,
    bahasa: languages[0],
    ukuran: sizes[0],
    smartRecommendation: true
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const target = e.target;
    const name = target.name;
    const value = target.type === 'checkbox' ? (target as HTMLInputElement).checked : target.value;
    
    setFormData(prev => {
      const newData = { ...prev, [name]: value };
      if (name === 'jenisUndangan') {
        const availableStyles = getDesignStyles(value as string);
        newData.gayaDesain = availableStyles[0];
      }
      return newData;
    });
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
      triggerToast("Gagal menyalin text", "error");
    }
  };

  const handleGenerate = async () => {
    try {
      setLoading(true);
      setResultPrompt("");
      setCopied(false);

      const response = await fetch('/api/generate-kartu-undangan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Gagal menghasilkan prompt');
      }
      setResultPrompt(data.prompt || "");
      
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
              <div className="w-8 h-8 bg-violet-500 rounded-lg flex items-center justify-center shadow-md shadow-violet-500/25">
                <MailOpen className="w-4.5 h-4.5 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Kartu Undangan</h1>
            </div>
            <p className="text-sm text-slate-500 font-medium ml-[42px]">AI Prompt Generator</p>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Left Column - Form */}
        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200/60 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-violet-50 rounded-full blur-3xl -z-10 opacity-60 translate-x-1/2 -translate-y-1/2"></div>
          
          <div className="space-y-8 relative z-10">
            {/* Basic Info */}
            <div className="space-y-5">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <div className="w-1.5 h-6 bg-violet-500 rounded-full"></div>
                <h2 className="text-lg font-bold text-slate-800">Detail Undangan</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Jenis Undangan</label>
                  <select 
                    name="jenisUndangan"
                    value={formData.jenisUndangan}
                    onChange={handleInputChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2364748B%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[position:right_12px_center] bg-[length:20px]"
                  >
                    {invitationTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                {formData.jenisUndangan === 'Custom' && (
                  <div className="md:col-span-2 animate-in slide-in-from-top-2">
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Nama Acara</label>
                    <input 
                      type="text" 
                      name="customJenisUndangan"
                      value={formData.customJenisUndangan}
                      onChange={handleInputChange}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all placeholder:text-slate-400"
                      placeholder="Masukkan nama acara..."
                    />
                  </div>
                )}
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Judul Acara</label>
                  <input 
                    type="text" 
                    name="judulAcara"
                    value={formData.judulAcara}
                    onChange={handleInputChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all placeholder:text-slate-400"
                    placeholder="Contoh: Pernikahan Ahmad & Aisyah"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Nama Pengantin / Tuan Rumah / Penyelenggara</label>
                  <input 
                    type="text" 
                    name="namaPenyelenggara"
                    value={formData.namaPenyelenggara}
                    onChange={handleInputChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all placeholder:text-slate-400"
                    placeholder="Contoh: Ahmad & Aisyah"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Isi Undangan</label>
                  <textarea 
                    name="isiUndangan"
                    value={formData.isiUndangan}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all placeholder:text-slate-400 resize-y"
                    placeholder="Contoh: Assalamu'alaikum Warahmatullahi Wabarakatuh. Dengan memohon rahmat Allah SWT kami mengundang Bapak/Ibu/Saudara/i untuk menghadiri acara pernikahan kami."
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Detail Acara</label>
                  <textarea 
                    name="detailAcara"
                    value={formData.detailAcara}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all placeholder:text-slate-400 resize-y"
                    placeholder="Contoh: 📅 Sabtu, 15 Agustus 2026&#10;🕘 09.00 WIB&#10;📍 Gedung Serbaguna Al-Ikhlas"
                  />
                </div>
              </div>
            </div>

            {/* Design & Visual */}
            <div className="space-y-5">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <div className="w-1.5 h-6 bg-violet-500 rounded-full"></div>
                <h2 className="text-lg font-bold text-slate-800">Desain & Visual</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Gaya Desain</label>
                  <select 
                    name="gayaDesain"
                    value={formData.gayaDesain}
                    onChange={handleInputChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2364748B%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[position:right_12px_center] bg-[length:20px]"
                  >
                    {getDesignStyles(formData.jenisUndangan).map(style => (
                      <option key={style} value={style}>{style}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Warna Dominan</label>
                  <select 
                    name="warnaDominan"
                    value={formData.warnaDominan}
                    onChange={handleInputChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2364748B%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[position:right_12px_center] bg-[length:20px]"
                  >
                    {dominantColors.map(color => (
                      <option key={color} value={color}>{color}</option>
                    ))}
                  </select>
                </div>

                {formData.warnaDominan === 'Custom' && (
                  <div className="md:col-span-2 animate-in slide-in-from-top-2">
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Nama Warna Custom</label>
                    <input 
                      type="text" 
                      name="customWarnaDominan"
                      value={formData.customWarnaDominan}
                      onChange={handleInputChange}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all placeholder:text-slate-400"
                      placeholder="Masukkan warna dominan..."
                    />
                  </div>
                )}

                                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-3">Smart Design Recommendation</label>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      name="smartRecommendation" 
                      checked={formData.smartRecommendation} 
                      onChange={handleInputChange}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-violet-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-violet-600"></div>
                    <span className="ml-3 text-sm font-medium text-slate-700">
                      {formData.smartRecommendation ? 'ON' : 'OFF'} <span className="text-slate-400 font-normal ml-1">(Otomatis memilih elemen dekorasi & ilustrasi terbaik)</span>
                    </span>
                  </label>
                </div>
                
                {!formData.smartRecommendation && (
                  <>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Elemen Dekorasi</label>
                      <select 
                        name="elemenDekorasi"
                        value={formData.elemenDekorasi}
                        onChange={handleInputChange}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2364748B%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[position:right_12px_center] bg-[length:20px]"
                      >
                        {decorationElements.map(el => (
                          <option key={el} value={el}>{el}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Ilustrasi</label>
                      <select 
                        name="ilustrasi"
                        value={formData.ilustrasi}
                        onChange={handleInputChange}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2364748B%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[position:right_12px_center] bg-[length:20px]"
                      >
                        {illustrationStyles.map(ill => (
                          <option key={ill} value={ill}>{ill}</option>
                        ))}
                      </select>
                    </div>
                  </>
                )}

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
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-violet-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-violet-600"></div>
                    <span className="ml-3 text-sm font-medium text-slate-700">
                      {formData.facelessMode ? 'ON' : 'OFF'} <span className="text-slate-400 font-normal ml-1">(Tanpa detail wajah)</span>
                    </span>
                  </label>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Bahasa</label>
                  <select 
                    name="bahasa"
                    value={formData.bahasa}
                    onChange={handleInputChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2364748B%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[position:right_12px_center] bg-[length:20px]"
                  >
                    {languages.map(lang => (
                      <option key={lang} value={lang}>{lang}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Ukuran</label>
                  <select 
                    name="ukuran"
                    value={formData.ukuran}
                    onChange={handleInputChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2364748B%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[position:right_12px_center] bg-[length:20px]"
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
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl py-4 flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-500/30 disabled:opacity-70 disabled:cursor-not-allowed group relative overflow-hidden"
              >
                {/* Ripple overlay - optional visual enhancement */}
                <span className="absolute inset-0 bg-white/20 opacity-0 group-active:opacity-100 transition-opacity"></span>
                
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
          {resultPrompt ? (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                  <div className="w-2 h-6 bg-violet-500 rounded-full"></div>
                  Generated Prompt
                </h3>
              </div>
              
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden group">
                <div className="bg-slate-50 border-b border-slate-200 px-4 py-3 flex justify-between items-center">
                  <span className="text-sm font-semibold text-slate-700">Prompt Image</span>
                  <button 
                    onClick={handleCopy}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                      copied 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-violet-600 hover:border-violet-200'
                    }`}
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    {copied ? 'Copied' : 'Copy'}
                  </button>
                </div>
                <div className="p-0">
                  <div className="max-h-[600px] overflow-y-auto custom-scrollbar">
                    <textarea 
                      readOnly
                      value={resultPrompt}
                      className="w-full p-4 bg-slate-900 text-slate-300 font-mono text-sm leading-relaxed whitespace-pre-wrap selection:bg-violet-500/30 resize-none min-h-[400px] outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-[400px] bg-slate-50/50 border border-slate-200 border-dashed rounded-3xl flex flex-col items-center justify-center text-center p-8">
              {loading ? (
                 <div className="space-y-4 w-full max-w-[280px]">
                    <div className="h-6 bg-slate-200 rounded-md animate-pulse w-3/4 mx-auto"></div>
                    <div className="space-y-2">
                      <div className="h-4 bg-slate-200 rounded-md animate-pulse w-full"></div>
                      <div className="h-4 bg-slate-200 rounded-md animate-pulse w-5/6 mx-auto"></div>
                      <div className="h-4 bg-slate-200 rounded-md animate-pulse w-4/6 mx-auto"></div>
                    </div>
                 </div>
              ) : (
                <>
                  <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm mb-4">
                    <MailOpen className="w-8 h-8 text-violet-300" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-700 mb-2">Belum ada prompt</h3>
                  <p className="text-slate-500 text-sm max-w-[250px]">
                    Isi form di samping dan klik Generate untuk membuat prompt kartu undangan.
                  </p>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
