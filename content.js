// コンテンツスクリプト
// このスクリプトはページに注入され、ページ内の色情報にアクセスできます

// ページの読み込み完了を待つ
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

function init() {
  console.log('Color Picker content script loaded');
}

// メッセージリスナー（将来的な拡張用）
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'extractColors') {
    const colors = extractAllColors();
    sendResponse({ colors });
  }
  return true;
});

// ページ内のすべての色を抽出
function extractAllColors() {
  const colors = new Set();
  const elements = document.querySelectorAll('*');

  elements.forEach(element => {
    const styles = window.getComputedStyle(element);

    // 背景色
    const bgColor = styles.backgroundColor;
    if (bgColor && bgColor !== 'rgba(0, 0, 0, 0)' && bgColor !== 'transparent') {
      colors.add(bgColor);
    }

    // テキスト色
    const textColor = styles.color;
    if (textColor && textColor !== 'rgba(0, 0, 0, 0)') {
      colors.add(textColor);
    }

    // ボーダー色
    const borderColor = styles.borderColor;
    if (borderColor && borderColor !== 'rgba(0, 0, 0, 0)') {
      colors.add(borderColor);
    }

    // アウトライン色
    const outlineColor = styles.outlineColor;
    if (outlineColor && outlineColor !== 'rgba(0, 0, 0, 0)') {
      colors.add(outlineColor);
    }
  });

  return Array.from(colors);
}