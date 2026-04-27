"use client";

import { useState, useTransition } from "react";
import { motion } from "framer-motion";
import { Upload, User, ArrowLeft, Landmark, Zap, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { submitOrder } from "@/actions/order";

// Diccionario de precios (Espejo del backend)
const ROBUX_PRICES: Record<string, string> = {
  "40": "0.75",
  "80": "1.35",
  "400": "6.00",
  "800": "12.00",
  "1200": "17.50",
  "1700": "24.00",
  "3150": "41.00",
  "4500": "60.00",
};

export default function OrderPage() {
  const router = useRouter();
  const params = useParams();
  const amount = params.amount as string; 
  
  // Obtenemos el precio correcto o "0.00" si hay un error
  const price = ROBUX_PRICES[amount] || "0.00";

  const [file, setFile] = useState<File | null>(null);
  const [username, setUsername] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.size > 5 * 1024 * 1024) {
        setErrorMsg("El archivo es demasiado pesado (Máx 5MB).");
        return;
      }
      setFile(selectedFile);
      setErrorMsg("");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !username) {
      setErrorMsg("Completa todos los campos, piloto.");
      return;
    }

    startTransition(async () => {
      const formData = new FormData();
      formData.append("amount", amount);
      formData.append("username", username);
      formData.append("file", file);

      const result = await submitOrder(formData);

      if (result.success) {
        router.push("/dashboard?success=true");
      } else {
        setErrorMsg(result.error || "Ocurrió un error inesperado.");
      }
    });
  };

  return (
    <main className="min-h-screen flex flex-col items-center py-12 px-6 relative">
      <div className="w-full max-w-2xl z-10">
        
        <div className="flex items-center gap-4 mb-8">
          <Link href="/" className="p-2 bg-white dark:bg-dark-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:border-neon-cyan text-slate-500 dark:text-slate-400 hover:text-neon-cyan transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-3xl font-display font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            Completar <span className="text-neon-cyan">Misión</span>
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {errorMsg && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-4 bg-neon-pink/10 border border-neon-pink text-neon-pink rounded-xl font-mono text-sm text-center">
              ALERTA: {errorMsg}
            </motion.div>
          )}

          <motion.div className="bg-white dark:bg-dark-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl flex items-center justify-between shadow-sm">
            <div>
              <p className="text-slate-500 dark:text-slate-400 text-sm font-display tracking-widest uppercase mb-1">Paquete Seleccionado</p>
              <div className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-500 dark:text-yellow-400" fill="currentColor" />
                {amount} Robux
              </div>
            </div>
            <div className="text-right">
              <p className="text-slate-500 dark:text-slate-400 text-sm font-display tracking-widest uppercase mb-1">Total a pagar</p>
              <div className="text-2xl font-light text-neon-cyan">
                ${price}
              </div>
            </div>
          </motion.div>

          <motion.div className="bg-slate-50 dark:bg-dark-800 border border-neon-purple/30 dark:border-neon-purple/50 p-6 rounded-2xl">
             <div className="flex items-center gap-3 mb-4 text-neon-purple">
              <Landmark className="w-6 h-6" />
              <h3 className="font-display font-bold text-lg uppercase tracking-wider">Datos de Transferencia</h3>
            </div>
            <div className="text-slate-700 dark:text-slate-300 space-y-2 text-sm font-mono bg-white dark:bg-dark-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-inner">
              <p className="text-neon-cyan font-bold mb-2 border-b border-slate-200 dark:border-slate-800 pb-2">BANCO PICHINCHA</p>
              <p>Tipo: <span className="font-bold">Cuenta de Ahorros</span></p>
              <p>Número: <span className="font-bold">2205330629</span></p>
              <p>Titular: <span className="font-bold">Kevin Javier Montatixe (CI: 1726303090)</span></p>
            </div>
          </motion.div>

          <motion.div className="bg-white dark:bg-dark-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl space-y-6 shadow-sm">
            <div>
              <label className="block text-slate-500 dark:text-slate-400 text-sm font-display tracking-widest uppercase mb-2">Usuario de Roblox</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User className="w-5 h-5 text-slate-400 dark:text-slate-500" />
                </div>
                <input
                  type="text"
                  required
                  disabled={isPending}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Tu_GamerTag123"
                  className="w-full bg-slate-50 dark:bg-dark-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:border-neon-cyan focus:ring-1 focus:ring-neon-cyan transition-all disabled:opacity-50"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-500 dark:text-slate-400 text-sm font-display tracking-widest uppercase mb-2">Comprobante de Pago</label>
              <label className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-xl transition-all ${isPending ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} ${file ? 'border-neon-green bg-neon-green/5' : 'border-slate-300 dark:border-slate-700 hover:border-neon-cyan hover:bg-slate-50 dark:hover:bg-dark-800'}`}>
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className={`w-8 h-8 mb-3 ${file ? 'text-neon-green' : 'text-slate-400 dark:text-slate-500'}`} />
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {file ? <span className="text-neon-green font-bold">{file.name}</span> : <span>Click para subir captura (JPG, PNG)</span>}
                  </p>
                </div>
                <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} disabled={isPending} required />
              </label>
            </div>
          </motion.div>

          <button 
            type="submit"
            disabled={isPending}
            className="w-full py-4 rounded-xl bg-neon-cyan text-dark-900 font-display font-black uppercase tracking-widest hover:bg-cyan-300 dark:hover:bg-white transition-all hover:shadow-[0_0_20px_rgba(0,240,255,0.4)] disabled:opacity-70 disabled:hover:shadow-none flex justify-center items-center gap-2"
          >
            {isPending ? (
              <>
                <Loader2 className="w-6 h-6 animate-spin" />
                Procesando Transacción...
              </>
            ) : (
              "Confirmar y Enviar Orden"
            )}
          </button>
        </form>
      </div>
    </main>
  );
}