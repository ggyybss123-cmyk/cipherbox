(function () {
  'use strict';

  const C = window.CipherBox;

  // =========================
  // Tool Definitions
  // =========================
  const TOOLS = [
    {
      id: 'morse',
      group: '古典密碼',
      icon: '📡',
      name: '摩斯密碼 (Morse Code)',
      shortSub: '點劃編碼與聲音播放',
      desc: '支援國際標準摩斯密碼（英文字母、數字與標點）即時雙向轉換，並內建聲音播放與閃燈提示。',
      supportsMode: true,
      encodeLabel: '編碼（文字 → 摩斯）',
      decodeLabel: '解碼（摩斯 → 文字）',
      sampleEncode: 'HELLO WORLD 2026!',
      sampleDecode: '.... . .-.. .-.. --- / .-- --- .-. .-.. -.. / ..--- ----- ..--- -.... -.-.--',
      guide: '字母之間以單一空白分隔，單字之間預設以「 / 」分隔。解碼時自動相容 · • — – _ 等常見變體符號。支援切換點劃符號並調整 WPM 播放速度。',
      defaultOptions: { dotChar: '.', dashChar: '-', wordSep: '/', wpm: 16, showRef: false }
    },
    {
      id: 'caesar',
      group: '古典密碼',
      icon: '🏛️',
      name: '凱撒密碼 (Caesar / ROT13)',
      shortSub: '字母位移與 25 種暴力破解',
      desc: '經典的字母位移替換密碼，支援自訂位移量（1–25）、ROT13 捷徑與一鍵暴力破解所有位移組合。',
      supportsMode: true,
      encodeLabel: '加密（位移）',
      decodeLabel: '解密（還原）',
      sampleEncode: 'Attack at Dawn! 秘密行動',
      sampleDecode: 'Dwwdfn dw Gdzq! 秘密行動',
      guide: '將英文字母表向前或向後平移固定位數（Shift）。當位移為 13 時即為對稱的 ROT13（加密與解密相同）。若未知密鑰，可勾選「暴力破解」一次檢視全部 25 種結果。',
      defaultOptions: { shift: 3, showBruteForce: true }
    },
    {
      id: 'vigenere',
      group: '古典密碼',
      icon: '🔑',
      name: '維吉尼亞密碼 (Vigenère)',
      shortSub: '多表替換關鍵字密碼',
      desc: '使用關鍵字循環決定每個字母的凱撒位移量，安全性高於單一凱撒位移。',
      supportsMode: true,
      encodeLabel: '加密',
      decodeLabel: '解密',
      sampleEncode: 'CipherBox Tool Demo 2026',
      sampleDecode: 'UmryikTsz Kshd Hgds 2026',
      guide: '金鑰僅取英文字母 A–Z（不分大小寫），數字、空白與中文會原樣保留。',
      defaultOptions: { key: 'SECRET' }
    },
    {
      id: 'railfence',
      group: '古典密碼',
      icon: '🚂',
      name: '柵欄密碼 (Rail Fence)',
      shortSub: '鋸齒狀換位加密',
      desc: '將字元以「之」字形排列在多條柵欄線上，再按列讀取完成換位加解密。',
      supportsMode: true,
      encodeLabel: '加密',
      decodeLabel: '解密',
      sampleEncode: 'WE ARE DISCOVERED FLEE AT ONCE',
      sampleDecode: 'WRIVDETCEAEDSOEE LEA NE  CRF O',
      guide: '屬於換位密碼（Transposition Cipher），字元本身不改變，僅重新排列順序。設定 2 條以上柵欄即可使用，支援中文與 Unicode 字元。',
      defaultOptions: { rails: 3 }
    },
    {
      id: 'atbash',
      group: '古典密碼',
      icon: '🪞',
      name: '埃特巴什碼 (Atbash)',
      shortSub: '鏡像字母替換（A↔Z）',
      desc: '古老的對稱替換密碼，將字母表首尾反轉對應（A↔Z、B↔Y、C↔X...）。',
      supportsMode: false,
      modeNote: '對稱轉換（加密與解密規則相同）',
      sampleEncode: 'Hello World! ABC xyz',
      sampleDecode: 'Svool Dliow! ZYX cba',
      guide: '因為映射完全對稱，對密文再次套用埃特巴什碼即可還原為原文。',
      defaultOptions: {}
    },
    {
      id: 'base64',
      group: '編碼轉換',
      icon: '📦',
      name: 'Base64 編解碼',
      shortSub: 'UTF-8 安全 / URL-Safe',
      desc: '將任意 UTF-8 文字（含繁體中文與 Emoji）轉換為 Base64 字串，支援 URL-Safe 變體。',
      supportsMode: true,
      encodeLabel: '編碼 (Encode)',
      decodeLabel: '解碼 (Decode)',
      sampleEncode: '你好，CipherBox！🔐',
      sampleDecode: '5L2g5aW977yMQ2lwaGVyQm9477yB8J+UkA==',
      guide: '透過 TextEncoder / TextDecoder 先轉為 UTF-8 位元組再進行 Base64 編碼，解決傳統瀏覽器 btoa() 不支援中文的問題。',
      defaultOptions: { urlSafe: false }
    },
    {
      id: 'base32',
      group: '編碼轉換',
      icon: '🔠',
      name: 'Base32 編解碼',
      shortSub: 'RFC 4648 標準（2FA 常見）',
      desc: '僅使用大寫字母 A–Z 與數字 2–7 的編碼格式，常用於 TOTP 雙重驗證密鑰。',
      supportsMode: true,
      encodeLabel: '編碼 (Encode)',
      decodeLabel: '解碼 (Decode)',
      sampleEncode: 'Hello Base32!',
      sampleDecode: 'JBSWY3DPEBBGC43FGMZCC===',
      guide: '遵守 RFC 4648 規範，每 5 bits 對應一個字元，解碼時會自動忽略空白與大小寫差異。',
      defaultOptions: {}
    },
    {
      id: 'hex',
      group: '編碼轉換',
      icon: '🔢',
      name: '十六進位 (Hex)',
      shortSub: 'UTF-8 位元組 ↔ 0xFF',
      desc: '將文字轉換為 UTF-8 十六進位位元組序列，或將 Hex（支援空白與 0x 前綴）還原為文字。',
      supportsMode: true,
      encodeLabel: '轉為 Hex',
      decodeLabel: 'Hex 還原文字',
      sampleEncode: 'CipherBox 密碼',
      sampleDecode: '43 69 70 68 65 72 42 6f 78 20 e5 af 86 e7 a2 bc',
      guide: '解碼時會自動忽略空白、0x 前綴、冒號與連字號，方便直接貼上封包或記憶體傾印資料。',
      defaultOptions: { spaceSeparated: true, uppercase: false }
    },
    {
      id: 'binary',
      group: '編碼轉換',
      icon: '💻',
      name: '二進位 (Binary)',
      shortSub: '8-bit UTF-8 位元串',
      desc: '將文字轉為 8 位元二進位（0 與 1），或將二進位串解碼回原始 UTF-8 文字。',
      supportsMode: true,
      encodeLabel: '轉為二進位',
      decodeLabel: '二進位還原文字',
      sampleEncode: 'Hi!',
      sampleDecode: '01001000 01101001 00100001',
      guide: '每個 UTF-8 位元組固定以 8 bits 表示，解碼時總位元數必須為 8 的倍數。',
      defaultOptions: { spaceSeparated: true }
    },
    {
      id: 'url',
      group: '編碼轉換',
      icon: '🌐',
      name: 'URL 編解碼',
      shortSub: 'Percent Encoding (%E4%B8%AD)',
      desc: '處理網址參數中的特殊字元與中文字元百分比編碼（encodeURIComponent）。',
      supportsMode: true,
      encodeLabel: 'URL 編碼',
      decodeLabel: 'URL 解碼',
      sampleEncode: 'https://example.com/?q=摩斯密碼&lang=zh-TW',
      sampleDecode: 'https%3A%2F%2Fexample.com%2F%3Fq%3D%E6%91%A9%E6%96%AF%E5%AF%86%E7%A2%BC%26lang%3Dzh-TW',
      guide: '解碼時可勾選「將 + 視作空白」，適用於解析表單（application/x-www-form-urlencoded）查詢字串。',
      defaultOptions: { plusAsSpace: false }
    },
    {
      id: 'html',
      group: '編碼轉換',
      icon: '🏷️',
      name: 'HTML 實體編解碼',
      shortSub: '&lt; &gt; &amp; &#x...;',
      desc: '將特殊符號或非 ASCII 字元轉為 HTML Entities，或還原含十進位/十六進位實體的字串。',
      supportsMode: true,
      encodeLabel: '編碼為 HTML 實體',
      decodeLabel: '還原 HTML 實體',
      sampleEncode: '<script>alert("安全測試 & 編碼")</script>',
      sampleDecode: '&lt;script&gt;alert(&quot;安全測試 &amp; 編碼&quot;)&lt;/script&gt;',
      guide: '使用純字串解析還原實體，不會觸發瀏覽器 DOM 執行，防止測試時產生 XSS 風險。',
      defaultOptions: { encodeNonAscii: false }
    },
    {
      id: 'aes',
      group: '現代加密與分析',
      icon: '🛡️',
      name: 'AES-256-GCM 加解密',
      shortSub: 'Web Crypto API 密碼加密',
      desc: '使用瀏覽器原生 Web Crypto API（PBKDF2-SHA256 + AES-256-GCM）進行安全對稱加密。',
      supportsMode: true,
      encodeLabel: 'AES 加密',
      decodeLabel: 'AES 解密',
      sampleEncode: '這是需要高度保密的訊息內容！',
      sampleDecode: '',
      guide: '每次加密皆隨機產生 16-byte Salt 與 12-byte IV，並以 CB1: 前綴封裝。註：部分瀏覽器僅於 localhost 或 HTTPS 下開放 Web Crypto API。',
      defaultOptions: { password: '' }
    },
    {
      id: 'jwt',
      group: '現代加密與分析',
      icon: '🪪',
      name: 'JWT 權杖解碼器',
      shortSub: '解析 Header / Payload / 過期時間',
      desc: '即時拆解 JSON Web Token 的 Header 與 Payload 內容，並自動換算發行與過期時間。',
      supportsMode: false,
      modeNote: '唯讀解析（不驗證簽章）',
      sampleEncode: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkNpcGhlckJveCDkvb_nlKjogIUiLCJpYXQiOjE3MzI1MDAwMDAsImV4cCI6MTk5OTk5OTk5OX0.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
      sampleDecode: '',
      guide: 'JWT 的 Header 與 Payload 僅以 Base64URL 編碼而非加密，任何取得權杖的人都能讀取其內容。',
      defaultOptions: {}
    },
    {
      id: 'hash',
      group: '現代加密與分析',
      icon: '#️⃣',
      name: 'SHA 雜湊摘要',
      shortSub: 'SHA-256 / SHA-384 / SHA-512',
      desc: '計算輸入文字的單向密碼學雜湊值（Digest），支援離線純 JS SHA-256 備援。',
      supportsMode: false,
      modeNote: '單向雜湊（不可逆推原文）',
      sampleEncode: 'CipherBox',
      sampleDecode: '',
      guide: '雜湊為單向運算，常用於資料完整性校驗與密碼指紋比對。',
      defaultOptions: { algorithm: 'SHA-256', uppercase: false }
    },
    {
      id: 'detect',
      group: '現代加密與分析',
      icon: '🪄',
      name: '智慧編碼偵測 (Auto-Detect)',
      shortSub: '自動辨識密文格式並預覽解碼',
      desc: '不確定手上的密文是什麼編碼嗎？貼上任意字串，自動比對多種格式並列出可能的解碼結果。',
      supportsMode: false,
      modeNote: '自動分析輸入格式',
      sampleEncode: '.... . .-.. .-.. --- / .-- --- .-. .-.. -..',
      sampleDecode: '',
      guide: '依序檢測 JWT、摩斯密碼、二進位、十六進位、URL 編碼、HTML 實體、Base64 與 Base32，同時顯示凱撒位移 13 (ROT13) 參考。',
      defaultOptions: {}
    }
  ];

  const TOOL_MAP = Object.fromEntries(TOOLS.map((t) => [t.id, t]));

  // =========================
  // Application State
  // =========================
  const state = {
    activeToolId: 'morse',
    mode: 'encode', // 'encode' | 'decode'
    searchQuery: '',
    options: {},
    runCounter: 0,
    detectedTop: null
  };

  TOOLS.forEach((t) => {
    state.options[t.id] = { ...t.defaultOptions };
  });

  // =========================
  // DOM References
  // =========================
  const els = {
    sidebar: document.getElementById('sidebar'),
    sidebarBackdrop: document.getElementById('sidebar-backdrop'),
    mobileMenuBtn: document.getElementById('mobile-menu-btn'),
    toolNav: document.getElementById('tool-nav'),
    toolSearch: document.getElementById('tool-search'),
    themeToggle: document.getElementById('theme-toggle'),
    themeIcon: document.getElementById('theme-icon'),
    toolBadge: document.getElementById('tool-badge'),
    toolTitle: document.getElementById('tool-title'),
    toolDesc: document.getElementById('tool-desc'),
    btnSample: document.getElementById('btn-sample'),
    btnClear: document.getElementById('btn-clear'),
    btnSwap: document.getElementById('btn-swap'),
    modeSwitch: document.getElementById('mode-switch'),
    modeEncode: document.getElementById('mode-encode'),
    modeDecode: document.getElementById('mode-decode'),
    toolOptions: document.getElementById('tool-options'),
    detectBanner: document.getElementById('detect-banner'),
    detectMessage: document.getElementById('detect-message'),
    detectApplyBtn: document.getElementById('detect-apply-btn'),
    statusBanner: document.getElementById('status-banner'),
    inputLabel: document.getElementById('input-label'),
    inputStats: document.getElementById('input-stats'),
    btnPaste: document.getElementById('btn-paste'),
    inputText: document.getElementById('input-text'),
    outputLabel: document.getElementById('output-label'),
    outputStats: document.getElementById('output-stats'),
    btnDownload: document.getElementById('btn-download'),
    btnCopy: document.getElementById('btn-copy'),
    outputText: document.getElementById('output-text'),
    extraPanel: document.getElementById('extra-panel'),
    guideContent: document.getElementById('guide-content'),
    toast: document.getElementById('toast')
  };

  // =========================
  // Utilities
  // =========================
  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  let toastTimer = null;
  function showToast(msg) {
    els.toast.textContent = msg;
    els.toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      els.toast.classList.remove('show');
    }, 2200);
  }

  function updateStats(text, targetEl) {
    const chars = Array.from(text).length;
    const bytes = new TextEncoder().encode(text).length;
    targetEl.textContent = `${chars} 字元 · ${bytes} bytes`;
  }

  function setStatusBanner(type, msg) {
    if (!msg) {
      els.statusBanner.className = 'status-banner hidden';
      els.statusBanner.textContent = '';
      return;
    }
    els.statusBanner.className = `status-banner ${type}`;
    els.statusBanner.textContent = msg;
  }

  async function copyText(text) {
    if (!text) {
      showToast('沒有可複製的內容');
      return;
    }
    try {
      await navigator.clipboard.writeText(text);
      showToast('已複製到剪貼簿');
    } catch {
      const temp = document.createElement('textarea');
      temp.value = text;
      document.body.appendChild(temp);
      temp.select();
      document.execCommand('copy');
      temp.remove();
      showToast('已複製到剪貼簿');
    }
  }

  // =========================
  // Theme Handling
  // =========================
  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    els.themeIcon.textContent = theme === 'dark' ? '☀️' : '🌙';
    try {
      localStorage.setItem('cipherbox_theme', theme);
    } catch { /* ignore */ }
  }

  function initTheme() {
    let saved = 'dark';
    try {
      saved = localStorage.getItem('cipherbox_theme') || 'dark';
    } catch { /* ignore */ }
    applyTheme(saved);
  }

  // =========================
  // Morse Audio Player (Web Audio API)
  // =========================
  const morsePlayer = {
    ctx: null,
    timers: [],
    playing: false,

    stop() {
      this.timers.forEach((t) => clearTimeout(t));
      this.timers = [];
      this.playing = false;
      if (this.ctx) {
        try {
          this.ctx.close();
        } catch { /* ignore */ }
        this.ctx = null;
      }
      const led = document.getElementById('morse-led');
      if (led) led.classList.remove('on');
      const playBtn = document.getElementById('morse-play-btn');
      const stopBtn = document.getElementById('morse-stop-btn');
      if (playBtn) playBtn.disabled = false;
      if (stopBtn) stopBtn.disabled = true;
    },

    play(morseString, wpm = 16) {
      this.stop();
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) {
        showToast('此瀏覽器不支援 Web Audio API');
        return;
      }

      const opts = state.options.morse;
      const cleaned = morseString.trim();
      if (!cleaned) {
        showToast('請先產生或輸入摩斯密碼');
        return;
      }

      // Normalize to standard . - /
      const tokens = cleaned.split(/\s+/);
      const unitMs = 1200 / Math.max(5, Math.min(40, Number(wpm) || 16));
      const unitSec = unitMs / 1000;

      const ctx = new AudioCtx();
      this.ctx = ctx;
      this.playing = true;

      const playBtn = document.getElementById('morse-play-btn');
      const stopBtn = document.getElementById('morse-stop-btn');
      const led = document.getElementById('morse-led');
      if (playBtn) playBtn.disabled = true;
      if (stopBtn) stopBtn.disabled = false;

      let t = ctx.currentTime + 0.05;
      const startTime = t;

      const scheduleTone = (start, duration) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = 650;
        gain.gain.setValueAtTime(0.0001, start);
        gain.gain.exponentialRampToValueAtTime(0.25, start + 0.008);
        gain.gain.setValueAtTime(0.25, Math.max(start + 0.008, start + duration - 0.008));
        gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(start);
        osc.stop(start + duration + 0.01);

        const delayOn = Math.max(0, (start - startTime) * 1000);
        const delayOff = Math.max(0, (start + duration - startTime) * 1000);
        this.timers.push(setTimeout(() => led && led.classList.add('on'), delayOn));
        this.timers.push(setTimeout(() => led && led.classList.remove('on'), delayOff));
      };

      tokens.forEach((token, idx) => {
        if (token === opts.wordSep || token === '/' || token === '|') {
          t += unitSec * 4; // previous letter already added 3 units => total 7 units
          return;
        }
        const norm = token
          .split(opts.dotChar || '.').join('.')
          .split(opts.dashChar || '-').join('-')
          .replace(/[·•・]/g, '.')
          .replace(/[—–−_]/g, '-');

        for (let i = 0; i < norm.length; i++) {
          const ch = norm[i];
          if (ch === '.') {
            scheduleTone(t, unitSec);
            t += unitSec;
          } else if (ch === '-') {
            scheduleTone(t, unitSec * 3);
            t += unitSec * 3;
          }
          if (i < norm.length - 1) {
            t += unitSec; // intra-character gap
          }
        }
        if (idx < tokens.length - 1) {
          t += unitSec * 3; // letter gap
        }
      });

      const totalMs = Math.max(200, (t - startTime) * 1000 + 80);
      this.timers.push(
        setTimeout(() => {
          this.stop();
        }, totalMs)
      );
    }
  };

  // =========================
  // Sidebar Rendering
  // =========================
  function renderSidebar() {
    const query = state.searchQuery.trim().toLowerCase();
    const filtered = TOOLS.filter((t) => {
      if (!query) return true;
      return (
        t.name.toLowerCase().includes(query) ||
        t.shortSub.toLowerCase().includes(query) ||
        t.group.toLowerCase().includes(query) ||
        t.id.toLowerCase().includes(query)
      );
    });

    const groups = new Map();
    for (const tool of filtered) {
      if (!groups.has(tool.group)) groups.set(tool.group, []);
      groups.get(tool.group).push(tool);
    }

    els.toolNav.innerHTML = '';
    if (filtered.length === 0) {
      els.toolNav.innerHTML = '<div style="padding:14px;color:var(--text-muted);font-size:13px;">找不到符合的工具</div>';
      return;
    }

    for (const [groupName, tools] of groups.entries()) {
      const groupEl = document.createElement('div');
      groupEl.className = 'tool-group';

      const titleEl = document.createElement('div');
      titleEl.className = 'tool-group-title';
      titleEl.textContent = groupName;
      groupEl.appendChild(titleEl);

      const listEl = document.createElement('div');
      listEl.className = 'tool-list';

      for (const tool of tools) {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = `tool-item${tool.id === state.activeToolId ? ' active' : ''}`;
        btn.dataset.toolId = tool.id;

        const iconSpan = document.createElement('span');
        iconSpan.className = 'tool-item-icon';
        iconSpan.textContent = tool.icon;

        const textWrap = document.createElement('span');
        textWrap.className = 'tool-item-text';

        const nameSpan = document.createElement('span');
        nameSpan.textContent = tool.name;

        const subSpan = document.createElement('span');
        subSpan.className = 'tool-item-sub';
        subSpan.textContent = tool.shortSub;

        textWrap.appendChild(nameSpan);
        textWrap.appendChild(subSpan);
        btn.appendChild(iconSpan);
        btn.appendChild(textWrap);

        btn.addEventListener('click', () => {
          selectTool(tool.id);
          closeMobileSidebar();
        });

        listEl.appendChild(btn);
      }

      groupEl.appendChild(listEl);
      els.toolNav.appendChild(groupEl);
    }
  }

  function openMobileSidebar() {
    els.sidebar.classList.add('open');
    els.sidebarBackdrop.classList.add('open');
  }

  function closeMobileSidebar() {
    els.sidebar.classList.remove('open');
    els.sidebarBackdrop.classList.remove('open');
  }

  // =========================
  // Dynamic Tool Options UI
  // =========================
  function renderToolOptions() {
    const id = state.activeToolId;
    const opts = state.options[id];
    const container = els.toolOptions;
    container.innerHTML = '';

    const addField = (labelText, controlEl) => {
      const wrap = document.createElement('div');
      wrap.className = 'option-field';
      const label = document.createElement('label');
      label.textContent = labelText;
      wrap.appendChild(label);
      wrap.appendChild(controlEl);
      container.appendChild(wrap);
    };

    const addCheckbox = (labelText, checked, onChange) => {
      const label = document.createElement('label');
      label.className = 'option-checkbox';
      const input = document.createElement('input');
      input.type = 'checkbox';
      input.checked = Boolean(checked);
      input.addEventListener('change', () => onChange(input.checked));
      label.appendChild(input);
      label.appendChild(document.createTextNode(labelText));
      container.appendChild(label);
    };

    if (id === 'morse') {
      const dotInput = document.createElement('input');
      dotInput.className = 'option-input';
      dotInput.style.width = '54px';
      dotInput.value = opts.dotChar;
      dotInput.maxLength = 2;
      dotInput.addEventListener('input', () => {
        opts.dotChar = dotInput.value || '.';
        runTransform();
      });
      addField('點 (Dot)', dotInput);

      const dashInput = document.createElement('input');
      dashInput.className = 'option-input';
      dashInput.style.width = '54px';
      dashInput.value = opts.dashChar;
      dashInput.maxLength = 2;
      dashInput.addEventListener('input', () => {
        opts.dashChar = dashInput.value || '-';
        runTransform();
      });
      addField('劃 (Dash)', dashInput);

      const sepInput = document.createElement('input');
      sepInput.className = 'option-input';
      sepInput.style.width = '54px';
      sepInput.value = opts.wordSep;
      sepInput.maxLength = 3;
      sepInput.addEventListener('input', () => {
        opts.wordSep = sepInput.value || '/';
        runTransform();
      });
      addField('單字分隔', sepInput);

      const wpmInput = document.createElement('input');
      wpmInput.type = 'number';
      wpmInput.className = 'option-input';
      wpmInput.style.width = '68px';
      wpmInput.min = '5';
      wpmInput.max = '40';
      wpmInput.value = opts.wpm;
      wpmInput.addEventListener('input', () => {
        opts.wpm = Number(wpmInput.value) || 16;
      });
      addField('語速 WPM', wpmInput);

      const audioWrap = document.createElement('div');
      audioWrap.className = 'option-field';

      const playBtn = document.createElement('button');
      playBtn.id = 'morse-play-btn';
      playBtn.type = 'button';
      playBtn.className = 'btn btn-sm btn-primary';
      playBtn.textContent = '🔊 播放摩斯音訊';
      playBtn.addEventListener('click', () => {
        const morseSource = state.mode === 'encode' ? els.outputText.value : els.inputText.value;
        morsePlayer.play(morseSource, opts.wpm);
      });

      const stopBtn = document.createElement('button');
      stopBtn.id = 'morse-stop-btn';
      stopBtn.type = 'button';
      stopBtn.className = 'btn btn-sm btn-secondary';
      stopBtn.textContent = '⏹ 停止';
      stopBtn.disabled = true;
      stopBtn.addEventListener('click', () => morsePlayer.stop());

      const led = document.createElement('span');
      led.id = 'morse-led';
      led.className = 'morse-led';
      led.title = '訊號閃燈指示';

      audioWrap.appendChild(playBtn);
      audioWrap.appendChild(stopBtn);
      audioWrap.appendChild(led);
      container.appendChild(audioWrap);

      addCheckbox('顯示摩斯對照表', opts.showRef, (val) => {
        opts.showRef = val;
        renderExtraPanel();
      });
    } else if (id === 'caesar') {
      const shiftInput = document.createElement('input');
      shiftInput.type = 'number';
      shiftInput.className = 'option-input';
      shiftInput.style.width = '72px';
      shiftInput.min = '1';
      shiftInput.max = '25';
      shiftInput.value = opts.shift;
      shiftInput.addEventListener('input', () => {
        const v = Math.max(1, Math.min(25, Math.trunc(Number(shiftInput.value) || 1)));
        opts.shift = v;
        runTransform();
      });
      addField('位移量 (Shift 1–25)', shiftInput);

      const rot13Btn = document.createElement('button');
      rot13Btn.type = 'button';
      rot13Btn.className = 'btn btn-sm btn-secondary';
      rot13Btn.textContent = '套用 ROT13 (Shift=13)';
      rot13Btn.addEventListener('click', () => {
        opts.shift = 13;
        shiftInput.value = 13;
        runTransform();
      });
      container.appendChild(rot13Btn);

      addCheckbox('顯示全部 25 種暴力破解結果', opts.showBruteForce, (val) => {
        opts.showBruteForce = val;
        renderExtraPanel();
      });
    } else if (id === 'vigenere') {
      const keyInput = document.createElement('input');
      keyInput.type = 'text';
      keyInput.className = 'option-input';
      keyInput.placeholder = '例如：SECRET';
      keyInput.value = opts.key;
      keyInput.addEventListener('input', () => {
        opts.key = keyInput.value;
        runTransform();
      });
      addField('關鍵字金鑰 (Key)', keyInput);
    } else if (id === 'railfence') {
      const railsInput = document.createElement('input');
      railsInput.type = 'number';
      railsInput.className = 'option-input';
      railsInput.style.width = '72px';
      railsInput.min = '2';
      railsInput.max = '20';
      railsInput.value = opts.rails;
      railsInput.addEventListener('input', () => {
        opts.rails = Number(railsInput.value) || 2;
        runTransform();
      });
      addField('柵欄數量 (Rails ≥ 2)', railsInput);
    } else if (id === 'base64') {
      addCheckbox('URL-Safe Base64（以 - _ 取代 + / 並省略 =）', opts.urlSafe, (val) => {
        opts.urlSafe = val;
        runTransform();
      });
    } else if (id === 'hex') {
      addCheckbox('以空白分隔位元組', opts.spaceSeparated, (val) => {
        opts.spaceSeparated = val;
        runTransform();
      });
      addCheckbox('大寫輸出 (A–F)', opts.uppercase, (val) => {
        opts.uppercase = val;
        runTransform();
      });
    } else if (id === 'binary') {
      addCheckbox('每 8 位元以空白分隔', opts.spaceSeparated, (val) => {
        opts.spaceSeparated = val;
        runTransform();
      });
    } else if (id === 'url') {
      addCheckbox('解碼時將 + 號視為空白', opts.plusAsSpace, (val) => {
        opts.plusAsSpace = val;
        runTransform();
      });
    } else if (id === 'html') {
      addCheckbox('將非 ASCII 字元一併轉為十進位實體（&#...;）', opts.encodeNonAscii, (val) => {
        opts.encodeNonAscii = val;
        runTransform();
      });
    } else if (id === 'aes') {
      const pwInput = document.createElement('input');
      pwInput.type = 'password';
      pwInput.className = 'option-input';
      pwInput.style.minWidth = '220px';
      pwInput.placeholder = '輸入加解密密碼...';
      pwInput.value = opts.password;
      pwInput.addEventListener('input', () => {
        opts.password = pwInput.value;
        runTransform();
      });
      addField('加解密密碼', pwInput);

      const togglePw = document.createElement('button');
      togglePw.type = 'button';
      togglePw.className = 'btn btn-sm btn-secondary';
      togglePw.textContent = '顯示密碼';
      togglePw.addEventListener('click', () => {
        const isPw = pwInput.type === 'password';
        pwInput.type = isPw ? 'text' : 'password';
        togglePw.textContent = isPw ? '隱藏密碼' : '顯示密碼';
      });
      container.appendChild(togglePw);
    } else if (id === 'hash') {
      const sel = document.createElement('select');
      sel.className = 'option-select';
      ['SHA-256', 'SHA-384', 'SHA-512'].forEach((alg) => {
        const opt = document.createElement('option');
        opt.value = alg;
        opt.textContent = alg;
        if (opts.algorithm === alg) opt.selected = true;
        sel.appendChild(opt);
      });
      sel.addEventListener('change', () => {
        opts.algorithm = sel.value;
        runTransform();
      });
      addField('雜湊演算法', sel);

      addCheckbox('大寫輸出', opts.uppercase, (val) => {
        opts.uppercase = val;
        runTransform();
      });
    }

    container.classList.toggle('hidden', container.children.length === 0);
  }

  // =========================
  // Tool Selection & Mode UI
  // =========================
  function selectTool(toolId, forcedMode) {
    if (!TOOL_MAP[toolId]) return;
    morsePlayer.stop();
    state.activeToolId = toolId;
    const tool = TOOL_MAP[toolId];

    if (forcedMode && tool.supportsMode) {
      state.mode = forcedMode;
    } else if (!tool.supportsMode) {
      state.mode = 'encode';
    }

    els.toolBadge.textContent = tool.group;
    els.toolTitle.textContent = tool.name;
    els.toolDesc.textContent = tool.desc;
    els.guideContent.textContent = tool.guide;

    if (tool.supportsMode) {
      els.modeSwitch.classList.remove('hidden');
      els.modeEncode.textContent = tool.encodeLabel || '編碼 / 加密';
      els.modeDecode.textContent = tool.decodeLabel || '解碼 / 解密';
      els.btnSwap.classList.remove('hidden');
    } else {
      els.modeSwitch.classList.add('hidden');
      els.btnSwap.classList.add('hidden');
    }

    updateModeButtons();
    renderSidebar();
    renderToolOptions();
    runTransform();
  }

  function updateModeButtons() {
    const tool = TOOL_MAP[state.activeToolId];
    els.modeEncode.classList.toggle('active', state.mode === 'encode');
    els.modeDecode.classList.toggle('active', state.mode === 'decode');
    els.modeEncode.setAttribute('aria-selected', state.mode === 'encode' ? 'true' : 'false');
    els.modeDecode.setAttribute('aria-selected', state.mode === 'decode' ? 'true' : 'false');

    if (!tool.supportsMode) {
      els.inputLabel.textContent = '輸入內容';
      els.outputLabel.textContent = tool.modeNote || '輸出結果';
    } else if (state.mode === 'encode') {
      els.inputLabel.textContent = '輸入明文 / 原文';
      els.outputLabel.textContent = '編碼 / 加密結果';
    } else {
      els.inputLabel.textContent = '輸入密文 / 編碼字串';
      els.outputLabel.textContent = '解碼 / 還原結果';
    }
  }

  // =========================
  // Smart Auto-Detect Hint Banner
  // =========================
  function updateSmartDetectHint(input) {
    const id = state.activeToolId;
    if (id === 'detect' || !input.trim()) {
      els.detectBanner.classList.add('hidden');
      state.detectedTop = null;
      return;
    }

    const candidates = C.detectEncoding(input);
    const best = candidates[0];
    if (!best) {
      els.detectBanner.classList.add('hidden');
      state.detectedTop = null;
      return;
    }

    // Suggest if it's a different tool, OR if it's the current tool in encode mode while input looks encoded
    const isDifferentTool = best.toolId !== id;
    const isSameToolNeedsDecode = best.toolId === id && TOOL_MAP[id].supportsMode && state.mode === 'encode';

    if (isDifferentTool || isSameToolNeedsDecode) {
      state.detectedTop = best;
      els.detectMessage.textContent = `偵測到輸入內容可能是「${best.label}」（信心度：${best.confidence}）`;
      els.detectApplyBtn.textContent = isSameToolNeedsDecode ? '切換為解碼模式' : `切換至 ${TOOL_MAP[best.toolId].name} 並解碼`;
      els.detectBanner.classList.remove('hidden');
    } else {
      els.detectBanner.classList.add('hidden');
      state.detectedTop = null;
    }
  }

  // =========================
  // Core Transform Execution
  // =========================
  async function runTransform() {
    const runId = ++state.runCounter;
    const id = state.activeToolId;
    const input = els.inputText.value;
    const opts = state.options[id];
    const isDecode = state.mode === 'decode';

    updateStats(input, els.inputStats);
    setStatusBanner(null, '');
    updateSmartDetectHint(input);

    if (!input) {
      els.outputText.value = '';
      updateStats('', els.outputStats);
      renderExtraPanel(null);
      return;
    }

    try {
      let result = '';
      let extraData = null;

      switch (id) {
        case 'morse':
          result = isDecode ? C.morseDecode(input, opts) : C.morseEncode(input, opts);
          break;
        case 'caesar':
          result = C.caesarTransform(input, opts.shift, isDecode);
          if (opts.showBruteForce) {
            extraData = { type: 'caesar', rows: C.caesarBruteForce(input) };
          }
          break;
        case 'vigenere':
          result = C.vigenereTransform(input, opts.key, isDecode);
          break;
        case 'railfence':
          result = isDecode ? C.railFenceDecode(input, opts.rails) : C.railFenceEncode(input, opts.rails);
          break;
        case 'atbash':
          result = C.atbashTransform(input);
          break;
        case 'base64':
          result = isDecode ? C.base64Decode(input) : C.base64Encode(input, opts);
          break;
        case 'base32':
          result = isDecode ? C.base32Decode(input) : C.base32Encode(input);
          break;
        case 'hex':
          result = isDecode ? C.hexDecode(input) : C.hexEncode(input, opts);
          break;
        case 'binary':
          result = isDecode ? C.binaryDecode(input) : C.binaryEncode(input, opts);
          break;
        case 'url':
          result = isDecode ? C.urlDecode(input, opts) : C.urlEncode(input);
          break;
        case 'html':
          result = isDecode ? C.htmlDecode(input) : C.htmlEncode(input, opts);
          break;
        case 'aes':
          result = isDecode ? await C.aesDecrypt(input, opts.password) : await C.aesEncrypt(input, opts.password);
          break;
        case 'jwt': {
          const parsed = C.jwtDecode(input);
          result = JSON.stringify(parsed.payload, null, 2);
          extraData = { type: 'jwt', parsed };
          break;
        }
        case 'hash':
          result = await C.shaHash(input, opts.algorithm, opts.uppercase);
          break;
        case 'detect': {
          const candidates = C.detectEncoding(input);
          const rot13 = C.caesarTransform(input, 13, true);
          extraData = { type: 'detect', candidates, rot13 };
          if (candidates.length > 0) {
            result = `[${candidates[0].label}]\n${candidates[0].preview}`;
          } else {
            result = '未偵測到常見編碼格式（可參考下方 ROT13 / 凱撒試探結果）。';
          }
          break;
        }
        default:
          result = '';
      }

      if (runId !== state.runCounter) return;
      els.outputText.value = result;
      updateStats(result, els.outputStats);
      renderExtraPanel(extraData);
    } catch (err) {
      if (runId !== state.runCounter) return;
      els.outputText.value = '';
      updateStats('', els.outputStats);
      setStatusBanner('error', err.message || '轉換過程發生錯誤');
      renderExtraPanel(null);
    }
  }

  // =========================
  // Extra Dynamic Panel
  // =========================
  function renderExtraPanel(extraData) {
    const panel = els.extraPanel;
    const id = state.activeToolId;

    // Special case: Morse reference table when toggled on even without input
    if (id === 'morse' && state.options.morse.showRef) {
      panel.innerHTML = '';
      const title = document.createElement('h3');
      title.className = 'extra-panel-title';
      title.textContent = '國際摩斯密碼對照表（A–Z、0–9 與常用標點）';
      panel.appendChild(title);

      const grid = document.createElement('div');
      grid.className = 'morse-ref-grid';
      for (const [ch, code] of Object.entries(C.MORSE_MAP)) {
        const cell = document.createElement('div');
        cell.className = 'morse-ref-cell';
        const cSpan = document.createElement('strong');
        cSpan.textContent = ch;
        const codeSpan = document.createElement('span');
        codeSpan.style.color = 'var(--text-secondary)';
        codeSpan.textContent = code;
        cell.appendChild(cSpan);
        cell.appendChild(codeSpan);
        grid.appendChild(cell);
      }
      panel.appendChild(grid);
      panel.classList.remove('hidden');
      return;
    }

    if (!extraData) {
      panel.classList.add('hidden');
      panel.innerHTML = '';
      return;
    }

    panel.innerHTML = '';

    if (extraData.type === 'caesar') {
      const title = document.createElement('h3');
      title.className = 'extra-panel-title';
      title.textContent = '凱撒密碼暴力破解（全部 25 種位移還原結果）';
      panel.appendChild(title);

      const wrap = document.createElement('div');
      wrap.className = 'brute-table-wrap';
      const table = document.createElement('table');
      table.className = 'brute-table';
      table.innerHTML = '<thead><tr><th style="width:90px;">Shift</th><th>還原結果</th><th style="width:90px;">操作</th></tr></thead>';
      const tbody = document.createElement('tbody');

      extraData.rows.forEach((row) => {
        const tr = document.createElement('tr');
        const tdShift = document.createElement('td');
        tdShift.textContent = row.shift === 13 ? '13 (ROT13)' : String(row.shift);

        const tdText = document.createElement('td');
        tdText.className = 'mono';
        tdText.textContent = row.text;

        const tdAct = document.createElement('td');
        const copyBtn = document.createElement('button');
        copyBtn.type = 'button';
        copyBtn.className = 'btn btn-xs btn-secondary';
        copyBtn.textContent = '複製';
        copyBtn.addEventListener('click', () => copyText(row.text));
        tdAct.appendChild(copyBtn);

        tr.appendChild(tdShift);
        tr.appendChild(tdText);
        tr.appendChild(tdAct);
        tbody.appendChild(tr);
      });

      table.appendChild(tbody);
      wrap.appendChild(table);
      panel.appendChild(wrap);
      panel.classList.remove('hidden');
      return;
    }

    if (extraData.type === 'jwt') {
      const { header, payload, signature } = extraData.parsed;
      const titleRow = document.createElement('div');
      titleRow.className = 'extra-panel-title';
      const titleText = document.createElement('span');
      titleText.textContent = 'JWT 結構檢視';
      titleRow.appendChild(titleText);

      if (typeof payload.exp === 'number') {
        const expMs = payload.exp * 1000;
        const expired = Date.now() > expMs;
        const badge = document.createElement('span');
        badge.className = 'badge';
        badge.style.background = expired ? 'var(--danger-soft)' : 'var(--success-soft)';
        badge.style.color = expired ? 'var(--danger)' : 'var(--success)';
        badge.style.borderColor = 'transparent';
        badge.textContent = `${expired ? '已過期' : '未過期'}（${new Date(expMs).toLocaleString('zh-TW')}）`;
        titleRow.appendChild(badge);
      }
      panel.appendChild(titleRow);

      const grid = document.createElement('div');
      grid.className = 'jwt-grid';

      const headerBlock = document.createElement('div');
      headerBlock.className = 'jwt-block';
      headerBlock.innerHTML = '<h4>Header（演算法與類型）</h4>';
      const hPre = document.createElement('pre');
      hPre.textContent = JSON.stringify(header, null, 2);
      headerBlock.appendChild(hPre);

      const payloadBlock = document.createElement('div');
      payloadBlock.className = 'jwt-block';
      payloadBlock.innerHTML = '<h4>Payload（宣告資料）</h4>';
      const pPre = document.createElement('pre');
      pPre.textContent = JSON.stringify(payload, null, 2);
      payloadBlock.appendChild(pPre);

      grid.appendChild(headerBlock);
      grid.appendChild(payloadBlock);
      panel.appendChild(grid);

      const sigNote = document.createElement('p');
      sigNote.style.cssText = 'margin:10px 0 0;font-size:12.5px;color:var(--text-muted);font-family:var(--font-mono);word-break:break-all;';
      sigNote.textContent = `Signature: ${signature}`;
      panel.appendChild(sigNote);

      panel.classList.remove('hidden');
      return;
    }

    if (extraData.type === 'detect') {
      const title = document.createElement('h3');
      title.className = 'extra-panel-title';
      title.textContent = `偵測候選清單（找到 ${extraData.candidates.length} 種可能格式）`;
      panel.appendChild(title);

      const list = document.createElement('div');
      list.className = 'detect-list';

      extraData.candidates.forEach((cand) => {
        const card = document.createElement('div');
        card.className = 'detect-card';

        const top = document.createElement('div');
        top.className = 'detect-card-top';

        const left = document.createElement('div');
        left.innerHTML = `<strong>${escapeHtml(cand.label)}</strong> <span class="badge">信心度：${escapeHtml(cand.confidence)}</span>`;

        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'btn btn-xs btn-primary';
        btn.textContent = '以此工具開啟解碼';
        btn.addEventListener('click', () => {
          const targetTool = TOOL_MAP[cand.toolId];
          selectTool(cand.toolId, targetTool && targetTool.supportsMode ? 'decode' : undefined);
        });

        top.appendChild(left);
        top.appendChild(btn);

        const preview = document.createElement('pre');
        preview.className = 'detect-preview';
        preview.textContent = cand.preview;

        card.appendChild(top);
        card.appendChild(preview);
        list.appendChild(card);
      });

      // Always offer ROT13 quick peek
      if (extraData.rot13 && extraData.rot13 !== els.inputText.value) {
        const card = document.createElement('div');
        card.className = 'detect-card';
        const top = document.createElement('div');
        top.className = 'detect-card-top';
        top.innerHTML = '<strong>ROT13 參考（凱撒位移 13）</strong>';
        const preview = document.createElement('pre');
        preview.className = 'detect-preview';
        preview.textContent = extraData.rot13;
        card.appendChild(top);
        card.appendChild(preview);
        list.appendChild(card);
      }

      panel.appendChild(list);
      panel.classList.remove('hidden');
    }
  }

  // =========================
  // Event Wiring
  // =========================
  function bindEvents() {
    els.mobileMenuBtn.addEventListener('click', openMobileSidebar);
    els.sidebarBackdrop.addEventListener('click', closeMobileSidebar);

    els.themeToggle.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme') || 'dark';
      applyTheme(current === 'dark' ? 'light' : 'dark');
    });

    els.toolSearch.addEventListener('input', () => {
      state.searchQuery = els.toolSearch.value;
      renderSidebar();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === '/' && document.activeElement.tagName !== 'TEXTAREA' && document.activeElement.tagName !== 'INPUT') {
        e.preventDefault();
        els.toolSearch.focus();
      }
    });

    els.modeEncode.addEventListener('click', () => {
      if (state.mode === 'encode') return;
      state.mode = 'encode';
      updateModeButtons();
      runTransform();
    });

    els.modeDecode.addEventListener('click', () => {
      if (state.mode === 'decode') return;
      state.mode = 'decode';
      updateModeButtons();
      runTransform();
    });

    els.btnSwap.addEventListener('click', () => {
      const tool = TOOL_MAP[state.activeToolId];
      if (!tool.supportsMode) return;
      const out = els.outputText.value;
      if (!out) {
        showToast('目前沒有可交換的輸出內容');
        return;
      }
      els.inputText.value = out;
      state.mode = state.mode === 'encode' ? 'decode' : 'encode';
      updateModeButtons();
      runTransform();
    });

    els.btnSample.addEventListener('click', () => {
      const tool = TOOL_MAP[state.activeToolId];
      const useDecodeSample = tool.supportsMode && state.mode === 'decode' && tool.sampleDecode;
      els.inputText.value = useDecodeSample ? tool.sampleDecode : tool.sampleEncode;
      if (state.activeToolId === 'aes' && !state.options.aes.password) {
        state.options.aes.password = 'CipherBox-2026';
        renderToolOptions();
      }
      runTransform();
    });

    els.btnClear.addEventListener('click', () => {
      morsePlayer.stop();
      els.inputText.value = '';
      runTransform();
    });

    els.btnPaste.addEventListener('click', async () => {
      try {
        const text = await navigator.clipboard.readText();
        els.inputText.value = text;
        runTransform();
        showToast('已貼上剪貼簿內容');
      } catch {
        showToast('無法讀取剪貼簿，請直接使用 Ctrl+V 貼上');
        els.inputText.focus();
      }
    });

    els.btnCopy.addEventListener('click', () => copyText(els.outputText.value));

    els.btnDownload.addEventListener('click', () => {
      const content = els.outputText.value;
      if (!content) {
        showToast('沒有可下載的結果');
        return;
      }
      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `cipherbox-${state.activeToolId}-${Date.now()}.txt`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      showToast('已開始下載文字檔');
    });

    els.detectApplyBtn.addEventListener('click', () => {
      if (!state.detectedTop) return;
      const targetId = state.detectedTop.toolId;
      const targetTool = TOOL_MAP[targetId];
      selectTool(targetId, targetTool && targetTool.supportsMode ? 'decode' : undefined);
    });

    els.inputText.addEventListener('input', () => {
      runTransform();
    });
  }

  // =========================
  // Init
  // =========================
  initTheme();
  bindEvents();
  selectTool('morse');
})();
