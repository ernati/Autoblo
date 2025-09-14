/**
 * @fileoverview Main renderer entry point for Autoblo
 * Initializes the application and coordinates all modules
 */

// Import modules (these will be loaded via script tags in index.html)

/**
 * Initialize the application when DOM is loaded
 */
document.addEventListener('DOMContentLoaded', () => {
  try {
    const app = new AutobloApp();
    app.init();
  } catch (error) {
    console.error('Failed to initialize Autoblo application:', error);
    alert('애플리케이션 초기화에 실패했습니다. 콘솔을 확인해주세요.');
  }
});

/**
 * Handle any unhandled errors in the renderer process
 */
window.addEventListener('error', (event) => {
  console.error('Unhandled error in renderer:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection in renderer:', event.reason);
});
