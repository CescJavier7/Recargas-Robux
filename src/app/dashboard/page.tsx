"use client";

import { useState, useTransition } from "react";
import { Upload, CreditCard, Loader2, QrCode, ShoppingCart, User, Trash2, Landmark, X } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { submitOrder } from "@/actions/order";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, getTotalPrice, getTotalRobux, removeItem, clearCart } = useCartStore();
  const totalRobux = getTotalRobux();
  const totalPrice = getTotalPrice();

  const [paymentMethod, setPaymentMethod] = useState<"transfer" | "card">("transfer");
  const [username, setUsername] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [isPending, startTransition] = useTransition();
  const [showQR, setShowQR] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return setErrorMsg("Tu carrito está vacío.");
    
    if (paymentMethod === "transfer") {
      if (!file || !username) return setErrorMsg("Falta tu usuario o comprobante.");
      
      startTransition(async () => {
        const formData = new FormData();
        formData.append("totalRobux", totalRobux.toString());
        formData.append("totalPrice", totalPrice.toString());
        formData.append("username", username);
        formData.append("file", file);
        formData.append("cartItems", JSON.stringify(items));

        const result = await submitOrder(formData);
        if (result.success) {
          clearCart();
          router.push("/dashboard?success=true");
        } else {
          setErrorMsg(result.error || "Fallo en el servidor.");
        }
      });
    } else {
      setErrorMsg("La pasarela de tarjetas está siendo encriptada. Usa transferencia por ahora.");
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-slate-50 dark:bg-slate-950">
        <ShoppingCart className="w-12 h-12 text-slate-300" />
        <p className="text-slate-500 font-display uppercase tracking-widest">El carrito está vacío</p>
        <button onClick={() => router.push("/#robux")} className="text-neon-cyan font-bold hover:underline">Volver al catálogo</button>
      </div>
    );
  }

  return (
    <main className="min-h-screen py-12 px-4 sm:px-6 bg-slate-50 dark:bg-slate-950 relative">
      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* COLUMNA IZQUIERDA: Formulario (Se mantiene igual) */}
        <div className="space-y-6">
          <h1 className="text-3xl font-display font-black text-slate-900 dark:text-white uppercase">
            Terminal de <span className="text-neon-cyan">Pago</span>
          </h1>

          {errorMsg && (
            <div className="p-4 bg-neon-pink/10 border border-neon-pink text-neon-pink rounded-xl text-sm font-bold">
              {errorMsg}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <button onClick={() => setPaymentMethod("transfer")} className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${paymentMethod === "transfer" ? "border-neon-cyan bg-neon-cyan/5 text-neon-cyan" : "border-slate-200 dark:border-slate-800 text-slate-500"}`}>
              <QrCode className="w-6 h-6" />
              <span className="text-xs font-bold uppercase tracking-widest">De Una / Banco</span>
            </button>
            <button onClick={() => setPaymentMethod("card")} className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${paymentMethod === "card" ? "border-neon-purple bg-neon-purple/5 text-neon-purple" : "border-slate-200 dark:border-slate-800 text-slate-500"}`}>
              <CreditCard className="w-6 h-6" />
              <span className="text-xs font-bold uppercase tracking-widest">Tarjeta</span>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="bg-white dark:bg-dark-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-6">
            <div>
              <label className="block text-xs font-display tracking-widest uppercase mb-2 text-slate-500">ID de Roblox</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input type="text" required value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Tu usuario exacto" className="w-full bg-slate-50 dark:bg-dark-800 border border-slate-200 dark:border-slate-700 rounded-xl py-3 pl-12 pr-4 outline-none focus:border-neon-cyan text-slate-900 dark:text-white" />
              </div>
            </div>

            {paymentMethod === "transfer" && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <button type="button" onClick={() => setShowQR(true)} className="w-full p-4 bg-neon-cyan/5 border border-dashed border-neon-cyan/50 text-neon-cyan font-display font-bold uppercase tracking-widest rounded-xl hover:bg-neon-cyan/10 transition-all flex items-center justify-center gap-3">
                  <QrCode className="w-6 h-6" />
                  Ver QR y Datos Bancarios
                </button>
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl cursor-pointer hover:bg-slate-50 dark:hover:bg-dark-800 transition-all">
                  <Upload className={`w-6 h-6 mb-2 ${file ? 'text-neon-green' : 'text-slate-400'}`} />
                  <span className="text-xs text-slate-500 px-4 text-center truncate w-full">{file ? file.name : "Subir comprobante"}</span>
                  <input type="file" className="hidden" accept="image/*" onChange={(e) => e.target.files && setFile(e.target.files[0])} required />
                </label>
              </div>
            )}

            <button disabled={isPending} className={`w-full py-4 rounded-xl font-display font-black uppercase tracking-widest transition-all shadow-lg flex justify-center gap-2 ${paymentMethod === 'card' ? 'bg-neon-purple text-white' : 'bg-neon-cyan text-dark-900'}`}>
              {isPending ? <Loader2 className="animate-spin w-6 h-6" /> : paymentMethod === 'card' ? 'Pagar con Tarjeta' : 'Confirmar Transferencia'}
            </button>
          </form>
        </div>

        {/* COLUMNA DERECHA: Resumen con Opción de Borrar */}
        <div className="bg-white dark:bg-dark-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 h-fit sticky top-24 shadow-sm">
          <h2 className="text-sm font-display font-bold uppercase tracking-widest mb-6 flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-4 text-slate-900 dark:text-white">
            <ShoppingCart className="w-5 h-5 text-neon-cyan" /> Resumen de Carga
          </h2>
          
          <div className="space-y-4 mb-6">
            <AnimatePresence>
              {items.map((item) => (
                <motion.div 
                  layout
                  key={item.id} 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="flex justify-between items-center group"
                >
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => removeItem(item.id)} 
                      className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-neon-pink transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <span className="text-sm font-bold text-slate-600 dark:text-slate-300">{item.robux} R$</span>
                  </div>
                  <span className="text-sm font-mono text-slate-500">${item.price.toFixed(2)}</span>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          <div className="border-t border-slate-100 dark:border-slate-800 pt-4 flex justify-between items-center">
            <span className="text-xs font-display uppercase tracking-widest text-slate-500">Total a Pagar</span>
            <span className="text-2xl font-black text-neon-cyan">${totalPrice.toFixed(2)}</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-4 text-center font-mono">Total Robux: {totalRobux} R$</p>
        </div>
      </div>

      {/* Modal QR (Se mantiene igual) */}
      {showQR && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-dark-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-sm shadow-2xl p-6 space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="font-display font-bold text-slate-900 dark:text-white uppercase text-sm tracking-widest flex items-center gap-2">
                <Landmark className="w-5 h-5 text-neon-cyan" /> Datos Bancarios
              </h3>
              <button onClick={() => setShowQR(false)} className="text-slate-400 hover:text-neon-pink"><X /></button>
            </div>
            <div className="w-full h-48 bg-slate-100 dark:bg-dark-800 rounded-2xl border-2 border-neon-cyan flex items-center justify-center text-xs text-slate-400 font-mono">
              [ TU IMAGEN QR AQUÍ ]
            </div>
            <div className="space-y-2 text-sm font-mono bg-slate-50 dark:bg-dark-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
               <p className="text-neon-cyan font-bold uppercase mb-1">C. Montatixe</p>
               <p className="flex justify-between"><span>Pichincha:</span> <span className="text-slate-900 dark:text-white font-bold">2200XXXXX</span></p>
               <p className="flex justify-between"><span>De Una:</span> <span className="text-slate-900 dark:text-white font-bold">099XXXXXXX</span></p>
            </div>
            <button onClick={() => setShowQR(false)} className="w-full py-3 bg-dark-900 dark:bg-white text-white dark:text-dark-900 font-display font-black uppercase tracking-widest rounded-xl">Cerrar</button>
          </div>
        </div>
      )}
    </main>
  );
}