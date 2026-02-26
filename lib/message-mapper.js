const MAX_STOCKS_PER_MESSAGE = 4;

export function formatBidikanMessages(apiData) {
  const { date, time, total_saham, config, summary, stocks } = apiData;
  
  const formattedDate = new Date(date).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });

  const messages = [];
  
  // Format header
  const header = `🎯 BIDIKAN SAHAM HARIAN
📅 ${formattedDate} | ⏰ ${time || '19:12 WIB'}
📊 Strategi: ${config.strategy}

━━━━━━━━━━━━━━━━━━━━
📈 SUMMARY SCREENING
━━━━━━━━━━━━━━━━━━━━
✅ Total: ${total_saham}
🟢 High: ${summary?.high_confidence || 0}
🟡 Moderate: ${summary?.moderate_confidence || 0}
🔴 Low: ${summary?.low_confidence || 0}

`;

  if (total_saham === 0 || !stocks || stocks.length === 0) {
    messages.push(header + `❌ Tidak ada saham yang lolos screening hari ini

━━━━━━━━━━━━━━━━━━━━
⚠️ DISCLAIMER PENTING

📌 Ini adalah hasil screening OTOMATIS
🔍 Owner akan analisa ulang manual
📝 Entry area dapat berubah setelah review
⏳ Bisa menunggu konfirmasi final dari Owner

💡 Bukan ajakan untuk membeli atau menjual
💡 Do Your Own Research (DYOR)
💡 Gunakan money management yang baik`);
    return messages;
  }

  // Split stocks into chunks (max 4 per message)
  const chunks = [];
  for (let i = 0; i < stocks.length; i += MAX_STOCKS_PER_MESSAGE) {
    chunks.push(stocks.slice(i, i + MAX_STOCKS_PER_MESSAGE));
  }

  // Create message for each chunk
  chunks.forEach((chunk, chunkIndex) => {
    let message = chunkIndex === 0 ? header : '';
    
    chunk.forEach((saham, index) => {
      const rank = saham.Rank || (chunkIndex * MAX_STOCKS_PER_MESSAGE + index + 1);
      const tierEmoji = getConfidenceEmoji(saham.ranking?.tier);
      const trendEmoji = getTrendEmoji(saham.SMC_Details?.Trend_Bias);
      
      message += `━━━━━━━━━━━━━━━━━━━━
🏆 #${rank} ${saham.Emiten}
   ${saham.Company_Name || '-'}
━━━━━━━━━━━━━━━━━━━━

📊 CONFIDENCE
├─ Tier: ${tierEmoji} ${saham.ranking?.tier || 'N/A'}
├─ Score: ${saham.ranking?.confidence_score || 0}/100
└─ RR: 1:${saham.RR_Value || '-'}

💰 ENTRY AREA
├─ Close: ${formatNumber(saham.Close)}
├─ Zone: ${saham.Entry_Zone || formatNumber(saham.Entry)}
├─ E1: ${formatNumber(saham.Entry_Details?.Entry_1)} (${saham.Entry_Details?.Pct_1 || 20}%)
├─ E2: ${formatNumber(saham.Entry_Details?.Entry_2)} (${saham.Entry_Details?.Pct_2 || 50}%)
└─ E3: ${formatNumber(saham.Entry_Details?.Entry_3)} (${saham.Entry_Details?.Pct_3 || 30}%)

🎯 TAKE PROFIT
├─ TP1: ${formatNumber(saham.TP_1)} (30%)
├─ TP2: ${formatNumber(saham.TP_2)} (30%)
└─ TP3: ${formatNumber(saham.TP_3)} (40%)

🛑 RISK
├─ SL: ${formatNumber(saham.SL)}
└─ RR Ratio: ${saham.RR || '-'}

📌 BIAS & TREND
├─ ${trendEmoji} ${saham.SMC_Details?.Trend_Bias || 'N/A'}
└─ ${saham.Bias_Description || '-'}

🌊 FOREIGN FLOW
├─ 1D: ${saham.foreign_flow?.net_foreign_1d_formatted || '-'} (${saham.foreign_flow?.direction_1d || '-'})
└─ 1W: ${saham.foreign_flow?.net_foreign_1w_formatted || '-'} (${saham.foreign_flow?.direction_1w || '-'})

🔍 SMC
├─ OB: ${saham.SMC_Details?.OB_Count || 0}
└─ FVG: ${saham.SMC_Details?.FVG_Count || 0}

ℹ️ ${formatInfo(saham.Info)}

`;
    });

    // Add disclaimer to last message
    if (chunkIndex === chunks.length - 1) {
      message += `━━━━━━━━━━━━━━━━━━━━
⚠️ DISCLAIMER PENTING

📌 Ini adalah hasil screening OTOMATIS
🔍 Owner akan analisa ulang manual
📝 Entry area dapat berubah setelah review
⏳ Bisa menunggu konfirmasi final dari Owner

💡 Bukan ajakan untuk membeli atau menjual
💡 Do Your Own Research (DYOR)
💡 Gunakan money management yang baik`;
    } else {
      message += `⏳ Lanjut ke pesan berikutnya... ⬇️`;
    }

    messages.push(message);
  });

  return messages;
}

export function formatErrorMessage() {
  return `⚠️ SERVER ERROR

Data screening tidak dapat diambil.
Admin sedang memperbaiki.

Silakan coba lagi nanti.

⚠️ Bukan ajakan untuk membeli atau menjual`;
}

function formatNumber(num) {
  if (!num) return '-';
  return Number(num).toLocaleString('id-ID');
}

function formatInfo(info) {
  if (!info) return '-';
  return info.replace('Fundamental: SKIP (Technical Only) ', '');
}

function getConfidenceEmoji(tier) {
  if (!tier) return '⚪';
  switch (tier.toUpperCase()) {
    case 'HIGH': return '🟢';
    case 'MODERATE': return '🟡';
    case 'LOW': return '🔴';
    default: return '⚪';
  }
}

function getTrendEmoji(bias) {
  if (!bias) return '⚪';
  switch (bias.toUpperCase()) {
    case 'BULLISH': return '📈';
    case 'BEARISH': return '📉';
    case 'NEUTRAL': return '➡️';
    default: return '⚪';
  }
}