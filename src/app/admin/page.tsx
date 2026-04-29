import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ShieldAlert, CheckCircle, XCircle, ExternalLink, User, DollarSign, Package, Trash2 } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminPanel() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll() { return cookieStore.getAll(); } } }
  );

  // ==========================================
  // 🛡️ GUARDIA DE SEGURIDAD DEL ADMIN (FUERZA BRUTA)
  // ==========================================
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user) {
    redirect("/login");
  }

  const googleEmail = user.email?.toLowerCase().trim();
  
  // 🔥 QUEMAMOS EL CORREO PARA EVITAR PROBLEMAS DE VERCEL
  const adminEmail = "javiercaiza220158@gmail.com";

  if (googleEmail !== adminEmail) {
    redirect("/"); 
  }
  // ==========================================

  const { data: orders } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });

  // 🛠️ ACCIÓN 1: ACTUALIZAR ESTADO (Aprobar/Rechazar)
  async function updateOrderStatus(formData: FormData) {
    "use server";
    const orderId = formData.get("orderId") as string;
    const newStatus = formData.get("status") as string;

    const cookieStoreServer = await cookies();
    const supabaseServer = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { getAll() { return cookieStoreServer.getAll(); } } }
    );

    const { data: { user: adminUser } } = await supabaseServer.auth.getUser();
    
    // 🔥 TAMBIÉN USAMOS EL CORREO QUEMADO AQUÍ ADENTRO
    if (adminUser?.email?.toLowerCase().trim() === adminEmail) {
      await supabaseServer.from("orders").update({ status: newStatus }).eq("id", orderId);
      revalidatePath("/admin"); 
      revalidatePath("/dashboard");
    }
  }

  // 🛠️ ACCIÓN 2: ELIMINAR ORDEN POR COMPLETO DE LA BASE DE DATOS
  async function deleteOrderAction(formData: FormData) {
    "use server";
    const orderId = formData.get("orderId") as string;

    const cookieStoreServer = await cookies();
    const supabaseServer = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { getAll() { return cookieStoreServer.getAll(); } } }
    );

    const { data: { user: adminUser } } = await supabaseServer.auth.getUser();
    
    // 🔥 VALIDACIÓN DE SEGURIDAD ANTES DE BORRAR
    if (adminUser?.email?.toLowerCase().trim() === adminEmail) {
      await supabaseServer.from("orders").delete().eq("id", orderId);
      revalidatePath("/admin"); 
      revalidatePath("/dashboard");
    }
  }

  return (
    <main className="min-h-screen max-w-7xl mx-auto py-8 px-4 sm:px-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-neon-pink/10 rounded-2xl">
            <ShieldAlert className="w-8 h-8 text-neon-pink" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-display font-black text-slate-900 dark:text-white uppercase tracking-tighter">
              CENTRO DE <span className="text-neon-pink">CONTROL</span>
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-xs font-mono uppercase tracking-widest">Gestión de suministros y pagos</p>
          </div>
        </div>
        
        <div className="flex gap-2">
            <div className="px-4 py-2 bg-slate-100 dark:bg-dark-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-400">
                Total Órdenes: {orders?.length || 0}
            </div>
        </div>
      </div>

      <div className="bg-white dark:bg-dark-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xl dark:shadow-none overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-dark-800/50 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700">
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] min-w-[220px]"><div className="flex items-center gap-2"><User className="w-3 h-3"/> Cliente y Destino</div></th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] min-w-[140px]"><div className="flex items-center gap-2"><Package className="w-3 h-3"/> Paquete</div></th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] min-w-[100px]"><div className="flex items-center gap-2"><DollarSign className="w-3 h-3"/> Pago</div></th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] min-w-[140px]">Comprobante</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] min-w-[140px]">Estado</th>
                <th className="sticky right-0 bg-slate-50 dark:bg-dark-800 px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-center shadow-[-10px_0_15px_-3px_rgba(0,0,0,0.05)] dark:shadow-[-10px_0_15px_-3px_rgba(0,0,0,0.3)] z-10">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {orders?.map((order) => (
                <tr key={order.id} className="group hover:bg-slate-50/50 dark:hover:bg-dark-800/30 transition-colors">
                  
                  <td className="px-6 py-5">
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5 truncate max-w-[200px]">
                        {order.user_name || "Cliente Nexus"}
                      </span>
                      <span className="text-[10px] text-slate-500 mb-2 truncate max-w-[200px]">
                        {order.user_email || "Correo no registrado"}
                      </span>
                      
                      <div className="flex items-center gap-1.5 px-2 py-1 bg-neon-cyan/10 border border-neon-cyan/20 rounded-md w-fit">
                        <User className="w-3 h-3 text-neon-cyan" />
                        <span className="text-[10px] font-bold text-neon-cyan">Roblox: {order.roblox_username}</span>
                      </div>
                      
                      <span className="text-[9px] font-mono text-slate-400 mt-2 uppercase tracking-tighter">ID: {order.id.split('-')[0]}</span>
                    </div>
                  </td>

                  <td className="px-6 py-5">
                    {order.cart_items && order.cart_items.length > 0 ? (
                      <div className="flex flex-col gap-1.5">
                        {order.cart_items.map((item: any, idx: number) => (
                          <span key={idx} className="inline-flex items-center w-fit px-2 py-0.5 rounded-md bg-slate-100 dark:bg-dark-800 border border-slate-200 dark:border-slate-700 text-[10px] font-mono text-slate-600 dark:text-slate-400">
                            {item.robux} R$ <span className="mx-1 opacity-50">|</span> ${item.price.toFixed(2)}
                          </span>
                        ))}
                        <div className="mt-1 flex items-center gap-1 text-xs font-black text-yellow-600 dark:text-yellow-400">
                          <span className="uppercase text-[9px] tracking-widest">Total:</span> {order.amount_robux} R$
                        </div>
                      </div>
                    ) : (
                      <div className="inline-flex items-center px-3 py-1 rounded-lg bg-yellow-400/10 border border-yellow-400/20">
                        <span className="text-yellow-600 dark:text-yellow-400 font-black text-xs leading-none">{order.amount_robux}</span>
                        <span className="ml-1 text-[9px] text-yellow-600/70 dark:text-yellow-400/70 font-bold uppercase">R$</span>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-5">
                    <span className="font-mono font-bold text-neon-cyan">${order.price_usd}</span>
                  </td>
                  <td className="px-6 py-5">
                    <a 
                      href={order.proof_url} 
                      target="_blank" 
                      rel="noreferrer" 
                      className="group/link inline-flex items-center gap-2 text-neon-purple hover:text-neon-pink transition-all font-bold text-xs"
                    >
                      <div className="p-1.5 rounded-md bg-neon-purple/10 group-hover/link:bg-neon-pink/10">
                        <ExternalLink className="w-3 h-3" />
                      </div>
                      VER RECIBO
                    </a>
                  </td>
                  <td className="px-6 py-5">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-widest border ${
                      order.status === 'PENDING' ? 'bg-yellow-400/5 text-yellow-600 border-yellow-200 dark:text-yellow-400 dark:border-yellow-400/20' :
                      order.status === 'COMPLETED' ? 'bg-neon-green/5 text-emerald-600 border-emerald-200 dark:text-neon-green dark:border-neon-green/20' :
                      'bg-neon-pink/5 text-rose-600 border-rose-200 dark:text-neon-pink dark:border-neon-pink/20'
                    }`}>
                      {order.status === 'PENDING' ? 'En Revisión' : order.status === 'COMPLETED' ? 'Enviado' : 'Rechazado'}
                    </span>
                  </td>

                  <td className="sticky right-0 bg-white dark:bg-dark-900 group-hover:bg-slate-50 dark:group-hover:bg-dark-800 px-6 py-5 shadow-[-10px_0_15px_-3px_rgba(0,0,0,0.05)] dark:shadow-[-10px_0_15px_-3px_rgba(0,0,0,0.3)] z-10">
                    <div className="flex justify-center gap-2">
                      {/* BOTÓN: APROBAR */}
                      <form action={updateOrderStatus}>
                        <input type="hidden" name="orderId" value={order.id} />
                        <input type="hidden" name="status" value="COMPLETED" />
                        <button title="Marcar como Enviado" className="p-2.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-neon-green rounded-xl hover:bg-emerald-500 hover:text-white transition-all active:scale-90">
                          <CheckCircle className="w-4 h-4" />
                        </button>
                      </form>
                      
                      {/* BOTÓN: RECHAZAR */}
                      <form action={updateOrderStatus}>
                        <input type="hidden" name="orderId" value={order.id} />
                        <input type="hidden" name="status" value="CANCELLED" />
                        <button title="Rechazar Pedido" className="p-2.5 bg-yellow-500/10 border border-yellow-500/30 text-yellow-600 dark:text-yellow-400 rounded-xl hover:bg-yellow-500 hover:text-white transition-all active:scale-90">
                          <XCircle className="w-4 h-4" />
                        </button>
                      </form>

                      {/* 🔥 NUEVO BOTÓN: ELIMINAR DE LA BASE DE DATOS 🔥 */}
                      <form action={deleteOrderAction} onSubmit={(e) => {
                        // Agregamos una confirmación en el navegador para evitar clics por accidente
                        if(!window.confirm('¿Estás SEGURO de querer borrar este pedido? Desaparecerá de tu panel y del cliente para siempre.')) {
                          e.preventDefault();
                        }
                      }}>
                        <input type="hidden" name="orderId" value={order.id} />
                        <button title="Eliminar Permanentemente" className="p-2.5 bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-neon-pink rounded-xl hover:bg-rose-500 hover:text-white transition-all active:scale-90">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {(!orders || orders.length === 0) && (
            <div className="text-center py-20 bg-slate-50/50 dark:bg-dark-800/20 italic text-slate-400 text-sm">
              Esperando nuevas transmisiones de datos...
            </div>
          )}
        </div>
      </div>
    </main>
  );
}