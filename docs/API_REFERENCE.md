# Autoblo API 참조 문서

## 📋 목차
1. [Main Process API](#main-process-api)
2. [Preload API](#preload-api)
3. [Renderer Modules](#renderer-modules)
4. [데이터 구조](#데이터-구조)
5. [이벤트 시스템](#이벤트-시스템)
6. [에러 처리](#에러-처리)

## 🔧 Main Process API

### 파일 시스템 작업 함수들

#### `copyFolder(src, dest, overwrite)`
폴더를 재귀적으로 복사합니다.

**매개변수:**
- `src` (string): 소스 폴더 경로
- `dest` (string): 대상 폴더 경로  
- `overwrite` (boolean): 덮어쓰기 여부

**반환값:** `Promise<void>`

**예외:**
- 유효하지 않은 경로
- 권한 부족
- 디스크 공간 부족

**예시:**
```javascript
try {
  await copyFolder('/source/folder', '/destination/folder', true);
  console.log('폴더 복사 완료');
} catch (error) {
  console.error('복사 실패:', error.message);
}
```

#### `runPlan(plan, continueOnFail)`
파일 시스템 작업 계획을 실행합니다.

**매개변수:**
- `plan` (Array): 작업 계획 배열
- `continueOnFail` (boolean): 실패 시 계속 진행 여부

**반환값:** `Promise<StepResult[]>`

**StepResult 구조:**
```javascript
{
  index: number,    // 단계 번호
  ok: boolean,      // 성공 여부
  message: string   // 결과 메시지
}
```

**지원되는 작업 타입:**

##### 1. 폴더 생성 (mkdir)
```javascript
{
  kind: 'mkdir',
  path: '/path/to/create',
  recursive: true  // 상위 폴더도 생성
}
```

##### 2. 파일 복사 (copy)
```javascript
{
  kind: 'copy',
  from: '/source/path',
  to: '/destination/path',
  ensure_parent: true,  // 대상 폴더 자동 생성
  overwrite: false      // 덮어쓰기 여부
}
```

##### 3. 파일 이동 (move)
```javascript
{
  kind: 'move',
  from: '/source/path',
  to: '/destination/path',
  ensure_parent: true,  // 대상 폴더 자동 생성
  overwrite: false      // 덮어쓰기 여부
}
```

##### 4. 파일 삭제 (delete)
```javascript
{
  kind: 'delete',
  path: '/path/to/delete',
  force: true  // 강제 삭제 (읽기 전용 포함)
}
```

### IPC 핸들러들

#### `run-plan`
계획 실행 IPC 핸들러

**입력:**
```javascript
{
  plan: Array,
  continueOnFail: boolean
}
```

**출력:** `StepResult[]`

#### `select-file`
파일 선택 다이얼로그 IPC 핸들러

**입력:**
```javascript
{
  filters?: Array<{
    name: string,
    extensions: string[]
  }>
}
```

**출력:** `string | null` (선택된 파일 경로 또는 null)

#### `select-folder`
폴더 선택 다이얼로그 IPC 핸들러

**입력:** 없음

**출력:** `string | null` (선택된 폴더 경로 또는 null)

## 🌉 Preload API

### `window.api` 객체

#### `runPlan(plan, continueOnFail)`
메인 프로세스의 계획 실행 함수를 호출합니다.

**타입 정의:**
```typescript
runPlan(
  plan: Array<PlanStep>, 
  continueOnFail: boolean
): Promise<StepResult[]>
```

**사용 예시:**
```javascript
const plan = [
  { kind: 'mkdir', path: '/test/folder', recursive: true },
  { kind: 'copy', from: '/src/file.txt', to: '/test/folder/file.txt', ensure_parent: true, overwrite: false }
];

try {
  const results = await window.api.runPlan(plan, false);
  results.forEach((result, index) => {
    console.log(`Step ${index + 1}: ${result.ok ? '성공' : '실패'} - ${result.message}`);
  });
} catch (error) {
  console.error('계획 실행 실패:', error);
}
```

#### `selectFile(options)`
파일 선택 다이얼로그를 엽니다.

**타입 정의:**
```typescript
selectFile(options?: {
  filters?: Array<{
    name: string;
    extensions: string[];
  }>;
}): Promise<string | null>
```

**사용 예시:**
```javascript
// 이미지 파일 선택
const imagePath = await window.api.selectFile({
  filters: [
    { name: 'Images', extensions: ['jpg', 'png', 'gif', 'bmp'] },
    { name: 'All Files', extensions: ['*'] }
  ]
});

if (imagePath) {
  console.log('선택된 이미지:', imagePath);
} else {
  console.log('파일 선택이 취소되었습니다.');
}

// 모든 파일 선택
const anyFile = await window.api.selectFile();
```

#### `selectFolder()`
폴더 선택 다이얼로그를 엽니다.

**타입 정의:**
```typescript
selectFolder(): Promise<string | null>
```

**사용 예시:**
```javascript
const folderPath = await window.api.selectFolder();
if (folderPath) {
  console.log('선택된 폴더:', folderPath);
} else {
  console.log('폴더 선택이 취소되었습니다.');
}
```

## 📦 Renderer Modules

### AutobloApp 클래스

#### 생성자
```javascript
constructor()
```
BlockManager와 PlanExecutor 인스턴스를 생성합니다.

#### 메서드

##### `init()`
애플리케이션을 초기화합니다.

**반환값:** `void`

**예외:** 
- 필수 UI 요소를 찾을 수 없는 경우

##### `_handleAddBlock()` (private)
새 블록 추가를 처리합니다.

##### `_handleReset()` (private)
애플리케이션 초기화를 처리합니다.

##### `_handleRun()` (private)
계획 실행을 처리합니다.

### BlockManager 클래스

#### 생성자
```javascript
constructor()
```
DOM 요소 참조와 블록 배열을 초기화합니다.

#### 프로퍼티
- `blocks: Array` - 현재 블록들의 상태 배열
- `blocksContainer: HTMLElement` - 블록 컨테이너 DOM 요소
- `emptyHint: HTMLElement` - 빈 상태 힌트 DOM 요소
- `planDisplay: HTMLElement` - 계획 표시 DOM 요소

#### 메서드

##### `addBlock()`
새 블록을 인터페이스에 추가합니다.

**반환값:** `void`

**동작:**
1. 템플릿에서 새 블록 복제
2. 고유 ID 할당
3. 이벤트 리스너 설정
4. DOM에 추가
5. 계획 다시 렌더링

##### `resetAll()`
모든 블록을 삭제합니다.

**반환값:** `void`

##### `getPlanPayload()`
현재 블록들로부터 실행 계획을 생성합니다.

**반환값:** `Array<PlanStep>`

**예시 출력:**
```javascript
[
  { kind: 'mkdir', path: '/test', recursive: true },
  { kind: 'copy', from: '/src', to: '/dest', ensure_parent: true, overwrite: false }
]
```

##### `renderPlan()`
계획 미리보기를 렌더링합니다.

**반환값:** `void`

**출력 형식:**
```
#1 [mkdir] /test/folder (recursive)
#2 [copy] /src/file.txt -> /dest/file.txt (ensure_parent)
#3 [delete] /old/file.txt (force)
```

#### 블록 상태 구조
```javascript
{
  id: string,              // 고유 ID (UUID)
  kind: string,            // 'mkdir' | 'copy' | 'move' | 'delete'
  
  // mkdir 옵션
  mkdirPath: string,
  mkdirRecursive: boolean,
  
  // copy 옵션
  copyFrom: string,
  copyTo: string,
  copyEnsureParent: boolean,
  copyOverwrite: boolean,
  
  // move 옵션
  moveFrom: string,
  moveTo: string,
  moveEnsureParent: boolean,
  moveOverwrite: boolean,
  
  // delete 옵션
  deletePath: string,
  deleteForce: boolean
}
```

### PlanExecutor 클래스

#### 생성자
```javascript
constructor()
```
출력 표시 DOM 요소 참조를 초기화합니다.

#### 프로퍼티
- `outputDisplay: HTMLElement` - 출력 표시 DOM 요소

#### 메서드

##### `executePlan(planPayload)`
제공된 계획을 실행합니다.

**매개변수:**
- `planPayload` (Array): 실행할 계획 배열

**반환값:** `Promise<void>`

**동작 과정:**
1. 빈 계획 검사
2. 실행 시작 메시지 출력
3. API를 통한 계획 실행
4. 결과 표시
5. 실행 완료 메시지 출력

##### `clearOutput()`
출력 표시를 지웁니다.

**반환값:** `void`

##### `_displayResults(results)` (private)
실행 결과를 표시합니다.

**매개변수:**
- `results` (Array): StepResult 배열

## 📊 데이터 구조

### PlanStep 인터페이스

#### MkdirStep
```javascript
{
  kind: 'mkdir',
  path: string,      // 생성할 폴더 경로
  recursive: boolean // 상위 폴더도 생성할지 여부
}
```

#### CopyStep
```javascript
{
  kind: 'copy',
  from: string,         // 소스 경로
  to: string,           // 대상 경로
  ensure_parent: boolean, // 대상 폴더 자동 생성
  overwrite: boolean    // 덮어쓰기 허용
}
```

#### MoveStep
```javascript
{
  kind: 'move',
  from: string,         // 소스 경로
  to: string,           // 대상 경로
  ensure_parent: boolean, // 대상 폴더 자동 생성
  overwrite: boolean    // 덮어쓰기 허용
}
```

#### DeleteStep
```javascript
{
  kind: 'delete',
  path: string,      // 삭제할 경로
  force: boolean     // 강제 삭제 (읽기 전용 포함)
}
```

### StepResult 인터페이스
```javascript
{
  index: number,    // 단계 번호 (0부터 시작)
  ok: boolean,      // 성공 여부
  message: string   // 상세 메시지
}
```

**성공 예시:**
```javascript
{
  index: 0,
  ok: true,
  message: "폴더 생성 완료: /test/folder"
}
```

**실패 예시:**
```javascript
{
  index: 1,
  ok: false,
  message: "파일 복사 실패 (/src -> /dest): 권한이 부족합니다"
}
```

## ⚡ 이벤트 시스템

### DOM 이벤트

#### 버튼 이벤트
```javascript
// 블록 추가 버튼
document.getElementById('btn-add').addEventListener('click', handler);

// 초기화 버튼
document.getElementById('btn-reset').addEventListener('click', handler);

// 실행 버튼
document.getElementById('btn-run').addEventListener('click', handler);
```

#### 블록 이벤트
각 블록은 다음 이벤트들을 가집니다:

```javascript
// 기능 변경
select.addEventListener('change', (e) => {
  blockState.kind = e.target.value;
  this.updateBlockUI(card, blockState);
  this.renderPlan();
});

// 경로 변경
input.addEventListener('input', (e) => {
  blockState[propertyName] = e.target.value;
  this.renderPlan();
});

// 체크박스 변경
checkbox.addEventListener('change', (e) => {
  blockState[propertyName] = e.target.checked;
  this.renderPlan();
});

// 블록 삭제
deleteBtn.addEventListener('click', () => {
  this.removeBlock(blockState.id);
});
```

### IPC 이벤트

#### Main → Renderer
- `plan-progress`: 계획 실행 진행 상황 (미구현)
- `plan-complete`: 계획 실행 완료

#### Renderer → Main
- `run-plan`: 계획 실행 요청
- `select-file`: 파일 선택 요청
- `select-folder`: 폴더 선택 요청

## 🚨 에러 처리

### 에러 타입

#### 1. 파일 시스템 에러
```javascript
// 파일 복사 실패
throw new Error(`파일 복사 실패 (${src} -> ${dest}): ${error.message}`);

// 파일 이동 실패
throw new Error(`파일 이동 실패 (${src} -> ${dest}): ${error.message}`);

// 파일 삭제 실패
throw new Error(`파일 삭제 실패 (${path}): ${error.message}`);

// 폴더 생성 실패
throw new Error(`폴더 생성 실패 (${path}): ${error.message}`);
```

#### 2. 검증 에러
```javascript
// 빈 경로
throw new Error('경로가 비어있습니다');

// 잘못된 경로
throw new Error('유효하지 않은 경로입니다');

// 권한 부족
throw new Error('파일에 접근할 권한이 없습니다');
```

#### 3. UI 에러
```javascript
// 필수 요소 누락
throw new Error('Required UI elements not found');

// 블록 상태 불일치
throw new Error('Block state inconsistency detected');
```

### 에러 처리 패턴

#### 1. Try-Catch 패턴
```javascript
async function safeOperation() {
  try {
    const result = await riskyOperation();
    return result;
  } catch (error) {
    console.error('Operation failed:', error);
    throw new Error(`Safe operation failed: ${error.message}`);
  }
}
```

#### 2. 사용자 알림 패턴
```javascript
try {
  await performAction();
} catch (error) {
  console.error('Action failed:', error);
  alert(`작업 실패: ${error.message}`);
}
```

#### 3. 결과 기반 패턴
```javascript
const result = {
  index: stepIndex,
  ok: false,
  message: `작업 실패: ${error.message}`
};
```

### 일반적인 에러 상황과 대응

#### 1. 파일이 이미 존재하는 경우
```javascript
// overwrite 옵션이 false인 경우
if (!overwrite && await fileExists(destPath)) {
  throw new Error('파일이 이미 존재합니다. 덮어쓰기 옵션을 확인하세요.');
}
```

#### 2. 권한 부족
```javascript
try {
  await fs.access(path, fs.constants.R_OK | fs.constants.W_OK);
} catch (error) {
  throw new Error('파일에 접근할 권한이 없습니다.');
}
```

#### 3. 디스크 공간 부족
```javascript
try {
  await fs.copyFile(src, dest);
} catch (error) {
  if (error.code === 'ENOSPC') {
    throw new Error('디스크 공간이 부족합니다.');
  }
  throw error;
}
```

---

**문서 버전**: 1.0.0  
**최종 업데이트**: 2025년 9월 14일  
**API 호환성**: Autoblo v0.1.0
