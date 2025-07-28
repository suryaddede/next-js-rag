// Embeddable Chat Widget for PHP/HTML integration
(function () {
  // Configuration
  const CHAT_CONFIG = {
    // Change this to your actual domain
    baseUrl: 'http://localhost:3000',
    embedPath: '/embed',
    // Customizable options
    position: 'bottom-right', // bottom-right, bottom-left, top-right, top-left
    buttonColor: '#2563eb',
    title: 'Chat Assistant',
    maxWidth: '450px',
    maxHeight: '650px',
    zIndex: 1000,
  };

  // Create iframe container
  function createChatWidget() {
    // Check if widget already exists
    if (document.getElementById('rag-chat-widget')) {
      return;
    }

    // Create iframe
    const iframe = document.createElement('iframe');
    iframe.id = 'rag-chat-widget';
    iframe.src = `${CHAT_CONFIG.baseUrl}${CHAT_CONFIG.embedPath}`;
    iframe.style.cssText = `
      position: fixed;
      ${getPositionStyles()}
      width: 100vw;
      height: 100vh;
      border: none;
      background: transparent;
      z-index: ${CHAT_CONFIG.zIndex};
      pointer-events: none;
    `;

    // Allow pointer events only for the chat elements
    iframe.onload = function () {
      iframe.style.pointerEvents = 'auto';
    };

    // Append to body
    document.body.appendChild(iframe);

    // Handle iframe communication (optional)
    window.addEventListener('message', function (event) {
      if (event.origin !== CHAT_CONFIG.baseUrl) return;

      // Handle messages from the chat widget if needed
      if (event.data.type === 'CHAT_RESIZE') {
        // Handle resize events
      }
    });
  }

  function getPositionStyles() {
    switch (CHAT_CONFIG.position) {
      case 'bottom-left':
        return 'bottom: 0; left: 0;';
      case 'top-right':
        return 'top: 0; right: 0;';
      case 'top-left':
        return 'top: 0; left: 0;';
      default:
        return 'bottom: 0; right: 0;';
    }
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createChatWidget);
  } else {
    createChatWidget();
  }

  // Global function to customize widget
  window.RAGChatWidget = {
    init: function (config) {
      Object.assign(CHAT_CONFIG, config);
      createChatWidget();
    },
    destroy: function () {
      const widget = document.getElementById('rag-chat-widget');
      if (widget) {
        widget.remove();
      }
    },
  };
})();
