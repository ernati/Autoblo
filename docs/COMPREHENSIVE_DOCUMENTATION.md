# Autoblo - 블록 시퀀스 실행기 종합 문서

## 📋 목차
1. [프로젝트 개요](#프로젝트-개요)
2. [아키텍처](#아키텍처)
3. [파일 구조](#파일-구조)
4. [설치 및 실행](#설치-및-실행)
5. [기능 상세](#기능-상세)
6. [API 문서](#api-문서)
7. [사용자 인터페이스](#사용자-인터페이스)
8. [개발자 가이드](#개발자-가이드)
9. [배포 및 빌드](#배포-및-빌드)
10. [문제 해결](#문제-해결)

## 🎯 프로젝트 개요

### 프로젝트 정보
- **이름**: Autoblo (Automatic Block Sequence Executor)
- **버전**: 0.1.0
- **플랫폼**: Electron (Cross-platform Desktop Application)
- **라이선스**: MIT
- **주요 언어**: JavaScript, HTML, CSS

### 목적
Autoblo는 파일 시스템 작업을 자동화하기 위한 직관적인 GUI 도구입니다. 사용자는 복잡한 파일 복사, 이동, 삭제 작업을 블록 단위로 구성하여 순차적으로 실행할 수 있습니다.

### 주요 특징
- **시각적 블록 인터페이스**: 직관적인 드래그 앤 드롭 방식
- **실시간 계획 미리보기**: 실행 전 작업 내용 확인
- **일괄 실행**: 모든 작업을 순차적으로 자동 실행
- **크로스 플랫폼**: Windows, macOS, Linux 지원
- **안전한 파일 작업**: 덮어쓰기 보호 및 강제 삭제 옵션

## 🏗️ 아키텍처

### 전체 구조
```
┌─────────────────┐    IPC     ┌─────────────────┐
│   Main Process  │ ←────────→ │ Renderer Process│
│   (main.js)     │            │ (renderer/)     │
│                 │            │                 │
│ - File Operations│           │ - UI Management │
│ - Dialog Handling│           │ - User Interaction│
│ - Plan Execution │           │ - Block Management│
└─────────────────┘            └─────────────────┘
         ↓                              ↑
┌─────────────────┐            ┌─────────────────┐
│  File System    │            │   Preload.js    │
│                 │            │ (Security Bridge)│
└─────────────────┘            └─────────────────┘
```

### 모듈 구성
1. **Main Process** (`main.js`): 파일 시스템 작업 실행
2. **Preload Script** (`preload.js`): 보안 브리지 역할
3. **Renderer Process**: 사용자 인터페이스
   - `AutobloApp.js`: 애플리케이션 컨트롤러
   - `BlockManager.js`: 블록 관리
   - `PlanExecutor.js`: 계획 실행

## 📁 파일 구조

```
Autoblo/
├── 📄 main.js                    # 메인 프로세스 (365 lines)
├── 📄 preload.js                 # 프리로드 스크립트 (64 lines)
├── 📄 package.json               # 프로젝트 설정
├── 📄 README.md                  # 프로젝트 설명 (148 lines)
├── 📄 .gitignore                 # Git 무시 파일 (66 lines)
├── 📁 renderer/                  # 렌더러 프로세스
│   ├── 📄 index.html             # 메인 HTML (127 lines)
│   ├── 📄 renderer.js            # 렌더러 진입점
│   ├── 📄 style.css              # 스타일시트 (348 lines)
│   └── 📁 modules/               # 모듈화된 JS 파일
│       ├── 📄 AutobloApp.js      # 앱 컨트롤러 (100+ lines)
│       ├── 📄 BlockManager.js    # 블록 관리 (304 lines)
│       └── 📄 PlanExecutor.js    # 실행 관리 (71 lines)
├── 📁 docs/                      # 문서 폴더 (현재 비어있음)
├── 📁 TestArea2/                 # 테스트 영역 (현재 비어있음)
└── 📁 node_modules/              # 의존성 (npm 설치 후 생성)
```

## 🚀 설치 및 실행

### 시스템 요구사항
- **Node.js**: 18.0.0 이상
- **npm**: 8.0.0 이상 또는 yarn
- **운영체제**: Windows 10+, macOS 10.15+, Linux (Ubuntu 18.04+)

### 설치 과정

1. **저장소 클론**
   ```bash
   git clone https://github.com/your-username/autoblo.git
   cd autoblo
   ```

2. **의존성 설치**
   ```bash
   npm install
   ```

3. **개발 모드 실행**
   ```bash
   npm run dev
   # 또는
   npm start
   ```

4. **배포 빌드**
   ```bash
   npm run pack    # 패키징만
   npm run dist    # 배포용 빌드
   ```

### 빌드 설정
```json
{
  "build": {
    "appId": "com.autoblo.electron",
    "productName": "Autoblo",
    "directories": {
      "output": "dist"
    },
    "files": [
      "main.js",
      "preload.js",
      "renderer/",
      "package.json"
    ]
  }
}
```

## ⚙️ 기능 상세

### 1. 폴더 생성 (mkdir)
- **기능**: 단일 또는 재귀적 폴더 생성
- **옵션**:
  - `recursive`: 상위 폴더도 함께 생성

### 2. 파일 복사 (copy)
- **기능**: 파일 및 폴더 복사
- **옵션**:
  - `ensure_parent`: 대상 폴더 자동 생성
  - `overwrite`: 기존 파일 덮어쓰기

### 3. 파일 이동 (move)
- **기능**: 파일 및 폴더 이동
- **옵션**:
  - `ensure_parent`: 대상 폴더 자동 생성
  - `overwrite`: 기존 파일 덮어쓰기

### 4. 파일 삭제 (delete)
- **기능**: 파일 및 폴더 삭제
- **옵션**:
  - `force`: 강제 삭제 (읽기 전용 파일 포함)

## 📚 API 문서

### Main Process API

#### `runPlan(plan, continueOnFail)`
파일 시스템 작업 계획을 실행합니다.

**매개변수:**
- `plan`: 작업 계획 배열
- `continueOnFail`: 실패 시 계속 진행 여부

**반환값:**
```javascript
StepResult[] = [
  { index: number, ok: boolean, message: string }
]
```

**계획 형식:**
```javascript
// 폴더 생성
{ kind: 'mkdir', path: string, recursive: boolean }

// 파일 복사
{ kind: 'copy', from: string, to: string, ensure_parent: boolean, overwrite: boolean }

// 파일 이동
{ kind: 'move', from: string, to: string, ensure_parent: boolean, overwrite: boolean }

// 파일 삭제
{ kind: 'delete', path: string, force: boolean }
```

### Preload API

#### `window.api.runPlan(plan, continueOnFail)`
메인 프로세스의 runPlan을 호출합니다.

#### `window.api.selectFile(options)`
파일 선택 다이얼로그를 엽니다.

**매개변수:**
```javascript
options = {
  filters: [{ name: string, extensions: string[] }]
}
```

#### `window.api.selectFolder()`
폴더 선택 다이얼로그를 엽니다.

### Renderer Process 모듈

#### AutobloApp
- **역할**: 전체 애플리케이션 관리
- **주요 메서드**:
  - `init()`: 애플리케이션 초기화
  - `_handleAddBlock()`: 블록 추가 처리
  - `_handleReset()`: 초기화 처리
  - `_handleRun()`: 실행 처리

#### BlockManager
- **역할**: 블록 생성 및 관리
- **주요 메서드**:
  - `addBlock()`: 새 블록 추가
  - `resetAll()`: 모든 블록 삭제
  - `getPlanPayload()`: 실행 계획 생성
  - `renderPlan()`: 계획 미리보기 렌더링

#### PlanExecutor
- **역할**: 계획 실행 및 결과 표시
- **주요 메서드**:
  - `executePlan(planPayload)`: 계획 실행
  - `clearOutput()`: 출력 화면 지우기

## 🎨 사용자 인터페이스

### 색상 팔레트 (Dark Theme)
```css
:root {
  --bg: #0f172a;          /* 메인 배경 */
  --bg-2: #111827;        /* 보조 배경 */
  --panel: #0b1220;       /* 패널 배경 */
  --card: #0b1220;        /* 카드 배경 */
  --border: #1f2937;      /* 테두리 */
  --muted: #94a3b8;       /* 회색 텍스트 */
  --text: #e5e7eb;        /* 기본 텍스트 */
  --primary: #0ea5e9;     /* 주요 색상 */
  --danger: #ef4444;      /* 위험 색상 */
  --ghost: #334155;       /* 고스트 버튼 */
}
```

### 레이아웃 구조
```
┌─────────────────────────────────────────────────────┐
│ Header (Topbar)                                     │
│ ┌─ Title ────┐ ┌─ Actions ──────────────────────┐   │
│ │ Autoblo    │ │ [+ 추가] [초기화] [실행]        │   │
│ └────────────┘ └─────────────────────────────────┘   │
├─────────────────────────────────────────────────────┤
│ Main Container                                      │
│ ┌─ Lane (시퀀스) ─────┐ ┌─ Panel (계획/출력) ──────┐ │
│ │                    │ │ ┌─ 계획(Plan) ─────────┐ │ │
│ │ [Block 1]          │ │ │ #1 [mkdir] /path    │ │ │
│ │ [Block 2]          │ │ │ #2 [copy] src->dest │ │ │
│ │ [Block 3]          │ │ └───────────────────────┘ │ │
│ │                    │ │ ┌─ 출력(Output) ────────┐ │ │
│ │                    │ │ │ === 실행 시작 ===    │ │ │
│ │                    │ │ │ #1 성공              │ │ │
│ │                    │ │ │ #2 성공              │ │ │
│ │                    │ │ └───────────────────────┘ │ │
│ └────────────────────┘ └─────────────────────────────┘ │
└─────────────────────────────────────────────────────┘
```

### 블록 UI 요소
각 블록은 다음 요소들로 구성됩니다:
1. **헤더**: 블록 번호 표시
2. **기능 선택**: 드롭다운 (mkdir/copy/move/delete)
3. **경로 입력**: 파일/폴더 경로 선택
4. **옵션 체크박스**: 각 기능별 옵션
5. **삭제 버튼**: 개별 블록 제거

## 👨‍💻 개발자 가이드

### 개발 환경 설정

1. **VSCode 권장 확장**:
   - ES6 String HTML
   - Prettier
   - ESLint

2. **디버깅 설정**:
   ```json
   // .vscode/launch.json
   {
     "version": "0.2.0",
     "configurations": [
       {
         "name": "Electron Main",
         "type": "node",
         "request": "launch",
         "program": "${workspaceFolder}/main.js",
         "runtimeExecutable": "${workspaceFolder}/node_modules/.bin/electron"
       }
     ]
   }
   ```

### 코드 스타일

#### JavaScript
- ES6+ 문법 사용
- JSDoc 주석 필수
- 함수형 프로그래밍 스타일 권장
- 에러 핸들링 필수

```javascript
/**
 * 예시 함수 설명
 * @param {string} path - 파일 경로
 * @param {boolean} recursive - 재귀 옵션
 * @returns {Promise<boolean>} 성공 여부
 * @throws {Error} 유효하지 않은 경로 시
 */
async function createDirectory(path, recursive) {
  try {
    await fsp.mkdir(path, { recursive });
    return true;
  } catch (error) {
    throw new Error(`폴더 생성 실패: ${error.message}`);
  }
}
```

#### CSS
- BEM 방법론 사용
- CSS 변수 적극 활용
- 모바일 우선 반응형 디자인

```css
/* Block */
.block { }

/* Element */
.block__header { }
.block__caption { }

/* Modifier */
.block--active { }
.block__header--collapsed { }
```

### 새 기능 추가 가이드

1. **Main Process 작업 추가**:
   ```javascript
   // main.js에 새 작업 타입 추가
   if (step.kind === 'new-operation') {
     // 새 작업 로직 구현
     result = await performNewOperation(step);
   }
   ```

2. **Renderer Process UI 추가**:
   ```javascript
   // BlockManager.js에 새 옵션 추가
   if (blockState.kind === 'new-operation') {
     return `#${i+1} [new-operation] ${blockState.newOperationPath}`;
   }
   ```

3. **HTML 템플릿 수정**:
   ```html
   <!-- index.html의 block-template에 새 필드 추가 -->
   <option value="new-operation">새 작업</option>
   ```

### 보안 고려사항

1. **CSP (Content Security Policy)**:
   ```html
   <meta http-equiv="Content-Security-Policy" 
         content="default-src 'self'; style-src 'self' 'unsafe-inline';">
   ```

2. **nodeIntegration 비활성화**:
   ```javascript
   // main.js
   webPreferences: {
     nodeIntegration: false,
     contextIsolation: true,
     preload: path.join(__dirname, 'preload.js')
   }
   ```

3. **파일 경로 검증**:
   ```javascript
   // 경로 순회 공격 방지
   if (targetPath.includes('..')) {
     throw new Error('Invalid path');
   }
   ```

## 📦 배포 및 빌드

### 빌드 명령어
```bash
# 개발용 실행
npm run dev

# 패키징 (압축하지 않음)
npm run pack

# 배포용 빌드 (설치 파일 생성)
npm run dist
```

### 플랫폼별 빌드
```json
{
  "build": {
    "win": {
      "target": "nsis"
    },
    "mac": {
      "target": "dmg"
    },
    "linux": {
      "target": "AppImage"
    }
  }
}
```

### 배포 파일 구조
```
dist/
├── win-unpacked/           # Windows 압축 해제 버전
├── Autoblo Setup 0.1.0.exe # Windows 설치 파일
├── Autoblo-0.1.0.dmg      # macOS 디스크 이미지
└── Autoblo-0.1.0.AppImage # Linux AppImage
```

## 🔧 문제 해결

### 일반적인 문제들

#### 1. 애플리케이션이 시작되지 않음
**원인**: Node.js 버전 불일치 또는 의존성 누락
**해결**:
```bash
node --version  # 18.0.0 이상인지 확인
npm ci          # package-lock.json 기반 정확한 설치
```

#### 2. 파일 작업이 실패함
**원인**: 권한 부족 또는 경로 오류
**해결**:
- 관리자 권한으로 실행
- 절대 경로 사용
- 파일/폴더 존재 여부 확인

#### 3. UI가 제대로 표시되지 않음
**원인**: CSS 파일 로딩 실패 또는 보안 정책
**해결**:
- 브라우저 개발자 도구에서 콘솔 확인
- CSP 설정 검토

#### 4. 빌드 실패
**원인**: electron-builder 설정 오류
**해결**:
```bash
# 캐시 정리
npm run clean
rm -rf node_modules
npm install

# 빌드 재시도
npm run dist
```

### 디버깅 방법

#### 1. Main Process 디버깅
```bash
# 개발자 도구로 메인 프로세스 디버깅
npm run dev -- --inspect=5858
```

#### 2. Renderer Process 디버깅
- Electron 앱에서 `Ctrl+Shift+I` (개발자 도구 열기)
- Console 탭에서 JavaScript 오류 확인

#### 3. 로그 파일 위치
- **Windows**: `%APPDATA%/Autoblo/logs/`
- **macOS**: `~/Library/Logs/Autoblo/`
- **Linux**: `~/.config/Autoblo/logs/`

### 성능 최적화

#### 1. 메모리 사용량 최적화
- 큰 파일 작업 시 스트림 사용
- 불필요한 DOM 요소 정리
- 이벤트 리스너 정리

#### 2. 실행 속도 개선
- 파일 작업을 비동기로 처리
- 진행률 표시로 사용자 경험 개선
- 배치 처리로 I/O 작업 최적화

## 📝 라이선스 및 기여

### 라이선스
이 프로젝트는 MIT 라이선스 하에 배포됩니다.

### 기여 방법
1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

### 버전 관리
- **Semantic Versioning** 사용
- **Major.Minor.Patch** 형식
- 변경 사항은 CHANGELOG.md에 기록

---

**최종 업데이트**: 2025년 9월 14일  
**문서 버전**: 1.0.0  
**작성자**: GitHub Copilot
