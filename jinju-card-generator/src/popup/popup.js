// 初始化时获取选中的文本
document.addEventListener('DOMContentLoaded', async () => {
  const previewText = document.getElementById('preview-text');
  
  try {
    // 从storage中获取文本
    const data = await chrome.storage.local.get(['selectedText', 'hasLineBreaks']);
    
    if (data.selectedText) {
      previewText.textContent = data.selectedText;
      if (data.hasLineBreaks) {
        previewText.style.whiteSpace = 'pre-wrap';
      }
    } else {
      previewText.textContent = '请在网页中选择文本';
    }
  } catch (error) {
    console.error('初始化失败:', error);
    previewText.textContent = '加载失败，请重试';
  }
});

// 主题切换
document.querySelectorAll('#template-selector button').forEach(button => {
  button.addEventListener('click', (event) => {
    // 移除其他按钮的active类
    document.querySelectorAll('#template-selector button').forEach(btn => {
      btn.classList.remove('active');
    });
    
    // 添加当前按钮的active类
    event.target.classList.add('active');
    
    const template = event.target.getAttribute('data-template');
    const card = document.getElementById('card-preview');
    
    // 应用主题样式
    switch(template) {
      case 'simple':
        card.style.background = '#ffffff';
        card.style.fontFamily = "'Microsoft YaHei'";
        break;
      case 'vintage':
        card.style.background = '#F8F0E5';
        card.style.fontFamily = "'KaiTi'";
        break;
      case 'modern':
        card.style.background = 'linear-gradient(120deg, #fdfbfb 0%, #ebedee 100%)';
        card.style.fontFamily = "'SimHei'";
        break;
    }
  });
});

// 背景选择功能
document.querySelectorAll('.background-option').forEach(option => {
  option.addEventListener('click', (event) => {
    // 移除其他选项的active类
    document.querySelectorAll('.background-option').forEach(opt => {
      opt.classList.remove('active');
    });
    
    // 添加当前选项的active类
    option.classList.add('active');
    
    // 应用背景
    const background = option.getAttribute('data-background');
    const card = document.getElementById('card-preview');
    const previewText = document.getElementById('preview-text');
    
    // 设置背景
    card.style.background = background;
    
    // 根据背景类型调整文字颜色
    if (background.includes('gradient')) {
      // 对于渐变背景，使用默认文字颜色
      previewText.style.color = '#333';
    } else {
      // 对于纯色背景，计算亮度并调整文字颜色
      const rgb = background.match(/\d+/g);
      if (rgb) {
        const brightness = (parseInt(rgb[0]) * 299 + parseInt(rgb[1]) * 587 + parseInt(rgb[2]) * 114) / 1000;
        previewText.style.color = brightness > 128 ? '#333' : '#fff';
      }
    }
  });
});

// 字体设置
document.getElementById('font-family').addEventListener('change', (event) => {
  document.getElementById('preview-text').style.fontFamily = event.target.value;
});

// 文字对齐方式
document.getElementById('text-align').addEventListener('change', (event) => {
  document.getElementById('preview-text').style.textAlign = event.target.value;
});

// 导出功能
document.getElementById('export-btn').addEventListener('click', async () => {
  const format = document.getElementById('export-format').value;
  const quality = parseFloat(document.getElementById('export-quality').value);
  const card = document.getElementById('card-preview');
  
  try {
    // 添加加载状态
    const exportBtn = document.getElementById('export-btn');
    exportBtn.textContent = '导出中...';
    exportBtn.disabled = true;

    // 创建一个新的div用于导出
    const exportDiv = document.createElement('div');
    exportDiv.style.cssText = `
      position: fixed;
      left: -9999px;
      top: -9999px;
      width: 600px;
      padding: 40px;
      border-radius: 12px;
      box-sizing: border-box;
    `;

    // 处理背景
    const background = card.style.background;
    if (background.includes('gradient')) {
      // 对于渐变背景，直接设置background属性
      exportDiv.style.background = background;
    } else {
      // 对于纯色背景
      exportDiv.style.backgroundColor = background || '#ffffff';
    }

    // 复制文本内容和样式
    const textDiv = document.createElement('div');
    const originalText = document.getElementById('preview-text');
    textDiv.textContent = originalText.textContent;
    textDiv.style.cssText = `
      font-family: ${originalText.style.fontFamily || "'Microsoft YaHei'"};
      font-size: 18px;
      line-height: 1.6;
      color: ${originalText.style.color || '#333'};
      text-align: ${originalText.style.textAlign || 'left'};
      white-space: pre-wrap;
      word-wrap: break-word;
      padding: 20px;
    `;

    exportDiv.appendChild(textDiv);
    document.body.appendChild(exportDiv);

    // 确保内容已经渲染
    await new Promise(resolve => setTimeout(resolve, 100));

    // 使用html2canvas捕获
    const canvas = await html2canvas(exportDiv, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: null, // 设置为null以保持背景透明
      width: 600,
      height: exportDiv.offsetHeight,
      logging: false,
      onclone: function(clonedDoc) {
        const clonedElement = clonedDoc.querySelector('div');
        if (clonedElement) {
          clonedElement.style.position = 'static';
          clonedElement.style.left = '0';
          clonedElement.style.top = '0';
          // 确保渐变背景被正确复制
          clonedElement.style.background = background;
        }
      }
    });

    // 清理临时元素
    document.body.removeChild(exportDiv);

    // 创建下载链接
    const link = document.createElement('a');
    
    if (format === 'png') {
      link.href = canvas.toDataURL('image/png');
    } else if (format === 'jpeg') {
      link.href = canvas.toDataURL('image/jpeg', quality);
    } else {
      link.href = canvas.toDataURL('image/webp', quality);
    }
    
    link.download = `金句卡片_${new Date().getTime()}.${format}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // 恢复按钮状态
    exportBtn.textContent = '导出卡片';
    exportBtn.disabled = false;
  } catch (error) {
    console.error('导出失败:', error);
    alert('导出失败，请重试: ' + error.message);
    const exportBtn = document.getElementById('export-btn');
    exportBtn.textContent = '导出卡片';
    exportBtn.disabled = false;
  }
}); 