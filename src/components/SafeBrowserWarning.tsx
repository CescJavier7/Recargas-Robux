"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldAlert, ExternalLink, X, Compass } from "lucide-react";

export default function SafeBrowserWarning() {
  const [isInApp, setIsInApp] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const ua = navigator.userAgent || navigator.vendor || (window as any).opera;
    // Detecta Instagram, Facebook, TikTok y otros hilos de WebView
    const isFB = ua.indexOf("FBAN") > -1 || ua.indexOf("FBAV") > -1;
    const isInsta = ua.indexOf("Instagram") > -1;
    const isTikTok = ua.indexOf("TikTok") > -1;
    
    if (isFB || isInsta || isTikTok) {
      setIsInApp(true);
    }
  }, []);

  if (!isInApp || !isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -100, opacity: 0 }}
        className="fixed top-4 inset-x-4 z-[9999] md:inset-x-auto md:right-4 md:w-96"
      >
        <div className="bg-slate-900 border border-neon-pink/50 rounded-2xl p-5 shadow-[0_0_30px_rgba(255,0,60,0.2)] backdrop-blur-xl bg-opacity-95">
          <div className="flex justify-between items-start mb-3">
            <div className="flex items-center gap-3 text-neon-pink">
              <ShieldAlert className="w-6 h-6" />
              <span className="font-display font-black uppercase tracking-widest text-sm">Navegador Inseguro</span>
            </div>
            <button onClick={() => setIsVisible(false)} className="text-slate-500 hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <p className="text-slate-300 text-xs leading-relaxed mb-4 font-mono">
            Estás navegando desde una red social. Por seguridad, Google bloquea el acceso aquí para prevenir el robo de datos.
          </p>

          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/10">
              <Compass className="w-5 h-5 text-neon-cyan" />
              <div className="text-[10px] text-slate-400 uppercase font-bold tracking-tight">
                Toca los tres puntos <span className="text-white">(...)</span> y selecciona <br/>
                <span className="text-neon-cyan">"Abrir en el navegador"</span>
              </div>
            </div>
            
            <p className="text-center text-[9px] text-slate-500 uppercase font-black italic">
              — Protegiendo tu conexión Nexus —
            </p>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}