import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ShieldAlert, CheckCircle, XCircle, ExternalLink, User, DollarSign, Package, Trash2, Eye, X } from "lucide-react";

export const dynamic = "force-dynamic";

// 🚀 TIPO CORRECTO PARA NEXT.JS 15 / 16
type PageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function AdminPanel(props: PageProps) {
  // 🚀 AWAIT OBLIGATORIO: En tu versión de Next.js esto es una promesa
  const searchParams = await props.searchParams;
  const viewId = searchParams?.view as string | undefined;

  // 🚀 AWAIT OBLIGATORIO: Las cookies también son promesas ahora
  const cookieStore = await cookies();
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll() { return cookieStore.getAll(); } } }
  );

  // ==========================================
  // 🛡️ GUARDIA DE SEGURIDAD (CORREO FIJO)
  // ==========================================
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user) {
    redirect("/login");
  }

  const googleEmail = user.email?.toLowerCase().trim();
  const adminEmail = "javiercaiza220158@gmail.com"; 

  if (googleEmail !== adminEmail) {
    redirect("/"); 
  }
  // ==========================================

  const { data: orders } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });

  // 🛠️ ACCIÓN 1: ACTUALIZAR ESTADO
  async function updateOrderStatus(formData: FormData) {
    "use server";
    const orderId = formData.get("orderId") as string;
    const newStatus = formData.get("status") as string;

    const cookieStoreServer = await cookies(); // AWAIT AQUÍ TAMBIÉN
    const supabaseServer = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { getAll() { return cookieStoreServer.getAll(); } } }
    );

    const { data: { user: adminUser } } = await supabaseServer.auth.getUser();
    
    if (adminUser?.email?.toLowerCase().trim() === adminEmail) {
      await supabaseServer.from("orders").update({ status: newStatus }).eq("id", orderId);
      revalidatePath("/admin"); 
      revalidatePath("/dashboard");
    }
  }

  // 🛠️ ACCIÓN 2: ELIMINAR DE LA BD
  async function deleteOrderAction(formData: FormData) {
    "use server";
    const orderId = formData.get("orderId") as string;

    const cookieStoreServer = await cookies(); // AWAIT AQUÍ TAMBIÉN
    const supabaseServer = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { getAll() { return cookieStoreServer.getAll(); } } }
    );

    const { data: { user: adminUser } } = await supabaseServer.auth.getUser();
    
    if (adminUser?.email?.toLowerCase().trim() === adminEmail) {
      await supabaseServer.from("orders").delete().eq("id", orderId);
      revalidatePath("/admin"); 
      revalidatePath("/dashboard");
    }
  }

  // Buscamos la orden usando la variable que ya esperamos con await
  const selectedOrder = viewId ? orders?.find(o => String(o.id) === String(viewId)) : null;

  // Extraemos los items de forma ultra-segura
  const cartItemsSafe = Array.isArray(selectedOrder?.cart_items) ? selectedOrder.cart_items : [];

  return (
    <main className="min-h-screen max-w-7xl mx-auto py-8 px-4 sm:px-6 relative">
      
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
              {orders?.map((order) => {
                const orderCartSafe = Array.isArray(order.cart_items) ? order.cart_items : [];
                
                return (
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
                    {orderCartSafe.length > 0 ? (
                      <div className="flex flex-col gap-1.5">
                        {orderCartSafe.map((item: any, idx: number) => (
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
                      
                      <a href={`/admin?view=${order.id}`} title="Ver Detalles" className="p-2.5 bg-neon-cyan/10 border border-neon-cyan/30 text-neon-cyan rounded-xl hover:bg-neon-cyan hover:text-dark-900 transition-all active:scale-90 flex items-center justify-center">
                        <Eye className="w-4 h-4" />
                      </a>

                      <form action={updateOrderStatus}>
                        <input type="hidden" name="orderId" value={order.id} />
                        <input type="hidden" name="status" value="COMPLETED" />
                        <button title="Marcar como Enviado" className="p-2.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-neon-green rounded-xl hover:bg-emerald-500 hover:text-white transition-all active:scale-90">
                          <CheckCircle className="w-4 h-4" />
                        </button>
                      </form>
                      
                      <form action={updateOrderStatus}>
                        <input type="hidden" name="orderId" value={order.id} />
                        <input type="hidden" name="status" value="CANCELLED" />
                        <button title="Rechazar Pedido" className="p-2.5 bg-yellow-500/10 border border-yellow-500/30 text-yellow-600 dark:text-yellow-400 rounded-xl hover:bg-yellow-500 hover:text-white transition-all active:scale-90">
                          <XCircle className="w-4 h-4" />
                        </button>
                      </form>

                      <form action={deleteOrderAction}>
                        <input type="hidden" name="orderId" value={order.id} />
                        <button title="Eliminar Permanentemente" className="p-2.5 bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-neon-pink rounded-xl hover:bg-rose-500 hover:text-white transition-all active:scale-90">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 🚨 SERVER-SIDE MODAL DE DETALLES DE LA ORDEN 🚨 */}
      {/* ========================================================= */}
      {selectedOrder && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-md shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden">
            <div className="flex justify-between items-center p-5 border-b border-slate-800">
              <h3 className="font-display font-black text-white uppercase tracking-widest text-lg flex items-center gap-2">
                <Package className="w-5 h-5 text-neon-cyan" /> Detalles del Pedido
              </h3>
              <a href="/admin" className="text-slate-500 hover:text-neon-pink bg-slate-800 p-1.5 rounded-full transition-all">
                <X className="w-4 h-4" />
              </a>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <p className="text-xs text-slate-500 font-mono uppercase tracking-widest mb-3">Items Comprados</p>
                <div className="space-y-2">
                  {cartItemsSafe.map((item: any, idx: number) => (
                    <div key={idx} className="flex justify-between items-center bg-slate-800/50 p-3 rounded-xl border border-slate-700/50">
                      <span className="text-sm font-bold text-slate-300">{item.robux} R$</span>
                      <span className="text-sm font-mono text-neon-cyan">${item.price.toFixed(2)}</span>
                    </div>
                  ))}
                  {cartItemsSafe.length === 0 && (
                    <div className="text-center text-slate-500 text-xs italic py-2">
                      Detalle de paquetes no disponible.
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
                  <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1">Destino Roblox</p>
                  <p className="text-sm font-black text-white truncate">{selectedOrder.roblox_username}</p>
                </div>
                <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
                  <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1">Total a Inyectar</p>
                  <p className="text-sm font-black text-yellow-400">{selectedOrder.amount_robux} R$</p>
                </div>
              </div>

              <a href="/admin" className="block w-full py-3 text-center bg-slate-800 hover:bg-slate-700 text-white font-bold uppercase text-xs tracking-widest rounded-xl transition-colors">
                Cerrar Detalles
              </a>
            </div>
          </div>
        </div>
      )}

    </main>
  );
}