// Chat Resize Utility - Makes the chat sidebar resizable
export function initializeChatResizer() {
  const resizer = document.querySelector('.chat-resizer');
  const chatList = document.querySelector('.chat-list');
  const chatLayout = document.querySelector('.chat-layout');

  if (!resizer || !chatList || !chatLayout) return;

  let isResizing = false;

  const mouseDownHandler = () => {
    isResizing = true;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  };

  const mouseMoveHandler = (e) => {
    if (!isResizing) return;

    const container = chatLayout.getBoundingClientRect();
    const newWidth = ((e.clientX - container.left) / container.width) * 100;

    // Constrain width between 20% and 60%
    if (newWidth > 20 && newWidth < 60) {
      chatList.style.flex = `0 0 ${newWidth}%`;
      localStorage.setItem('chatListWidth', newWidth);
    }
  };

  const mouseUpHandler = () => {
    isResizing = false;
    document.body.style.cursor = 'auto';
    document.body.style.userSelect = 'auto';
  };

  // Restore saved width
  const savedWidth = localStorage.getItem('chatListWidth');
  if (savedWidth) {
    chatList.style.flex = `0 0 ${savedWidth}%`;
  }

  resizer.addEventListener('mousedown', mouseDownHandler);
  document.addEventListener('mousemove', mouseMoveHandler);
  document.addEventListener('mouseup', mouseUpHandler);

  // Cleanup function
  return () => {
    resizer.removeEventListener('mousedown', mouseDownHandler);
    document.removeEventListener('mousemove', mouseMoveHandler);
    document.removeEventListener('mouseup', mouseUpHandler);
  };
}

// Reset chat width to default
export function resetChatWidth() {
  const chatList = document.querySelector('.chat-list');
  if (chatList) {
    chatList.style.flex = '0 0 30%';
    localStorage.removeItem('chatListWidth');
  }
}
