// ユーティリティ関数: RGBをHEXに変換
function rgbToHex(r, g, b) {
  return '#' + [r, g, b].map(x => {
    const hex = x.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('');
}

// ユーティリティ関数: RGBをHSLに変換
function rgbToHsl(r, g, b) {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;

  if (max === min) {
    h = s = 0;
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }

  h = Math.round(h * 360);
  s = Math.round(s * 100);
  l = Math.round(l * 100);

  return `hsl(${h}, ${s}%, ${l}%)`;
}

// 色情報を表示
function displayColor(color) {
  const colorResult = document.getElementById('colorResult');
  const colorPreview = document.getElementById('colorPreview');
  const hexValue = document.getElementById('hexValue');
  const rgbValue = document.getElementById('rgbValue');
  const hslValue = document.getElementById('hslValue');

  // RGB値を抽出
  const rgb = color.match(/\d+/g).map(Number);
  const [r, g, b] = rgb;

  // 各形式に変換
  const hex = rgbToHex(r, g, b);
  const hsl = rgbToHsl(r, g, b);

  // 表示を更新
  colorPreview.style.backgroundColor = color;
  hexValue.value = hex;
  rgbValue.value = `rgb(${r}, ${g}, ${b})`;
  hslValue.value = hsl;

  colorResult.classList.remove('hidden');
}

// ステータスメッセージを表示
function showStatus(message, isError = false) {
  const status = document.getElementById('status');
  status.textContent = message;
  status.className = 'status ' + (isError ? 'error' : 'success');
  status.classList.remove('hidden');

  setTimeout(() => {
    status.classList.add('hidden');
  }, 3000);
}

// クリップボードにコピー
function copyToClipboard(text, btn) {
  navigator.clipboard.writeText(text).then(() => {
    if (btn) {
      btn.classList.add('copied');
      setTimeout(() => btn.classList.remove('copied'), 1200);
    }
  }).catch(err => {
    showStatus('コピーに失敗しました', true);
    console.error('Copy failed:', err);
  });
}

// 色を抽出（EyeDropper API使用）
async function pickColorFromScreen() {
  try {
    if (!window.EyeDropper) {
      showStatus('お使いのブラウザはEyeDropper APIに対応していません', true);
      return;
    }

    const eyeDropper = new EyeDropper();
    const result = await eyeDropper.open();

    if (result.sRGBHex) {
      // HEXからRGBに変換
      const hex = result.sRGBHex;
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);

      displayColor(`rgb(${r}, ${g}, ${b})`);
      showStatus('色を抽出しました！');
    }
  } catch (err) {
    if (err.name !== 'AbortError') {
      showStatus('色の抽出に失敗しました', true);
      console.error('Color picking failed:', err);
    }
  }
}

// ページから色を抽出
async function extractColorsFromPage() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    if (!tab?.url || /^(chrome|edge|about|devtools):/.test(tab.url)) {
      showStatus('このページでは色を抽出できません', true);
      return;
    }

    const results = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      function: extractColors,
    });

    if (results && results[0] && results[0].result && results[0].result.length > 0) {
      displayColorList(results[0].result);
    } else {
      showStatus('色が見つかりませんでした', true);
    }
  } catch (err) {
    showStatus('このページでは色を抽出できません', true);
  }
}

// ページ内の色を抽出する関数（コンテンツスクリプトとして実行）
function extractColors() {
  const hexSet = new Set();
  const elements = document.querySelectorAll('*');

  function toHex(r, g, b) {
    return '#' + [r, g, b].map(x => {
      const h = x.toString(16);
      return h.length === 1 ? '0' + h : h;
    }).join('');
  }

  function addColor(raw) {
    if (!raw || raw === 'transparent') return;
    // rgb/rgba の個別値を抽出（ボーダー等で複数連結されるケースにも対応）
    const rgbPattern = /rgba?\(\s*(\d+),\s*(\d+),\s*(\d+)(?:,\s*[\d.]+)?\)/g;
    let m;
    while ((m = rgbPattern.exec(raw)) !== null) {
      // 完全透明は除外
      if (/rgba/.test(m[0])) {
        const alpha = parseFloat(m[0].match(/,\s*([\d.]+)\s*\)$/)[1]);
        if (alpha === 0) continue;
      }
      hexSet.add(toHex(parseInt(m[1]), parseInt(m[2]), parseInt(m[3])));
    }
  }

  elements.forEach(element => {
    const styles = window.getComputedStyle(element);
    addColor(styles.backgroundColor);
    addColor(styles.color);
    addColor(styles.borderTopColor);
    addColor(styles.borderRightColor);
    addColor(styles.borderBottomColor);
    addColor(styles.borderLeftColor);
  });

  return Array.from(hexSet).slice(0, 50);
}

// HEXからHSLの数値を取得（ソート用）
function hexToHslValues(hex) {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;

  if (max === min) {
    h = s = 0;
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return { h, s, l };
}

// 色リストを表示
function displayColorList(colors) {
  const colorList = document.getElementById('colorList');
  const colorGrid = document.getElementById('colorGrid');

  colorGrid.innerHTML = '';

  // 色相 → 彩度 → 明度 でソート（無彩色は末尾にまとめる）
  const sorted = [...colors].sort((a, b) => {
    const ha = hexToHslValues(a);
    const hb = hexToHslValues(b);
    // 無彩色（彩度ほぼ0）は末尾へ
    const aGray = ha.s < 0.02 ? 1 : 0;
    const bGray = hb.s < 0.02 ? 1 : 0;
    if (aGray !== bGray) return aGray - bGray;
    if (aGray && bGray) return ha.l - hb.l;
    // 色相 → 明度 → 彩度
    if (Math.abs(ha.h - hb.h) > 0.01) return ha.h - hb.h;
    if (Math.abs(ha.l - hb.l) > 0.01) return ha.l - hb.l;
    return ha.s - hb.s;
  });

  sorted.forEach(hex => {
    const colorItem = document.createElement('div');
    colorItem.className = 'color-item';

    const colorBox = document.createElement('div');
    colorBox.className = 'color-box';
    colorBox.style.backgroundColor = hex;

    const colorLabel = document.createElement('div');
    colorLabel.className = 'color-label';
    colorLabel.textContent = hex;

    colorItem.appendChild(colorBox);
    colorItem.appendChild(colorLabel);

    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    colorItem.addEventListener('click', () => {
      displayColor(`rgb(${r}, ${g}, ${b})`);
      copyToClipboard(hex, null);
    });

    colorGrid.appendChild(colorItem);
  });

  colorList.classList.remove('hidden');
}

// イベントリスナー
document.addEventListener('DOMContentLoaded', () => {
  // カラーピッカーボタン
  document.getElementById('pickColor').addEventListener('click', pickColorFromScreen);

  // 色抽出ボタン
  document.getElementById('extractColors').addEventListener('click', extractColorsFromPage);

  // コピーボタン
  document.querySelectorAll('.copy-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-target');
      const input = document.getElementById(targetId);
      copyToClipboard(input.value, btn);
    });
  });
});