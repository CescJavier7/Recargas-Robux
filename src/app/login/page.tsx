"use client";

import { createClient } from "@/lib/supabase/client";
import { motion } from "framer-motion";
import { ShieldCheck, Lock, ChevronRight } from "lucide-react";
import { useSearchParams } from "next/navigation";

export default function LoginPage() {
  const supabase = createClient();
  const searchParams = useSearchParams();
  
  // Capturamos el destino (ej: /order/800). Por defecto va al dashboard.
  const nextPath = searchParams.get("next") || "/dashboard";

  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        // Pasamos el destino a la ruta de callback
        redirectTo: `${window.location.origin}/auth/v1/callback?next=${encodeURIComponent(nextPath)}`,
      },
    });
  };

  return (
    <main className="min-h-[calc(100vh-64px)] flex items-center justify-center p-6 relative overflow-hidden bg-slate-50 dark:bg-slate-950">
      <div className="absolute inset-0 z-0 opacity-20 dark:opacity-40 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-neon-cyan/10 rounded-full blur-[120px] pointer-events-none"></div>

      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md relative z-10">
        <div className="relative p-[2px] rounded-[2rem] overflow-hidden bg-slate-200 dark:bg-slate-800">
          <motion.div animate={{ rotate: [0, 360] }} transition={{ duration: 4, repeat: Infinity, ease: "linear" }} className="absolute inset-[-100%] bg-[conic-gradient(from_0deg,#00f0ff,#ff003c,#00f0ff)] opacity-30" />
          
          <div className="relative bg-white dark:bg-dark-900 rounded-[1.9rem] p-8 md:p-10 shadow-2xl">
            <div className="text-center mb-10">
              <div className="inline-flex p-4 rounded-2xl bg-slate-50 dark:bg-dark-800 border border-slate-100 dark:border-slate-700 mb-6 shadow-inner">
                <ShieldCheck className="w-12 h-12 text-neon-cyan" />
              </div>
              <h1 className="text-4xl font-display font-black text-slate-900 dark:text-white uppercase tracking-tighter">
                INICIAR <span className="text-neon-cyan italic">ENLACE</span>
              </h1>
            </div>

            <div className="space-y-6 text-center">
              <p className="text-slate-500 dark:text-slate-400 text-xs font-mono leading-relaxed">
                [ SISTEMA DE AUTENTICACIÓN NEXUS ]<br/>VERIFICACIÓN REQUERIDA
              </p>

              <button onClick={handleLogin} className="w-full group relative flex items-center justify-between bg-slate-900 dark:bg-white text-white dark:text-slate-900 py-4 px-5 rounded-2xl font-display font-bold uppercase tracking-widest transition-all hover:ring-4 hover:ring-neon-cyan/20 active:scale-95 shadow-lg overflow-hidden">
                <div className="bg-white p-2 rounded-xl flex items-center justify-center shadow-md border border-slate-100">
                  <svg width="20" height="20" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                </div>
                <span className="flex-1 text-center text-sm md:text-base">Conectar con Google</span>
                <ChevronRight className="w-5 h-5 opacity-50 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            <div className="mt-10 pt-6 border-t border-slate-100 dark:border-slate-800 flex justify-center gap-6 text-[10px] font-mono text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                <span className="flex items-center gap-1.5"><Lock className="w-3 h-3" /> SECURE</span>
                <span className="w-1.5 h-1.5 rounded-full bg-neon-cyan animate-pulse"></span>
                <span>ENCRYPT V4</span>
            </div>
          </div>
        </div>
      </motion.div>
    </main>
  );
}