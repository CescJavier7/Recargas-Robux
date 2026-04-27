"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Eye, X, Package, Zap } from "lucide-react";

export default function OrderDetailsModal({ order }: { order: any }) {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Aseguramos que el Portal solo se renderice en el cliente
  useEffect(() => {
    setMounted(true);
  }, []);

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-dark-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="flex justify-between items-center p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-dark-800/50">
          <h3 className="font-display font-bold text-slate-900 dark:text-white uppercase tracking-widest flex items-center gap-2">
            <Package className="w-5 h-5 text-neon-cyan" /> Detalles de Orden
          </h3>
          <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-neon-pink transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6 space-y-4 text-sm font-mono text-slate-600 dark:text-slate-300 max-h-[70vh] overflow-y-auto">
          <p><strong className="text-slate-900 dark:text-white">ID Completo:</strong> <br/><span className="text-[10px] break-all">{order.id}</span></p>
          <p><strong className="text-slate-900 dark:text-white">Usuario de Roblox:</strong> {order.roblox_username}</p>
          <p><strong className="text-slate-900 dark:text-white">Fecha:</strong> {new Date(order.created_at).toLocaleString()}</p>
          
          <div className="mt-6">
            <strong className="text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-700 pb-2 block mb-3 uppercase font-display tracking-widest text-xs">
              Desglose del Carrito
            </strong>
            
            {order.cart_items && order.cart_items.length > 0 ? (
              <ul className="space-y-2">
                {order.cart_items.map((item: any, idx: number) => (
                  <li key={idx} className="flex justify-between items-center bg-slate-50 dark:bg-dark-800 p-3 rounded-lg border border-slate-100 dark:border-slate-700">
                    <span className="font-bold text-yellow-600 dark:text-yellow-400 flex items-center gap-2">
                      <Zap className="w-3 h-3" fill="currentColor"/> {item.robux} R$
                    </span>
                    <span className="text-neon-cyan font-bold">${item.price.toFixed(2)}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-slate-400 italic p-3 bg-slate-50 dark:bg-dark-800 rounded-lg">
                Sin desglose (Orden antigua o vacía).
              </p>
            )}
          </div>

          <div className="flex justify-between items-center pt-4 border-t border-slate-100 dark:border-slate-800 mt-4">
             <span className="font-display font-bold uppercase tracking-widest text-xs">Total: {order.amount_robux} R$</span>
             <span className="text-lg font-black text-neon-cyan">${order.price_usd}</span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)} 
        title="Ver Detalles" 
        className="p-2.5 bg-neon-cyan/10 border border-neon-cyan/30 text-neon-cyan rounded-xl hover:bg-neon-cyan hover:text-dark-900 transition-all active:scale-90"
      >
        <Eye className="w-4 h-4" />
      </button>
      
      {/* MAGIA DE PORTAL: Esto saca al modal de la tabla y lo dibuja en el body */}
      {isOpen && mounted && createPortal(modalContent, document.body)}
    </>
  );
}