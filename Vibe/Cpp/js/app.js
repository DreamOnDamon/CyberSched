/* ============================================================
   CyberSchedule_Matrix v1.1 — Main Application
   Digital Binder + Three-Column Table + Inline Editing
   ============================================================ */

const App = (() => {
  // --- Constants ---
  const PERIODS = ['MORNING', 'NOON', 'AFTERNOON', 'NIGHT'];
  const PERIOD_LABELS = {
    MORNING:    { en: 'AM CYCLE',    zh: '上午' },
    NOON:       { en: 'NOON PHASE',  zh: '中午' },
    AFTERNOON:  { en: 'PM CYCLE',    zh: '下午' },
    NIGHT:      { en: 'NIGHT CYCLE', zh: '晚上' }
  };

  // --- Study Template ---
  // 8:00起床  12:30午饭  19:00晚饭
  const STUDY_TEMPLATE = [
    { period: 'MORNING',   time_range: '08:30-09:30', title: '📖 语文',         tag: 'STUDY' },
    { period: 'MORNING',   time_range: '09:40-10:40', title: '📐 数学 (上)',    tag: 'STUDY' },
    { period: 'MORNING',   time_range: '10:50-11:50', title: '📐 数学 (下)',    tag: 'STUDY' },
    { period: 'NOON',      time_range: '12:30-13:00', title: '🍚 午饭',         tag: 'REST' },
    { period: 'NOON',      time_range: '13:10-13:50', title: '📝 英语',         tag: 'STUDY' },
    { period: 'AFTERNOON', time_range: '14:30-16:00', title: '🔬 物理',         tag: 'STUDY' },
    { period: 'AFTERNOON', time_range: '16:10-16:40', title: '⚗️ 化学',         tag: 'STUDY' },
    { period: 'AFTERNOON', time_range: '16:50-17:20', title: '📚 历史',         tag: 'STUDY' },
    { period: 'NIGHT',     time_range: '19:30-20:00', title: '⚖️ 道德与法治',  tag: 'STUDY' }
  ];

  // --- Vacation Template ---
  const VACATION_TEMPLATE = [
    { period: 'MORNING',   time_range: '', title: '🏖️ 旅行中',   tag: 'REST' },
    { period: 'NOON',      time_range: '', title: '🍜 当地美食', tag: 'REST' },
    { period: 'AFTERNOON', time_range: '', title: '📸 景点游玩', tag: 'REST' },
    { period: 'NIGHT',     time_range: '', title: '😴 休息',     tag: 'REST' }
  ];

  const WEEKEND_TEMPLATE = [
    { period: 'MORNING',   time_range: '', title: '😴 周末休息', tag: 'REST' },
    { period: 'NOON',      time_range: '', title: '🍜 享受美食', tag: 'REST' },
    { period: 'AFTERNOON', time_range: '', title: '🎮 自由活动', tag: 'REST' },
    { period: 'NIGHT',     time_range: '', title: '🌙 早睡早起', tag: 'REST' }
  ];

  // --- Homework schedule helpers ---
  // Returns overrides for { chineseTitle, englishTitle, physicsTitle, chemistryTitle, historyTitle, moralityTitle }

  const CHINESE_POEMS = [
    '📖 语文 行路难(其一)', '📖 语文 酬乐天扬州初逢席上见赠',
    '📖 语文 水调歌头', '📖 语文 月夜忆舍弟',
    '📖 语文 长沙过贾谊宅', '📖 语文 左迁至蓝关示侄孙湘',
    '📖 语文 商山早行', '📖 语文 咸阳城东楼',
    '📖 语文 无题', '📖 语文 行香子',
    '📖 语文 丑奴儿'
  ];

  function isVacationDate(dateStr) {
    return dateStr >= '2026-07-09' && dateStr <= '2026-07-14';
  }

  function getStudyDayIndex(dateStr) {
    // 0-based study-day index since July 6, skipping Sundays and vacation
    const start = new Date('2026-07-06T00:00:00');
    const d = new Date(dateStr + 'T00:00:00');
    let idx = -1;
    const cur = new Date(start);
    while (cur <= d) {
      const s = fmtLocalDate(cur);
      const dow = cur.getDay();
      if (dow !== 0 && !isVacationDate(s)) idx++;
      if (s === dateStr) return idx;
      cur.setDate(cur.getDate() + 1);
    }
    return idx;
  }

  function getChineseStudyCount(dateStr) {
    // Non-Saturday study days for Chinese task progression
    const start = new Date('2026-07-06T00:00:00');
    const d = new Date(dateStr + 'T00:00:00');
    let count = -1;
    const cur = new Date(start);
    while (cur <= d) {
      const s = fmtLocalDate(cur);
      const dow = cur.getDay();
      if (dow !== 0 && dow !== 6 && !isVacationDate(s)) count++;
      if (s === dateStr) return count;
      cur.setDate(cur.getDate() + 1);
    }
    return count;
  }

  function getWeekNum(dateStr) {
    const start = new Date('2026-07-06T00:00:00');
    const d = new Date(dateStr + 'T00:00:00');
    return Math.floor((d - start) / (1000 * 60 * 60 * 24) / 7) + 1;
  }

  function getHomeworkOverrides(dateStr) {
    const d = new Date(dateStr + 'T00:00:00');
    const dayOfWeek = d.getDay();
    const studyIdx = getStudyDayIndex(dateStr);
    const chineseCount = getChineseStudyCount(dateStr);
    const weekNum = getWeekNum(dateStr);

    // --- Chinese: 试卷一二 → 诗歌循环 → 8/3-5手抄报, Sat = 八下复习+简爱 ---
    const REPORT_DAYS = { '2026-08-03': 1, '2026-08-04': 2, '2026-08-05': 3 };
    let chineseTitle;
    if (dayOfWeek === 6) {
      chineseTitle = '📖 语文 复习八下古诗文言 + 阅读简爱';
    } else if (REPORT_DAYS[dateStr]) {
      chineseTitle = `📖 语文 现代文手抄报 (${REPORT_DAYS[dateStr]}/3)`;
    } else if (chineseCount >= 0 && chineseCount <= 1) {
      chineseTitle = `📖 语文 试卷一 (${chineseCount + 1}/2)`;
    } else if (chineseCount >= 2 && chineseCount <= 3) {
      chineseTitle = `📖 语文 试卷二 (${chineseCount - 1}/2)`;
    } else if (chineseCount >= 4) {
      const poemIdx = (chineseCount - 4) % CHINESE_POEMS.length;
      chineseTitle = CHINESE_POEMS[poemIdx];
    } else {
      chineseTitle = null;
    }

    // --- Physics: 4 papers(×4) + 5 mind maps(×1) = 21 sessions, then review Mon/Thu ---
    const PHYSICS_PAPERS = 16;
    const PHYSICS_MAPS = 5;
    const PHYSICS_DONE = PHYSICS_PAPERS + PHYSICS_MAPS;

    let physicsTitle;
    if (studyIdx < 0) {
      physicsTitle = null;
    } else if (studyIdx < PHYSICS_PAPERS) {
      const paperNum = Math.floor(studyIdx / 4) + 1;
      const session = (studyIdx % 4) + 1;
      physicsTitle = `🔬 物理 试卷${['','一','二','三','四'][paperNum]} (${session}/4)`;
    } else if (studyIdx < PHYSICS_DONE) {
      const mapNum = studyIdx - PHYSICS_PAPERS + 1;
      physicsTitle = `🔬 物理 九上思维导图 (${mapNum}/5)`;
    } else {
      if (dayOfWeek === 1 || dayOfWeek === 4) {
        physicsTitle = '🔬 物理 复习';
      } else {
        physicsTitle = null;
      }
    }

    // --- Math: 4 八下试卷 + 5 九上预习卷 (1 paper/day, both sessions), then review Mon/Wed/Fri ---
    const MATH_PAPERS_1 = 4; // 八下试卷
    const MATH_PAPERS_2 = 5; // 九上预习卷
    const MATH_DONE = MATH_PAPERS_1 + MATH_PAPERS_2; // 9

    let mathUpperTitle, mathLowerTitle;
    if (studyIdx < 0) {
      mathUpperTitle = null;
      mathLowerTitle = null;
    } else if (studyIdx < MATH_PAPERS_1) {
      const n = studyIdx + 1;
      mathUpperTitle = `📐 数学 八下试卷${n} (上)`;
      mathLowerTitle = `📐 数学 八下试卷${n} (下)`;
    } else if (studyIdx < MATH_DONE) {
      const n = studyIdx - MATH_PAPERS_1 + 1;
      mathUpperTitle = `📐 数学 九上预习卷${n} (上)`;
      mathLowerTitle = `📐 数学 九上预习卷${n} (下)`;
    } else {
      if (dayOfWeek === 1 || dayOfWeek === 3 || dayOfWeek === 5) {
        mathUpperTitle = '📐 数学 复习 (上)';
        mathLowerTitle = '📐 数学 复习 (下)';
      } else {
        mathUpperTitle = null;
        mathLowerTitle = null;
      }
    }

    // --- Chemistry: 2 days/week (Mon, Thu) ---
    let chemistryTitle;
    if (dayOfWeek === 1 || dayOfWeek === 4) {
      chemistryTitle = '⚗️ 化学 预习';
    } else {
      chemistryTitle = null;
    }

    // --- History ---
    let historyTitle;
    if (dateStr <= '2026-07-11') {
      historyTitle = '📚 历史 预习第一单元';
    } else if (dateStr <= '2026-07-21') {
      historyTitle = '📚 历史 预习第二单元';
    } else if (dateStr <= '2026-07-26') {
      historyTitle = '📚 历史 预习第三单元';
    } else {
      historyTitle = '📚 历史 复习已预习单元';
    }

    // --- Morality ---
    let moralityTitle;
    if (dateStr <= '2026-07-18') {
      moralityTitle = '⚖️ 道法 复习宪法专册';
    } else if (dateStr <= '2026-07-26') {
      moralityTitle = '⚖️ 道法 预习第一单元';
    } else if (dateStr <= '2026-08-02') {
      moralityTitle = '⚖️ 道法 预习第二单元';
    } else if (dateStr <= '2026-08-09') {
      moralityTitle = '⚖️ 道法 预习第三单元';
    } else {
      moralityTitle = '⚖️ 道法 复习已预习单元';
    }

    // --- English: Mon-Wed=背诵, Thu=听写, Fri=ReadingPlus ---
    const engWeek = Math.min(weekNum, 8);
    const englishDone = weekNum > 8;
    let englishTitle;

    if (englishDone) {
      if (dayOfWeek === 1 || dayOfWeek === 3 || dayOfWeek === 5) {
        englishTitle = '📝 英语 单词复习';
      } else {
        englishTitle = null;
      }
    } else {
      if (dayOfWeek >= 1 && dayOfWeek <= 3) {
        englishTitle = `📝 英语 背诵 Unit ${engWeek} 单词`;
      } else if (dayOfWeek === 4) {
        englishTitle = `📝 英语 听写 Unit ${engWeek}`;
      } else if (dayOfWeek === 5) {
        englishTitle = `📝 英语 ReadingPlus 第${engWeek}篇`;
      } else {
        englishTitle = null;
      }
    }

    return { chineseTitle, englishTitle, mathUpperTitle, mathLowerTitle, physicsTitle, chemistryTitle, historyTitle, moralityTitle };
  }

  // --- State ---
  const state = {
    currentDate: fmtLocalDate(new Date()),
    currentView: 'day',
    editingId: null
  };

  // --- DOM helpers ---
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => document.querySelectorAll(sel);

  // --- Init ---
  async function init() {
    // ShaoYi console signature
    console.log('%c✦ SHAOYI\'S MATRIX v1.1 ✦ %cCrafted with ⚡ by ShaoYi',
      'color:#00FF66;font-size:20px;font-family:monospace;text-shadow:0 0 10px #00FF66;',
      'color:#FF007F;font-size:12px;');
    console.log('%c┌──────────────────────────────────────┐%c',
      'color:#00FF66;', '');
    console.log('%c│  ░▒▓█ G I N O  W A S  H E R E █▓▒░  │%c',
      'color:#FF007F;font-size:14px;', '');
    console.log('%c└──────────────────────────────────────┘%c',
      'color:#00FF66;', '');

    registerSW();
    initMatrixRain();
    initCursorGlow();
    bindEvents();
    bindMascot();
    await refreshView();
  }

  function registerSW() {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('./sw.js').catch(() => {});
    }
  }

  // ============================================================
  // Event Bindings
  // ============================================================

  function bindEvents() {
    $('#btn-today').addEventListener('click', () => { setToday(); refreshView(); });
    $('#btn-prev').addEventListener('click', () => navigate(-1));
    $('#btn-next').addEventListener('click', () => navigate(1));
    $('#btn-day-view').addEventListener('click', () => switchView('day'));
    $('#btn-week-view').addEventListener('click', () => switchView('week'));
    $('#btn-add').addEventListener('click', () => addNewItem());
    $('#btn-template').addEventListener('click', () => fillTemplate(state.currentDate));
    $('#btn-vacation').addEventListener('click', () => fillVacation(state.currentDate));
    $('#btn-export').addEventListener('click', handleExport);
    $('#btn-summary').addEventListener('click', handleSummaryExport);
    $('#btn-table').addEventListener('click', handleTableExport);

    // Period nav buttons
    $$('.period-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const period = btn.dataset.period;
        scrollToPeriod(period);
      });
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      // Row edit mode: Enter=save, Escape=cancel
      const editingRow = document.querySelector('.schedule-row.editing');
      if (editingRow) {
        if (e.key === 'Enter') {
          e.preventDefault();
          exitRowEdit(
            editingRow,
            editingRow.dataset.id,
            editingRow.querySelector('.col-time'),
            editingRow.querySelector('.col-mission'),
            true
          );
          return;
        }
        if (e.key === 'Escape') {
          e.preventDefault();
          exitRowEdit(
            editingRow,
            editingRow.dataset.id,
            editingRow.querySelector('.col-time'),
            editingRow.querySelector('.col-mission'),
            false
          );
          return;
        }
        return; // Block navigation while editing
      }

      // Don't navigate if editing a single cell inline
      if (document.activeElement && document.activeElement.contentEditable === 'true') {
        return;
      }

      if (e.key === 'ArrowLeft') { navigate(-1); }
      if (e.key === 'ArrowRight') { navigate(1); }
      if (e.key === 'n' && e.ctrlKey) { e.preventDefault(); addNewItem(); }
    });
  }

  function bindMascot() {
    const mascot = $('#mascot');
    mascot.addEventListener('click', () => {
      const current = mascot.dataset.status;
      const next = current === 'online' ? 'sleep' : 'online';
      mascot.dataset.status = next;
      $('#mascot-label').textContent = next === 'online' ? 'SHAOYI\'S CAT' : 'ZZZ...';

      AudioEngine.play('meow');

      if (next === 'online') {
        showToast('喵~ SHAOYI WAS HERE! ✦');
      } else {
        showToast('zzZ... 猫猫睡了 💤');
      }

      // Extra particle burst
      spawnParticles($('#mascot-svg'));
    });
  }

  // ============================================================
  // Matrix Rain Background
  // ============================================================

  function initMatrixRain() {
    const canvas = $('#matrix-rain');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    const chars = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789';
    const fontSize = 14;
    const columns = Math.floor(canvas.width / fontSize);
    const drops = new Array(columns).fill(1);

    function draw() {
      ctx.fillStyle = 'rgba(18, 24, 20, 0.08)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = '#00FF66';
      ctx.font = `${fontSize}px monospace`;

      for (let i = 0; i < drops.length; i++) {
        const text = chars[Math.floor(Math.random() * chars.length)];
        const x = i * fontSize;
        const y = drops[i] * fontSize;

        // Lead character brighter
        ctx.fillStyle = '#CCFFDD';
        ctx.fillText(text, x, y);

        // Trail
        ctx.fillStyle = '#00FF66';
        ctx.fillText(chars[Math.floor(Math.random() * chars.length)], x, y - fontSize);
        ctx.fillStyle = 'rgba(0, 255, 102, 0.4)';
        ctx.fillText(chars[Math.floor(Math.random() * chars.length)], x, y - fontSize * 2);

        if (y > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }
    }

    setInterval(draw, 55);
  }

  // ============================================================
  // Cursor Glow Trail
  // ============================================================

  function initCursorGlow() {
    const container = $('#cursor-trails');
    if (!container) return;
    let lastTime = 0;

    document.addEventListener('mousemove', (e) => {
      const now = Date.now();
      if (now - lastTime < 80) return; // throttle
      lastTime = now;

      const dot = document.createElement('div');
      dot.className = 'cursor-dot';
      dot.style.left = (e.clientX - 3) + 'px';
      dot.style.top = (e.clientY - 3) + 'px';
      document.body.appendChild(dot);
      setTimeout(() => dot.remove(), 700);
    });
  }

  // ============================================================
  // Navigation
  // ============================================================

  function navigate(delta) {
    const d = new Date(state.currentDate + 'T00:00:00');
    if (state.currentView === 'day') {
      d.setDate(d.getDate() + delta);
    } else {
      d.setDate(d.getDate() + delta * 7);
    }
    state.currentDate = fmtLocalDate(d);
    refreshView();
  }

  function setToday() {
    state.currentDate = fmtLocalDate(new Date());
  }

  function switchView(view) {
    state.currentView = view;
    $('#btn-day-view').classList.toggle('active', view === 'day');
    $('#btn-week-view').classList.toggle('active', view === 'week');
    refreshView();
  }

  // ============================================================
  // View Refresh
  // ============================================================

  async function refreshView() {
    updateDateDisplay();
    if (state.currentView === 'day') {
      $('#view-day').classList.add('active');
      $('#view-week').classList.remove('active');
      await renderDayView();
    } else {
      $('#view-day').classList.remove('active');
      $('#view-week').classList.add('active');
      await renderWeekView();
    }
  }

  function updateDateDisplay() {
    const d = new Date(state.currentDate + 'T00:00:00');
    const week = getWeekRange(state.currentDate);
    const dayNames = ['日', '一', '二', '三', '四', '五', '六'];

    if (state.currentView === 'day') {
      $('#date-display').textContent =
        `${d.getFullYear()}.${String(d.getMonth()+1).padStart(2,'0')}.${String(d.getDate()).padStart(2,'0')} 周${dayNames[d.getDay()]}`;
    } else {
      $('#date-display').textContent = `${week.start} ~ ${week.end}`;
    }
  }

  // ============================================================
  // Day View — Three-Column Binder
  // ============================================================

  async function renderDayView() {
    const body = $('#table-body');
    body.innerHTML = '';

    const items = await Storage.getByDate(state.currentDate);
    const itemsByPeriod = {};
    PERIODS.forEach(p => { itemsByPeriod[p] = []; });
    items.forEach(item => {
      if (itemsByPeriod[item.period]) {
        itemsByPeriod[item.period].push(item);
      }
    });

    let hasAny = false;

    PERIODS.forEach(period => {
      const periodItems = itemsByPeriod[period];
      const section = document.createElement('div');
      section.className = 'period-section';
      section.id = `period-${period}`;

      // Period header
      const header = document.createElement('div');
      header.className = 'period-section-header';
      header.textContent = `▸ ${PERIOD_LABELS[period].en} / ${PERIOD_LABELS[period].zh}`;
      section.appendChild(header);

      // Sort within period by time_range, then render rows
      periodItems.sort((a, b) => (a.time_range || '').localeCompare(b.time_range || ''));
      periodItems.forEach(item => {
        section.appendChild(createScheduleRow(item));
        hasAny = true;
      });

      // Add-row button
      const addBtn = document.createElement('button');
      addBtn.className = 'add-row-btn';
      addBtn.textContent = `+ 添加 ${PERIOD_LABELS[period].zh} 事项`;
      addBtn.addEventListener('click', () => addNewItem(period));
      section.appendChild(addBtn);

      body.appendChild(section);
    });

    $('#empty-state').classList.toggle('visible', !hasAny);
  }

  function createScheduleRow(item) {
    const row = document.createElement('div');
    row.className = 'schedule-row' + (item.completed ? ' completed' : '');
    row.dataset.id = item.id;

    // Col 1: Time range (click to edit)
    const colTime = document.createElement('div');
    colTime.className = 'col-time';
    colTime.textContent = item.time_range || '--:-- - --:--';
    colTime.title = '点击编辑时间';
    colTime.addEventListener('click', (e) => {
      e.stopPropagation();
      if (row.classList.contains('editing')) return;
      startInlineEdit(colTime, item.id, 'time_range');
    });

    // Col 2: Mission (double-click to edit)
    const colMission = document.createElement('div');
    colMission.className = 'col-mission';
    colMission.textContent = item.title || '(无标题)';
    colMission.title = '双击编辑事项';
    colMission.addEventListener('dblclick', (e) => {
      e.stopPropagation();
      if (row.classList.contains('editing')) return;
      startInlineEdit(colMission, item.id, 'title');
    });

    // Col 3: Status checkbox
    const colStatus = document.createElement('div');
    colStatus.className = 'col-status';
    const statusBox = document.createElement('div');
    statusBox.className = 'status-box' + (item.completed ? ' checked' : '');
    statusBox.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleComplete(item.id, statusBox, row);
    });
    colStatus.appendChild(statusBox);

    // Col 4: Action buttons (edit / delete)
    const colActions = document.createElement('div');
    colActions.className = 'col-actions';

    const btnEdit = document.createElement('button');
    btnEdit.className = 'action-btn action-btn-edit';
    btnEdit.innerHTML = '&#9998;';  // ✎
    btnEdit.title = '编辑此行';
    btnEdit.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleRowEdit(row, item.id);
    });

    const btnDelete = document.createElement('button');
    btnDelete.className = 'action-btn action-btn-delete';
    btnDelete.innerHTML = '&#10005;';  // ✕
    btnDelete.title = '删除此行';
    btnDelete.addEventListener('click', (e) => {
      e.stopPropagation();
      deleteItem(item.id, row);
    });

    colActions.appendChild(btnEdit);
    colActions.appendChild(btnDelete);

    row.appendChild(colTime);
    row.appendChild(colMission);
    row.appendChild(colStatus);
    row.appendChild(colActions);
    return row;
  }

  // ============================================================
  // Inline Editing
  // ============================================================

  function startInlineEdit(el, id, field) {
    if (el.contentEditable === 'true') return;

    el.contentEditable = true;
    el.focus();

    // Select all text
    const range = document.createRange();
    range.selectNodeContents(el);
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);

    async function onBlur() {
      el.contentEditable = false;
      el.removeEventListener('blur', onBlur);
      el.removeEventListener('keydown', onKey);

      const newValue = el.textContent.trim();
      if (newValue && newValue !== '--:-- - --:--' && newValue !== '(无标题)') {
        try {
          await Storage.update(id, { [field]: newValue });
          AudioEngine.play('success');
          showToast('已更新');
        } catch (err) {
          showToast('更新失败', 'warn');
        }
      }
    }

    function onKey(e) {
      if (e.key === 'Escape') {
        el.contentEditable = false;
        el.removeEventListener('blur', onBlur);
        el.removeEventListener('keydown', onKey);
        refreshView(); // Re-render to restore original text
      }
      if (e.key === 'Enter') {
        e.preventDefault();
        el.blur(); // triggers onBlur
      }
    }

    el.addEventListener('blur', onBlur);
    el.addEventListener('keydown', onKey);
  }

  // ============================================================
  // Toggle Complete + Particle Effect
  // ============================================================

  async function toggleComplete(id, statusBox, row) {
    const newState = await Storage.toggleComplete(id);
    if (newState === null) return;

    AudioEngine.play('check');

    if (newState) {
      statusBox.classList.add('checked');
      row.classList.add('completed');
    } else {
      statusBox.classList.remove('checked');
      row.classList.remove('completed');
    }

    // Particle burst from checkbox
    spawnParticles(statusBox);
  }

  function spawnParticles(origin) {
    const rect = origin.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;

    const symbols = ['✦', '✧', '◆', '◇', '·', '◆'];
    for (let i = 0; i < 8; i++) {
      const particle = document.createElement('span');
      particle.className = 'particle';
      particle.textContent = symbols[Math.floor(Math.random() * symbols.length)];
      particle.style.left = cx + 'px';
      particle.style.top = cy + 'px';
      particle.style.setProperty('--px', (Math.random() - 0.5) * 60 + 'px');
      particle.style.setProperty('--py', (Math.random() - 0.5) * 60 - 20 + 'px');
      document.body.appendChild(particle);
      setTimeout(() => particle.remove(), 600);
    }
  }

  // ============================================================
  // Row Edit Mode (edit button toggles both time + title)
  // ============================================================

  function toggleRowEdit(row, id) {
    const colTime = row.querySelector('.col-time');
    const colMission = row.querySelector('.col-mission');
    const btnEdit = row.querySelector('.action-btn-edit');

    if (row.classList.contains('editing')) {
      // Exit edit mode — save changes
      exitRowEdit(row, id, colTime, colMission, true);
    } else {
      // Enter edit mode
      row.classList.add('editing');
      colTime.contentEditable = 'true';
      colMission.contentEditable = 'true';
      btnEdit.innerHTML = '&#10003;';  // ✓ save icon
      btnEdit.title = '保存 (Enter)';

      // Focus time cell
      colTime.focus();
      selectAllContent(colTime);
    }
  }

  function exitRowEdit(row, id, colTime, colMission, save) {
    row.classList.remove('editing');
    colTime.contentEditable = 'false';
    colMission.contentEditable = 'false';
    const btnEdit = row.querySelector('.action-btn-edit');
    btnEdit.innerHTML = '&#9998;';  // ✎
    btnEdit.title = '编辑此行';

    if (save) {
      const newTime = colTime.textContent.trim();
      const newTitle = colMission.textContent.trim();
      const updates = {};
      if (newTime && newTime !== '--:-- - --:--') updates.time_range = newTime;
      if (newTitle && newTitle !== '(无标题)') updates.title = newTitle;

      if (Object.keys(updates).length > 0) {
        Storage.update(id, updates).then(() => {
          AudioEngine.play('success');
          showToast('已更新');
        }).catch(() => {
          showToast('更新失败', 'warn');
        });
      }
    } else {
      // Cancel: restore original text by re-rendering
      refreshView();
    }
  }

  function selectAllContent(el) {
    const range = document.createRange();
    range.selectNodeContents(el);
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
  }

  // ============================================================
  // Delete Item
  // ============================================================

  async function deleteItem(id, row) {
    const title = row.querySelector('.col-mission').textContent;
    const confirmed = confirm(`确定删除「${title}」吗？\n\n此操作不可撤销。`);
    if (!confirmed) return;

    try {
      await Storage.remove(id);
      AudioEngine.play('laser');
      showToast('已删除: ' + title);

      // Animate row out
      row.style.transition = 'all 0.3s';
      row.style.opacity = '0';
      row.style.transform = 'translateX(-20px)';
      row.style.maxHeight = row.offsetHeight + 'px';
      row.style.overflow = 'hidden';
      setTimeout(() => {
        row.style.maxHeight = '0';
        row.style.minHeight = '0';
        row.style.padding = '0';
        row.style.margin = '0';
        row.style.border = 'none';
      }, 150);
      setTimeout(() => {
        row.remove();
        // Show empty state if no rows left
        const remainingRows = $$('#table-body .schedule-row');
        if (remainingRows.length === 0) {
          refreshView();
        }
      }, 500);
    } catch (err) {
      showToast('删除失败: ' + err.message, 'warn');
    }
  }

  // ============================================================
  // Fill Study Template
  // ============================================================

  async function fillTemplate(date, silent = false) {
    try {
      // Check existing items
      const existing = await Storage.getByDate(date);
      if (existing.length > 0 && !silent) {
        if (!confirm(`该日已有 ${existing.length} 条事项，是否覆盖？`)) return;
      }

      // Clear old items if any
      if (existing.length > 0) {
        await Storage.clearDate(date);
      }

      // Get homework-aware overrides for this date
      const overrides = getHomeworkOverrides(date);

      // Build items from template with overrides
      const items = STUDY_TEMPLATE.map(t => {
        let title = t.title;
        if (t.title.includes('语文')) {
          title = overrides.chineseTitle;
        } else if (t.title.includes('数学 (上)')) {
          title = overrides.mathUpperTitle;
        } else if (t.title.includes('数学 (下)')) {
          title = overrides.mathLowerTitle;
        } else if (t.title.includes('英语')) {
          title = overrides.englishTitle;
        } else if (t.title.includes('物理')) {
          title = overrides.physicsTitle;
        } else if (t.title.includes('化学')) {
          title = overrides.chemistryTitle;
        } else if (t.title.includes('历史')) {
          title = overrides.historyTitle;
        } else if (t.title.includes('道德与法治')) {
          title = overrides.moralityTitle;
        }
        if (title === null) return null;
        return {
          date: date,
          period: t.period,
          time_range: t.time_range,
          title: title,
          completed: false,
          tag: t.tag
        };
      }).filter(item => item !== null); // Remove null-title items (skip slots)

      const count = await Storage.bulkAdd(items);

      if (!silent) {
        AudioEngine.play('success');
        showToast(`已填充 ${count} 条日程`);
        if (date === state.currentDate) await refreshView();
      }

      return count;
    } catch (err) {
      if (!silent) showToast('填充失败: ' + err.message, 'warn');
      throw err;
    }
  }

  // --- Vacation toggle ---
  async function fillVacation(date, silent = false) {
    try {
      const existing = await Storage.getByDate(date);
      const isVacation = existing.length > 0 && existing.every(item => item.tag === 'REST' && item.title.includes('旅行'));

      if (isVacation) {
        // Undo vacation
        if (!silent && !confirm('该日正在休假，是否取消休假并清空？')) return;
        await Storage.clearDate(date);
        if (!silent) {
          showToast('已取消休假');
          if (date === state.currentDate) await refreshView();
        }
        return 0;
      }

      // Set vacation
      if (existing.length > 0 && !silent) {
        if (!confirm(`该日已有 ${existing.length} 条事项，是否替换为休假？`)) return;
      }
      if (existing.length > 0) await Storage.clearDate(date);

      const items = VACATION_TEMPLATE.map(t => ({
        date, period: t.period, time_range: t.time_range,
        title: t.title, completed: false, tag: t.tag
      }));
      const count = await Storage.bulkAdd(items);

      if (!silent) {
        AudioEngine.play('success');
        showToast('🏖️ 已设为休假');
        if (date === state.currentDate) await refreshView();
      }
      return count;
    } catch (err) {
      if (!silent) showToast('操作失败: ' + err.message, 'warn');
      throw err;
    }
  }

  async function addNewItem(period) {
    const p = period || getCurrentVisiblePeriod();

    // Quick prompt-based add for simplicity
    const title = prompt(`添加${PERIOD_LABELS[p].zh}事项:`, '');
    if (!title || !title.trim()) return;

    const timeRange = prompt('时间范围 (如 08:00-08:30):', '');
    if (!timeRange || !timeRange.trim()) return;

    try {
      const item = {
        date: state.currentDate,
        period: p,
        time_range: timeRange.trim(),
        title: title.trim(),
        completed: false,
        tag: 'STUDY'
      };
      await Storage.add(item);
      AudioEngine.play('success');
      showToast('事项已添加');
      await refreshView();
    } catch (err) {
      showToast('添加失败: ' + err.message, 'warn');
    }
  }

  function getCurrentVisiblePeriod() {
    // Find which period section is most visible
    for (const period of PERIODS) {
      const el = document.getElementById(`period-${period}`);
      if (el) {
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom > 0) {
          return period;
        }
      }
    }
    return 'MORNING';
  }

  function scrollToPeriod(period) {
    // Update active button
    $$('.period-btn').forEach(b => b.classList.remove('active'));
    const btn = document.querySelector(`.period-btn[data-period="${period}"]`);
    if (btn) btn.classList.add('active');

    // Scroll to section
    const section = document.getElementById(`period-${period}`);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  // ============================================================
  // Week View — 7 Mini Binders
  // ============================================================

  async function renderWeekView() {
    const container = $('#week-binders');
    container.innerHTML = '';

    const week = getWeekRange(state.currentDate);
    const items = await Storage.getByRange(week.start, week.end);
    const dayNames = ['一', '二', '三', '四', '五', '六', '日'];
    const today = fmtLocalDate(new Date());
    let hasAny = false;

    for (let i = 0; i < 7; i++) {
      const d = new Date(week.start + 'T00:00:00');
      d.setDate(d.getDate() + i);
      const dateStr = fmtLocalDate(d);
      const dayItems = items.filter(it => it.date === dateStr);
      if (dayItems.length > 0) hasAny = true;

      const binder = document.createElement('div');
      binder.className = 'week-day-binder';

      const title = document.createElement('div');
      title.className = 'week-day-title' + (dateStr === today ? ' today' : '');
      title.textContent = `周${dayNames[i]} ${d.getDate()}`;
      binder.appendChild(title);

      const itemsDiv = document.createElement('div');
      itemsDiv.className = 'week-day-items';
      dayItems.forEach(item => {
        const row = document.createElement('div');
        row.className = 'week-item-row' + (item.completed ? ' completed' : '');
        row.textContent = `${item.time_range} ${item.title}`;
        row.title = `${item.time_range} ${item.title}`;
        row.addEventListener('click', () => {
          // Navigate to that day in day view
          state.currentDate = item.date;
          switchView('day');
        });
        itemsDiv.appendChild(row);
      });
      binder.appendChild(itemsDiv);
      container.appendChild(binder);
    }

    $('#empty-state').classList.toggle('visible', !hasAny);
  }

  // ============================================================
  // Export
  // ============================================================

  async function handleExport() {
    try {
      showToast('正在生成 PDF...');
      await ExportEngine.exportToPDF({ theme: 'cyber_neon' });
      AudioEngine.play('levelup');
      showToast('PDF 导出完成!');
    } catch (err) {
      showToast('导出失败: ' + err.message, 'warn');
    }
  }

  async function handleSummaryExport() {
    try {
      showToast('正在生成摘要 PDF...');
      await ExportEngine.exportSummaryPDF({
        date: state.currentDate,
        theme: 'cyber_neon'
      });
      AudioEngine.play('levelup');
      showToast('摘要 PDF 导出完成!');
    } catch (err) {
      showToast('导出失败: ' + err.message, 'warn');
    }
  }

  async function handleTableExport() {
    try {
      showToast('正在生成日程摘要表...');
      await ExportEngine.exportTablePDF({ theme: 'cyber_neon' });
      AudioEngine.play('levelup');
      showToast('日程摘要表导出完成!');
    } catch (err) {
      showToast('导出失败: ' + err.message, 'warn');
    }
  }

  // ============================================================
  // Toast
  // ============================================================

  let toastTimer = null;
  function showToast(msg, type = '') {
    const toast = $('#toast');
    toast.textContent = msg;
    toast.className = 'toast ' + type;
    clearTimeout(toastTimer);
    toast.classList.remove('hidden');
    toastTimer = setTimeout(() => toast.classList.add('hidden'), 2000);
  }

  // ============================================================
  // Public
  // ============================================================

  function getState() { return { ...state }; }

  return { init, getState, refreshView, showToast, fillTemplate, fillVacation };
})();

// ============================================================
// Console API (updated for v1.1 schema)
// ============================================================

window.cybersched = {
  add: async (payload) => {
    const item = await Storage.add({
      date: payload.date || fmtLocalDate(new Date()),
      period: payload.period || 'MORNING',
      time_range: payload.time_range || '',
      title: payload.title || 'Untitled',
      completed: payload.completed || false,
      tag: payload.tag || 'STUDY'
    });
    App.refreshView();
    return item;
  },
  rm: async (id) => {
    await Storage.remove(id);
    App.refreshView();
    return { removed: id };
  },
  update: async (id, payload) => {
    await Storage.update(id, payload);
    App.refreshView();
    return { updated: id };
  },
  toggle: async (id) => {
    const result = await Storage.toggleComplete(id);
    App.refreshView();
    return { id, completed: result };
  },
  list: async (isoWeek) => {
    const year = new Date().getFullYear();
    const jan4 = new Date(year, 0, 4);
    const jan4Day = jan4.getDay() || 7;
    const week1Start = new Date(jan4);
    week1Start.setDate(jan4.getDate() - jan4Day + 1);
    const targetMonday = new Date(week1Start);
    targetMonday.setDate(week1Start.getDate() + (isoWeek - 1) * 7);
    const week = getWeekRange(fmtLocalDate(targetMonday));
    return Storage.getByRange(week.start, week.end);
  },
  clone: async (from, to) => {
    const cloned = await Storage.cloneDay(from, to);
    App.refreshView();
    return cloned;
  },
  export: async (config) => {
    return ExportEngine.exportToPDF({ ...(config || {}), interactive: false });
  },
  exportSummary: async (config) => {
    return ExportEngine.exportSummaryPDF({ ...(config || {}), interactive: false });
  },
  exportTable: async (config) => {
    return ExportEngine.exportTablePDF({ ...(config || {}), interactive: false });
  },
  fillTemplate: async (date) => {
    return App.fillTemplate(date || fmtLocalDate(new Date()), false);
  },
  fillRange: async (from, to) => {
    const start = new Date(from + 'T00:00:00');
    const end = new Date(to + 'T00:00:00');
    let total = 0;
    let days = 0;
    const d = new Date(start);
    while (d <= end) {
      const dateStr = fmtLocalDate(d);
      const count = await App.fillTemplate(dateStr, true);
      total += count;
      days++;
      console.log(`%c📋 ${dateStr} %c→ %c${count} 条`,
        'color:#00FF66;', '', 'color:#FFD700;font-weight:bold;');
      d.setDate(d.getDate() + 1);
    }
    console.log(`%c✅ 完成! %c共 ${days} 天，${total} 条日程`,
      'color:#00FF66;font-size:14px;', 'color:#fff;');
    return { total, days };
  },
  setVacation: async (date) => {
    return App.fillVacation(date || fmtLocalDate(new Date()), false);
  },
  fillSummerPlan: async () => {
    const START = '2026-07-06';
    const END = '2026-08-28';
    const VACATION_RANGE = { from: '2026-07-09', to: '2026-07-14' };

    console.log('%c🏖️ SHAOYI\'S SUMMER PLAN %c开始生成...',
      'color:#FFD700;font-size:16px;', 'color:#fff;');
    console.log('%c暑期范围:%c %s ~ %s',
      'color:#00FF66;', 'color:#fff;', START, END);

    let total = 0;
    let studyDays = 0;
    let vacDays = 0;
    let restDays = 0;

    const d = new Date(START + 'T00:00:00');
    const end = new Date(END + 'T00:00:00');

    while (d <= end) {
      const dateStr = fmtLocalDate(d);
      const dayOfWeek = d.getDay(); // 0=Sun

      // Sunday = weekend rest
      if (dayOfWeek === 0) {
        const existing = await Storage.getByDate(dateStr);
        if (existing.length > 0) await Storage.clearDate(dateStr);
        await Storage.bulkAdd([
          { date: dateStr, period: 'MORNING',   time_range: '', title: '😴 周末休息', tag: 'REST' },
          { date: dateStr, period: 'NOON',      time_range: '', title: '🍜 享受美食', tag: 'REST' },
          { date: dateStr, period: 'AFTERNOON', time_range: '', title: '🎮 自由活动', tag: 'REST' },
          { date: dateStr, period: 'NIGHT',     time_range: '', title: '🌙 早睡早起', tag: 'REST' }
        ]);
        console.log(`%c😴 ${dateStr} %c周末休息`,
          'color:#6699FF;', 'color:#999;');
        restDays++;
        d.setDate(d.getDate() + 1);
        continue;
      }

      // Vacation range
      if (dateStr >= VACATION_RANGE.from && dateStr <= VACATION_RANGE.to) {
        const existing = await Storage.getByDate(dateStr);
        if (existing.length > 0) await Storage.clearDate(dateStr);
        await App.fillVacation(dateStr, true);
        console.log(`%c🏖️ ${dateStr} %c云南旅游`,
          'color:#FFD700;', 'color:#FFAA00;');
        vacDays++;
        d.setDate(d.getDate() + 1);
        continue;
      }

      // Study day
      // Clear existing then fill with homework-aware template
      const existing = await Storage.getByDate(dateStr);
      if (existing.length > 0) await Storage.clearDate(dateStr);
      const count = await App.fillTemplate(dateStr, true);
      total += count;
      studyDays++;
      console.log(`%c📚 ${dateStr} %c→ %c${count} 条`,
        'color:#00FF66;', '', 'color:#FFD700;font-weight:bold;');
      d.setDate(d.getDate() + 1);
    }

    console.log('%c✅ 暑假计划生成完毕!',
      'color:#00FF66;font-size:16px;');
    console.log(`%c  学习日: ${studyDays} | 休假: ${vacDays} | 休息: ${restDays} | 总条目: ${total}`,
      'color:#fff;font-size:13px;');
    App.refreshView();
    return { studyDays, vacDays, restDays, total };
  }
};

// --- Boot ---
document.addEventListener('DOMContentLoaded', () => App.init());
