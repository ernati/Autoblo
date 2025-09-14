/**
 * @fileoverview Main process for Autoblo - File Operations Automation Tool
 * Handles file system operations (copy, move, delete, mkdir) through a plan-based system
 */

const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fsp = require('fs/promises');
const fs = require('fs'); // constants용

/** @typedef {{ index:number, ok:boolean, message:string }} StepResult */

/**
 * 폴더를 재귀적으로 복사하는 함수
 * @param {string} src 소스 폴더 경로
 * @param {string} dest 대상 폴더 경로
 * @param {boolean} overwrite 덮어쓰기 여부
 * @throws {Error} 유효하지 않은 경로나 권한 문제 시
 */
async function copyFolder(src, dest, overwrite) {
  try {
    await fsp.mkdir(dest, { recursive: true });
    
    const entries = await fsp.readdir(src, { withFileTypes: true });
    
    for (const entry of entries) {
      const srcPath = path.join(src, entry.name);
      const destPath = path.join(dest, entry.name);
      
      if (entry.isDirectory()) {
        await copyFolder(srcPath, destPath, overwrite);
      } else {
        const flags = overwrite ? 0 : fs.constants.COPYFILE_EXCL;
        await fsp.copyFile(srcPath, destPath, flags);
      }
    }
  } catch (error) {
    throw new Error(`폴더 복사 실패 (${src} -> ${dest}): ${error.message}`);
  }
}

/**
 * 파일 시스템 작업 계획을 실행하는 함수
 * @param {Array} plan 실행할 작업 계획 배열
 *  [{ kind:'mkdir', path:string, recursive:boolean } |
 *   { kind:'copy',  from:string, to:string, ensure_parent:boolean, overwrite:boolean } |
 *   { kind:'move',  from:string, to:string, ensure_parent:boolean, overwrite:boolean } |
 *   { kind:'delete', path:string, force:boolean }]
 * @param {boolean} continueOnFail 실패 시 계속 진행할지 여부
 * @returns {Promise<StepResult[]>} 각 단계별 실행 결과
 */
async function runPlan(plan, continueOnFail) {
  if (!Array.isArray(plan)) {
    throw new Error('계획은 배열이어야 합니다');
  }

  const out = [];

  outer: for (let i = 0; i < plan.length; i++) {
    const blk = plan[i];

    if (!blk || typeof blk !== 'object' || !blk.kind) {
      out.push({ index: i, ok: false, message: '유효하지 않은 블록 형식입니다' });
      if (!continueOnFail) break outer; else continue;
    }

    try {
      if (blk.kind === 'mkdir') {
        const result = await handleMkdirOperation(blk, i);
        out.push(result);
        if (!result.ok && !continueOnFail) break outer;
      }
      else if (blk.kind === 'copy') {
        const result = await handleCopyOperation(blk, i);
        out.push(result);
        if (!result.ok && !continueOnFail) break outer;
      }
      else if (blk.kind === 'move') {
        const result = await handleMoveOperation(blk, i);
        out.push(result);
        if (!result.ok && !continueOnFail) break outer;
      }
      else if (blk.kind === 'delete') {
        const result = await handleDeleteOperation(blk, i);
        out.push(result);
        if (!result.ok && !continueOnFail) break outer;
      }
      else {
        out.push({ index: i, ok: false, message: `알 수 없는 블록 타입: ${blk?.kind}` });
        if (!continueOnFail) break outer;
      }
    } catch (error) {
      out.push({ index: i, ok: false, message: `예상치 못한 오류: ${error.message}` });
      if (!continueOnFail) break outer;
    }
  }

  return out;
}

/**
 * mkdir 작업 처리
 * @param {object} blk 작업 블록
 * @param {number} index 블록 인덱스
 * @returns {Promise<StepResult>}
 */
async function handleMkdirOperation(blk, index) {
  const p = String(blk.path || '').trim();
  const recursive = !!blk.recursive;

  if (!p) {
    return { index, ok: false, message: 'mkdir: 경로가 비어 있습니다' };
  }

  // 경로 유효성 검사
  if (!isValidPath(p)) {
    return { index, ok: false, message: 'mkdir: 유효하지 않은 경로입니다' };
  }

  try {
    if (recursive) {
      await fsp.mkdir(p, { recursive: true });
    } else {
      await fsp.mkdir(p);
    }
    return { index, ok: true, message: `mkdir OK: ${p}` };
  } catch (e) {
    return { index, ok: false, message: `mkdir ERR: ${p} -> ${e.message}` };
  }
}

/**
 * copy 작업 처리
 * @param {object} blk 작업 블록
 * @param {number} index 블록 인덱스
 * @returns {Promise<StepResult>}
 */
async function handleCopyOperation(blk, index) {
  const from = String(blk.from || '').trim();
  const to = String(blk.to || '').trim();
  const ensureParent = !!blk.ensure_parent;
  const overwrite = !!blk.overwrite;

  if (!from || !to) {
    return { index, ok: false, message: 'copy: from/to 경로가 비어 있습니다' };
  }

  if (!isValidPath(from) || !isValidPath(to)) {
    return { index, ok: false, message: 'copy: 유효하지 않은 경로입니다' };
  }

  try {
    const stat = await fsp.stat(from);

    if (ensureParent) {
      const parent = path.dirname(to);
      await fsp.mkdir(parent, { recursive: true });
    }

    if (stat.isDirectory()) {
      // 폴더 복사
      await copyFolder(from, to, overwrite);
      return { index, ok: true, message: `copy OK (folder): ${from} -> ${to}` };
    } else {
      // 파일 복사
      const flags = overwrite ? 0 : fs.constants.COPYFILE_EXCL;
      await fsp.copyFile(from, to, flags);
      return { index, ok: true, message: `copy OK (file): ${from} -> ${to}` };
    }
  } catch (e) {
    return { index, ok: false, message: `copy ERR: ${from} -> ${to} : ${e.message}` };
  }
}

/**
 * move 작업 처리
 * @param {object} blk 작업 블록
 * @param {number} index 블록 인덱스
 * @returns {Promise<StepResult>}
 */
async function handleMoveOperation(blk, index) {
  const from = String(blk.from || '').trim();
  const to = String(blk.to || '').trim();
  const ensureParent = !!blk.ensure_parent;
  const overwrite = !!blk.overwrite;

  if (!from || !to) {
    return { index, ok: false, message: 'move: from/to 경로가 비어 있습니다' };
  }

  if (!isValidPath(from) || !isValidPath(to)) {
    return { index, ok: false, message: 'move: 유효하지 않은 경로입니다' };
  }

  try {
    const stat = await fsp.stat(from);

    if (ensureParent) {
      const parent = path.dirname(to);
      await fsp.mkdir(parent, { recursive: true });
    }

    // 대상이 이미 존재하는 경우 덮어쓰기 옵션 확인
    if (!overwrite) {
      try {
        await fsp.access(to);
        throw new Error('destination already exists');
      } catch (e) {
        if (e.code !== 'ENOENT') throw e;
      }
    }

    await fsp.rename(from, to);

    const typeMsg = stat.isDirectory() ? '(folder)' : '(file)';
    return { index, ok: true, message: `move OK ${typeMsg}: ${from} -> ${to}` };
  } catch (e) {
    return { index, ok: false, message: `move ERR: ${from} -> ${to} : ${e.message}` };
  }
}

/**
 * delete 작업 처리
 * @param {object} blk 작업 블록
 * @param {number} index 블록 인덱스
 * @returns {Promise<StepResult>}
 */
async function handleDeleteOperation(blk, index) {
  const path_to_delete = String(blk.path || '').trim();
  const force = !!blk.force;

  if (!path_to_delete) {
    return { index, ok: false, message: 'delete: 경로가 비어 있습니다' };
  }

  if (!isValidPath(path_to_delete)) {
    return { index, ok: false, message: 'delete: 유효하지 않은 경로입니다' };
  }

  try {
    const stat = await fsp.stat(path_to_delete);
    
    if (stat.isDirectory()) {
      if (force) {
        await fsp.rmdir(path_to_delete, { recursive: true });
      } else {
        await fsp.rmdir(path_to_delete);
      }
      return { index, ok: true, message: `delete OK (dir): ${path_to_delete}` };
    } else {
      await fsp.unlink(path_to_delete);
      return { index, ok: true, message: `delete OK (file): ${path_to_delete}` };
    }
  } catch (e) {
    if (!force && e.code === 'ENOENT') {
      return { index, ok: false, message: `delete ERR: ${path_to_delete} : file not found` };
    } else {
      return { index, ok: false, message: `delete ERR: ${path_to_delete} : ${e.message}` };
    }
  }
}

/**
 * 경로 유효성 검사
 * @param {string} filePath 검사할 경로
 * @returns {boolean} 유효한 경로인지 여부
 */
function isValidPath(filePath) {
  if (!filePath || typeof filePath !== 'string') return false;
  
  // 기본적인 보안 검사 - 상위 디렉토리 접근 방지
  if (filePath.includes('..') || filePath.includes('\0')) return false;
  
  try {
    // path.normalize로 정규화 가능한지 확인
    path.normalize(filePath);
    return true;
  } catch {
    return false;
  }
}

/**
 * Electron 메인 윈도우 생성
 */
function createWindow () {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 1000,
    minHeight: 680,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    }
  });

  win.removeMenu();
  win.loadFile(path.join(__dirname, 'renderer', 'index.html'));
}

app.whenReady().then(() => {
  // IPC 핸들러 등록
  ipcMain.handle('run-plan', async (_evt, { plan, continueOnFail }) => {
    try {
      return await runPlan(Array.isArray(plan) ? plan : [], !!continueOnFail);
    } catch (error) {
      console.error('Plan execution error:', error);
      return [{ index: 0, ok: false, message: `실행 오류: ${error.message}` }];
    }
  });

  // 파일 선택 다이얼로그
  ipcMain.handle('select-file', async (_evt, options) => {
    try {
      const result = await dialog.showOpenDialog(BrowserWindow.getFocusedWindow(), {
        properties: ['openFile'],
        filters: options?.filters || []
      });
      return result.canceled ? null : result.filePaths[0];
    } catch (error) {
      console.error('File selection error:', error);
      return null;
    }
  });

  // 폴더 선택 다이얼로그
  ipcMain.handle('select-folder', async (_evt) => {
    try {
      const result = await dialog.showOpenDialog(BrowserWindow.getFocusedWindow(), {
        properties: ['openDirectory']
      });
      return result.canceled ? null : result.filePaths[0];
    } catch (error) {
      console.error('Folder selection error:', error);
      return null;
    }
  });

  // 저장 파일 다이얼로그
  ipcMain.handle('select-save-file', async (_evt, options) => {
    try {
      const result = await dialog.showSaveDialog(BrowserWindow.getFocusedWindow(), {
        filters: options?.filters || []
      });
      return result.canceled ? null : result.filePath;
    } catch (error) {
      console.error('Save file selection error:', error);
      return null;
    }
  });

  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
