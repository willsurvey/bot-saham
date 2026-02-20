export function formatBidikanMessage(apiData) {
  const { date, total_saham, config, data } = apiData;
  
  // Format tanggal (YYYY-MM-DD → DD-MM-YYYY)
  const formattedDate = new Date(date).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });

  // Header pesan
  let message = `🎯 BIDIKAN SAHAM HARIAN
📅 ${formattedDate}
📊 Strategi: ${config.strategy}

━━━━━━━━━━━━━━━━━━━━
`;

  // Jika tidak ada saham yang lolos
  if (total_saham === 0 || !data || data.length === 0) {
    message += `
❌ Tidak ada saham yang lolos screening hari ini

`;
  } else {
    // Loop setiap saham
    data.forEach((saham, index) => {
      message += `
🔹 ${saham.Emiten}
━━━━━━━━━━━━━━━━━━━━
💰 Close: ${formatNumber(saham.Close)}
📥 Entry Area: ${formatInfo(saham.Entry_Zone)}
🛑 SL: ${formatNumber(saham.SL)}
🎯 TP: ${formatNumber(saham.TP)}
📈 RR: ${saham.RR}
✅ Status: ${saham.Status}
ℹ️ Info: ${formatInfo(saham.Info)}

`;
    });

    message += `━━━━━━━━━━━━━━━━━━━━
📊 Total Saham: ${total_saham}

`;
  }

  // Disclaimer wajib
  message += `⚠️ Bukan ajakan untuk membeli atau menjual`;

  return message;
}

export function formatErrorMessage() {
  return `⚠️ SERVER ERROR

Data screening tidak dapat diambil.
Admin sedang memperbaiki.

Silakan coba lagi nanti.

⚠️ Bukan ajakan untuk membeli atau menjual`;
}

// Helper: Format angka dengan separator ribuan
function formatNumber(num) {
  if (!num) return '-';
  return Number(num).toLocaleString('id-ID');
}

// Helper: Bersihkan info dari emoji duplikat
function formatInfo(info) {
  if (!info) return '-';
  // Hapus "Fundamental: SKIP (Technical Only)" agar lebih ringkas
  return info.replace('Fundamental: SKIP (Technical Only) ', '');
}