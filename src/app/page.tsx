"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Zap, Tv, Trophy, Flame } from "lucide-react";
import { useCartStore } from "@/store/cartStore"; // <-- IMPORTAMOS EL CEREBRO DEL CARRITO

const ROBUX_PACKAGES = [
  { amount: "40", price: "0.75", popular: false },
  { amount: "80", price: "1.35", popular: true },
  { amount: "400", price: "6.00", popular: false },
  { amount: "800", price: "12.00", popular: true },
  { amount: "1200", price: "17.50", popular: false },
  { amount: "1700", price: "24.00", popular: false },
  { amount: "3150", price: "41.00", popular: false },
  { amount: "4500", price: "60.00", popular: false },
];

export default function Home() {
  // Instanciamos la función para añadir al carrito
  const addItem = useCartStore((state) => state.addItem);

  return (
    <main className="min-h-screen flex flex-col items-center">
      
      {/* HERO SECTION */}
      <section className="w-full relative overflow-hidden py-24 px-6 flex flex-col items-center justify-center min-h-[70vh]">
        <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-96 h-96 bg-neon-cyan/20 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-96 h-96 bg-neon-pink/20 rounded-full blur-[100px] pointer-events-none"></div>

        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.5 }} className="relative z-10 text-center max-w-4xl">
          <span className="px-4 py-1.5 rounded-full border border-neon-cyan/50 text-neon-cyan text-xs font-bold uppercase tracking-widest bg-neon-cyan/10 mb-6 inline-block">
            Nivel Máximo Desbloqueado
          </span>
          <h1 className="text-5xl md:text-7xl font-display font-black text-slate-900 dark:text-transparent dark:bg-clip-text dark:bg-gradient-to-r dark:from-neon-cyan dark:via-white dark:to-neon-pink mb-6 uppercase tracking-tight">
            Potencia Tu <br/> Arsenal Digital
          </h1>
          <p className="text-lg md:text-xl text-slate-600 dark:text-slate-300 mb-10 max-w-2xl mx-auto leading-relaxed">
            Recargas de juegos, pases de batalla y streaming en Ecuador. <strong className="text-slate-900 dark:text-white">Sin tarjetas de crédito, sin riesgos.</strong> Transferencia directa y a jugar.
          </p>
          
          <div className="flex flex-wrap items-center justify-center gap-4">
            <a href="#robux" className="px-8 py-4 rounded-xl bg-neon-pink text-white font-display font-black uppercase tracking-widest hover:scale-105 hover:shadow-[0_0_30px_rgba(255,0,60,0.4)] transition-all">
              Recargar Robux
            </a>
            <a href="#servicios" className="px-8 py-4 rounded-xl bg-white dark:bg-dark-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-display font-bold uppercase tracking-widest hover:border-neon-cyan hover:text-neon-cyan transition-all shadow-sm">
              Explorar Catálogo
            </a>
          </div>
        </motion.div>
      </section>

      {/* SECCIÓN 1: ROBUX */}
     <section id="robux" className="w-full max-w-7xl mx-auto px-6 py-20 relative">
          <div className="text-center mb-16 px-4">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center justify-center gap-3 flex-wrap">
              <Zap className="w-8 h-8 text-yellow-500" fill="currentColor" />
              Depósito de 
              <span className="text-yellow-500 md:text-transparent md:bg-clip-text md:bg-gradient-to-r md:from-yellow-500 md:to-orange-500">
                Robux
              </span>
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mt-4 max-w-lg mx-auto">Selecciona el paquete que necesitas para tu próxima skin o pase.</p>
          </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {ROBUX_PACKAGES.map((pkg, i) => (
            <motion.div 
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} viewport={{ once: true }}
              key={pkg.amount} 
              className={`relative bg-white dark:bg-dark-900 rounded-2xl p-6 border transition-all hover:-translate-y-2 hover:shadow-xl ${pkg.popular ? 'border-neon-pink shadow-[0_0_20px_rgba(255,0,60,0.1)]' : 'border-slate-200 dark:border-slate-800 hover:border-neon-cyan dark:hover:border-neon-cyan hover:shadow-[0_0_20px_rgba(0,240,255,0.1)]'}`}
            >
              {pkg.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-neon-pink text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full whitespace-nowrap">
                  🔥 Más Popular
                </span>
              )}
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white flex justify-center items-center gap-1 mb-2">
                  <Zap className="w-6 h-6 text-yellow-500" fill="currentColor"/> {pkg.amount}
                </div>
                <div className="text-slate-500 text-sm font-display tracking-widest mb-6">ROBUX</div>
                <div className="text-xl md:text-2xl font-light text-neon-cyan mb-6">${pkg.price}</div>
                
                {/* BOTÓN ACTUALIZADO PARA CARRITO */}
                <button 
                  onClick={() => {
                    // Genera un ID único para cada elemento y lo agrega al Zustand
                    addItem({ 
                      id: crypto.randomUUID(), 
                      robux: parseInt(pkg.amount), 
                      price: parseFloat(pkg.price) 
                    });
                  }}
                  className={`block w-full py-3 rounded-lg font-display font-bold uppercase tracking-wider transition-colors ${pkg.popular ? 'bg-neon-pink text-white hover:bg-rose-600 dark:hover:bg-white dark:hover:text-neon-pink' : 'bg-slate-100 dark:bg-dark-800 text-slate-900 dark:text-white hover:bg-neon-cyan hover:text-dark-900'}`}
                >
                  Añadir
                </button>

              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* SECCIÓN 2: OTROS SERVICIOS */}
      <section id="servicios" className="w-full bg-slate-50 dark:bg-dark-900 border-y border-slate-200 dark:border-slate-800 py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Más Allá del <span className="text-neon-purple">Gaming</span>
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mt-4">Expande tus horizontes. Suscripciones y pases de batalla a un clic.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="group bg-white dark:bg-dark-800 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden hover:border-orange-500 transition-all shadow-sm">
              <div className="h-32 bg-gradient-to-r from-orange-500 to-red-600 flex items-center justify-center">
                <Flame className="w-16 h-16 text-white opacity-50" />
              </div>
              <div className="p-6 text-center">
                <h3 className="text-xl font-display font-bold text-slate-900 dark:text-white mb-2 uppercase tracking-widest">Free Fire Diamantes</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">Recarga directa a tu ID. Pases booyah y diamantes listos para el campo.</p>
                <button disabled className="w-full py-2 bg-slate-100 dark:bg-dark-900 border border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500 rounded uppercase text-xs font-bold tracking-widest cursor-not-allowed">Próximamente</button>
              </div>
            </div>

            <div className="group bg-white dark:bg-dark-800 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden hover:border-red-500 transition-all shadow-sm">
              <div className="h-32 bg-gradient-to-r from-red-600 to-slate-900 flex items-center justify-center">
                <Tv className="w-16 h-16 text-white opacity-50" />
              </div>
              <div className="p-6 text-center">
                <h3 className="text-xl font-display font-bold text-slate-900 dark:text-white mb-2 uppercase tracking-widest">Pases Streaming</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">Cuentas completas o perfiles de Netflix, HBO Max y Spotify Premium.</p>
                <button disabled className="w-full py-2 bg-slate-100 dark:bg-dark-900 border border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500 rounded uppercase text-xs font-bold tracking-widest cursor-not-allowed">Próximamente</button>
              </div>
            </div>

            <div className="group bg-white dark:bg-dark-800 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden hover:border-blue-500 transition-all shadow-sm">
              <div className="h-32 bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
                <Trophy className="w-16 h-16 text-white opacity-50" />
              </div>
              <div className="p-6 text-center">
                <h3 className="text-xl font-display font-bold text-slate-900 dark:text-white mb-2 uppercase tracking-widest">Pases de Batalla</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">Fortnite V-Bucks, Valorant Points, y recargas para EA Sports FC.</p>
                <button disabled className="w-full py-2 bg-slate-100 dark:bg-dark-900 border border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500 rounded uppercase text-xs font-bold tracking-widest cursor-not-allowed">Próximamente</button>
              </div>
            </div>
          </div>
        </div>
      </section>

    </main>
  );
}