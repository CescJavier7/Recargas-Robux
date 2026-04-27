import { Gamepad2, MapPin, Mail, Smartphone} from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full bg-white dark:bg-dark-900 border-t border-slate-200 dark:border-slate-800 pt-16 pb-8 mt-20 transition-colors duration-300" id="contacto">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
        
        {/* Info de la Marca */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Gamepad2 className="w-6 h-6 text-neon-cyan" />
            <span className="font-display font-bold text-xl tracking-wider text-slate-900 dark:text-white">
              NEXUS<span className="text-neon-cyan">TOPUP</span>
            </span>
          </div>
          <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-6">
            La base de operaciones definitiva para gamers en Ecuador. Recargas, pases de batalla y streaming 100% seguro.
          </p>
        </div>

       

        {/* Contacto y Ubicación */}
        <div>
          <h3 className="font-display font-bold text-slate-900 dark:text-white mb-4 tracking-widest">CENTRO DE MANDO</h3>
          <ul className="space-y-4 text-sm text-slate-600 dark:text-slate-400">
            <li className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-neon-pink shrink-0" />
              <span>Sector Sur, Quito - Machachi<br/>Pichincha, Ecuador</span>
            </li>
            <li className="flex items-center gap-3">
              <Smartphone className="w-5 h-5 text-neon-green shrink-0" />
              <span>+593983755469 (Solo WhatsApp)</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 border-t border-slate-200 dark:border-slate-800 pt-8 text-center text-xs text-slate-500 font-mono">
        <p>&copy; {new Date().getFullYear()} NEXUS TOPUP. Todos los derechos reservados. Desarrollado por @CescJavier7.</p>
        <p className="mt-2">No estamos afiliados con Roblox Corporation, Garena, Epic Games ni Netflix.</p>
      </div>
    </footer>
  );
}