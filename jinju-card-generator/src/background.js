// 监听扩展安装
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "generateCard",
    title: "生成金句卡片",
    contexts: ["selection"]
  });
});

// 监听来自content script的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'openPopup') {
    try {
      // 计算新窗口的位置
      const width = 450;
      const height = 650;
      const left = Math.round((screen.availWidth - width) / 2);
      const top = Math.round((screen.availHeight - height) / 2);

      // 创建新窗口
      chrome.windows.create({
        url: chrome.runtime.getURL('src/popup/popup.html'),
        type: 'popup',
        width: width,
        height: height,
        left: left,
        top: top,
        focused: true
      });
    } catch (error) {
      console.error('创建弹窗失败:', error);
    }
    return true;
  }
});

// 监听右键菜单点击
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "generateCard") {
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ["src/content.js"]
    });
  }
});

// 监听窗口关闭
chrome.windows.onRemoved.addListener((windowId) => {
  chrome.storage.local.get('popupWindowId', (data) => {
    if (data.popupWindowId === windowId) {
      chrome.storage.local.remove('popupWindowId');
    }
  });
}); 