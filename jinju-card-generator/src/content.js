// 创建浮动图标
const createFloatingIcon = (x, y) => {
  const icon = document.createElement('div');
  icon.className = 'jinju-floating-icon';
  icon.style.left = `${x}px`;
  icon.style.top = `${y}px`;
  icon.innerHTML = `
    <img src="${chrome.runtime.getURL('src/assets/icon.png')}" />
    <div class="jinju-tooltip">点击生成金句卡片</div>
  `;
  return icon;
};

// 监听文字选择
document.addEventListener('mouseup', (e) => {
  const selection = window.getSelection();
  const selectedText = selection.toString().trim();
  
  // 移除已存在的浮动图标
  const existingIcon = document.querySelector('.jinju-floating-icon');
  if (existingIcon) {
    existingIcon.remove();
  }

  if (selectedText) {
    // 保存选中的文本
    chrome.storage.local.set({ 
      selectedText,
      hasLineBreaks: selectedText.includes('\n')
    });

    // 创建并显示浮动图标
    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    const icon = createFloatingIcon(
      rect.right + window.scrollX,
      rect.top + window.scrollY - 30
    );

    // 点击图标打开弹窗
    icon.addEventListener('click', () => {
      // 保存选中的文本到storage
      chrome.storage.local.set({ 
        selectedText,
        hasLineBreaks: selectedText.includes('\n'),
        timestamp: new Date().getTime()
      }, () => {
        // 发送消息打开弹窗
        chrome.runtime.sendMessage({ 
          action: 'openPopup',
          source: 'floatingIcon'
        }, (response) => {
          if (chrome.runtime.lastError) {
            console.error('发送消息失败:', chrome.runtime.lastError);
          }
        });
      });
      
      // 添加点击动画效果
      icon.classList.add('clicked');
      setTimeout(() => icon.remove(), 300);
    });

    document.body.appendChild(icon);

    // 点击页面其他地方时移除图标
    document.addEventListener('mousedown', (e) => {
      if (!icon.contains(e.target)) {
        icon.remove();
      }
    }, { once: true });
  }
});

// 监听页面滚动，更新图标位置
let scrollTimeout;
window.addEventListener('scroll', () => {
  const icon = document.querySelector('.jinju-floating-icon');
  if (icon) {
    if (scrollTimeout) {
      clearTimeout(scrollTimeout);
    }
    icon.style.display = 'none';
    scrollTimeout = setTimeout(() => {
      icon.style.display = 'block';
    }, 150);
  }
}, { passive: true }); 