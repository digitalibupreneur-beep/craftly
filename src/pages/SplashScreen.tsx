import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { setLoginSession, checkLoginSession } from '../components/ProtectedRoute';

export function SplashScreen() {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (checkLoginSession()) {
      navigate('/home', { replace: true });
    }
  }, [navigate]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(false);
    setLoading(true);
    
    setTimeout(() => {
      if (password === 'CRAFT01') {
        setLoginSession();
        navigate('/home', { replace: true });
      } else {
        setError(true);
        setLoading(false);
      }
    }, 800);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex flex-col justify-center items-center bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: "url('/background (2).png')" }}
    >
      {/* Subtle blur overlay */}
      <div className="absolute inset-0 bg-white/30 backdrop-blur-md z-0"></div>
      
      <div className="relative z-10 flex flex-col items-center justify-center text-center px-6 w-full max-w-md mt-4">
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="mb-8"
        >
          <h1 
            className="text-6xl md:text-7xl font-extrabold mb-4 tracking-tight"
            style={{
              background: "linear-gradient(135deg, #1e293b 0%, #334155 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              textShadow: "0px 4px 20px rgba(0, 0, 0, 0.05)"
            }}
          >
            ✨ Craftly
          </h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
            className="text-lg md:text-xl font-medium text-slate-700/90 tracking-wide"
          >
            Satu Tools untuk Menciptakan Berbagai Produk Digital
          </motion.p>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
            className="mt-2"
          >
            <p className="text-slate-500/80 text-sm font-semibold tracking-wide">Developed by Libria W.S.</p>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8, ease: "easeOut" }}
          className="w-full"
        >
          <form 
            onSubmit={handleLogin}
            className="bg-white/50 backdrop-blur-xl border border-white/60 shadow-[0_8px_32px_rgba(0,0,0,0.08)] rounded-3xl p-8 w-full transition-all"
          >
            <h2 className="text-2xl font-bold text-slate-800 mb-6">Masuk ke Craftly</h2>
            
            <div className="relative mb-4">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan Password"
                className={`w-full bg-white/70 border ${error ? 'border-red-400 focus:ring-red-500/20' : 'border-slate-200 focus:ring-blue-500/20'} rounded-2xl px-5 py-4 text-slate-800 font-medium placeholder:font-normal placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:border-blue-500 transition-all`}
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                disabled={loading}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            
            <AnimatePresence>
              {error && (
                <motion.p
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="text-red-500 text-sm font-medium text-left mb-4 px-2"
                >
                  Password yang Anda masukkan tidak valid.
                </motion.p>
              )}
            </AnimatePresence>

            <button
              type="submit"
              disabled={loading || !password}
              className="w-full mt-2 bg-slate-800 hover:bg-slate-900 disabled:bg-slate-800/50 text-white font-semibold text-lg py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 flex justify-center items-center gap-2 hover:scale-[1.02] active:scale-[0.98]"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Memvalidasi...</span>
                </>
              ) : (
                'Masuk'
              )}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
