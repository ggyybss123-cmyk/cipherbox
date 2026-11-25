# CipherBox — 密碼與編碼解碼工具箱

純前端實作的密碼與編碼轉換工具網站（HTML + CSS + JavaScript，無需安裝任何前端建置依賴，開啟即可使用，也支援直接部署至 GitHub Pages）。

## 功能特色

### 古典密碼
- **摩斯密碼 (Morse Code)**：支援國際標準摩斯密碼雙向轉換、自訂符號與對照表，內建 Web Audio API 音訊播放、可調 WPM 語速與閃燈提示。
- **凱撒密碼 (Caesar / ROT13)**：支援自訂位移（1–25）、ROT13 捷徑與一鍵暴力破解全部 25 種位移結果。
- **維吉尼亞密碼 (Vigenère)**：自訂英文字母關鍵字多表替換加解密。
- **柵欄密碼 (Rail Fence)**：支援自訂柵欄數與 Unicode / 中文字元換位。
- **埃特巴什碼 (Atbash)**：對稱字母鏡像替換（A↔Z）。

### 編碼轉換
- **Base64**：支援完整 UTF-8（繁體中文、Emoji）與 URL-Safe 變體。
- **Base32**：符合 RFC 4648 標準。
- **十六進位 (Hex)** & **二進位 (Binary)**：UTF-8 位元組雙向轉換。
- **URL 編解碼** & **HTML 實體編解碼**。

### 現代加密與分析
- **AES-256-GCM 加解密**：透過瀏覽器原生 Web Crypto API（PBKDF2-SHA256 衍生金鑰）於本地端加解密（需於 `localhost` 或 `HTTPS` 環境使用）。
- **JWT 權杖解碼器**：拆解 Header / Payload JSON 並顯示過期時間狀態。
- **SHA 雜湊摘要**：支援 SHA-256 / SHA-384 / SHA-512（提供純 JS SHA-256 離線備援）。
- **智慧編碼偵測 (Auto-Detect)**：自動辨識輸入內容可能的編碼格式並提供解碼預覽。

## 本地執行

直接以瀏覽器開啟 `index.html`，或啟動任意靜態伺服器（例如 `npx serve`、`python -m http.server`）：

```bash
python -m http.server 4173
```

開啟 `http://localhost:4173` 即可使用全部功能（包含 Web Crypto API）。
