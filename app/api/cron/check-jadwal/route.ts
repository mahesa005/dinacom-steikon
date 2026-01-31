import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { kirimNotifJadwalPemeriksaan } from '@/lib/whatsapp';

/**
 * Cron job untuk mengecek dan mengirim notifikasi jadwal pemeriksaan
 * 
 * Endpoint ini akan:
 * 1. Cari semua jadwal yang rentangAwal sudah lewat/hari ini
 * 2. Filter yang status SCHEDULED dan notifikasi belum terkirim
 * 3. Kirim notifikasi WhatsApp ke orang tua
 * 4. Update flag notifikasiTerkirim
 * 
 * Cara setup cron:
 * - Menggunakan cron job service (cron-job.org, easycron.com, dll)
 * - Atau GitHub Actions
 * - Atau Vercel Cron Jobs
 * - Hit endpoint ini setiap hari jam 08:00 pagi
 * 
 * Format URL: https://your-domain.com/api/cron/check-jadwal?secret=YOUR_SECRET_KEY
 */
export async function GET(request: NextRequest) {
  try {
    // Simple authentication dengan secret key
    const { searchParams } = new URL(request.url);
    const secret = searchParams.get('secret');
    
    const cronSecret = process.env.CRON_SECRET_KEY;
    
    // Validasi secret key untuk keamanan
    if (!cronSecret || secret !== cronSecret) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set ke awal hari

    console.log('[CRON] Checking jadwal pemeriksaan at:', new Date().toISOString());

    // Query jadwal yang:
    // 1. rentangAwal <= hari ini (sudah masuk periode)
    // 2. status = SCHEDULED (belum selesai/terlewat)
    // 3. notifikasiTerkirim = false (belum dikirim notifikasi)
    const jadwalToNotify = await prisma.jadwalPemeriksaan.findMany({
      where: {
        rentangAwal: {
          lte: today,
        },
        status: 'SCHEDULED',
        notifikasiTerkirim: false,
      },
      include: {
        bayi: {
          select: {
            id: true,
            nama: true,
            namaIbu: true,
            nomorHpOrangTua: true,
          },
        },
      },
      orderBy: {
        rentangAwal: 'asc',
      },
    });

    console.log(`[CRON] Found ${jadwalToNotify.length} jadwal to notify`);

    const results = [];
    let successCount = 0;
    let failCount = 0;

    // Kirim notifikasi untuk setiap jadwal
    for (const jadwal of jadwalToNotify) {
      try {
        console.log(`[CRON] Sending notification for bayi: ${jadwal.bayi.nama}`);

        // Kirim notifikasi WhatsApp
        const whatsappResult = await kirimNotifJadwalPemeriksaan(
          jadwal.bayi.nomorHpOrangTua,
          jadwal.bayi.nama,
          jadwal.bayi.namaIbu,
          jadwal.targetUmurBulan,
          jadwal.rentangAwal,
          jadwal.rentangAkhir
        );

        if (whatsappResult.success) {
          // Update flag notifikasi terkirim
          await prisma.jadwalPemeriksaan.update({
            where: { id: jadwal.id },
            data: {
              notifikasiTerkirim: true,
              tanggalNotifikasi: new Date(),
            },
          });

          successCount++;
          results.push({
            jadwalId: jadwal.id,
            bayiNama: jadwal.bayi.nama,
            status: 'success',
            message: whatsappResult.message,
          });

          console.log(`[CRON] ✓ Notification sent for: ${jadwal.bayi.nama}`);
        } else {
          failCount++;
          results.push({
            jadwalId: jadwal.id,
            bayiNama: jadwal.bayi.nama,
            status: 'failed',
            error: whatsappResult.error,
          });

          console.error(`[CRON] ✗ Failed to send notification for: ${jadwal.bayi.nama}`, whatsappResult.error);
        }
      } catch (error) {
        failCount++;
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        
        results.push({
          jadwalId: jadwal.id,
          bayiNama: jadwal.bayi.nama,
          status: 'error',
          error: errorMessage,
        });

        console.error(`[CRON] ✗ Error processing jadwal for: ${jadwal.bayi.nama}`, error);
      }
    }

    console.log(`[CRON] Finished. Success: ${successCount}, Failed: ${failCount}`);

    return NextResponse.json({
      success: true,
      summary: {
        totalChecked: jadwalToNotify.length,
        successCount,
        failCount,
        timestamp: new Date().toISOString(),
      },
      results,
    });
  } catch (error) {
    console.error('[CRON] Fatal error:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
