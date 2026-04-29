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

    // 🔥 NUEVO: Extraemos el correo y nombre real de la cuenta de Google
    const userEmail = user?.email || "Correo oculto";
    const userName = user?.user_metadata?.name || user?.user_metadata?.full_name || "Usuario Nexus";

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

    const totalRobux = parseInt(formData.get("totalRobux") as string);
    const totalPrice = parseFloat(formData.get("totalPrice") as string);
    const username = formData.get("username") as string;
    const proofUrl = formData.get("publicUrl") as string; 
    
    const cartItemsRaw = formData.get("cartItems") as string;
    const cartItems = cartItemsRaw ? JSON.parse(cartItemsRaw) : [];

    if (!totalRobux || !totalPrice || !username || username.trim() === "") {
      throw new Error("Datos corruptos. Operación abortada.");
    }
    if (!proofUrl || !proofUrl.startsWith("http")) {
       throw new Error("La URL del comprobante no es válida o está ausente.");
    }

    // Guardado final en la Base de Datos incluyendo Correo y Nombre
    const { error: dbError } = await supabase
      .from('orders')
      .insert({
        user_id: user.id,
        user_email: userEmail, // Sello del correo
        user_name: userName,   // Sello del nombre
        roblox_username: username,
        amount_robux: totalRobux,
        price_usd: totalPrice,
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