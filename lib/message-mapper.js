export function formatBidikanMessage(apiData) {
  const { date, time, total_saham, config, summary, stocks } = apiData;
  
  // Format tanggal (YYYY-MM-DD → DD-MM-YYYY)
  const formattedDate = new Date(date).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });

  // Header pesan dengan summary
  let message = `🎯 BIDIKAN SAHAM HARIAN
📅 ${formattedDate} | ⏰ ${time || '19:12 WIB'}
📊 Strategi: ${config.strategy}

━━━━━━━━━━━━━━━━━━━━
📈 SUMMARY SCREENING
━━━━━━━━━━━━━━━━━━━━
✅ Total Saham: ${total_saham}
🟢 High Confidence: ${summary?.high_confidence || 0}
🟡 Moderate Confidence: ${summary?.moderate_confidence || 0}
🔴 Low Confidence: ${summary?.low_confidence || 0}
❌ Failed: ${summary?.failed || 0}

`;

  // Jika tidak ada saham yang lolos
  if (total_saham === 0 || !stocks || stocks.length === 0) {
    message += `❌ Tidak ada saham yang lolos screening hari ini

`;
  } else {
    // Loop setiap saham
    stocks.forEach((saham, index) => {
      const rank = saham.Rank || index + 1;
      const confidenceTier = getConfidenceEmoji(saham.ranking?.tier);
      const foreignTrend = getForeignTrendEmoji(saham.foreign_flow?.trend_1w);
      
      message += `━━━━━━━━━━━━━━━━━━━━
🏆 #${rank} ${saham.Emiten}
   ${saham.Company_Name || '-'}
━━━━━━━━━━━━━━━━━━━━

📊 CONFIDENCE & RANKING
├─ Tier: ${confidenceTier} ${saham.ranking?.tier || 'N/A'}
├─ Score: ${saham.ranking?.confidence_score || 0}/100
└─ Hit Rate: ${saham.ranking?.empirical_hit_rate ? saham.ranking.empirical_hit_rate + '%' : 'N/A'}

💰 HARGA & ENTRY
├─ Close: ${formatNumber(saham.Close)}
├─ Entry Area: ${saham.Entry_Zone || formatNumber(saham.Entry)}
├─ MA50: ${formatNumber(saham.MA50)}
└─ Vol Ratio: ${saham.Vol_Ratio || '-'}x

📥 ENTRY PLAN (Cicil 3 Kali)
├─ Entry 1: ${formatNumber(saham.Entry_Details?.Entry_1)} (${saham.Entry_Details?.Pct_1 || 20}%)
├─ Entry 2: ${formatNumber(saham.Entry_Details?.Entry_2)} (${saham.Entry_Details?.Pct_2 || 50}%)
└─ Entry 3: ${formatNumber(saham.Entry_Details?.Entry_3)} (${saham.Entry_Details?.Pct_3 || 30}%)

🎯 TAKE PROFIT (3 Level)
├─ TP 1: ${formatNumber(saham.TP_1)} (Jual 30%)
├─ TP 2: ${formatNumber(saham.TP_2)} (Jual 30%)
└─ TP 3: ${formatNumber(saham.TP_3)} (Jual 40%)

🛑 RISK MANAGEMENT
├─ Stop Loss: ${formatNumber(saham.SL)}
├─ Risk:Reward: ${saham.RR || '-'}
└─ RR Value: ${saham.RR_Value || '-'}

📌 BIAS & TREND
├─ Bias: ${getTrendEmoji(saham.SMC_Details?.Trend_Bias)} ${saham.SMC_Details?.Trend_Bias || 'N/A'}
└─ Description: ${saham.Bias_Description || '-'}

🌊 FOREIGN FLOW (1 Week)
├─ Trend: ${foreignTrend} ${saham.foreign_flow?.trend_1w || 'N/A'}
├─ 1 Day: ${saham.foreign_flow?.net_foreign_1d_formatted || '-'} (${saham.foreign_flow?.direction_1d || '-'})
└─ 1 Week: ${saham.foreign_flow?.net_foreign_1w_formatted || '-'} (${saham.foreign_flow?.direction_1w || '-'})

🔍 SMC ANALYSIS
├─ Order Blocks: ${saham.SMC_Details?.OB_Count || 0}
├─ FVG Zones: ${saham.SMC_Details?.FVG_Count || 0}
└─ Data Points: ${saham.data_points || 0}

ℹ️ INFO: ${formatInfo(saham.Info)}

`;
    });

    message += `━━━━━━━━━━━━━━━━━━━━
📊 Total Saham: ${total_saham}

`;
  }

  // ✅ DISCLAIMER BARU (Updated)
  message += `━━━━━━━━━━━━━━━━━━━━
⚠️ DISCLAIMER PENTING

📌 Ini adalah hasil screening OTOMATIS
🔍 Owner akan analisa ulang manual
📝 Entry area dapat berubah setelah review
⏳ Bisa menunggu konfirmasi final dari Owner

💡 Bukan ajakan untuk membeli atau menjual
💡 Do Your Own Research (DYOR)
💡 Gunakan money management yang baik`;

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
  return info.replace('Fundamental: SKIP (Technical Only) ', '');
}

// Helper: Emoji untuk confidence tier
function getConfidenceEmoji(tier) {
  if (!tier) return '⚪';
  switch (tier.toUpperCase()) {
    case 'HIGH': return '🟢';
    case 'MODERATE': return '🟡';
    case 'LOW': return '🔴';
    default: return '⚪';
  }
}

// Helper: Emoji untuk foreign flow trend
function getForeignTrendEmoji(trend) {
  if (!trend) return '⚪';
  switch (trend.toUpperCase()) {
    case 'ACCUMULATION': return '🟢';
    case 'DISTRIBUTION': return '🔴';
    case 'NEUTRAL': return '🟡';
    default: return '⚪';
  }
}

// Helper: Emoji untuk trend bias
function getTrendEmoji(bias) {
  if (!bias) return '⚪';
  switch (bias.toUpperCase()) {
    case 'BULLISH': return '📈';
    case 'BEARISH': return '📉';
    case 'NEUTRAL': return '➡️';
    default: return '⚪';
  }
}