import { LucideIcon } from 'lucide-react';
import React, { useState } from 'react';

interface MenuCardProps {
  id?: string;
  key?: React.Key;
  title: string;
  description: string;
  icon: LucideIcon;
  buttonText: string;
  color: string;
  onClick?: () => void;
}

export function MenuCard({ title, description, icon: Icon, buttonText, color, onClick }: MenuCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      className="group rounded-[24px] p-7 md:p-8 flex flex-col h-full cursor-pointer relative overflow-hidden"
      style={{
        background: 'rgba(255, 255, 255, 0.18)',
        backdropFilter: 'blur(28px) saturate(180%)',
        WebkitBackdropFilter: 'blur(28px) saturate(180%)',
        border: '1px solid rgba(255, 255, 255, 0.35)',
        borderTopColor: 'rgba(255, 255, 255, 0.55)',
        borderBottomColor: 'rgba(255, 255, 255, 0.12)',
        boxShadow: isHovered 
          ? '0 20px 60px rgba(15, 23, 42, 0.18)' 
          : '0 12px 45px rgba(15, 23, 42, 0.12)',
        transform: isHovered ? 'translateY(-8px) scale(1.02)' : 'translateY(0) scale(1)',
        transition: 'all 350ms ease',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
    >
      {/* Light effect pantulan cahaya sangat halus di kiri atas */}
      <div 
        className="absolute -top-10 -left-10 w-32 h-32 rounded-full pointer-events-none transition-opacity duration-350"
        style={{
          background: 'radial-gradient(circle, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0) 70%)',
          filter: 'blur(10px)',
          opacity: isHovered ? 0.8 : 0.5,
        }}
      ></div>

      {/* Inner highlight tipis di bagian atas */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/60 to-transparent pointer-events-none"></div>

      <div className="relative z-10 flex flex-col h-full">
        <div 
          className="w-14 h-14 rounded-full flex items-center justify-center mb-6 transition-transform duration-300 ease-out group-hover:scale-110"
          style={{ 
            backgroundColor: 'rgba(255, 255, 255, 0.25)', 
            backdropFilter: 'blur(16px)', 
            WebkitBackdropFilter: 'blur(16px)',
            border: '1px solid rgba(255, 255, 255, 0.4)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.05), inset 0 2px 4px rgba(255,255,255,0.3)',
          }}
        >
          <Icon className="w-6 h-6 drop-shadow-sm" style={{ color: color }} />
        </div>
        
        <h3 className="text-xl font-bold text-slate-900 mb-3 tracking-tight drop-shadow-sm">{title}</h3>
        <p className="text-slate-900/80 font-medium leading-relaxed flex-grow mb-8 text-[15px] drop-shadow-sm">
          {description}
        </p>
        
        <button 
          className="w-full relative overflow-hidden font-semibold py-3.5 rounded-xl transition-all duration-300 active:scale-[0.98] flex items-center justify-center gap-2"
          style={{ 
            border: isHovered ? '1px solid rgba(255, 255, 255, 0.4)' : '1px solid rgba(255, 255, 255, 0.25)',
            color: color,
            background: isHovered ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0.08)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            boxShadow: '0 4px 15px rgba(0,0,0,0.05), inset 0 1px 0 rgba(255,255,255,0.2)',
          }}
        >
          <span>{buttonText}</span>
        </button>
      </div>
    </div>
  );
}
