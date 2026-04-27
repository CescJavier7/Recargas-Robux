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
      .select('*', { count: 'exact', head: true }) // head: true hace que no gaste megas descargando datos
      .eq('user_id', user.id)
      .gte('created_at', twentyFourHoursAgo);

    if (countError) {
      throw new Error("Fallo en el sistema de seguridad. Operación abortada.");
    }
    
    if (count !== null && count >= 5) {
      throw new Error("🛡️ SISTEMA DE DEFENSA: Has alcanzado el límite máximo de 5 solicitudes en 24 horas. Por seguridad, intenta mañana.");
    }
    // ====================================================================

    // Extracción de datos del formulario
    const totalRobux = parseInt(formData.get("totalRobux") as string);
    const totalPrice = parseFloat(formData.get("totalPrice") as string);
    const username = formData.get("username") as string;
    const file = formData.get("file");
    
    const cartItemsRaw = formData.get("cartItems") as string;
    const cartItems = cartItemsRaw ? JSON.parse(cartItemsRaw) : [];

    // Validaciones estrictas de datos corruptos
    if (!totalRobux || !totalPrice || !username || username.trim() === "") {
      throw new Error("Datos corruptos. Operación abortada.");
    }
    if (!file) throw new Error("El comprobante de pago es obligatorio.");
    if (!(file instanceof File)) throw new Error("Intento de brecha detectado.");
    if (file.size > 5 * 1024 * 1024) throw new Error("Archivo demasiado pesado. Máximo 5MB.");

    const validImageTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    if (!validImageTypes.includes(file.type)) {
      throw new Error("FIREWALL ACTIVADO: Solo se permiten imágenes reales.");
    }

    // Subida del archivo al Storage
    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}-${Date.now()}.${fileExt}`; 
    
    const { error: uploadError } = await supabase.storage
      .from('payment-proofs')
      .upload(fileName, file);

    if (uploadError) throw new Error("Fallo en la matriz al subir el comprobante.");

    const { data: { publicUrl } } = supabase.storage
      .from('payment-proofs')
      .getPublicUrl(fileName);

    // Guardado final en la Base de Datos
    const { error: dbError } = await supabase
      .from('orders')
      .insert({
        user_id: user.id,
        roblox_username: username,
        amount_robux: totalRobux,
        price_usd: totalPrice,
        proof_url: publicUrl,
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
    // Esto enviará el mensaje de error de nuestro Firewall al Checkout
    return { success: false, error: error.message || "Error interno del sistema" };
  }
}