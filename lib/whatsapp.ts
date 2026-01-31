
interface SendWhatsAppParams {
  nomor: string;
  message: string;
}

interface WhatsAppResponse {
  success: boolean;
  message?: string;
  error?: string;
}

/**
 * Mengirim notifikasi WhatsApp
 * @param nomor - Nomor WhatsApp tujuan (format: 628xxx)
 * @param message - Pesan yang akan dikirim
 * @returns Promise dengan hasil pengiriman
 */
export async function kirimNotifWhatsApp(
  nomor: string,
  message: string
): Promise<WhatsAppResponse> {
  try {
    const apiUrl = process.env.WHATSAPP_API_URL;
    const apiToken = process.env.WHATSAPP_API_TOKEN;

    if (!apiUrl || !apiToken) {
      throw new Error('WHATSAPP_API_URL atau WHATSAPP_API_TOKEN tidak dikonfigurasi');
    }

    // Bersihkan nomor dari karakter non-numeric
    const cleanNomor = nomor.replace(/\D/g, '');

    // Build URL dengan query parameters (encode message)
    const encodedMessage = encodeURIComponent(message);
    const url = `${apiUrl}?target=${cleanNomor}&message=${encodedMessage}&token=${apiToken}`;

    // Kirim GET request
    const response = await fetch(url);

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.message || `HTTP error! status: ${response.status}`,
      };
    }

    return {
      success: true,
      message: data.message || 'Pesan WhatsApp berhasil dikirim',
    };
  } catch (error) {
    console.error('Error mengirim WhatsApp:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Mengirim notifikasi pengingat kontrol bayi
 */
export async function kirimNotifPengingatKontrol(
  nomor: string,
  namaBayi: string,
  tanggalKontrol: Date
): Promise<WhatsAppResponse> {
  const message = `Pengingat Kontrol Stunting\n\n` +
    `Bayi: ${namaBayi}\n` +
    `Waktu kontrol berikutnya: ${tanggalKontrol.toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })}\n\n` +
    `Mohon datang ke Puskesmas untuk pemeriksaan rutin. Terima kasih.`;

  return kirimNotifWhatsApp(nomor, message);
}

/**
 * Mengirim notifikasi hasil deteksi stunting
 */
export async function kirimNotifHasilDeteksi(
  nomor: string,
  namaBayi: string,
  statusGizi: string,
  rekomendasi: string
): Promise<WhatsAppResponse> {
  const message = `Hasil Deteksi Stunting\n\n` +
    `Bayi: ${namaBayi}\n` +
    `Status Gizi: ${statusGizi}\n\n` +
    `Rekomendasi:\n${rekomendasi}\n\n` +
    `Untuk informasi lebih lanjut, silakan hubungi Puskesmas terdekat.`;

  return kirimNotifWhatsApp(nomor, message);
}
