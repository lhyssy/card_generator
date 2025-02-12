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
    // 获取当前标签页的信息
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      const currentTab = tabs[0];
      
      // 计算弹窗位置
      const width = 450;
      const height = 650;
      const left = Math.round((screen.width - width) / 2);
      const top = Math.round((screen.height - height) / 2);

      // 创建新窗口
      chrome.windows.create({
        url: chrome.runtime.getURL('src/popup/popup.html'),
        type: 'popup',
        width: width,
        height: height,
        left: left,
        top: top,
        focused: true
      }, (popupWindow) => {
        // 存储弹窗ID，以便后续管理
        chrome.storage.local.set({ popupWindowId: popupWindow.id });
      });
    });
    return true; // 保持消息通道开启
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