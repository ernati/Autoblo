/**
 * @fileoverview Preload script for Autoblo - Exposes safe APIs to renderer process
 * This script runs in a privileged context and bridges the gap between
 * the main process and the renderer process while maintaining security.
 */

const { contextBridge, ipcRenderer } = require('electron');

/**
 * Exposed API for the renderer process
 * All functions are wrapped to ensure type safety and error handling
 */
contextBridge.exposeInMainWorld('api', {
  /**
   * 파일 시스템 작업 계획을 실행합니다
   * @param {Array<Object>} plan - 실행할 작업 계획 배열
   * @param {boolean} continueOnFail - 실패 시 계속 진행할지 여부
   * @returns {Promise<Array<{index:number, ok:boolean, message:string}>>} 각 단계별 실행 결과
   * @example
   * const plan = [
   *   { kind: 'mkdir', path: '/path/to/dir', recursive: true },
   *   { kind: 'copy', from: '/src', to: '/dest', ensure_parent: true, overwrite: false }
   * ];
   * const results = await window.api.runPlan(plan, false);
   */
  runPlan: (plan, continueOnFail) =>
    ipcRenderer.invoke('run-plan', { plan, continueOnFail }),

  /**
   * 파일 선택 다이얼로그를 엽니다
   * @param {Object} [options] - 필터 옵션
   * @param {Array<{name: string, extensions: string[]}>} [options.filters] - 파일 확장자 필터
   * @returns {Promise<string|null>} 선택된 파일 경로 또는 null (취소 시)
   * @example
   * const filePath = await window.api.selectFile({
   *   filters: [{ name: 'Images', extensions: ['jpg', 'png', 'gif'] }]
   * });
   */
  selectFile: (options) =>
    ipcRenderer.invoke('select-file', options),

  /**
   * 폴더 선택 다이얼로그를 엽니다
   * @returns {Promise<string|null>} 선택된 폴더 경로 또는 null (취소 시)
   * @example
   * const folderPath = await window.api.selectFolder();
   */
  selectFolder: () =>
    ipcRenderer.invoke('select-folder'),

  /**
   * 저장 파일 다이얼로그를 엽니다
   * @param {Object} [options] - 필터 옵션
   * @param {Array<{name: string, extensions: string[]}>} [options.filters] - 파일 확장자 필터
   * @returns {Promise<string|null>} 선택된 저장 파일 경로 또는 null (취소 시)
   * @example
   * const savePath = await window.api.selectSaveFile({
   *   filters: [{ name: 'Text Files', extensions: ['txt'] }]
   * });
   */
  selectSaveFile: (options) =>
    ipcRenderer.invoke('select-save-file', options),
});
