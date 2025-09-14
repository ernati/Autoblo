/**
 * @fileoverview Plan execution functionality for Autoblo
 * Handles the execution of file operation plans and output display
 */

/**
 * Plan executor class
 */
class PlanExecutor {
  constructor() {
    this.outputDisplay = document.getElementById('output');
  }

  /**
   * Execute a plan using the provided plan payload
   * @param {Array} planPayload - The plan operations to execute
   * @returns {Promise<void>}
   */
  async executePlan(planPayload) {
    if (!planPayload || planPayload.length === 0) {
      this._appendOutput('실행할 블록이 없습니다.');
      return;
    }

    this._appendOutput('=== 실행 시작 ===');

    try {
      const results = await window.api.runPlan(planPayload, /*continueOnFail*/ false);
      this._displayResults(results);
    } catch (error) {
      this._appendOutput(`실패: ${error?.message || String(error)}`);
    } finally {
      this._appendOutput('=== 실행 끝 ===');
    }
  }

  /**
   * Clear the output display
   */
  clearOutput() {
    this.outputDisplay.textContent = '';
  }

  /**
   * Display execution results
   * @private
   * @param {Array} results - Execution results from the main process
   */
  _displayResults(results) {
    for (const result of results) {
      const status = result.ok ? 'OK ' : 'ERR';
      const message = `${status} #${result.index + 1} ${result.message}`;
      this._appendOutput(message);
    }
  }

  /**
   * Append message to output display
   * @private
   * @param {string} message - Message to append
   */
  _appendOutput(message) {
    const currentText = this.outputDisplay.textContent;
    const separator = currentText ? '\n' : '';
    this.outputDisplay.textContent += separator + message;
    
    // Auto-scroll to bottom
    this.outputDisplay.scrollTop = this.outputDisplay.scrollHeight;
  }
}
