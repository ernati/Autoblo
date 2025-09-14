/**
 * @fileoverview Block management functionality for Autoblo
 * Handles creation, state management, and UI interactions for operation blocks
 */

/**
 * Block management class
 */
class BlockManager {
  constructor() {
    this.blocks = [];
    this.blocksContainer = document.getElementById('blocks');
    this.emptyHint = document.getElementById('empty-hint');
    this.planDisplay = document.getElementById('plan');
  }

  /**
   * Add a new block to the interface
   */
  addBlock() {
    const tpl = document.getElementById('block-template');
    const node = tpl.content.cloneNode(true);
    const card = node.querySelector('.block');
    const idx = this.blocks.length + 1;
    card.dataset.id = crypto.randomUUID();
    card.querySelector('.block__caption').textContent = `블록 #${idx}`;

    const blockState = this._createBlockState(card);
    this.blocks.push(blockState);

    this._setupBlockEventListeners(card, blockState);
    this._appendBlockToDOM(card);

    this.emptyHint.style.display = 'none';
    this.renderPlan();
  }

  /**
   * Reset all blocks
   */
  resetAll() {
    this.blocks = [];
    this.blocksContainer.innerHTML = '';
    this.planDisplay.textContent = '';
    this.emptyHint.style.display = '';
  }

  /**
   * Get current plan data
   * @returns {Array} Plan payload for execution
   */
  getPlanPayload() {
    return this.blocks.map(b => {
      if (b.kind === 'mkdir') {
        return { kind:'mkdir', path: b.mkdirPath, recursive: !!b.mkdirRecursive };
      } else if (b.kind === 'copy') {
        return { kind:'copy', from: b.copyFrom, to: b.copyTo, ensure_parent: !!b.copyEnsureParent, overwrite: !!b.copyOverwrite };
      } else if (b.kind === 'move') {
        return { kind:'move', from: b.moveFrom, to: b.moveTo, ensure_parent: !!b.moveEnsureParent, overwrite: !!b.moveOverwrite };
      } else if (b.kind === 'delete') {
        return { kind:'delete', path: b.deletePath, force: !!b.deleteForce };
      }
    });
  }

  /**
   * Render the plan display
   */
  renderPlan() {
    if (this.blocks.length === 0) { 
      this.planDisplay.textContent = ''; 
      return; 
    }
    
    const lines = this.blocks.map((b, i) => {
      if (b.kind === 'mkdir') {
        return `#${i+1} [mkdir] ${b.mkdirPath}${b.mkdirRecursive ? ' (recursive)' : ''}`;
      } else if (b.kind === 'copy') {
        return `#${i+1} [copy] ${b.copyFrom} -> ${b.copyTo}${b.copyEnsureParent ? ' (ensure_parent)' : ''}${b.copyOverwrite ? ' (overwrite)' : ''}`;
      } else if (b.kind === 'move') {
        return `#${i+1} [move] ${b.moveFrom} -> ${b.moveTo}${b.moveEnsureParent ? ' (ensure_parent)' : ''}${b.moveOverwrite ? ' (overwrite)' : ''}`;
      } else if (b.kind === 'delete') {
        return `#${i+1} [delete] ${b.deletePath}${b.deleteForce ? ' (force)' : ''}`;
      }
    });
    this.planDisplay.textContent = lines.join('\n');
  }

  /**
   * Create initial block state
   * @private
   */
  _createBlockState(card) {
    return {
      id: card.dataset.id,
      kind: 'mkdir',
      mkdirPath: '',
      mkdirRecursive: true,
      copyFrom: '',
      copyTo: '',
      copyEnsureParent: true,
      copyOverwrite: false,
      moveFrom: '',
      moveTo: '',
      moveEnsureParent: true,
      moveOverwrite: false,
      deletePath: '',
      deleteForce: false,
    };
  }

  /**
   * Setup event listeners for a block
   * @private
   */
  _setupBlockEventListeners(card, blockState) {
    const elements = this._getBlockElements(card);
    
    // Kind selector change
    elements.selKind.addEventListener('change', () => {
      blockState.kind = elements.selKind.value;
      this._updateFieldVisibility(elements, blockState.kind);
      this.renderPlan();
    });

    // Input field listeners
    this._setupInputListeners(elements, blockState);
    
    // File selection button listeners
    this._setupFileSelectionListeners(elements, blockState);
  }

  /**
   * Get all relevant elements from a block card
   * @private
   */
  _getBlockElements(card) {
    return {
      selKind: card.querySelector('.select-kind'),
      mkdirWrap: card.querySelector('.fields-mkdir'),
      copyWrap: card.querySelector('.fields-copy'),
      moveWrap: card.querySelector('.fields-move'),
      deleteWrap: card.querySelector('.fields-delete'),
      inputMkdirPath: card.querySelector('.input-mkdir-path'),
      inputMkdirRec: card.querySelector('.input-mkdir-rec'),
      inputCopyFrom: card.querySelector('.input-copy-from'),
      inputCopyTo: card.querySelector('.input-copy-to'),
      inputCopyEns: card.querySelector('.input-copy-ensure'),
      inputCopyOver: card.querySelector('.input-copy-over'),
      inputMoveFrom: card.querySelector('.input-move-from'),
      inputMoveTo: card.querySelector('.input-move-to'),
      inputMoveEns: card.querySelector('.input-move-ensure'),
      inputMoveOver: card.querySelector('.input-move-over'),
      inputDeletePath: card.querySelector('.input-delete-path'),
      inputDeleteForce: card.querySelector('.input-delete-force'),
      btnBrowseFolder: card.querySelector('.btn-browse-folder'),
      btnBrowseAnys: card.querySelectorAll('.btn-browse-any'),
      btnBrowseSaves: card.querySelectorAll('.btn-browse-save')
    };
  }

  /**
   * Setup input field listeners
   * @private
   */
  _setupInputListeners(elements, blockState) {
    elements.inputMkdirPath.addEventListener('input', () => { 
      blockState.mkdirPath = elements.inputMkdirPath.value; 
      this.renderPlan(); 
    });
    elements.inputMkdirRec.addEventListener('change', () => { 
      blockState.mkdirRecursive = elements.inputMkdirRec.checked; 
      this.renderPlan(); 
    });

    elements.inputCopyFrom.addEventListener('input', () => { 
      blockState.copyFrom = elements.inputCopyFrom.value; 
      this.renderPlan(); 
    });
    elements.inputCopyTo.addEventListener('input', () => { 
      blockState.copyTo = elements.inputCopyTo.value; 
      this.renderPlan(); 
    });
    elements.inputCopyEns.addEventListener('change', () => { 
      blockState.copyEnsureParent = elements.inputCopyEns.checked; 
      this.renderPlan(); 
    });
    elements.inputCopyOver.addEventListener('change', () => { 
      blockState.copyOverwrite = elements.inputCopyOver.checked; 
      this.renderPlan(); 
    });

    elements.inputMoveFrom.addEventListener('input', () => { 
      blockState.moveFrom = elements.inputMoveFrom.value; 
      this.renderPlan(); 
    });
    elements.inputMoveTo.addEventListener('input', () => { 
      blockState.moveTo = elements.inputMoveTo.value; 
      this.renderPlan(); 
    });
    elements.inputMoveEns.addEventListener('change', () => { 
      blockState.moveEnsureParent = elements.inputMoveEns.checked; 
      this.renderPlan(); 
    });
    elements.inputMoveOver.addEventListener('change', () => { 
      blockState.moveOverwrite = elements.inputMoveOver.checked; 
      this.renderPlan(); 
    });

    elements.inputDeletePath.addEventListener('input', () => { 
      blockState.deletePath = elements.inputDeletePath.value; 
      this.renderPlan(); 
    });
    elements.inputDeleteForce.addEventListener('change', () => { 
      blockState.deleteForce = elements.inputDeleteForce.checked; 
      this.renderPlan(); 
    });
  }

  /**
   * Setup file selection button listeners
   * @private
   */
  _setupFileSelectionListeners(elements, blockState) {
    if (elements.btnBrowseFolder) {
      elements.btnBrowseFolder.addEventListener('click', async () => {
        const path = await window.api.selectFolder();
        if (path) {
          elements.inputMkdirPath.value = path;
          blockState.mkdirPath = path;
          this.renderPlan();
        }
      });
    }

    elements.btnBrowseAnys.forEach((btn, index) => {
      btn.addEventListener('click', async () => {
        let path = await window.api.selectFile();
        if (!path) {
          path = await window.api.selectFolder();
        }
        if (path) {
          if (index === 0) { // copy from
            elements.inputCopyFrom.value = path;
            blockState.copyFrom = path;
          } else if (index === 1) { // move from
            elements.inputMoveFrom.value = path;
            blockState.moveFrom = path;
          } else { // delete path
            elements.inputDeletePath.value = path;
            blockState.deletePath = path;
          }
          this.renderPlan();
        }
      });
    });

    elements.btnBrowseSaves.forEach((btn, index) => {
      btn.addEventListener('click', async () => {
        const path = await window.api.selectSaveFile();
        if (path) {
          if (index === 0) { // copy to
            elements.inputCopyTo.value = path;
            blockState.copyTo = path;
          } else { // move to
            elements.inputMoveTo.value = path;
            blockState.moveTo = path;
          }
          this.renderPlan();
        }
      });
    });
  }

  /**
   * Update field visibility based on operation kind
   * @private
   */
  _updateFieldVisibility(elements, kind) {
    const isCopy = kind === 'copy';
    const isMove = kind === 'move';
    const isDelete = kind === 'delete';
    
    elements.mkdirWrap.style.display = (!isCopy && !isMove && !isDelete) ? '' : 'none';
    elements.copyWrap.style.display = isCopy ? '' : 'none';
    elements.moveWrap.style.display = isMove ? '' : 'none';
    elements.deleteWrap.style.display = isDelete ? '' : 'none';
  }

  /**
   * Append block to DOM
   * @private
   */
  _appendBlockToDOM(card) {
    if (this.blocksContainer.children.length > 0) {
      const arrow = document.createElement('div');
      arrow.className = 'arrow';
      arrow.textContent = '→';
      this.blocksContainer.appendChild(arrow);
    }
    this.blocksContainer.appendChild(card);
  }
}
