"use server";

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

export async function submitOrder(formData: FormData) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { getAll() { return cookieStore.getAll() } } }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Acceso denegado. Debes iniciar sesión.");

    // ====================================================================
    // 🛡️ FIREWALL ANTI-BOTS: LÍMITE DE 5 RECARGAS POR 24 HORAS
    // ====================================================================
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    
    const { count, error: countError } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .gte('created_at', twentyFourHoursAgo);

    if (countError) {
      throw new Error("Fallo en el sistema de seguridad. Operación abortada.");
    }
    
    if (count !== null && count >= 5) {
      throw new Error("🛡️ SISTEMA DE DEFENSA: Has alcanzado el límite máximo de 5 solicitudes en 24 horas. Por seguridad, intenta mañana.");
    }
    // ====================================================================

    // Extracción de datos del formulario (Ahora extraemos la URL, NO el archivo)
    const totalRobux = parseInt(formData.get("totalRobux") as string);
    const totalPrice = parseFloat(formData.get("totalPrice") as string);
    const username = formData.get("username") as string;
    
    // 🔥 ESTA ES LA LÍNEA NUEVA QUE RECIBE LA URL PÚBLICA
    const proofUrl = formData.get("publicUrl") as string; 
    
    const cartItemsRaw = formData.get("cartItems") as string;
    const cartItems = cartItemsRaw ? JSON.parse(cartItemsRaw) : [];

    // Validaciones estrictas de datos corruptos
    if (!totalRobux || !totalPrice || !username || username.trim() === "") {
      throw new Error("Datos corruptos. Operación abortada.");
    }
    // Validar que la URL no esté vacía
    if (!proofUrl || !proofUrl.startsWith("http")) {
       throw new Error("La URL del comprobante no es válida o está ausente.");
    }

    // ====================================================================
    // ELIMINADO: Todo el código de subida al Storage que estaba aquí
    // ====================================================================

    // Guardado final en la Base de Datos usando la URL que recibimos
    const { error: dbError } = await supabase
      .from('orders')
      .insert({
        user_id: user.id,
        roblox_username: username,
        amount_robux: totalRobux,
        price_usd: totalPrice,
        // Usamos la URL pública directa que recibimos
        proof_url: proofUrl, 
        status: 'PENDING',
        cart_items: cartItems
      });

    if (dbError) {
      console.error(dbError);
      throw new Error("No pudimos registrar la orden en la base de datos.");
    }

    revalidatePath('/dashboard'); 
    return { success: true };

  } catch (error: any) {
    return { success: false, error: error.message || "Error interno del sistema" };
  }
}