import { Calendar, Puzzle, PieChart, BookOpen, MessageSquare, ChefHat, Sparkles, BookHeart, Mail, MailOpen, LogOut } from 'lucide-react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { MenuCard } from './components/MenuCard';
import { SplashScreen } from './pages/SplashScreen';
import { ProtectedRoute, clearLoginSession } from './components/ProtectedRoute';
import { Planner } from './pages/Planner';
import { BukuAktivitas } from './pages/BukuAktivitas';
import { Infografis } from './pages/Infografis';
import { BukuCerita } from './pages/BukuCerita';
import { BukuResep } from './pages/BukuResep';
import { Komik } from './pages/Komik';
import { BukuDoa } from './pages/BukuDoa';
import { KartuUndangan } from './pages/KartuUndangan';
import Amplop from './pages/Amplop';

const menuItems = [
  {
    id: 'planner',
    title: 'Planner',
    description: 'Membuat prompt image planner harian, mingguan, bulanan, habit tracker, journal, agenda, dan berbagai planner lainnya.',
    buttonText: 'Buat Planner',
    icon: Calendar,
    color: '#2563EB' // Primary
  },
  {
    id: 'buku-aktivitas',
    title: 'Buku Aktivitas Anak',
    description: 'Membuat prompt image worksheet anak, tracing, maze, coloring, matching, berhitung, membaca, dan aktivitas edukatif lainnya.',
    buttonText: 'Buat Buku Aktivitas',
    icon: Puzzle,
    color: '#7C3AED' // Secondary
  },
  {
    id: 'infografis',
    title: 'Infografis Edukasi',
    description: 'Membuat prompt image infografis edukasi yang menarik, profesional, informatif, dan mudah dipahami.',
    buttonText: 'Buat Infografis',
    icon: PieChart,
    color: '#F59E0B' // Accent
  },
  {
    id: 'buku-cerita',
    title: 'Buku Cerita',
    description: 'Membuat prompt image ilustrasi buku cerita anak dengan karakter yang konsisten dan visual yang menarik.',
    buttonText: 'Buat Buku Cerita',
    icon: BookOpen,
    color: '#10B981'
  },
  {
    id: 'komik',
    title: 'Komik',
    description: 'Membuat prompt image komik dengan karakter, panel, ekspresi, dan gaya visual yang konsisten.',
    buttonText: 'Buat Komik',
    icon: MessageSquare,
    color: '#EC4899'
  },
  {
    id: 'buku-resep',
    title: 'Buku Resep',
    description: 'Membuat prompt image desain buku resep masakan, kartu resep, dan panduan memasak yang estetik.',
    buttonText: 'Buat Buku Resep',
    icon: ChefHat,
    color: '#14B8A6'
  },
  {
    id: 'buku-doa',
    title: 'Buku Doa',
    description: 'Membuat prompt image ilustrasi buku doa anak, panduan ibadah, dan materi keagamaan dengan visual menarik.',
    buttonText: 'Buat Buku Doa',
    icon: BookHeart,
    color: '#F43F5E'
  },
  {
    id: 'kartu-undangan',
    title: 'Kartu Undangan',
    description: 'Membuat prompt image desain kartu undangan pernikahan, ulang tahun, aqiqah, dan acara lainnya.',
    buttonText: 'Buat Undangan',
    icon: MailOpen,
    color: '#8B5CF6'
  },
  {
    id: 'amplop',
    title: 'Desain Amplop',
    description: 'Membuat prompt image desain pola template amplop (envelope dieline) siap cetak.',
    buttonText: 'Buat Amplop',
    icon: Mail,
    color: '#06B6D4'
  }
];

function Dashboard() {
  const navigate = useNavigate();

  const handleLogout = () => {
    clearLoginSession();
    navigate('/');
  };

  return (
    <div 
      className="flex-grow w-full relative bg-cover bg-center bg-no-repeat flex flex-col justify-center py-10"
      style={{ backgroundImage: "url('/background (2).png')" }}
    >
      <div className="absolute inset-0 bg-white/20 z-0"></div>
      
      <div className="relative z-10 p-6 md:p-10 lg:p-14 max-w-7xl mx-auto w-full">
        <header className="mb-12 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3.5 mb-1.5">
              <div className="w-12 h-12 bg-[#2563EB] rounded-[12px] flex items-center justify-center shadow-lg shadow-blue-500/25">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-[34px] font-bold text-slate-900 tracking-tight">Craftly</h1>
            </div>
            <p className="text-slate-800 font-semibold text-[17px] ml-[62px]">AI Prompt Generator</p>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 bg-white/50 hover:bg-white/80 border border-slate-200/50 backdrop-blur-md rounded-xl text-slate-700 font-medium transition-all shadow-sm hover:shadow"
          >
            <LogOut size={18} />
            <span>Keluar</span>
          </button>
        </header>

        <main>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {menuItems.map((item) => (
            <MenuCard 
              key={item.id} 
              {...item} 
              onClick={() => {
                if (item.id === 'planner') {
                  navigate('/planner');
                } else if (item.id === 'buku-aktivitas') {
                  navigate('/buku-aktivitas');
                } else if (item.id === 'infografis') {
                  navigate('/infografis');
                } else if (item.id === 'buku-cerita') {
                  navigate('/buku-cerita');
                } else if (item.id === 'komik') {
                  navigate('/komik');
                } else if (item.id === 'buku-resep') {
                  navigate('/buku-resep');
                } else if (item.id === 'buku-doa') {
                  navigate('/buku-doa');
                } else if (item.id === 'kartu-undangan') {
                  navigate('/kartu-undangan');
                } else if (item.id === 'amplop') {
                  navigate('/amplop');
                }
              }}
            />
          ))}
          </div>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  const location = useLocation();
  const isSplashScreen = location.pathname === '/';

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow flex flex-col">
        <Routes>
          <Route path="/" element={<SplashScreen />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/home" element={<Dashboard />} />
            <Route path="/planner" element={<Planner />} />
            <Route path="/buku-aktivitas" element={<BukuAktivitas />} />
            <Route path="/infografis" element={<Infografis />} />
            <Route path="/buku-cerita" element={<BukuCerita />} />
            <Route path="/komik" element={<Komik />} />
            <Route path="/buku-resep" element={<BukuResep />} />
            <Route path="/buku-doa" element={<BukuDoa />} />
            <Route path="/kartu-undangan" element={<KartuUndangan />} />
            <Route path="/amplop" element={<Amplop />} />
          </Route>
        </Routes>
      </main>
      {!isSplashScreen && (
        <footer className="py-6 text-center text-slate-600 text-[13px] bg-white border-t border-slate-200 shadow-sm relative z-20">
          <div className="max-w-7xl mx-auto px-6">
            <p className="font-semibold mb-1">Craftly © 2026 by Libria W.S. Seluruh hak cipta dilindungi.</p>
            <p className="opacity-80 leading-relaxed max-w-3xl mx-auto">Dilarang menyalin, memperbanyak, memodifikasi, memperjualbelikan, atau mendistribusikan tools ini tanpa izin tertulis dari pembuat.</p>
          </div>
        </footer>
      )}
    </div>
  );
}
