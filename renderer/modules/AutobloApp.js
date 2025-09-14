/**
 * @fileoverview Application controller for Autoblo
 * Main application class that coordinates between different modules
 */

/**
 * Main application controller
 */
class AutobloApp {
  constructor() {
    this.blockManager = new BlockManager();
    this.planExecutor = new PlanExecutor();
    this.initialized = false;
  }

  /**
   * Initialize the application
   */
  init() {
    if (this.initialized) {
      console.warn('Application already initialized');
      return;
    }

    this._setupEventListeners();
    this.initialized = true;
    console.log('Autoblo application initialized');
  }

  /**
   * Setup main application event listeners
   * @private
   */
  _setupEventListeners() {
    const btnAdd = document.getElementById('btn-add');
    const btnReset = document.getElementById('btn-reset');
    const btnRun = document.getElementById('btn-run');

    if (!btnAdd || !btnReset || !btnRun) {
      throw new Error('Required UI elements not found');
    }

    btnAdd.addEventListener('click', () => this._handleAddBlock());
    btnReset.addEventListener('click', () => this._handleReset());
    btnRun.addEventListener('click', () => this._handleRun());
  }

  /**
   * Handle add block button click
   * @private
   */
  _handleAddBlock() {
    try {
      this.blockManager.addBlock();
    } catch (error) {
      console.error('Failed to add block:', error);
      alert('블록 추가에 실패했습니다: ' + error.message);
    }
  }

  /**
   * Handle reset button click
   * @private
   */
  _handleReset() {
    try {
      this.blockManager.resetAll();
      this.planExecutor.clearOutput();
    } catch (error) {
      console.error('Failed to reset:', error);
      alert('초기화에 실패했습니다: ' + error.message);
    }
  }

  /**
   * Handle run button click
   * @private
   */
  async _handleRun() {
    try {
      const planPayload = this.blockManager.getPlanPayload();
      await this.planExecutor.executePlan(planPayload);
    } catch (error) {
      console.error('Failed to execute plan:', error);
      alert('계획 실행에 실패했습니다: ' + error.message);
    }
  }
}
