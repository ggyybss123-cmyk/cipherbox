(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.CipherBox = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const textEncoder = new TextEncoder();
  const textDecoder = new TextDecoder('utf-8', { fatal: true });

  // =========================
  // 1. Morse Code
  // =========================
  const MORSE_MAP = {
    A: '.-',    B: '-...',  C: '-.-.',  D: '-..',   E: '.',
    F: '..-.',  G: '--.',   H: '....',  I: '..',    J: '.---',
    K: '-.-',   L: '.-..',  M: '--',    N: '-.',    O: '---',
    P: '.--.',  Q: '--.-',  R: '.-.',   S: '...',   T: '-',
    U: '..-',   V: '...-',  W: '.--',   X: '-..-',  Y: '-.--',
    Z: '--..',
    '0': '-----', '1': '.----', '2': '..---', '3': '...--', '4': '....-',
    '5': '.....', '6': '-....', '7': '--...', '8': '---..', '9': '----.',
    '.': '.-.-.-', ',': '--..--', '?': '..--..', "'": '.----.',
    '!': '-.-.--', '/': '-..-.',  '(': '-.--.',  ')': '-.--.-',
    '&': '.-...',  ':': '---...', ';': '-.-.-.', '=': '-...-',
    '+': '.-.-.',  '-': '-....-', '_': '..--.-', '"': '.-..-.',
    '$': '...-..-','@': '.--.-.'
  };

  const REVERSE_MORSE_MAP = Object.fromEntries(
    Object.entries(MORSE_MAP).map(([char, code]) => [code, char])
  );

  function morseEncode(text, options = {}) {
    if (!text) return '';
    const dot = options.dotChar || '.';
    const dash = options.dashChar || '-';
    const wordSep = options.wordSep || '/';

    const words = text.trim().split(/\s+/);
    const encodedWords = words.map((word) => {
      const tokens = [];
      for (const ch of word.toUpperCase()) {
        if (MORSE_MAP[ch]) {
          tokens.push(MORSE_MAP[ch].replace(/\./g, dot).replace(/-/g, dash));
        } else {
          tokens.push(`[${ch}]`);
        }
      }
      return tokens.join(' ');
    });
    return encodedWords.join(` ${wordSep} `);
  }

  function normalizeMorseSymbol(token, dotChar = '.', dashChar = '-') {
    let normalized = token;
    if (dotChar !== '.') {
      normalized = normalized.split(dotChar).join('.');
    }
    if (dashChar !== '-') {
      normalized = normalized.split(dashChar).join('-');
    }
    return normalized
      .replace(/[·•・]/g, '.')
      .replace(/[—–−_]/g, '-');
  }

  function morseDecode(morse, options = {}) {
    if (!morse.trim()) return '';
    const dotChar = options.dotChar || '.';
    const dashChar = options.dashChar || '-';
    const wordSep = options.wordSep || '/';

    // Split into words by explicit word separator (/ or | or 3+ spaces or newlines)
    const escapedSep = wordSep.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const wordSplitRegex = new RegExp(`(?:\\s*${escapedSep}\\s*|\\s*\\|\\s*|\\r?\\n|\\s{3,})`, 'g');
    const rawWords = morse.trim().split(wordSplitRegex).filter((w) => w.length > 0);

    return rawWords
      .map((word) => {
        const letters = word.trim().split(/\s+/);
        return letters
          .map((token) => {
            if (!token) return '';
            const norm = normalizeMorseSymbol(token, dotChar, dashChar);
            if (REVERSE_MORSE_MAP[norm]) {
              return REVERSE_MORSE_MAP[norm];
            }
            if (/^\[.+\]$/.test(token)) {
              return token.slice(1, -1);
            }
            return '?';
          })
          .join('');
      })
      .join(' ');
  }

  // =========================
  // 2. Caesar Cipher
  // =========================
  function shiftAsciiLetter(ch, shift) {
    const code = ch.charCodeAt(0);
    if (code >= 65 && code <= 90) {
      return String.fromCharCode(((code - 65 + shift) % 26 + 26) % 26 + 65);
    }
    if (code >= 97 && code <= 122) {
      return String.fromCharCode(((code - 97 + shift) % 26 + 26) % 26 + 97);
    }
    return ch;
  }

  function caesarTransform(text, shift = 3, decode = false) {
    const n = Number.isFinite(Number(shift)) ? Math.trunc(Number(shift)) : 3;
    const effectiveShift = decode ? -n : n;
    let out = '';
    for (const ch of text) {
      out += shiftAsciiLetter(ch, effectiveShift);
    }
    return out;
  }

  function caesarBruteForce(text) {
    const results = [];
    for (let shift = 1; shift <= 25; shift++) {
      results.push({
        shift,
        text: caesarTransform(text, shift, true)
      });
    }
    return results;
  }

  // =========================
  // 3. Vigenere Cipher
  // =========================
  function vigenereTransform(text, key, decode = false) {
    const cleanKey = (key || '').toUpperCase().replace(/[^A-Z]/g, '');
    if (!cleanKey) {
      throw new Error('請輸入至少包含一個英文字母（A–Z）的金鑰');
    }

    let keyIndex = 0;
    let out = '';
    for (const ch of text) {
      const code = ch.charCodeAt(0);
      const isUpper = code >= 65 && code <= 90;
      const isLower = code >= 97 && code <= 122;
      if (isUpper || isLower) {
        const shift = cleanKey.charCodeAt(keyIndex % cleanKey.length) - 65;
        out += shiftAsciiLetter(ch, decode ? -shift : shift);
        keyIndex++;
      } else {
        out += ch;
      }
    }
    return out;
  }

  // =========================
  // 4. Rail Fence Cipher
  // =========================
  function railFenceEncode(text, rails = 3) {
    const numRails = Math.trunc(Number(rails));
    if (!Number.isFinite(numRails) || numRails < 2) {
      throw new Error('柵欄數（Rails）必須為大於等於 2 的整數');
    }
    const chars = Array.from(text);
    if (chars.length <= 1 || numRails >= chars.length) return text;

    const rows = Array.from({ length: numRails }, () => []);
    let rail = 0;
    let dir = 1;
    for (const ch of chars) {
      rows[rail].push(ch);
      if (rail === 0) dir = 1;
      else if (rail === numRails - 1) dir = -1;
      rail += dir;
    }
    return rows.map((r) => r.join('')).join('');
  }

  function railFenceDecode(text, rails = 3) {
    const numRails = Math.trunc(Number(rails));
    if (!Number.isFinite(numRails) || numRails < 2) {
      throw new Error('柵欄數（Rails）必須為大於等於 2 的整數');
    }
    const chars = Array.from(text);
    const len = chars.length;
    if (len <= 1 || numRails >= len) return text;

    // Track which rail each index belongs to
    const railPattern = new Array(len);
    const railCounts = new Array(numRails).fill(0);
    let rail = 0;
    let dir = 1;
    for (let i = 0; i < len; i++) {
      railPattern[i] = rail;
      railCounts[rail]++;
      if (rail === 0) dir = 1;
      else if (rail === numRails - 1) dir = -1;
      rail += dir;
    }

    const railSlices = [];
    let cursor = 0;
    for (let r = 0; r < numRails; r++) {
      railSlices[r] = chars.slice(cursor, cursor + railCounts[r]);
      cursor += railCounts[r];
    }

    const railPos = new Array(numRails).fill(0);
    let out = '';
    for (let i = 0; i < len; i++) {
      const r = railPattern[i];
      out += railSlices[r][railPos[r]++];
    }
    return out;
  }

  // =========================
  // 5. Atbash Cipher
  // =========================
  function atbashTransform(text) {
    let out = '';
    for (const ch of text) {
      const code = ch.charCodeAt(0);
      if (code >= 65 && code <= 90) {
        out += String.fromCharCode(90 - (code - 65));
      } else if (code >= 97 && code <= 122) {
        out += String.fromCharCode(122 - (code - 97));
      } else {
        out += ch;
      }
    }
    return out;
  }

  // =========================
  // 6. Base64 (UTF-8 Safe)
  // =========================
  function bytesToBinaryString(bytes) {
    let bin = '';
    const chunkSize = 0x8000;
    for (let i = 0; i < bytes.length; i += chunkSize) {
      bin += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
    }
    return bin;
  }

  function base64Encode(text, options = {}) {
    const bytes = textEncoder.encode(text);
    let b64 = btoa(bytesToBinaryString(bytes));
    if (options.urlSafe) {
      b64 = b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    }
    return b64;
  }

  function base64Decode(input) {
    const cleaned = input.replace(/\s+/g, '').replace(/-/g, '+').replace(/_/g, '/');
    if (!cleaned) return '';
    if (!/^[A-Za-z0-9+/]*={0,2}$/.test(cleaned) || cleaned.length % 4 === 1) {
      throw new Error('無效的 Base64 字串格式');
    }
    const padLen = (4 - (cleaned.length % 4)) % 4;
    const padded = cleaned + '='.repeat(padLen);
    let binary;
    try {
      binary = atob(padded);
    } catch {
      throw new Error('Base64 解碼失敗，請確認輸入字元是否正確');
    }
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    try {
      return textDecoder.decode(bytes);
    } catch {
      throw new Error('解碼後的位元組不是有效的 UTF-8 文字');
    }
  }

  // =========================
  // 7. Base32 (RFC 4648)
  // =========================
  const BASE32_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

  function base32Encode(text) {
    const bytes = textEncoder.encode(text);
    if (bytes.length === 0) return '';
    let bits = 0;
    let value = 0;
    let output = '';

    for (const byte of bytes) {
      value = (value << 8) | byte;
      bits += 8;
      while (bits >= 5) {
        output += BASE32_ALPHABET[(value >>> (bits - 5)) & 31];
        bits -= 5;
      }
    }
    if (bits > 0) {
      output += BASE32_ALPHABET[(value << (5 - bits)) & 31];
    }
    while (output.length % 8 !== 0) {
      output += '=';
    }
    return output;
  }

  function base32Decode(input) {
    const cleaned = input.replace(/\s+/g, '').toUpperCase().replace(/=+$/, '');
    if (!cleaned) return '';
    let bits = 0;
    let value = 0;
    const outBytes = [];

    for (const ch of cleaned) {
      const idx = BASE32_ALPHABET.indexOf(ch);
      if (idx === -1) {
        throw new Error(`無效的 Base32 字元：「${ch}」`);
      }
      value = (value << 5) | idx;
      bits += 5;
      if (bits >= 8) {
        outBytes.push((value >>> (bits - 8)) & 255);
        bits -= 8;
      }
    }
    try {
      return textDecoder.decode(new Uint8Array(outBytes));
    } catch {
      throw new Error('Base32 解碼後的位元組不是有效的 UTF-8 文字');
    }
  }

  // =========================
  // 8. Hex & Binary (UTF-8)
  // =========================
  function hexEncode(text, options = {}) {
    const bytes = textEncoder.encode(text);
    const sep = options.spaceSeparated !== false ? ' ' : '';
    const upper = Boolean(options.uppercase);
    return Array.from(bytes, (b) => {
      const h = b.toString(16).padStart(2, '0');
      return upper ? h.toUpperCase() : h;
    }).join(sep);
  }

  function hexDecode(input) {
    const cleaned = input.replace(/0x/gi, '').replace(/[\s:,-]+/g, '');
    if (!cleaned) return '';
    if (!/^[0-9a-fA-F]+$/.test(cleaned) || cleaned.length % 2 !== 0) {
      throw new Error('無效的十六進位（Hex）格式，長度必須為偶數且僅包含 0–9、A–F');
    }
    const bytes = new Uint8Array(cleaned.length / 2);
    for (let i = 0; i < bytes.length; i++) {
      bytes[i] = parseInt(cleaned.slice(i * 2, i * 2 + 2), 16);
    }
    try {
      return textDecoder.decode(bytes);
    } catch {
      throw new Error('Hex 解碼後的位元組不是有效的 UTF-8 文字');
    }
  }

  function binaryEncode(text, options = {}) {
    const bytes = textEncoder.encode(text);
    const sep = options.spaceSeparated !== false ? ' ' : '';
    return Array.from(bytes, (b) => b.toString(2).padStart(8, '0')).join(sep);
  }

  function binaryDecode(input) {
    const cleaned = input.replace(/\s+/g, '');
    if (!cleaned) return '';
    if (!/^[01]+$/.test(cleaned) || cleaned.length % 8 !== 0) {
      throw new Error('無效的二進位格式，位元總數必須為 8 的倍數且僅包含 0 與 1');
    }
    const bytes = new Uint8Array(cleaned.length / 8);
    for (let i = 0; i < bytes.length; i++) {
      bytes[i] = parseInt(cleaned.slice(i * 8, i * 8 + 8), 2);
    }
    try {
      return textDecoder.decode(bytes);
    } catch {
      throw new Error('二進位解碼後的位元組不是有效的 UTF-8 文字');
    }
  }

  // =========================
  // 9. URL & HTML Entities
  // =========================
  function urlEncode(text) {
    return encodeURIComponent(text);
  }

  function urlDecode(input, options = {}) {
    const source = options.plusAsSpace ? input.replace(/\+/g, ' ') : input;
    try {
      return decodeURIComponent(source);
    } catch {
      throw new Error('URL 解碼失敗：包含不完整或無效的 % 編碼序列');
    }
  }

  const HTML_ENCODE_MAP = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  };

  const HTML_NAMED_DECODE = {
    amp: '&',
    lt: '<',
    gt: '>',
    quot: '"',
    apos: "'",
    nbsp: '\u00A0',
    copy: '©',
    reg: '®',
    trade: '™',
    mdash: '—',
    ndash: '–',
    hellip: '…'
  };

  function htmlEncode(text, options = {}) {
    const encodeNonAscii = Boolean(options.encodeNonAscii);
    let out = '';
    for (const ch of text) {
      if (HTML_ENCODE_MAP[ch]) {
        out += HTML_ENCODE_MAP[ch];
      } else if (encodeNonAscii && ch.codePointAt(0) > 127) {
        out += `&#${ch.codePointAt(0)};`;
      } else {
        out += ch;
      }
    }
    return out;
  }

  function htmlDecode(text) {
    return text.replace(/&(#x[0-9a-fA-F]+|#\d+|[a-zA-Z]+);/g, (match, entity) => {
      if (entity[0] === '#') {
        const isHex = entity[1] === 'x' || entity[1] === 'X';
        const codePoint = parseInt(entity.slice(isHex ? 2 : 1), isHex ? 16 : 10);
        if (Number.isFinite(codePoint) && codePoint >= 0 && codePoint <= 0x10FFFF) {
          return String.fromCodePoint(codePoint);
        }
        return match;
      }
      const key = entity.toLowerCase();
      return Object.prototype.hasOwnProperty.call(HTML_NAMED_DECODE, key)
        ? HTML_NAMED_DECODE[key]
        : match;
    });
  }

  // =========================
  // 10. JWT Decoder
  // =========================
  function jwtDecode(token) {
    const cleaned = token.trim();
    if (!cleaned) return null;
    const parts = cleaned.split('.');
    if (parts.length !== 3) {
      throw new Error('無效的 JWT 格式：權杖必須由 3 個以「.」分隔的區段組成（Header.Payload.Signature）');
    }
    let header, payload;
    try {
      header = JSON.parse(base64Decode(parts[0]));
    } catch {
      throw new Error('無法解析 JWT Header（必須為有效的 Base64URL JSON）');
    }
    try {
      payload = JSON.parse(base64Decode(parts[1]));
    } catch {
      throw new Error('無法解析 JWT Payload（必須為有效的 Base64URL JSON）');
    }
    return {
      header,
      payload,
      signature: parts[2]
    };
  }

  // =========================
  // 11. SHA-256 Pure JS Fallback & WebCrypto Hash
  // =========================
  function sha256FallbackBytes(data) {
    const K = new Uint32Array([
      0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
      0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
      0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
      0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
      0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
      0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
      0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
      0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
    ]);

    const rotr = (n, x) => (x >>> n) | (x << (32 - n));
    const H = new Uint32Array([
      0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a,
      0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19
    ]);

    const bitLen = data.length * 8;
    const paddedLen = Math.ceil((data.length + 9) / 64) * 64;
    const padded = new Uint8Array(paddedLen);
    padded.set(data);
    padded[data.length] = 0x80;
    const view = new DataView(padded.buffer);
    view.setUint32(paddedLen - 8, Math.floor(bitLen / 0x100000000), false);
    view.setUint32(paddedLen - 4, bitLen >>> 0, false);

    const w = new Uint32Array(64);
    for (let offset = 0; offset < paddedLen; offset += 64) {
      for (let i = 0; i < 16; i++) {
        w[i] = view.getUint32(offset + i * 4, false);
      }
      for (let i = 16; i < 64; i++) {
        const s0 = rotr(7, w[i - 15]) ^ rotr(18, w[i - 15]) ^ (w[i - 15] >>> 3);
        const s1 = rotr(17, w[i - 2]) ^ rotr(19, w[i - 2]) ^ (w[i - 2] >>> 10);
        w[i] = (w[i - 16] + s0 + w[i - 7] + s1) >>> 0;
      }

      let [a, b, c, d, e, f, g, h] = H;
      for (let i = 0; i < 64; i++) {
        const S1 = rotr(6, e) ^ rotr(11, e) ^ rotr(25, e);
        const ch = (e & f) ^ ((~e) & g);
        const temp1 = (h + S1 + ch + K[i] + w[i]) >>> 0;
        const S0 = rotr(2, a) ^ rotr(13, a) ^ rotr(22, a);
        const maj = (a & b) ^ (a & c) ^ (b & c);
        const temp2 = (S0 + maj) >>> 0;
        h = g;
        g = f;
        f = e;
        e = (d + temp1) >>> 0;
        d = c;
        c = b;
        b = a;
        a = (temp1 + temp2) >>> 0;
      }

      H[0] = (H[0] + a) >>> 0;
      H[1] = (H[1] + b) >>> 0;
      H[2] = (H[2] + c) >>> 0;
      H[3] = (H[3] + d) >>> 0;
      H[4] = (H[4] + e) >>> 0;
      H[5] = (H[5] + f) >>> 0;
      H[6] = (H[6] + g) >>> 0;
      H[7] = (H[7] + h) >>> 0;
    }

    return Array.from(H, (x) => x.toString(16).padStart(8, '0')).join('');
  }

  async function shaHash(text, algorithm = 'SHA-256', uppercase = false) {
    const bytes = textEncoder.encode(text);
    const subtle = typeof globalThis !== 'undefined' && globalThis.crypto && globalThis.crypto.subtle;
    let hex;
    if (subtle) {
      const digest = await subtle.digest(algorithm, bytes);
      hex = Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, '0')).join('');
    } else if (algorithm === 'SHA-256') {
      hex = sha256FallbackBytes(bytes);
    } else {
      throw new Error(`目前環境不支援 Web Crypto API，僅提供 SHA-256 離線備援計算`);
    }
    return uppercase ? hex.toUpperCase() : hex;
  }

  // =========================
  // 12. AES-256-GCM (Web Crypto)
  // =========================
  function getSubtleCrypto() {
    const subtle = typeof globalThis !== 'undefined' && globalThis.crypto && globalThis.crypto.subtle;
    if (!subtle) {
      throw new Error('瀏覽器安全限制：AES-GCM 需要 Web Crypto API（請使用 localhost 或 HTTPS 開啟此網頁）');
    }
    return subtle;
  }

  async function deriveAesKey(password, salt, usage) {
    const subtle = getSubtleCrypto();
    const keyMaterial = await subtle.importKey(
      'raw',
      textEncoder.encode(password),
      { name: 'PBKDF2' },
      false,
      ['deriveKey']
    );
    return subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt,
        iterations: 100000,
        hash: 'SHA-256'
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false,
      usage
    );
  }

  async function aesEncrypt(plaintext, password) {
    if (!password) {
      throw new Error('請輸入加密密碼（Password / Passphrase）');
    }
    const subtle = getSubtleCrypto();
    const salt = globalThis.crypto.getRandomValues(new Uint8Array(16));
    const iv = globalThis.crypto.getRandomValues(new Uint8Array(12));
    const key = await deriveAesKey(password, salt, ['encrypt']);
    const cipherBuf = await subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      textEncoder.encode(plaintext)
    );
    const cipherBytes = new Uint8Array(cipherBuf);
    const packed = new Uint8Array(16 + 12 + cipherBytes.length);
    packed.set(salt, 0);
    packed.set(iv, 16);
    packed.set(cipherBytes, 28);
    return 'CB1:' + btoa(bytesToBinaryString(packed));
  }

  async function aesDecrypt(ciphertext, password) {
    if (!password) {
      throw new Error('請輸入解密密碼（Password / Passphrase）');
    }
    const subtle = getSubtleCrypto();
    const trimmed = ciphertext.trim();
    const rawB64 = trimmed.startsWith('CB1:') ? trimmed.slice(4) : trimmed;
    let bin;
    try {
      bin = atob(rawB64.replace(/\s+/g, ''));
    } catch {
      throw new Error('AES 密文格式無效（非有效的 Base64 封裝格式）');
    }
    if (bin.length < 29) {
      throw new Error('AES 密文資料長度不足');
    }
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) {
      bytes[i] = bin.charCodeAt(i);
    }
    const salt = bytes.slice(0, 16);
    const iv = bytes.slice(16, 28);
    const data = bytes.slice(28);

    const key = await deriveAesKey(password, salt, ['decrypt']);
    try {
      const plainBuf = await subtle.decrypt({ name: 'AES-GCM', iv }, key, data);
      return textDecoder.decode(plainBuf);
    } catch {
      throw new Error('解密失敗：密碼錯誤或密文已遭竄改');
    }
  }

  // =========================
  // 13. Smart Encoding Auto-Detector
  // =========================
  function isMostlyReadable(str) {
    if (!str) return false;
    let printable = 0;
    for (const ch of str) {
      const cp = ch.codePointAt(0);
      if (cp === 9 || cp === 10 || cp === 13 || (cp >= 32 && cp !== 127)) {
        printable++;
      }
    }
    return printable / str.length >= 0.85;
  }

  function detectEncoding(input) {
    const trimmed = (input || '').trim();
    if (!trimmed) return [];

    const candidates = [];

    // AES CB1
    if (trimmed.startsWith('CB1:') && trimmed.length > 40) {
      candidates.push({
        toolId: 'aes',
        label: 'AES-256-GCM 密文 (CipherBox)',
        confidence: '高',
        preview: '需要輸入正確密碼進行解密'
      });
    }

    // JWT
    if (/^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]*$/.test(trimmed)) {
      try {
        const parsed = jwtDecode(trimmed);
        candidates.push({
          toolId: 'jwt',
          label: 'JWT 權杖 (JSON Web Token)',
          confidence: '極高',
          preview: JSON.stringify(parsed.payload)
        });
      } catch { /* ignore */ }
    }

    // Morse code
    if (/^[.\-·•—–_/|\s]+$/.test(trimmed) && /[.\-·•—–]/.test(trimmed)) {
      const decoded = morseDecode(trimmed);
      if (decoded && !/^[\s?]+$/.test(decoded)) {
        candidates.push({
          toolId: 'morse',
          label: '摩斯密碼 (Morse Code)',
          confidence: '高',
          preview: decoded
        });
      }
    }

    // Binary (8-bit groups)
    const compactBin = trimmed.replace(/\s+/g, '');
    if (/^[01]{8,}$/.test(compactBin) && compactBin.length % 8 === 0) {
      try {
        const decoded = binaryDecode(trimmed);
        if (decoded && isMostlyReadable(decoded)) {
          candidates.push({
            toolId: 'binary',
            label: '二進位 (8-bit Binary)',
            confidence: '高',
            preview: decoded
          });
        }
      } catch { /* ignore */ }
    }

    // Hex
    const compactHex = trimmed.replace(/0x/gi, '').replace(/[\s:,-]+/g, '');
    if (/^[0-9a-fA-F]{4,}$/.test(compactHex) && compactHex.length % 2 === 0 && /[a-fA-F]/.test(compactHex) || (/^[0-9a-fA-F]{2}(\s+[0-9a-fA-F]{2})+$/.test(trimmed))) {
      try {
        const decoded = hexDecode(trimmed);
        if (decoded && isMostlyReadable(decoded)) {
          candidates.push({
            toolId: 'hex',
            label: '十六進位 (Hex)',
            confidence: '中高',
            preview: decoded
          });
        }
      } catch { /* ignore */ }
    }

    // URL Encoding
    if (/%[0-9a-fA-F]{2}/.test(trimmed)) {
      try {
        const decoded = urlDecode(trimmed);
        if (decoded !== trimmed) {
          candidates.push({
            toolId: 'url',
            label: 'URL 編碼 (Percent Encoding)',
            confidence: '高',
            preview: decoded
          });
        }
      } catch { /* ignore */ }
    }

    // HTML Entities
    if (/&(#x[0-9a-fA-F]+|#\d+|[a-zA-Z]+);/.test(trimmed)) {
      const decoded = htmlDecode(trimmed);
      if (decoded !== trimmed) {
        candidates.push({
          toolId: 'html',
          label: 'HTML 實體編碼',
          confidence: '高',
          preview: decoded
        });
      }
    }

    // Base64
    const compactB64 = trimmed.replace(/\s+/g, '');
    if (compactB64.length >= 4 && /^[A-Za-z0-9+/_-]+={0,2}$/.test(compactB64) && compactB64.length % 4 !== 1) {
      try {
        const decoded = base64Decode(compactB64);
        if (decoded && isMostlyReadable(decoded) && decoded !== trimmed) {
          candidates.push({
            toolId: 'base64',
            label: 'Base64 編碼',
            confidence: compactB64.endsWith('=') || compactB64.length % 4 === 0 ? '高' : '中',
            preview: decoded
          });
        }
      } catch { /* ignore */ }
    }

    // Base32
    const compactB32 = trimmed.replace(/\s+/g, '').toUpperCase();
    if (compactB32.length >= 8 && /^[A-Z2-7]+=*$/.test(compactB32) && compactB32.length % 8 === 0) {
      try {
        const decoded = base32Decode(compactB32);
        if (decoded && isMostlyReadable(decoded) && decoded !== trimmed) {
          candidates.push({
            toolId: 'base32',
            label: 'Base32 編碼',
            confidence: '中',
            preview: decoded
          });
        }
      } catch { /* ignore */ }
    }

    return candidates;
  }

  return {
    MORSE_MAP,
    morseEncode,
    morseDecode,
    caesarTransform,
    caesarBruteForce,
    vigenereTransform,
    railFenceEncode,
    railFenceDecode,
    atbashTransform,
    base64Encode,
    base64Decode,
    base32Encode,
    base32Decode,
    hexEncode,
    hexDecode,
    binaryEncode,
    binaryDecode,
    urlEncode,
    urlDecode,
    htmlEncode,
    htmlDecode,
    jwtDecode,
    shaHash,
    aesEncrypt,
    aesDecrypt,
    detectEncoding
  };
});
