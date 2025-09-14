# Autoblo — 블록 시퀀스 실행기

![Autoblo Banner](https://img.shields.io/badge/Autoblo-File%20Operations%20Automation-blue?style=for-the-badge)

Autoblo는 파일 시스템 작업을 자동화하기 위한 직관적인 GUI 도구입니다. 복잡한 파일 복사, 이동, 삭제 작업을 블록 단위로 구성하여 순차적으로 실행할 수 있습니다.

## 🌟 주요 기능

- **📁 폴더 생성**: 단일/재귀적 폴더 생성
- **📄 파일 복사**: 파일 및 폴더 복사 (덮어쓰기 옵션)
- **🔄 파일 이동**: 파일 및 폴더 이동 (덮어쓰기 옵션)
- **🗑️ 파일 삭제**: 파일 및 폴더 삭제 (강제 삭제 옵션)
- **🎯 시각적 블록 인터페이스**: 직관적인 드래그 앤 드롭 방식
- **📊 실시간 계획 미리보기**: 실행 전 작업 내용 확인
- **⚡ 일괄 실행**: 모든 작업을 순차적으로 자동 실행

## 🚀 빠른 시작

### 전제 조건

- Node.js 18.0.0 이상
- npm 또는 yarn

### 설치 및 실행

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
   ```

4. **배포 빌드**
   ```bash
   npm run dist
   ```

## 📖 사용법

### 기본 사용법

1. **블록 추가**: 상단의 "신규 블록 추가" 버튼을 클릭
2. **작업 종류 선택**: 폴더 생성, 파일 복사, 파일 이동, 파일/폴더 삭제 중 선택
3. **경로 설정**: 파일 브라우저를 통해 소스와 대상 경로 설정
4. **옵션 구성**: 필요에 따라 덮어쓰기, 재귀 생성 등 옵션 설정
5. **실행**: "실행" 버튼을 클릭하여 모든 블록을 순차 실행

### 작업 종류별 설정

#### 📁 폴더 생성 (mkdir)
- **경로**: 생성할 폴더의 전체 경로
- **하위 경로까지 생성**: 부모 폴더가 없을 경우 자동 생성

#### 📄 파일 복사 (copy)
- **From**: 복사할 파일 또는 폴더 경로
- **To**: 복사 대상 경로
- **부모 폴더 없으면 생성**: 대상 경로의 부모 폴더 자동 생성
- **대상 존재 시 덮어쓰기**: 동일한 파일이 있을 경우 덮어쓰기

#### 🔄 파일 이동 (move)
- **From**: 이동할 파일 또는 폴더 경로
- **To**: 이동 대상 경로
- **부모 폴더 없으면 생성**: 대상 경로의 부모 폴더 자동 생성
- **대상 존재 시 덮어쓰기**: 동일한 파일이 있을 경우 덮어쓰기

#### 🗑️ 파일/폴더 삭제 (delete)
- **경로**: 삭제할 파일 또는 폴더 경로
- **강제 삭제**: 폴더의 경우 하위 항목까지 모두 삭제

## 🏗️ 프로젝트 구조

```
autoblo/
├── main.js                    # Electron 메인 프로세스
├── preload.js                 # 보안 브리지 스크립트
├── package.json               # 프로젝트 설정 및 의존성
├── README.md                  # 프로젝트 문서
├── renderer/                  # 렌더러 프로세스 파일들
│   ├── index.html            # 메인 HTML 인터페이스
│   ├── style.css             # 스타일시트
│   ├── renderer.js           # 메인 렌더러 스크립트
│   └── modules/              # 모듈화된 JavaScript 파일들
│       ├── AutobloApp.js     # 메인 애플리케이션 컨트롤러
│       ├── BlockManager.js   # 블록 관리 모듈
│       └── PlanExecutor.js   # 계획 실행 모듈
└── dist/                     # 빌드 결과물 (생성됨)
```

## 🔧 기술 스택

- **프레임워크**: [Electron](https://electronjs.org/) - 크로스 플랫폼 데스크톱 앱
- **언어**: JavaScript (ES6+)
- **스타일링**: CSS3 (CSS Grid, Flexbox, Custom Properties)
- **아키텍처**: 모듈화된 MVC 패턴

## 🛡️ 보안 고려사항

- **Context Isolation**: 렌더러와 메인 프로세스 간 안전한 통신
- **경로 검증**: 상위 디렉토리 접근 차단 및 경로 정규화
- **에러 처리**: 모든 파일 시스템 작업에 대한 포괄적 에러 핸들링
- **입력 검증**: 사용자 입력에 대한 유효성 검사

## 🤝 기여하기

1. 이 저장소를 포크합니다
2. 기능 브랜치를 생성합니다 (`git checkout -b feature/amazing-feature`)
3. 변경사항을 커밋합니다 (`git commit -m 'Add some amazing feature'`)
4. 브랜치에 푸시합니다 (`git push origin feature/amazing-feature`)
5. Pull Request를 생성합니다

## 📋 개발 가이드라인

### 코드 스타일
- ES6+ 문법 사용
- JSDoc 주석 필수
- 모듈화된 구조 유지
- 의미있는 변수명 사용

### 테스트
- 새로운 기능 추가 시 테스트 케이스 작성
- 기존 기능 수정 시 회귀 테스트 확인

## � 문서

### 상세 문서
- **[종합 문서](docs/COMPREHENSIVE_DOCUMENTATION.md)** - 프로젝트의 전체적인 개요, 아키텍처, 설치 및 개발 가이드
- **[API 참조 문서](docs/API_REFERENCE.md)** - 모든 API, 데이터 구조, 이벤트 시스템에 대한 상세 참조
- **[사용자 가이드](docs/USER_GUIDE.md)** - 초보자를 위한 단계별 사용법과 실제 예시

### 빠른 참조
- **설치 및 실행**: [종합 문서 - 설치 및 실행](docs/COMPREHENSIVE_DOCUMENTATION.md#설치-및-실행)
- **기능 상세**: [종합 문서 - 기능 상세](docs/COMPREHENSIVE_DOCUMENTATION.md#기능-상세)
- **사용법**: [사용자 가이드 - 기본 사용법](docs/USER_GUIDE.md#기본-사용법)
- **API 레퍼런스**: [API 참조 문서](docs/API_REFERENCE.md)
- **문제 해결**: [사용자 가이드 - 문제 해결](docs/USER_GUIDE.md#문제-해결)

## �📝 라이선스

이 프로젝트는 [MIT 라이선스](LICENSE) 하에 배포됩니다.

## 🔗 관련 링크

- [Electron 공식 문서](https://electronjs.org/docs)
- [Node.js 파일 시스템 API](https://nodejs.org/api/fs.html)

## 📞 지원 및 문의

- **이슈 리포트**: [GitHub Issues](https://github.com/your-username/autoblo/issues)
- **기능 요청**: [GitHub Discussions](https://github.com/your-username/autoblo/discussions)
- **사용법 문의**: [사용자 가이드](docs/USER_GUIDE.md) 먼저 확인해주세요

---

**Autoblo** - 파일 작업을 더 스마트하게! 🚀