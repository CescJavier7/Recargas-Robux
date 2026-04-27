import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Zap, Clock, CheckCircle2, XCircle, AlertCircle, User } from "lucide-react";
// Forzamos a que esta página sea dinámica y no se quede cacheada eternamente
export const dynamic = "force-dynamic";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: { success?: string };
}) {

  // ANTES: const cookieStore = cookies();
  const cookieStore = await cookies(); // <-- AÑADE EL AWAIT AQUÍ

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
      },
    }
  );

  // 1. Verificamos la sesión
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  // 2. Extraemos las órdenes de la base de datos
  // Magia del RLS: Aunque pidamos '*', la BD solo nos devolverá las de ESTE usuario
 /// Extraemos las órdenes, forzando a que SOLO traiga las de este usuario
  const { data: orders, error } = await supabase
    .from("orders")
    .select("*")
    .eq("user_id", user.id) // <--- EL ESCUDO FILTRADOR
    .order("created_at", { ascending: false });
  // Si hay un error invisible, lo imprimimos en tu terminal de VS Code
  if (error) {
    console.error("Error crítico leyendo base de datos:", error.message);
  }

  // Función auxiliar para los colores y logos de estado
  const getStatusConfig = (status: string) => {
    switch (status) {
      case "PENDING":
        return { color: "text-yellow-400 border-yellow-400/50 bg-yellow-400/10", icon: <Clock className="w-4 h-4" />, text: "En Revisión" };
      case "PAID":
        return { color: "text-neon-cyan border-neon-cyan/50 bg-neon-cyan/10", icon: <CheckCircle2 className="w-4 h-4" />, text: "Pago Verificado" };
      case "COMPLETED":
        return { color: "text-neon-green border-neon-green/50 bg-neon-green/10", icon: <Zap className="w-4 h-4" />, text: "Robux Enviados" };
      case "CANCELLED":
        return { color: "text-neon-pink border-neon-pink/50 bg-neon-pink/10", icon: <XCircle className="w-4 h-4" />, text: "Rechazada" };
      default:
        return { color: "text-slate-400 border-slate-700 bg-dark-800", icon: <AlertCircle className="w-4 h-4" />, text: "Desconocido" };
    }
  };

  return (
    <main className="min-h-screen max-w-5xl mx-auto py-12 px-6">
      
      {/* Mensaje de Éxito Post-Compra */}
      {searchParams.success === "true" && (
        <div className="mb-8 p-4 bg-neon-green/10 border border-neon-green rounded-xl flex items-center gap-3 text-neon-green animate-pulse">
          <CheckCircle2 className="w-6 h-6" />
          <div>
            <h3 className="font-display font-bold uppercase tracking-widest">Transacción Exitosa</h3>
            <p className="text-sm">Tu comprobante ha sido subido al sistema. Lo verificaremos a la velocidad de la luz.</p>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-10">
        <h1 className="text-3xl md:text-4xl font-display font-black text-slate-900 dark:text-white uppercase tracking-tighter">
          Centro de <span className="text-neon-cyan">Comando</span>
        </h1>
      </div>
      
      {/* Grid de Órdenes */}
      {orders && orders.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {orders.map((order) => {
  const status = getStatusConfig(order.status);
  
  return (
    <div key={order.id} className="bg-white dark:bg-dark-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 hover:shadow-xl dark:hover:shadow-neon-cyan/5 transition-all group relative overflow-hidden flex flex-col justify-between">
      
      {/* Brillo de fondo (Solo Dark Mode) */}
      <div className={`absolute -right-12 -top-12 w-32 h-32 rounded-full blur-[50px] opacity-10 dark:opacity-20 transition-colors ${status.color.split(' ')[0].replace('text-', 'bg-')}`}></div>

      <div className="relative z-10">
        <div className="flex justify-between items-start mb-4">
          <div>
            <p className="text-[10px] font-mono text-slate-400 dark:text-slate-500 mb-1 tracking-tighter">ID: {order.id.split('-')[0]}...</p>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <User className="w-4 h-4 text-slate-400" />
              {order.roblox_username}
            </h3>
          </div>
          <span className={`flex items-center gap-1 px-2.5 py-1 text-[10px] font-display font-bold uppercase tracking-widest border rounded-full ${status.color}`}>
            {status.icon}
            {status.text}
          </span>
        </div>

        {/* Info de Carga y Precio */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          <div className="p-3 bg-slate-50 dark:bg-dark-800 rounded-xl border border-slate-100 dark:border-slate-700/50">
            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-display tracking-widest uppercase mb-1">Carga</p>
            <p className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-1">
              <Zap className="w-3 h-3 text-yellow-500" fill="currentColor" />
              {order.amount_robux}
            </p>
          </div>
          <div className="p-3 bg-slate-50 dark:bg-dark-800 rounded-xl border border-slate-100 dark:border-slate-700/50 text-right">
            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-display tracking-widest uppercase mb-1">Invertido</p>
            <p className="text-base font-light text-neon-cyan">${order.price_usd}</p>
          </div>
        </div>
      </div>

      {/* Botón de WhatsApp - Ahora ocupa todo el ancho inferior con mejor padding */}
      {order.status === 'PENDING' && (
        <div className="mt-auto pt-2 relative z-10">
          <a 
            href={`https://wa.me/593983755469?text=¡Hola! Tengo una recarga que procesar%20Orden:%20${order.id.split('-')[0]}%20para%20${order.roblox_username}.`}
            target="_blank"
            rel="noreferrer"
            className="w-full py-3 bg-[#25D366]/10 dark:bg-transparent border-2 border-[#25D366] text-[#128C7E] dark:text-[#25D366] rounded-xl text-xs font-display font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-[#25D366] hover:text-white dark:hover:text-dark-900 transition-all duration-300 shadow-sm"
          >
            <svg className="w-5 h-5 shrink-0" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            <span className="whitespace-nowrap">Acelerar Pedido</span>
          </a>
        </div>
      )}
    </div>
  );
})}
        </div>
      ) : (
        <div className="text-center py-20 bg-dark-900 border border-slate-800 rounded-2xl">
          <Zap className="w-12 h-12 text-slate-600 mx-auto mb-4 opacity-50" />
          <h2 className="text-xl font-display font-bold text-white mb-2">No hay misiones activas</h2>
          <p className="text-slate-500">Aún no has solicitado ninguna recarga de Robux.</p>
        </div>
      )}
    </main>
  );
  
}
