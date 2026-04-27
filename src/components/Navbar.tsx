"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { Gamepad2, User, LogOut, ChevronDown, LayoutDashboard, ShieldAlert, Sun, Moon, Menu, X, Home, Target, MessageCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { User as SupabaseUser } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import { useTheme } from "@/components/ThemeProvider";
import { motion, AnimatePresence } from "framer-motion";

// RUTAS ABSOLUTAS: El '/' al principio es OBLIGATORIO para evitar el error de #servicios
const NAV_LINKS = [
  { name: 'INICIO', href: '/', icon: Home, desc: 'Volver a la base de operaciones' },
  { name: 'CATÁLOGO', href: '/#robux', icon: Target, desc: 'Explorar servicios arcade y streaming' },
  { name: 'SOPORTE', href: '/#contacto', icon: MessageCircle, desc: 'Contactar con el centro de mando' },
];

export function Navbar() {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [imgError, setImgError] = useState(false); // Estado para manejar error de imagen
  
  const menuRef = useRef<HTMLDivElement>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);
  
  const { theme, setTheme } = useTheme();
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    const getUser = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            setUser(user);
            checkAdminRole(user.id);
        }
    };
    getUser();

    const checkAdminRole = async (userId: string) => {
      const { data } = await supabase.from('user_roles').select('role').eq('user_id', userId).single();
      if (data && data.role === 'ADMIN') setIsAdmin(true);
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      setImgError(false); // Resetear error si cambia el usuario
      if (session?.user) checkAdminRole(session.user.id);
    });

    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) setIsMenuOpen(false);
      if (isSidebarOpen && sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) setIsSidebarOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      subscription.unsubscribe();
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [supabase, isSidebarOpen]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsMenuOpen(false);
    setIsSidebarOpen(false);
    router.push("/");
  };

  const Logo = () => (
    <Link href="/" onClick={() => setIsSidebarOpen(false)} className="flex items-center gap-2 group">
      <Gamepad2 className="w-6 h-6 text-neon-cyan group-hover:text-neon-pink transition-colors" />
      <span className="font-display font-bold text-lg sm:text-xl tracking-wider text-slate-900 dark:text-white">
        NEXUS<span className="text-neon-cyan">TOPUP</span>
      </span>
    </Link>
  );

  return (
    <>
      <nav className="w-full border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-dark-900/80 backdrop-blur-md sticky top-0 z-50 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          
          <div className="flex items-center gap-2 sm:gap-4">
            <button onClick={() => setIsSidebarOpen(true)} className="md:hidden p-1.5 -ml-1 text-slate-600 dark:text-slate-400 hover:text-neon-cyan transition-colors">
              <Menu className="w-6 h-6" />
            </button>
            <Logo />
            <div className="hidden md:flex items-center gap-6 text-sm font-display tracking-widest text-slate-600 dark:text-slate-300">
              {NAV_LINKS.map(link => (
                <Link key={link.name} href={link.href} className="hover:text-neon-cyan transition-colors">
                  {link.name}
                </Link>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")} className="p-2 rounded-full bg-slate-100 dark:bg-dark-800 text-slate-600 dark:text-slate-400 hover:text-neon-cyan transition-colors">
              <Sun className="w-4 h-4 hidden dark:block" />
              <Moon className="w-4 h-4 block dark:hidden" />
            </button>

            {user ? (
              <div className="relative" ref={menuRef}>
                <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="flex items-center gap-2 bg-slate-100 dark:bg-dark-800 border border-slate-200 dark:border-slate-700 py-1 px-1 sm:pr-3 rounded-full hover:border-neon-cyan transition-all">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full overflow-hidden border border-neon-cyan relative">
                    {!imgError ? (
                        <img 
                            src={user.user_metadata?.avatar_url || user.user_metadata?.picture} 
                            alt="Avatar" 
                            referrerPolicy="no-referrer" // 🚨 ESTO REPARA LAS FOTOS DE GOOGLE
                            onError={() => setImgError(true)}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="w-full h-full bg-dark-700 flex items-center justify-center text-neon-cyan text-[10px] font-bold">
                            {user.email?.charAt(0).toUpperCase()}
                        </div>
                    )}
                  </div>
                  <span className="text-xs sm:text-sm font-display text-slate-700 dark:text-slate-300 hidden md:block">
                    {user.user_metadata?.full_name?.split(" ")[0] || "Jugador"}
                  </span>
                  <ChevronDown className={`w-4 h-4 text-slate-400 hidden sm:block transition-transform ${isMenuOpen ? "rotate-180" : ""}`} />
                </button>

                <AnimatePresence>
                {isMenuOpen && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="absolute top-full right-0 mt-2 w-56 bg-white dark:bg-dark-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-lg z-50 overflow-hidden">
                    <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800">
                      <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{user.user_metadata?.full_name || 'Agente Nexus'}</p>
                      <p className="text-[10px] text-slate-500 truncate">{user.email}</p>
                    </div>
                    <div className="p-2 flex flex-col gap-1">
                      <Link href="/dashboard" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-3 px-3 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-dark-800 hover:text-neon-cyan rounded-lg transition-colors">
                        <LayoutDashboard className="w-4 h-4" /> Centro de Comando
                      </Link>
                      {isAdmin && (
                        <Link href="/admin" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-3 px-3 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-neon-pink/10 hover:text-neon-pink rounded-lg transition-colors">
                          <ShieldAlert className="w-4 h-4" /> Panel de Admin
                        </Link>
                      )}
                    </div>
                    <div className="p-2 border-t border-slate-100 dark:border-slate-800">
                      <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors">
                        <LogOut className="w-4 h-4" /> Desconectar
                      </button>
                    </div>
                  </motion.div>
                )}
                </AnimatePresence>
              </div>
            ) : (
              <Link href="/login" className="flex items-center gap-2 px-4 py-2 text-sm font-display font-bold uppercase tracking-widest text-neon-cyan border border-neon-cyan/50 rounded-lg hover:bg-neon-cyan hover:text-dark-900 transition-all">
                <User className="w-4 h-4" /> Login
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* SIDEBAR MÓVIL (Rutas corregidas también) */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-dark-950/70 z-[60] md:hidden" />
            <motion.div ref={sidebarRef} initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }} transition={{ type: "spring", bounce: 0, duration: 0.4 }} className="fixed top-0 left-0 bottom-0 w-[80%] max-w-xs bg-white dark:bg-dark-900 z-[70] p-6 shadow-2xl border-r border-slate-200 dark:border-slate-800 md:hidden flex flex-col">
              <div className="flex items-center justify-between mb-12">
                <Logo />
                <button onClick={() => setIsSidebarOpen(false)} className="p-1 text-slate-500 hover:text-neon-pink transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="flex flex-col gap-4">
                {NAV_LINKS.map(link => (
                  <Link key={link.name} href={link.href} onClick={() => setIsSidebarOpen(false)} className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-dark-800 rounded-2xl border border-slate-100 dark:border-slate-700 hover:border-neon-cyan transition-all group">
                    <div className="p-2 bg-white dark:bg-dark-900 rounded-lg text-slate-400 group-hover:text-neon-cyan transition-colors">
                      <link.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="font-display font-bold text-sm text-slate-900 dark:text-white group-hover:text-neon-cyan transition-colors">{link.name}</span>
                      <p className="text-[10px] text-slate-500">{link.desc}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}