/* ============================================================
   CyberSchedule_Matrix v1.1 — PDF Export Engine
   A4 Portrait, 7 binder-style pages (Mon-Sun)
   ============================================================ */

const ExportEngine = {

  async exportToPDF(config = {}) {
    const { from, to, theme = 'cyber_neon', interactive = true } = config;

    let startDate, endDate;
    if (from && to) {
      startDate = from; endDate = to;
    } else if (interactive) {
      const week = getWeekRange(App.getState().currentDate);
      startDate = prompt('起始日期 (YYYY-MM-DD):', week.start);
      if (!startDate) return;
      endDate = prompt('结束日期 (YYYY-MM-DD):', week.end);
      if (!endDate) return;
    } else {
      const week = getWeekRange(App.getState().currentDate);
      startDate = week.start; endDate = week.end;
    }

    const items = await Storage.getByRange(startDate, endDate);
    const dayNames = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
    const dayNamesZh = ['周日','周一','周二','周三','周四','周五','周六'];

    const isGrayscale = theme === 'print_grayscale';
    const bg = isGrayscale ? '#FFFFFF' : '#E2F0D9';
    const textColor = isGrayscale ? '#000000' : '#2A3B2E';
    const accentColor = isGrayscale ? '#333333' : '#00FF66';
    const borderColor = isGrayscale ? '#999999' : '#2A3B2E';

    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm' });
    const pw = 210, ph = 297;
    const rr = parseInt(bg.slice(1,3),16), gg = parseInt(bg.slice(3,5),16), bb = parseInt(bg.slice(5,7),16);
    let firstPage = true;

    const d = new Date(startDate + 'T00:00:00');
    const endD = new Date(endDate + 'T00:00:00');
    while (d <= endD) {
      const dateStr = fmtLocalDate(d);
      const dayItems = items.filter(it => it.date === dateStr);
      const dow = d.getDay();

      const container = document.createElement('div');
      container.style.cssText = `position:fixed;left:-9999px;top:0;width:794px;font-family:'Courier New',monospace;background:${bg};color:${textColor};`;
      container.appendChild(buildBinderPage({
        dayName: `${dayNames[dow]} / ${dayNamesZh[dow]}`,
        dateStr, dayItems, isGrayscale, bg, textColor, accentColor, borderColor
      }));
      document.body.appendChild(container);

      try {
        const canvas = await html2canvas(container, { scale: 2, backgroundColor: bg, logging: false, windowWidth: 794 });
        if (!firstPage) pdf.addPage();
        firstPage = false;

        pdf.setFillColor(rr, gg, bb); pdf.rect(0, 0, pw, ph, 'F');
        const margin = 12;
        const availW = pw - margin * 2, availH = ph - margin * 2;
        const scale = Math.min(availW / canvas.width, availH / canvas.height);
        const w = canvas.width * scale, h = canvas.height * scale;
        const x = (pw - w) / 2, y = (ph - h) / 2;

        if (h <= availH) {
          pdf.addImage(canvas.toDataURL('image/png'), 'PNG', x, y, w, h);
        } else {
          const sliceH = availH / scale; let sy = 0;
          while (sy < canvas.height) {
            if (sy > 0) { pdf.addPage(); pdf.setFillColor(rr, gg, bb); pdf.rect(0, 0, pw, ph, 'F'); }
            const sc = document.createElement('canvas'); sc.width = canvas.width; sc.height = Math.min(sliceH, canvas.height - sy);
            const sctx = sc.getContext('2d'); sctx.drawImage(canvas, 0, sy, canvas.width, sc.height, 0, 0, canvas.width, sc.height);
            pdf.addImage(sc.toDataURL('image/png'), 'PNG', x, margin, w, sc.height * scale);
            sy += sliceH;
          }
        }
      } finally { document.body.removeChild(container); }
      d.setDate(d.getDate() + 1);
    }
    pdf.save(`Shaoyis_Matrix_${startDate}_${endDate}.pdf`);
  },

  // --- Summary export: titles only, no time ranges ---
  async exportSummaryPDF(config = {}) {
    const { from, to, theme = 'cyber_neon', interactive = true } = config;

    // Resolve date range: from config, or prompt user
    let startDate, endDate;
    if (from && to) {
      startDate = from;
      endDate = to;
    } else if (interactive) {
      const week = getWeekRange(App.getState().currentDate);
      startDate = prompt('起始日期 (YYYY-MM-DD):', week.start);
      if (!startDate) return;
      endDate = prompt('结束日期 (YYYY-MM-DD):', week.end);
      if (!endDate) return;
    } else {
      const week = getWeekRange(App.getState().currentDate);
      startDate = week.start;
      endDate = week.end;
    }

    const isGrayscale = theme === 'print_grayscale';
    const bg = isGrayscale ? '#FFFFFF' : '#E2F0D9';
    const textColor = isGrayscale ? '#000000' : '#2A3B2E';
    const accentColor = isGrayscale ? '#333333' : '#2A5A3A';
    const borderColor = isGrayscale ? '#999999' : '#2A3B2E';

    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const dayNamesZh = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];

    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm' });
    const pageWidth = 210;
    const pageHeight = 297;
    let firstPage = true;

    const d = new Date(startDate + 'T00:00:00');
    const end = new Date(endDate + 'T00:00:00');

    while (d <= end) {
      const dateStr = fmtLocalDate(d);
      const items = await Storage.getByRange(dateStr, dateStr);
      const dayItems = items.filter(it => it.date === dateStr);
      const dow = d.getDay();

      const dayName = `${dayNames[dow]} / ${dayNamesZh[dow]}`;

      // Build single-day page
      const container = document.createElement('div');
      container.style.cssText = `
        position: fixed; left: -9999px; top: 0;
        width: 560px; font-family: 'Courier New', monospace;
        background: ${bg}; color: ${textColor};
      `;
      const page = buildSummaryPage({ dayName, dateStr, dayItems, isGrayscale, bg, textColor, accentColor, borderColor });
      container.appendChild(page);
      document.body.appendChild(container);

      try {
        const canvas = await html2canvas(container, {
          scale: 2, backgroundColor: bg, logging: false, windowWidth: 794
        });
        const imgData = canvas.toDataURL('image/png');

        if (!firstPage) pdf.addPage();
        firstPage = false;

        // Full-page background
        const rr = parseInt(bg.slice(1,3), 16);
        const gg = parseInt(bg.slice(3,5), 16);
        const bb = parseInt(bg.slice(5,7), 16);
        pdf.setFillColor(rr, gg, bb);
        pdf.rect(0, 0, pageWidth, pageHeight, 'F');

        // Scale to fit with margin, centered
        const margin = 12;
        const availW = pageWidth - margin * 2;
        const availH = pageHeight - margin * 2;
        const scale = Math.min(availW / canvas.width, availH / canvas.height);
        const w = canvas.width * scale;
        const h = canvas.height * scale;
        const x = (pageWidth - w) / 2;
        const y = (pageHeight - h) / 2;

        if (h <= availH) {
          pdf.addImage(imgData, 'PNG', x, y, w, h);
        } else {
          const sliceH = availH / scale;
          let sy = 0;
          while (sy < canvas.height) {
            if (sy > 0) { pdf.addPage(); pdf.setFillColor(rr, gg, bb); pdf.rect(0, 0, pageWidth, pageHeight, 'F'); }
            const sc = document.createElement('canvas');
            sc.width = canvas.width;
            sc.height = Math.min(sliceH, canvas.height - sy);
            const sctx = sc.getContext('2d');
            sctx.drawImage(canvas, 0, sy, canvas.width, sc.height, 0, 0, canvas.width, sc.height);
            pdf.addImage(sc.toDataURL('image/png'), 'PNG', x, margin, w, sc.height * scale);
            sy += sliceH;
          }
        }
      } finally {
        document.body.removeChild(container);
      }

      d.setDate(d.getDate() + 1);
    }

    pdf.save(`Shaoyis_Summary_${startDate}_${endDate}.pdf`);
  },

  // --- Table export: all days in one continuous table ---
  async exportTablePDF(config = {}) {
    const { from, to, theme = 'cyber_neon', interactive = true } = config;

    let startDate, endDate;
    if (from && to) {
      startDate = from; endDate = to;
    } else if (interactive) {
      const week = getWeekRange(App.getState().currentDate);
      startDate = prompt('起始日期 (YYYY-MM-DD):', week.start);
      if (!startDate) return;
      endDate = prompt('结束日期 (YYYY-MM-DD):', week.end);
      if (!endDate) return;
    } else {
      const week = getWeekRange(App.getState().currentDate);
      startDate = week.start; endDate = week.end;
    }

    const isGrayscale = theme === 'print_grayscale';
    const bg = isGrayscale ? '#FFFFFF' : '#E2F0D9';
    const textColor = isGrayscale ? '#000000' : '#2A3B2E';
    const accentColor = isGrayscale ? '#333333' : '#2A5A3A';
    const borderColor = isGrayscale ? '#999999' : '#2A3B2E';

    // Collect all days' data
    const dayNames = ['周日','周一','周二','周三','周四','周五','周六'];
    const days = [];
    const d = new Date(startDate + 'T00:00:00');
    const end = new Date(endDate + 'T00:00:00');
    while (d <= end) {
      const ds = fmtLocalDate(d);
      const items = await Storage.getByRange(ds, ds);
      days.push({ dateStr: ds, dayName: dayNames[d.getDay()], items: items.filter(it => it.date === ds) });
      d.setDate(d.getDate() + 1);
    }

    // Build table HTML
    const container = document.createElement('div');
    container.id = 'export-target';
    container.style.cssText = `position:fixed;left:-9999px;top:0;width:760px;font-family:'Courier New',monospace;background:${bg};color:${textColor};padding:16px;`;

    container.innerHTML = `
      <div style="text-align:center;margin-bottom:14px;">
        <div style="font-size:17px;font-weight:bold;color:${accentColor};">SHAOYI'S MATRIX · 日程摘要表</div>
        <div style="font-size:12px;color:${textColor};margin-top:4px;">${startDate} ~ ${endDate}</div>
      </div>
    `;

    const table = document.createElement('div');
    days.forEach(day => {
      const row = document.createElement('div');
      row.style.cssText = `display:flex;border-bottom:1px solid ${borderColor};padding:6px 0;`;

      // Date column
      const dateCol = document.createElement('div');
      dateCol.style.cssText = `width:72px;flex-shrink:0;text-align:center;padding:4px;font-size:12px;font-weight:bold;color:${accentColor};`;
      dateCol.innerHTML = `${day.dateStr.slice(5)}<br>${day.dayName}`;
      row.appendChild(dateCol);

      // Tasks column
      const taskCol = document.createElement('div');
      taskCol.style.cssText = 'flex:1;padding:4px;font-size:12px;line-height:1.6;';

      const isVac = day.dateStr >= '2026-07-09' && day.dateStr <= '2026-07-14';
      const isSun = new Date(day.dateStr + 'T00:00:00').getDay() === 0;

      if (isVac) {
        taskCol.innerHTML = '<span style="color:#CC8800;">🏖️ 云南旅行中，请勿打扰</span>';
      } else if (isSun) {
        taskCol.innerHTML = '<span style="color:#6699FF;">😴 周末休息，请勿打扰</span>';
      } else if (day.items.length === 0) {
        taskCol.textContent = '—';
      } else {
        // Filter + merge (same as summary)
        const studyItems = day.items.filter(item => {
          if (item.tag === 'REST') return false;
          const t = item.title || '';
          return !t.includes('饭');
        });
        const merged = [];
        for (let i = 0; i < studyItems.length; i++) {
          let t = studyItems[i].title;
          t = t.replace(/\s*[（(]上[）)]\s*/, '').replace(/\s*[（(]下[）)]\s*/, '');
          if (merged.length > 0 && merged[merged.length - 1] === t) continue;
          merged.push(t);
        }
        taskCol.textContent = merged.join('  |  ');
      }
      row.appendChild(dateCol);
      row.appendChild(taskCol);
      table.appendChild(row);
    });
    container.appendChild(table);

    // Footer
    const footer = document.createElement('div');
    footer.style.cssText = `text-align:center;margin-top:16px;padding-top:10px;border-top:1px solid ${borderColor};font-size:11px;color:${isGrayscale ? '#666' : '#4A6B4E'};`;
    footer.textContent = '© 郑绍奕 (ShaoYi Zheng) 版权所有  |  CyberSchedule_Matrix v1.1';
    container.appendChild(footer);

    document.body.appendChild(container);

    try {
      const canvas = await html2canvas(container, { scale: 2, backgroundColor: bg, logging: false, windowWidth: 794 });
      const { jsPDF } = window.jspdf;
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm' });
      const pw = 210, ph = 297;
      const rr = parseInt(bg.slice(1,3), 16), gg = parseInt(bg.slice(3,5), 16), bb = parseInt(bg.slice(5,7), 16);

      const margin = 12;
      const availW = pw - margin * 2;
      const availH = ph - margin * 2;
      const imgW = availW;
      const imgH = (canvas.height * imgW) / canvas.width;
      if (imgH <= availH) {
        pdf.setFillColor(rr, gg, bb); pdf.rect(0, 0, pw, ph, 'F');
        pdf.addImage(imgData, 'PNG', margin, margin, imgW, imgH);
      } else {
        let sy = 0;
        const sliceH = (availH / imgW) * canvas.width;
        while (sy < canvas.height) {
          if (sy > 0) pdf.addPage();
          pdf.setFillColor(rr, gg, bb); pdf.rect(0, 0, pw, ph, 'F');
          const sc = document.createElement('canvas');
          sc.width = canvas.width;
          sc.height = Math.min(sliceH, canvas.height - sy);
          const sctx = sc.getContext('2d');
          sctx.drawImage(canvas, 0, sy, canvas.width, sc.height, 0, 0, canvas.width, sc.height);
          pdf.addImage(sc.toDataURL('image/png'), 'PNG', margin, margin, imgW, (sc.height * imgW) / canvas.width);
          sy += sliceH;
        }
      }
      pdf.save(`Shaoyis_Table_${startDate}_${endDate}.pdf`);
    } finally {
      document.body.removeChild(container);
    }
  }
};

// --- Build a single binder page (full detail) ---
function buildBinderPage(opts) {
  const { dayName, dateStr, dayItems, isGrayscale, bg, textColor, accentColor, borderColor } = opts;

  const page = document.createElement('div');
  page.style.cssText = `
    width: 754px; margin: 20px; padding: 24px;
    background: ${bg};
    border: 3px solid ${borderColor};
    box-shadow: ${isGrayscale ? 'none' : '3px 3px 0 #000'};
  `;

  // --- Header row: mascot + title ---
  const headerRow = document.createElement('div');
  headerRow.style.cssText = 'display:flex; align-items:center; margin-bottom:16px; padding-bottom:12px; border-bottom:3px solid ' + borderColor + ';';

  // Mini pixel cat SVG
  const catDiv = document.createElement('div');
  catDiv.style.cssText = 'width:48px; height:40px; margin-right:12px;';
  catDiv.innerHTML = `
    <svg viewBox="0 0 14 12" width="48" height="40" shape-rendering="crispEdges">
      <rect x="2" y="0" width="2" height="2" fill="#5D4037"/>
      <rect x="10" y="0" width="2" height="2" fill="#5D4037"/>
      <rect x="1" y="2" width="12" height="1" fill="#5D4037"/>
      <rect x="1" y="4" width="12" height="3" fill="#FFE0B2"/>
      <rect x="3" y="5" width="2" height="2" fill="#42A5F5"/>
      <rect x="9" y="5" width="2" height="2" fill="#42A5F5"/>
      <rect x="6" y="7" width="2" height="1" fill="#FF007F"/>
      <rect x="4" y="9" width="6" height="2" fill="#FFE0B2"/>
      <rect x="0" y="6" width="2" height="1" fill="#795548"/>
      <rect x="12" y="6" width="2" height="1" fill="#795548"/>
      <rect x="3" y="11" width="8" height="1" fill="#FFE0B2"/>
    </svg>`;

  headerRow.appendChild(catDiv);

  const titleDiv = document.createElement('div');
  titleDiv.innerHTML = `
    <div style="font-size:16px; font-weight:bold; color:${accentColor}; ${isGrayscale ? '' : 'text-shadow: 0 0 6px ' + accentColor + ';'}">
      SHAOYI'S MATRIX
    </div>
    <div style="font-size:12px; color:${textColor}; margin-top:2px;">
      ${dayName} — ${dateStr}
    </div>`;
  headerRow.appendChild(titleDiv);

  page.appendChild(headerRow);

  // --- Binder rings decoration ---
  const ringsDiv = document.createElement('div');
  ringsDiv.style.cssText = `text-align:center; margin-bottom:10px; color:${isGrayscale ? '#999' : '#7F8C8D'}; font-size:14px; letter-spacing:20px;`;
  ringsDiv.textContent = '◌ ◌ ◌ ◌ ◌';
  page.appendChild(ringsDiv);

  // --- Three-column table ---
  const table = document.createElement('div');
  table.style.cssText = 'border: 2px solid ' + borderColor + ';';

  // Table header
  const th = document.createElement('div');
  th.style.cssText = `
    display:grid; grid-template-columns:110px 1fr 60px;
    background:${isGrayscale ? '#eee' : '#1A221C'};
    border-bottom:2px solid ${borderColor};
    font-size:11px; font-weight:bold; color:${accentColor};
  `;
  th.innerHTML = `
    <div style="padding:8px 6px; border-right:2px solid ${borderColor};">Time</div>
    <div style="padding:8px 6px; border-right:2px solid ${borderColor};">Mission</div>
    <div style="padding:8px 6px; text-align:center;">OK?</div>
  `;
  table.appendChild(th);

  // Table rows
  if (dayItems.length === 0) {
    const emptyRow = document.createElement('div');
    emptyRow.style.cssText = `padding:20px; text-align:center; font-size:12px; color:${isGrayscale ? '#999' : '#6B7D6E'};`;
    emptyRow.textContent = '-- NO MISSIONS --';
    table.appendChild(emptyRow);
  } else {
    // Sort by period order then by time_range
    const PERIOD_ORDER = { MORNING: 0, NOON: 1, AFTERNOON: 2, NIGHT: 3 };
    dayItems.sort((a, b) => {
      const p = (PERIOD_ORDER[a.period] || 0) - (PERIOD_ORDER[b.period] || 0);
      if (p !== 0) return p;
      return (a.time_range || '').localeCompare(b.time_range || '');
    });

    dayItems.forEach(item => {
      const row = document.createElement('div');
      row.style.cssText = `
        display:grid; grid-template-columns:110px 1fr 60px;
        border-bottom:1px solid ${isGrayscale ? '#ddd' : '#C0D0C0'};
        font-size:12px;
        ${item.completed ? 'opacity:0.5;' : ''}
      `;

      const timeCell = document.createElement('div');
      timeCell.style.cssText = `padding:6px; border-right:1px solid ${isGrayscale ? '#ddd' : '#C0D0C0'};`;
      timeCell.textContent = item.time_range || '--:--';

      const missionCell = document.createElement('div');
      missionCell.style.cssText = `padding:6px; border-right:1px solid ${isGrayscale ? '#ddd' : '#C0D0C0'}; ${item.completed ? 'text-decoration:line-through;' : ''}`;
      missionCell.textContent = item.title;

      const statusCell = document.createElement('div');
      statusCell.style.cssText = 'padding:6px; text-align:center;';
      statusCell.textContent = item.completed ? '✓' : '☐';
      statusCell.style.color = item.completed ? accentColor : (isGrayscale ? '#999' : '#6B7D6E');

      row.appendChild(timeCell);
      row.appendChild(missionCell);
      row.appendChild(statusCell);
      table.appendChild(row);
    });
  }

  page.appendChild(table);

  // --- Footer ---
  const footer = document.createElement('div');
  footer.style.cssText = `text-align:center; margin-top:12px; font-size:9px; color:${isGrayscale ? '#999' : '#6B7D6E'};`;
  footer.textContent = '© 郑绍奕 (ShaoYi Zheng) 版权所有  |  CyberSchedule_Matrix v1.1';
  page.appendChild(footer);

  return page;
}

// --- Build a single summary page (titles only, no time ranges) ---
function buildSummaryPage(opts) {
  const { dayName, dateStr, dayItems, isGrayscale, bg, textColor, accentColor, borderColor } = opts;

  // Sort by period then time_range
  const PERIOD_ORDER = { MORNING: 0, NOON: 1, AFTERNOON: 2, NIGHT: 3 };
  const sorted = [...dayItems].sort((a, b) => {
    const p = (PERIOD_ORDER[a.period] || 0) - (PERIOD_ORDER[b.period] || 0);
    if (p !== 0) return p;
    return (a.time_range || '').localeCompare(b.time_range || '');
  });

  const page = document.createElement('div');
  page.style.cssText = `
    width: 520px; margin: 12px; padding: 16px;
    background: ${bg};
    border: 3px solid ${borderColor};
    box-shadow: ${isGrayscale ? 'none' : '3px 3px 0 #000'};
  `;

  // --- Header row ---
  const headerRow = document.createElement('div');
  headerRow.style.cssText = 'display:flex; align-items:center; margin-bottom:16px; padding-bottom:12px; border-bottom:3px solid ' + borderColor + ';';

  const catDiv = document.createElement('div');
  catDiv.style.cssText = 'width:48px; height:40px; margin-right:12px;';
  catDiv.innerHTML = `
    <svg viewBox="0 0 14 12" width="48" height="40" shape-rendering="crispEdges">
      <rect x="2" y="0" width="2" height="2" fill="#5D4037"/>
      <rect x="10" y="0" width="2" height="2" fill="#5D4037"/>
      <rect x="1" y="2" width="12" height="1" fill="#5D4037"/>
      <rect x="1" y="4" width="12" height="3" fill="#FFE0B2"/>
      <rect x="3" y="5" width="2" height="2" fill="#42A5F5"/>
      <rect x="9" y="5" width="2" height="2" fill="#42A5F5"/>
      <rect x="6" y="7" width="2" height="1" fill="#FF007F"/>
      <rect x="4" y="9" width="6" height="2" fill="#FFE0B2"/>
      <rect x="0" y="6" width="2" height="1" fill="#795548"/>
      <rect x="12" y="6" width="2" height="1" fill="#795548"/>
      <rect x="3" y="11" width="8" height="1" fill="#FFE0B2"/>
    </svg>`;

  headerRow.appendChild(catDiv);

  const titleDiv = document.createElement('div');
  titleDiv.innerHTML = `
    <div style="font-size:14px; font-weight:bold; color:${accentColor}; ${isGrayscale ? '' : 'text-shadow: 0 0 6px ' + accentColor + ';'}">
      SHAOYI'S MATRIX · 摘要
    </div>
    <div style="font-size:10px; color:${textColor}; margin-top:2px;">
      ${dayName} — ${dateStr}
    </div>`;
  headerRow.appendChild(titleDiv);
  page.appendChild(headerRow);

  // --- Binder rings ---
  const ringsDiv = document.createElement('div');
  ringsDiv.style.cssText = `text-align:center; margin-bottom:14px; color:${isGrayscale ? '#999' : '#7F8C8D'}; font-size:14px; letter-spacing:20px;`;
  ringsDiv.textContent = '◌ ◌ ◌ ◌ ◌';
  page.appendChild(ringsDiv);

  // --- Flat item list: study-only, math merged ---
  const isVacation = dateStr >= '2026-07-09' && dateStr <= '2026-07-14';
  const isWeekend = new Date(dateStr + 'T00:00:00').getDay() === 0;

  if (isVacation) {
    const vacDiv = document.createElement('div');
    vacDiv.style.cssText = `padding:40px 20px; text-align:center; font-size:13px; color:${accentColor}; font-weight:bold;`;
    vacDiv.textContent = '🏖️ 云南旅行中，请勿打扰';
    page.appendChild(vacDiv);
  } else if (isWeekend) {
    const weDiv = document.createElement('div');
    weDiv.style.cssText = `padding:40px 20px; text-align:center; font-size:13px; color:#6699FF; font-weight:bold;`;
    weDiv.textContent = '😴 周末休息，请勿打扰';
    page.appendChild(weDiv);
  } else {
    // Filter out non-study items (REST tag, meals)
    const studyItems = sorted.filter(item => {
      if (item.tag === 'REST') return false;
      const t = item.title || '';
      if (t.includes('饭') || t.includes('旅行') || t.includes('美食') || t.includes('游玩') || t.includes('休息')) return false;
      return true;
    });

    // Merge math (上)/(下) into single entries
    const merged = [];
    for (let i = 0; i < studyItems.length; i++) {
      const item = studyItems[i];
      let title = item.title;
      title = title.replace(/\s*[（(]上[）)]\s*/, '').replace(/\s*[（(]下[）)]\s*/, '');
      if (merged.length > 0 && merged[merged.length - 1].title === title) {
        continue;
      }
      merged.push({ title, completed: item.completed });
    }

    if (merged.length === 0) {
      const emptyDiv = document.createElement('div');
      emptyDiv.style.cssText = `padding:30px; text-align:center; font-size:11px; color:${isGrayscale ? '#999' : '#6B7D6E'};`;
      emptyDiv.textContent = '-- NO MISSIONS --';
      page.appendChild(emptyDiv);
    } else {
    merged.forEach(({ title, completed }) => {
      const row = document.createElement('div');
      row.style.cssText = `
        display:flex; align-items:center; gap:12px;
        padding:7px 14px;
        font-size:12px;
        border-bottom:1px solid ${isGrayscale ? '#eee' : 'rgba(192,208,192,0.4)'};
        ${completed ? 'opacity:0.5;' : ''}
      `;

      const check = document.createElement('span');
      check.style.cssText = `
        font-size:13px; font-weight:bold;
        color:${completed ? accentColor : (isGrayscale ? '#999' : '#6B7D6E')};
        min-width:20px; text-align:center;
      `;
      check.textContent = completed ? '✓' : '☐';

      const titleSpan = document.createElement('span');
      titleSpan.style.cssText = completed ? 'text-decoration:line-through;' : '';
      titleSpan.textContent = title;

      row.appendChild(check);
      row.appendChild(titleSpan);
      page.appendChild(row);
    });
  }
  }

  // --- Footer ---
  const footer = document.createElement('div');
  footer.style.cssText = `text-align:center;margin-top:16px;padding-top:10px;border-top:1px solid ${borderColor};font-size:11px;color:${isGrayscale ? '#666' : '#4A6B4E'};`;
  footer.textContent = '© 郑绍奕 (ShaoYi Zheng) 版权所有  |  CyberSchedule_Matrix v1.1';
  page.appendChild(footer);

  return page;
}

// ============================================================
// Helpers
// ============================================================

function fmtLocalDate(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function getWeekRange(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  const day = d.getDay();
  const diffToMon = day === 0 ? -6 : 1 - day;
  const mon = new Date(d);
  mon.setDate(d.getDate() + diffToMon);
  const sun = new Date(mon);
  sun.setDate(mon.getDate() + 6);
  return {
    start: fmtLocalDate(mon),
    end: fmtLocalDate(sun)
  };
}
