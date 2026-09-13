// 실제 과목을 추가할 때 이 임시 메뉴를 과목별 링크로 교체한다.
const comingSoonMenu = (title) => ({
  title,
  type: 'menu',
  items: {
    coming_soon: { title: '준비중', href: '#coming-soon' },
  },
})

const meta = {
  index: {
    title: '홈',
    theme: {
      layout: 'full',
      sidebar: false,
      toc: false,
      breadcrumb: false,
      pagination: false,
      copyPage: false,
    },
  },
  html: {
    title: 'HTML',
    type: 'menu',
    items: {
      html_fundamentals: {
        title: 'HTML 기본기',
        href: '/html/html_fundamentals/01_what-is-html-and-its-role',
      },
      modern_html: {
        title: '모던 HTML',
        href: '/html/modern_html/01_why-modern-html',
      },
    },
  },
  css: {
    title: 'CSS',
    type: 'menu',
    items: {
      css_fundamentals: {
        title: 'CSS 기본기',
        href: '/css/css_fundamentals/01_what-is-css',
      },
      modern_css: {
        title: '모던 CSS',
        href: '/css/modern_css/01_modern-css-boundary',
      },
    },
  },
  javascript: {
    title: 'JavaScript',
    type: 'menu',
    items: {
      ECMAscript: {
        title: 'ECMAScript',
        href: '/javascript/ECMAscript/01_ecmascript-overview',
      },
      web_apis: {
        title: 'Web APIs',
        href: '/javascript/web_apis/01_web-platform-basics',
      },
    },
  },
  react: {
    title: 'React',
    type: 'menu',
    items: {
      react_1: {
        title: 'React 기초',
        href: '/react/react_1/01_react-as-a-ui-library',
      },
      react_2: {
        title: 'React 중급',
        href: '/react/react_2/01_component-composition-basics',
      },
      react_3: {
        title: 'React 실무',
        href: '/react/react_3/01_server-vs-client-state',
      },
    },
  },
  web_platform: comingSoonMenu('Web Platform'),
  ui_libraries: comingSoonMenu('UI Libraries'),
  backend: comingSoonMenu('Backend'),
  devops: comingSoonMenu('DevOps'),
  자격증: {
    title: '자격증',
    type: 'menu',
    items: {
      빅데이터분석기사_필기: {
        title: '빅데이터분석기사 필기',
        href: '/자격증/빅데이터분석기사_필기/01_exam-overview',
      },
      리눅스마스터_2급_1차: {
        title: '리눅스마스터 2급 1차',
        href: '/자격증/리눅스마스터_2급_1차/01_exam-overview',
      },
      SQLD: {
        title: 'SQLD',
        href: '/자격증/SQLD/01_sql-and-database-basics',
      },
      ADSP: {
        title: 'ADsP',
        href: '/자격증/ADSP/01_adsp-exam-and-r-setup',
      },
      네트워크관리사_2급_실기: {
        title: '네트워크관리사 2급 실기',
        href: '/자격증/네트워크관리사_2급_실기/01_network-basics-for-practical-use',
      },
      PC정비사_2급_실기: {
        title: 'PC정비사 2급 실기',
        href: '/자격증/PC정비사_2급_실기/01_pc-exam-roadmap',
      },
    },
  },
  독학사: {
    title: '독학사',
    type: 'menu',
    items: {
      '1단계_영어': {
        title: '1단계 영어',
        href: '/독학사/1단계_영어/01_exam-structure',
      },
      '1단계_일반수학': {
        title: '1단계 일반수학',
        href: '/독학사/1단계_일반수학/01_math-language',
      },
      '1단계_기초통계학': {
        title: '1단계 기초통계학',
        href: '/독학사/1단계_기초통계학/01_exam-overview',
      },
      '2단계_컴퓨터구조': {
        title: '2단계 컴퓨터구조',
        href: '/독학사/2단계_컴퓨터구조/01_number-system-basics',
      },
      '2단계_운영체제': {
        title: '2단계 운영체제',
        href: '/독학사/2단계_운영체제/01_os-terminology-map',
      },
      '2단계_머신러닝': {
        title: '2단계 머신러닝',
        href: '/독학사/2단계_머신러닝/01_ml-basics',
      },
      '3단계_컴퓨터네트워크': {
        title: '3단계 컴퓨터네트워크',
        href: '/독학사/3단계_컴퓨터네트워크/01_network-basics',
      },
      '3단계_정보보호': {
        title: '3단계 정보보호',
        href: '/독학사/3단계_정보보호/01_exam-structure',
      },
      '3단계_딥러닝': {
        title: '3단계 딥러닝',
        href: '/독학사/3단계_딥러닝/01_exam-overview',
      },
      '4단계_데이터베이스': {
        title: '4단계 데이터베이스',
        href: '/독학사/4단계_데이터베이스/01_exam-overview',
      },
      '4단계_실용영어': {
        title: '4단계 실용영어',
        href: '/독학사/4단계_실용영어/01_exam-structure',
      },
    },
  },
}

export default meta
