"use client";

import { useState } from "react";
import { ShoppingCart, X, Trash2, Zap, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useCartStore } from "@/store/cartStore";
import { motion, AnimatePresence } from "framer-motion";

export default function FloatingCart() {
  const { items, getTotalPrice, removeItem, getTotalRobux } = useCartStore();
  const [isOpen, setIsOpen] = useState(false);

  if (items.length === 0) return null;

  return (
    <>
      {/* BOTÓN FLOTANTE (Trigger) */}
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-[100] flex items-center gap-3 bg-neon-cyan text-dark-900 px-6 py-4 rounded-full font-display font-black uppercase tracking-widest shadow-[0_0_20px_rgba(0,240,255,0.4)] hover:scale-105 transition-all"
      >
        <div className="relative">
          <ShoppingCart className="w-6 h-6" />
          <span className="absolute -top-3 -right-3 bg-neon-pink text-white text-[11px] w-5 h-5 flex items-center justify-center rounded-full shadow-md">
            {items.length}
          </span>
        </div>
        <span className="hidden sm:inline">Ver Carrito</span>
      </motion.button>

      {/* OVERLAY Y DRAWER */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Fondo oscuro */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[110]"
            />

            {/* Panel Lateral */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 w-full max-w-md bg-white dark:bg-dark-900 z-[120] shadow-2xl flex flex-col"
            >
              {/* Header del Carrito */}
              <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-dark-800/50">
                <div className="flex items-center gap-3">
                  <ShoppingCart className="w-6 h-6 text-neon-cyan" />
                  <h2 className="font-display font-black text-xl text-slate-900 dark:text-white uppercase tracking-tighter">
                    Tu <span className="text-neon-cyan">Carrito</span>
                  </h2>
                </div>
                <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-slate-200 dark:hover:bg-dark-700 rounded-full transition-colors">
                  <X className="w-6 h-6 text-slate-500" />
                </button>
              </div>

              {/* Lista de Items */}
              <div className="flex-grow overflow-y-auto p-6 space-y-4">
                {items.map((item) => (
                  <motion.div
                    layout
                    key={item.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="flex items-center justify-between p-4 bg-slate-50 dark:bg-dark-800 rounded-2xl border border-slate-100 dark:border-slate-700 group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-white dark:bg-dark-900 rounded-xl border border-slate-200 dark:border-slate-700 text-yellow-500">
                        <Zap className="w-5 h-5" fill="currentColor" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white">{item.robux} R$</p>
                        <p className="text-xs font-mono text-neon-cyan">${item.price.toFixed(2)}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="p-2 text-slate-400 hover:text-neon-pink hover:bg-neon-pink/10 rounded-lg transition-all"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </motion.div>
                ))}
              </div>

              {/* Footer con Totales */}
              <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-dark-800/50 space-y-4">
                <div className="flex justify-between items-center text-sm font-display uppercase tracking-widest text-slate-500">
                  <span>Total Robux:</span>
                  <span className="font-black text-slate-900 dark:text-white">{getTotalRobux()} R$</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-lg font-display font-black text-slate-900 dark:text-white uppercase tracking-tighter">Total a Pagar:</span>
                  <span className="text-3xl font-black text-neon-cyan">${getTotalPrice().toFixed(2)}</span>
                </div>
                
                <Link 
                  href="/checkout"
                  onClick={() => setIsOpen(false)}
                  className="w-full py-4 bg-neon-cyan text-dark-900 rounded-xl font-display font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:shadow-[0_0_20px_rgba(0,240,255,0.4)] transition-all group"
                >
                  Ir al Checkout
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}