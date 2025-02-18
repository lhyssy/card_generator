// 统一错误处理
const handleError = (error, context) => {
  console.error(`[${context}] Error:`, error);
  
  // 用户友好的错误消息
  const userMessages = {
    'Extension context invalidated': '扩展程序需要重新加载，请刷新页面',
    'Permission denied': '权限不足，请检查扩展程序权限设置',
    'Cannot access a chrome:// URL': '无法在浏览器内部页面使用此功能'
  };

  const message = userMessages[error.message] || '操作失败，请重试';
  
  // 显示错误提示
  if (typeof alert !== 'undefined') {
    alert(message);
  }
  
  return false;
};

export { handleError }; 