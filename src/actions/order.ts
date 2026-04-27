"use server";

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

const ROBUX_PRICES: Record<string, number> = {
  "40": 0.49,
  "80": 0.99,
  "400": 4.99,
  "800": 9.99,
  "1200": 14.99,
  "1700": 19.99,
  "3150": 34.99,
  "4500": 49.99,
};

export async function submitOrder(formData: FormData) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { getAll() { return cookieStore.getAll() } } }
    );

    // 1. Verificación de Identidad
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Acceso denegado. Debes iniciar sesión.");

    // 2. Extraer datos
    const amount = formData.get("amount") as string;
    const username = formData.get("username") as string;
    const file = formData.get("file");

    // 3. CAPA DE EXIGENCIA ESTRICTA (Ningún campo vacío)
    if (!amount || !username || username.trim() === "") {
      throw new Error("El ID de Roblox es obligatorio. Operación abortada.");
    }

    if (!file) {
      throw new Error("El comprobante de pago es obligatorio.");
    }

    // 4. FIREWALL ANTI-HACKS / ANTI-VIRUS
    // Nos aseguramos de que lo que enviaron es realmente un objeto de tipo Archivo
    if (!(file instanceof File)) {
      throw new Error("Intento de brecha detectado: Formato de datos corrupto.");
    }

    // Filtro de Tamaño Máximo (5MB) en el servidor
    if (file.size > 5 * 1024 * 1024) {
      throw new Error("Archivo demasiado pesado. Máximo 5MB.");
    }

    // Filtro de Tipo de Archivo (Solo Imágenes)
    // Esto bloquea scripts maliciosos, ejecutables o documentos infectados
    const validImageTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp', 'image/gif'];
    if (!validImageTypes.includes(file.type)) {
      throw new Error("FIREWALL ACTIVADO: Solo se permiten formatos de imagen reales. Archivo bloqueado.");
    }

    // 5. Validación Anti-Fraude de Precios
    const price = ROBUX_PRICES[amount];
    if (!price) throw new Error("Paquete de Robux inválido o alterado.");

    // 6. Subida Segura a Supabase
    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}-${Date.now()}.${fileExt}`; 
    
    const { error: uploadError } = await supabase.storage
      .from('payment-proofs')
      .upload(fileName, file);

    if (uploadError) {
      console.error("Error en Storage:", uploadError);
      throw new Error("Fallo en la matriz al subir el comprobante.");
    }

    const { data: { publicUrl } } = supabase.storage
      .from('payment-proofs')
      .getPublicUrl(fileName);

    // 7. Guardar la Orden
    const { error: dbError } = await supabase
      .from('orders')
      .insert({
        user_id: user.id,
        roblox_username: username,
        amount_robux: parseInt(amount),
        price_usd: price,
        proof_url: publicUrl,
        status: 'PENDING'
      });

    if (dbError) {
      console.error("Error en BD:", dbError);
      throw new Error("No pudimos registrar la orden en la base de datos.");
    }

    revalidatePath('/dashboard'); 
    return { success: true };

  } catch (error: any) {
    return { success: false, error: error.message || "Error interno del sistema" };
  }
}