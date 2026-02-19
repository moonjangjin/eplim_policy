import React, { useState, useEffect, useRef, useMemo } from 'react';
import ReactDOM from 'react-dom/client';
import { 
  Shield, Box, MessageSquare, ChevronRight, CheckCircle2, 
  Sparkles, X, Send, ChevronDown, Search, Info, Mail, User, Layers,
  TrendingUp, Download, Cpu, Zap, Terminal, ArrowLeft, AlertTriangle, Target, HelpCircle, Plus, Minus, ArrowRight,
  FileText, ShieldCheck, History, Bookmark, CheckSquare, ShoppingCart, Activity, Database, Settings as SettingsIcon,
  Users, UserCheck
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

const GOVERNANCE_DATA = {
  constitution: [
    { id: 'c1', title: '1. 인간 중심 원칙', description: 'AGI는 인간의 판단을 보조하는 도구이며, 최종 의사결정과 책임은 항상 인간에게 있다. AI의 제안은 참고사항이며, 비판적으로 검토되어야 한다.' },
    { id: 'c2', title: '2. 투명성 및 설명가능성', description: 'AGI가 생성한 모든 결과물은 그 과정과 근거를 명확히 설명할 수 있어야 하며, AI 사용 여부를 명시적으로 공개한다.' },
    { id: 'c3', title: '3. DB 보안 및 프라이버시', description: '고객 및 조직의 민감 정보는 AGI 시스템에 입력하지 않으며, 개인정보보호법 및 데이터 보호 규정을 철저히 준수한다.' },
    { id: 'c4', title: '4. 공정성 및 편향 방지', description: 'AGI 결과물에서 성별, 인종, 종교, 국적 등에 대한 차별이나 편향이 없도록 지속적으로 모니터링하고 개선한다.' },
    { id: 'c5', title: '5. 법적 준수', description: '저작권, 초상권, 상표권 등 지적재산권을 존중하며, 모든 관련 법규와 윤리 기준을 준수한다.' },
    { id: 'c6', title: '6. 규정의 불가침성', description: '본 규정은 조직 구성원 간 합의로 제정된 것으로, 특정인의 권한으로 임의 변경할 수 없다.' },
  ],
  commonRules: [
    { id: 'r1', title: '프롬프트 작성 원칙', items: ['목적 명확화', '형식 지정', '제약사항 명시', '민감정보 체크'] },
    { id: 'r2', title: '결과물 검증 프로세스', items: ['정확성 확인', '가이드 준수', '리스크 평가', '인간 승인'] },
    { id: 'r3', title: '버전 관리 및 기록', items: ['모델 기록', '아카이빙', '이력 추적', '롤백 준비'] },
    { id: 'r4', title: '지속적 학습 및 개선', items: ['성과 리뷰', 'BP 공유', '신규 도구 평가', '팀 교육'] },
  ],
  modules: [
    { id: 'm1', name: '모듈 A - 콘텐츠', rules: ['톤앤매너 유지', '표절 검사', '출처 교차 검증', 'AGI 표기 의무'] },
    { id: 'm2', name: '모듈 B - 이커머스', rules: ['상품 스펙 일치', '과장 광고 금지', '가격 자동화 불가', '리뷰 요약 점검'] },
    { id: 'm3', name: '모듈 C - 생산성', rules: ['반복 작업 우선', '효과 측정', '회의록 확인', '일정 제안 전용'] },
    { id: 'm4', name: '모듈 D - 데이터 분석', rules: ['소스 명시', '유의성 표기', '비식별화 철저', '오차율 공개'] },
    { id: 'm5', name: '모듈 E - 자동화', rules: ['코드 리뷰 배포', 'Failsafe 설정', '감사 로그 보관', '인간 전환 필수'] },
    { id: 'm6', name: '모듈 F - 외부 협력', rules: ['이해관계 명확화', '단계별 확인 프로세스', '법적 리스크 점검', '인간 승인 필수'] },
  ],
  faqs: [
    { question: "AGI가 생성한 이미지의 저작권은 누구에게 있나요?", answer: "이플림의 공식 도구로 생성된 결과물은 원칙적으로 회사의 업무 저작물로 관리되나, 활용 전 법무팀의 최종 확인이 필요합니다." },
    { question: "고객 데이터를 외부 AGI에 입력해도 되나요?", answer: "절대 불가합니다. 승인되지 않은 외부 AGI 서비스에 고객의 개인정보나 회사 기밀을 입력하는 것은 보안 규정 위반입니다." },
    { question: "AGI 결과물이 틀린 정보를 제공하면 어떡하죠?", answer: "규정 1조에 따라 모든 책임은 인간에게 있습니다. AGI의 답변을 반드시 교차 검증한 후 사용해야 합니다." }
  ]
};

const MODULE_DETAILS: Record<string, any> = {
  m1: {
    title: '모듈 A - 콘텐츠 거버넌스',
    badge: 'MODULE A',
    sub: '콘텐츠 제작과 배포에 적용되는 AGI 운영 기준 및 실무 가이드라인',
    sections: [
      { id: 's1', title: 'SECTION 1. 톤앤매너 유지', desc: 'AGI 생성 콘텐츠는 이플림 고유의 브랜드 보이스를 준수해야 하며, 모든 어조는 최종적으로 인간 에디터가 정제해야 함.', list: ['과도한 경어체 금지', '브랜드 정체성 준수 어조', '사용자 친화적 스타일 가이드'], icon: <Sparkles/> },
      { id: 's2', title: 'SECTION 2. 표절 검사 의무', desc: 'AGI는 외부 데이터를 조합하므로 우발적 표절 가능성이 존재함. 모든 생성물은 공식 탐지 도구를 거쳐 유사도 15% 이하를 유지해야 함.', list: ['외부 자료 무단 사용 금지', '표절 탐지 솔루션 필수 활용', '위반 시 전면 재작성 원칙'], icon: <ShieldCheck/> },
      { id: 's3', title: 'SECTION 3. 출처 교차 검증', desc: '할루시네이션 방지를 위해 모든 정보와 수치는 최소 2개 이상의 신뢰할 수 있는 소스를 통해 인간이 직접 검증해야 함.', list: ['1차/2차 출처 확인 의무', '통계 데이터 소스 명시', '검증 로그 기록 및 보관'], icon: <History/> },
      { id: 's4', title: 'SECTION 4. AGI 표기 의무', desc: '투명성 원칙에 따라 AGI의 도움을 받아 작성된 콘텐츠는 반드시 사용자에게 명시적으로 해당 사실을 알려야 함.', list: ['표기 문구 템플릿 사용', '콘텐츠별 지정 위치 표기', '내부 승인 프로세스 준수'], icon: <Bookmark/> },
    ]
  },
  m2: {
    title: '모듈 B - 이커머스 거버넌스',
    badge: 'MODULE B',
    sub: '이커머스 운영과 상품 관리의 AGI 기준',
    sections: [
      { id: 's1', title: 'SECTION 1. 상품 스펙 일치', desc: 'AI가 생성하는 상품 상세 설명은 내부 데이터베이스의 실제 스펙과 100% 일치해야 하며 임의 생성을 엄격히 금지함.', list: ['DB 직결 정보 우선 활용', '수치 데이터 수동 대조', '스펙 오류 시 즉시 노출 차단'], icon: <ShoppingCart/> },
      { id: 's2', title: 'SECTION 2. 과장 광고 금지', desc: 'AI를 활용한 카피라이팅 시 실제 성능이나 혜택을 부풀려 사용자에게 오해를 줄 수 있는 표현을 완전히 배제함.', list: ['최상급 표현(최고, 유일 등) 제한', '증빙 가능한 혜택만 명시', '리뷰 조작성 문구 생성 금지'], icon: <AlertTriangle/> },
      { id: 's3', title: 'SECTION 3. 가격 자동화 불가', desc: '최종 가격 결정은 항상 인간 담당자의 승인이 필요하며, AI 모델에 의한 실시간 가격 자동 변경을 금지함.', list: ['가격 결정권자 최종 승인', '대량 할인 자동 적용 불가', '비정상 가격 탐지 알림 설정'], icon: <Target/> },
      { id: 's4', title: 'SECTION 4. 리뷰 요약 점검', desc: 'AI에 의한 사용자 리뷰 요약 시 부정적인 피드백을 고의로 삭제하거나 긍정적으로 왜곡하는 필터링을 금지함.', list: ['원문의 뉘앙스 유지 의무', '불만 사항 누락 여부 점검', '요약 결과 샘플링 정기 검수'], icon: <MessageSquare/> },
    ]
  },
  m3: {
    title: '모듈 C - 생산성 거버넌스',
    badge: 'MODULE C',
    sub: '업무 효율화와 협업 도구 활용의 AGI 기준',
    sections: [
      { id: 's1', title: 'SECTION 1. 반복 작업 우선', desc: '창의적 판단이나 전략적 의사결정보다 반복적이고 정형화된 데이터 처리 및 단순 행정 업무에 AGI 활용을 집중함.', list: ['반복 태스크 우선 적용', '단순 데이터 분류 자동화', '전략적 판단 영역 인간 유지'], icon: <Activity/> },
      { id: 's2', title: 'SECTION 2. 효과 측정', desc: 'AGI 도구 도입 후 실질적인 시간 및 비용 절감 효과를 수치화하여 매 분기 보고하고 ROI가 낮은 도구는 제거함.', list: ['절감 시간 로그 기록', '업무 처리량 비교 분석', '활용 만족도 정기 조사'], icon: <TrendingUp/> },
      { id: 's3', title: 'SECTION 3. 회의록 확인', desc: 'AI가 작성한 회의록은 참석자 전원에게 공유되어 누락이나 왜곡이 없는지 최종 검토를 거쳐야 공식 문서로 인정함.', list: ['참석자 전원 검수 루틴', '주요 결정사항 수동 확인', 'AI 요약문 원본 녹취 병행'], icon: <FileText/> },
      { id: 's4', title: 'SECTION 4. 일정 제안 전용', desc: 'AI는 일정 조정의 보조자로서 제안만 수행하며, 실제 예약이나 일정 확정은 반드시 사용자가 직접 실행함.', list: ['자동 확정 기능 비활성화', '제안 맥락 투명성 제공', '수정 권한 항상 사용자 유지'], icon: <History/> },
    ]
  },
  m4: {
    title: '모듈 D - 데이터 분석 거버넌스',
    badge: 'MODULE D',
    sub: '데이터 처리와 분석 결과 도출의 AGI 기준',
    sections: [
      { id: 's1', title: 'SECTION 1. 소스 명시', desc: '모든 분석 결과물에는 사용된 원천 데이터의 소스와 데이터 추출 시점(Timestamp)을 명확하게 기록해야 함.', list: ['데이터 소스 URL/DB 기재', '수집 기간 명시', '원천 데이터 무결성 체크'], icon: <Database/> },
      { id: 's2', title: 'SECTION 2. 유의성 표기', desc: 'AI가 분석한 결과의 통계적 유의미성과 한계점을 명시하여 분석 결과가 과잉 해석되지 않도록 관리함.', list: ['통계적 신뢰 수준 표기', '분석 결과의 한계점 서술', '상관관계와 인과관계 구분'], icon: <Target/> },
      { id: 's3', title: 'SECTION 3. 비식별화 철저', desc: '데이터셋 구성 시 개인 식별 정보(PII)는 완전히 삭제하거나 비식별화하여 외부 유출 시 리스크를 원천 차단함.', list: ['PII 탐지 및 삭제 로직 필수', '가명 정보 처리 가이드 준수', '민감 정보 입력 상시 감시'], icon: <ShieldCheck/> },
      { id: 's4', title: 'SECTION 4. 오차율 공개', desc: '예측 모델 분석 시 예상되는 오차 범위와 편향 가능성을 분석 보고서 전면에 공개하여 의사결정을 지원함.', list: ['예상 오차율(MAPE 등) 명시', '편향 발생 가능성 자가 진단', '과거 데이터 성능 비교'], icon: <Activity/> },
    ]
  },
  m5: {
    title: '모듈 E - 자동화 거버넌스',
    badge: 'MODULE E',
    sub: '시스템 자동화와 장애 대응의 AGI 기준',
    sections: [
      { id: 's1', title: 'SECTION 1. 코드 리뷰 배포', desc: 'AI가 생성한 모든 소스 코드는 반드시 인간 개발자의 리뷰와 유닛 테스트 통과 후 상용 환경에 배포함.', list: ['AI 코드 전수 리뷰 원칙', '보안 취약점 스캔 필수', '테스트 커버리지 확인'], icon: <Terminal/> },
      { id: 's2', title: 'SECTION 2. Failsafe 설정', desc: '자동화 시스템 실패 시 즉시 작동을 멈추고 인간에게 제어권을 넘기며 관리자에게 알람이 가도록 설계함.', list: ['예외 상황 즉시 정지 로직', '긴급 알람 시스템 연동', '인간 제어권 전환 테스트'], icon: <Zap/> },
      { id: 's3', title: 'SECTION 3. 감사 로그 보관', desc: '모든 자동화 실행 이력과 시스템 로그를 최소 1년 이상 보관하여 문제 발생 시 사후 추적이 가능하게 함.', list: ['실행 로그 변조 방지', '감사 데이터 정기 백업', '로그 접근 권한 관리'], icon: <History/> },
      { id: 's4', title: 'SECTION 4. 인간 전환 필수', desc: '고객 대응 자동화 도구 사용 시, 사용자가 원할 때 즉시 상담사나 담당자에게 연결될 수 있는 인터페이스를 보장함.', list: ['상담사 연결 버튼 상시 노출', '자동화 단계별 탈출구 제공', '대기 시간 예측 정보 제공'], icon: <SettingsIcon/> },
    ]
  },
  m6: {
    title: '모듈 F - 외부 협력 거버넌스',
    badge: 'MODULE F',
    sub: '외부 협력사 및 이해관계자와의 커뮤니케이션 및 협업 시 AGI 활용 기준',
    sections: [
      { id: 's1', title: 'SECTION 1. 이해관계 및 표준화', desc: '외부 협력 시 AGI 활용 여부를 명확히 고지하고, 커뮤니케이션 톤을 표준화하여 오해의 소지를 원천 차단함.', list: ['이해관계자 AGI 활용 사전 고지', '커뮤니케이션 표준 템플릿 사용', '협력사 데이터 보안 약정 체결'], icon: <Users/> },
      { id: 's2', title: 'SECTION 2. 업무 순서 강제', desc: 'AGI가 업무 순서를 임의로 변경하지 못하도록 단계별 확인 프로세스를 시스템적으로 강제함.', list: ['워크플로우 단계별 승인 강제', '질문 회피 및 임의 답변 방지', '체크리스트 미준수 시 프로세스 중단'], icon: <Layers/> },
      { id: 's3', title: 'SECTION 3. 법적 리스크 점검', desc: '외부로 발송되는 모든 AGI 보조 문서의 법적 효력 및 리스크를 점검하고 감사 기록을 철저히 보관함.', list: ['법적 쟁점 사전 스크리닝', '감사 로그 영구 보관', '지식재산권 침해 여부 상시 검토'], icon: <ShieldCheck/> },
      { id: 's4', title: 'SECTION 4. 인간 승인 필수', desc: '모든 대외 공식 문서 및 협의 결과물은 반드시 담당자의 최종 수동 서명 및 승인이 완료된 후 발송함.', list: ['인간 승인 없는 발송 금지', '최종 책임자 서명 날인 의무', '승인 이력 시스템 기록'], icon: <UserCheck/> },
    ]
  }
};

const MissionPage: React.FC<{ onEnter: () => void }> = ({ onEnter }) => (
  <div className="min-h-screen relative flex flex-col items-center justify-center content-padding py-24 bg-[#050505] overflow-hidden">
    <div className="glow-sphere w-[1100px] h-[1100px] bg-indigo-600/15 top-[-300px] left-[-300px] animate-float" />
    <div className="glow-sphere w-[900px] h-[900px] bg-purple-600/15 bottom-[-200px] right-[-200px] animate-float" style={{animationDelay: '-10s'}} />
    <div className="relative z-10 max-w-6xl w-full space-y-24 lg:space-y-32 animate-fade-in">
      <div className="text-center space-y-12">
        <div className="inline-flex items-center gap-3 badge-policy mx-auto"><Sparkles size={16}/> Our Mission</div>
        <div className="space-y-10">
          <h1 className="hero-title leading-[1.15] font-black uppercase tracking-tighter text-white">사소한 문제를<br/><span className="text-indigo-400 drop-shadow-[0_10px_30px_rgba(99,102,241,0.4)]">정보자산</span>으로 구축합니다.</h1>
          <p className="text-xl md:text-3xl text-white max-w-4xl mx-auto font-medium leading-relaxed">사람들이 검색으로 해결하려는 반복적인 문제의<br className="hidden md:block" />질문을 <span className="text-white font-black text-2xl md:text-4xl border-b-4 border-indigo-500/80 pb-2">소유 가능한 정보자산</span>으로 정제합니다.</p>
        </div>
      </div>
      <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-10 lg:gap-16 relative py-12">
        {[{ step: "01", title: "반복문제 포착" }, { step: "02", title: "이해 쉬운 구조" }, { step: "03", title: "자산화" }].map((item, i) => (
          <React.Fragment key={i}>
            <div className="step-button group"><span className="text-[0.7rem] font-black text-indigo-400 tracking-[0.4em] uppercase opacity-90 group-hover:opacity-100 transition-opacity">Step {item.step}</span><h3 className="text-2xl md:text-3xl font-black text-white group-hover:text-indigo-400 transition-colors tracking-tight">{item.title}</h3></div>
            {i < 2 && <div className="flex items-center justify-center text-white/70 rotate-90 md:rotate-0 py-4 md:py-0"><ArrowRight size={48} strokeWidth={1} className="animate-pulse"/></div>}
          </React.Fragment>
        ))}
      </div>
      <div className="space-y-8 pt-20 border-t border-white/20 text-center">
        <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight">우리가 만드는 <span className="text-indigo-400">결과물의 기준</span></h2>
        <p className="text-lg md:text-xl text-white/90 font-semibold tracking-tight uppercase">결과물은 반드시 다음 <span className="text-white font-black">3가지</span>를 만족해야 합니다.</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-10 items-stretch relative">
        {[{ title: "반복문제 해결", desc: "일시적인 현상이 아닌, 반복적으로 발생하는 문제의 근본적인 해결에 기여하는가?", icon: <CheckCircle2 className="text-indigo-400" size={28}/> }, { title: "누구나 이해", desc: "복잡한 설명 없이도 누구나 직관적으로 파악하고 따라할 수 있는 구조인가?", icon: <CheckCircle2 className="text-indigo-400" size={28}/> }, { title: "장기적 재사용 자산", desc: "한 번 쓰고 버려지는 정보가 아닌, 시간이 지나도 가치를 유지하는 자산인가?", icon: <CheckCircle2 className="text-indigo-400" size={28}/> }].map((item, i) => (
          <div key={i} className="glass-panel p-10 md:p-12 rounded-[2.5rem] flex flex-col space-y-8 group border-white/20 hover:border-indigo-500/40">
            <div className="w-16 h-16 rounded-2xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center group-hover:rotate-6 transition-transform">{item.icon}</div>
            <div className="space-y-6"><h3 className="text-2xl md:text-3xl font-black text-white leading-tight">{item.title}</h3><p className="text-lg text-white/90 font-medium leading-relaxed group-hover:text-white transition-colors">{item.desc}</p></div>
          </div>
        ))}
      </div>
      <div className="flex flex-col items-center gap-10 pt-20 pb-12"><button onClick={onEnter} className="btn-action">프레임워크 입장하기 <ChevronRight size={28} strokeWidth={4}/></button></div>
    </div>
  </div>
);

const ModuleDetailPage: React.FC<{ moduleId: string, onBack: () => void, onNavigate: (id: string) => void }> = ({ moduleId, onBack, onNavigate }) => {
  const [agreed, setAgreed] = useState(false);
  const data = MODULE_DETAILS[moduleId];
  if (!data) return null;

  const moduleKeys = Object.keys(MODULE_DETAILS);
  const currentIndex = moduleKeys.indexOf(moduleId);
  const prevId = moduleKeys[currentIndex - 1];
  const nextId = moduleKeys[currentIndex + 1];

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const headerOffset = 120;
      const elementPosition = el.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
      window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] animate-fade-in">
      <div className="pt-32 pb-6 content-padding bg-black/60 border-b border-white/10">
        <div className="max-w-[960px] mx-auto flex items-center gap-4 text-xs font-black uppercase tracking-[0.2em] text-white/60">
          <button onClick={onBack} className="hover:text-white transition-colors">AGI Governance</button>
          <ChevronRight size={14} />
          <span className="text-white/80">{data.badge}</span>
          <ChevronRight size={14} />
          <span className="text-indigo-400">{data.title.split('-')[1].trim()}</span>
        </div>
      </div>
      <div className="max-w-[1280px] mx-auto content-padding py-20 flex flex-col lg:flex-row gap-16 relative">
        <aside className="lg:w-64 shrink-0">
          <div className="sticky top-40 space-y-8">
            <div className="space-y-2">
              <p className="text-[0.65rem] font-black text-indigo-400 uppercase tracking-[0.3em]">Contents Navigation</p>
              <nav className="flex flex-col gap-1">
                {data.sections.map((s: any) => (
                  <button key={s.id} onClick={() => scrollToSection(s.id)} className="flex items-center gap-4 px-6 py-4 rounded-2xl hover:bg-white/10 text-left text-sm font-bold text-white/70 hover:text-white transition-all group border border-transparent hover:border-white/10">
                    <span className="group-hover:text-indigo-400 transition-colors">{s.icon}</span>{s.title.split('.')[1].trim()}
                  </button>
                ))}
              </nav>
            </div>
          </div>
        </aside>
        <main className="flex-1 max-w-[960px] space-y-32">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-3 badge-policy"><FileText size={14}/> {data.badge}</div>
            <div className="space-y-4">
              <h1 className="text-5xl lg:text-7xl font-black text-gradient uppercase tracking-tight">{data.title.split('-')[1].trim()}</h1>
              <p className="text-xl md:text-2xl text-white font-medium leading-relaxed">{data.sub}</p>
            </div>
            <div className="pt-4 flex items-center gap-6 text-[0.7rem] font-bold text-white/60 uppercase tracking-[0.2em]">
              <span>Revision: 2025.02.21</span><span className="w-1 h-1 bg-white/30 rounded-full" /><span>Owner: Governance Board</span>
            </div>
          </div>
          {data.sections.map((section: any, idx: number) => (
            <section key={idx} id={section.id} className="space-y-12">
              <div className="space-y-4">
                <h2 className="text-4xl font-black text-white tracking-tight">{section.title}</h2>
                <div className="w-20 h-1.5 bg-indigo-500 rounded-full" />
              </div>
              <div className="glass-panel p-10 rounded-[2.5rem] space-y-8 border-white/20">
                <div className="space-y-6">
                  <h3 className="text-2xl font-black text-indigo-300">운영 원칙</h3>
                  <p className="text-lg text-white font-medium leading-relaxed">{section.desc}</p>
                </div>
                <div className="p-8 bg-black/60 rounded-3xl space-y-6 border border-white/10">
                  <p className="text-sm font-black text-indigo-400 uppercase tracking-widest">실무 체크리스트</p>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {section.list.map((t: string, i: number) => (
                      <li key={i} className="flex items-center gap-3 text-white/90 font-bold text-sm">
                        <CheckCircle2 size={16} className="text-indigo-400" /> {t}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </section>
          ))}
          <div className="pt-20 border-t border-white/20 space-y-12">
            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="flex items-center gap-6">
                <button onClick={() => setAgreed(!agreed)} className={`w-8 h-8 rounded-lg flex items-center justify-center border transition-all ${agreed ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-transparent border-white/40 text-transparent'}`}><CheckSquare size={20}/></button>
                <span className="text-lg font-bold text-white/90">본 모듈의 가이드라인을 숙지하였으며 준수할 것을 동의합니다.</span>
              </div>
              <button className="flex items-center gap-3 px-8 py-4 glass-panel rounded-2xl text-sm font-black text-indigo-400 hover:text-white border-indigo-500/50 hover:bg-indigo-600 transition-all uppercase tracking-widest">Download PDF <Download size={18}/></button>
            </div>
            <div className="flex items-center justify-between gap-4">
              {prevId ? (
                <button onClick={() => onNavigate(prevId)} className="flex items-center gap-4 px-10 py-6 glass-panel rounded-3xl text-white/70 hover:text-white transition-all font-bold"><ArrowLeft size={20}/> 이전 모듈</button>
              ) : <div/>}
              {nextId ? (
                <button onClick={() => onNavigate(nextId)} className="flex items-center gap-4 px-10 py-6 glass-panel rounded-3xl text-indigo-400 hover:text-white border-indigo-500/50 hover:bg-indigo-600/30 transition-all font-bold group">다음 모듈 <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform"/></button>
              ) : <div/>}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

const GlobalSearchBar: React.FC<{ data: any, onResultClick: (target: string) => void }> = ({ data, onResultClick }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const searchableItems = useMemo(() => {
    const items: any[] = [];
    data.constitution.forEach((c: any) => items.push({ type: 'AGI 규정', title: c.title, content: c.description, target: 'constitution' }));
    data.commonRules.forEach((r: any) => items.push({ type: '공통 운영 규칙', title: r.title, content: r.items.join(', '), target: 'common-rules' }));
    data.modules.forEach((m: any) => items.push({ type: '모듈 가이드라인', title: m.name, content: m.rules.join(', '), target: m.id }));
    data.faqs.forEach((f: any) => items.push({ type: 'FAQ', title: f.question, content: f.answer, target: 'faq' }));
    return items;
  }, [data]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.trim().length > 0) {
        const lowerQuery = query.toLowerCase();
        const filtered = searchableItems.filter(item => item.title.toLowerCase().includes(lowerQuery) || item.content.toLowerCase().includes(lowerQuery));
        setResults(filtered);
        setShowDropdown(true);
      } else {
        setResults([]);
        setShowDropdown(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [query, searchableItems]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => { if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setShowDropdown(false); };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative w-full max-w-[720px] mx-auto mt-10 mb-20 md:mb-24 z-50 animate-fade-in" style={{animationDelay: '0.2s'}}>
      <div className="search-bar-container w-full h-14 md:h-16 rounded-full flex items-center px-6 md:px-8 gap-4 overflow-hidden">
        <Search className="text-white/60 shrink-0" size={24}/>
        <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="AGI 규정, 규칙, 가이드라인을 검색하세요" className="flex-1 bg-transparent border-none outline-none text-lg font-medium placeholder:text-white/50 text-white"/>
        {query && <button onClick={() => setQuery('')} className="p-1 hover:bg-white/20 rounded-full text-white/80"><X size={20}/></button>}
      </div>
      {showDropdown && results.length > 0 && (
        <div ref={dropdownRef} className="absolute top-full left-0 right-0 mt-3 glass-panel border-white/20 rounded-[2rem] overflow-hidden max-h-[400px] overflow-y-auto z-50 shadow-2xl animate-fade-in">
          <div className="p-2 space-y-1">
            {results.map((res, i) => (
              <button key={i} onClick={() => { onResultClick(res.target); setShowDropdown(false); setQuery(''); }} className="w-full text-left p-6 hover:bg-indigo-500/20 rounded-2xl transition-all group flex flex-col gap-2">
                <div className="flex items-center justify-between"><span className="text-[0.65rem] font-black text-indigo-400 uppercase tracking-widest">{res.type}</span><ChevronRight size={16} className="text-white/50 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all"/></div>
                <h4 className="text-lg font-bold text-white group-hover:text-indigo-200 transition-colors">{res.title}</h4>
                <p className="text-sm text-white/70 font-medium line-clamp-2 leading-relaxed">{res.content}</p>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const AccordionItem: React.FC<{ question: string, answer: string, isOpen: boolean, onClick: () => void }> = ({ question, answer, isOpen, onClick }) => (
  <div className="glass-panel rounded-[2rem] overflow-hidden transition-all duration-500 hover:border-indigo-500/40">
    <button onClick={onClick} className="w-full px-10 py-8 flex items-center justify-between text-left group">
      <div className="flex items-center gap-6"><div className="w-12 h-12 rounded-xl bg-indigo-500/20 flex items-center justify-center shrink-0 border border-indigo-500/40"><HelpCircle className="text-indigo-400" size={24}/></div><h3 className="text-xl md:text-2xl font-black text-white group-hover:text-indigo-200 transition-colors leading-tight">{question}</h3></div>
      <div className="shrink-0 text-white/70 group-hover:text-indigo-400 transition-colors">{isOpen ? <Minus size={24}/> : <Plus size={24}/>}</div>
    </button>
    <div className={`transition-all duration-500 ease-in-out overflow-hidden ${isOpen ? 'max-h-[300px] opacity-100' : 'max-h-0 opacity-0'}`}><div className="px-10 pb-8 pt-2 pl-[calc(2.5rem+4.5rem)]"><p className="text-lg text-white/90 leading-relaxed font-medium border-l-2 border-indigo-500/40 pl-6">{answer}</p></div></div>
  </div>
);

const App = () => {
  const [view, setView] = useState('mission');
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null);
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState<any[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [chatHistory, isTyping]);

  const navigateTo = (target: string) => {
    if (target.startsWith('m')) {
      setSelectedModuleId(target);
      setView('module-detail');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setView('main');
      setTimeout(() => { const el = document.getElementById(target); if (el) el.scrollIntoView({ behavior: 'smooth' }); }, 100);
    }
  };

  const handleSendMessage = async () => {
    if (!chatInput.trim() || isTyping) return;
    const msg = chatInput; setChatInput(''); setChatHistory(h => [...h, { role: 'user', content: msg }]); setIsTyping(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await ai.models.generateContent({ model: 'gemini-3-flash-preview', contents: `Context: ${JSON.stringify(GOVERNANCE_DATA)}\nQuestion: ${msg}\nRespond in Korean concisely based on governance.`, });
      setChatHistory(h => [...h, { role: 'assistant', content: response.text }]);
    } catch (e) { setChatHistory(h => [...h, { role: 'assistant', content: '연결 오류가 발생했습니다.' }]); } finally { setIsTyping(false); }
  };

  if (view === 'mission') return <MissionPage onEnter={() => setView('main')}/>;
  if (view === 'module-detail') return <ModuleDetailPage moduleId={selectedModuleId!} onBack={() => setView('main')} onNavigate={(id) => navigateTo(id)}/>;

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-indigo-500/40">
      <header className="fixed top-0 inset-x-0 z-[100] bg-black/85 backdrop-blur-3xl border-b border-white/20 py-6 content-padding">
        <div className="section-container flex items-center justify-between">
          <div className="flex items-center gap-5 cursor-pointer group" onClick={() => setView('mission')}><Shield className="text-indigo-500 group-hover:scale-110 transition-transform duration-500" size={28}/><span className="font-black text-xl tracking-tighter uppercase">EPLIM <span className="text-indigo-400">FRAMEWORK</span></span></div>
          <nav className="hidden lg:flex items-center gap-10 text-[0.7rem] font-black uppercase tracking-[0.25em] text-white/80">
            <button className="hover:text-white transition-colors" onClick={() => navigateTo('constitution')}>AGI 규정</button>
            <button className="hover:text-white transition-colors" onClick={() => navigateTo('common-rules')}>공통 운영 규칙</button>
            <button className="hover:text-white transition-colors" onClick={() => navigateTo('modules')}>모듈별 가이드라인</button>
            <button className="hover:text-white transition-colors" onClick={() => navigateTo('faq')}>FAQ</button>
            <button className="text-indigo-400 hover:text-indigo-200 font-black border border-indigo-500/30 px-5 py-1.5 rounded-full bg-indigo-500/10 transition-all" onClick={() => setIsAssistantOpen(true)}>AGI HELP</button>
          </nav>
          <button className="lg:hidden p-3 text-indigo-400" onClick={() => setIsAssistantOpen(true)}><MessageSquare size={26}/></button>
        </div>
      </header>
      <main className="section-container content-padding pt-40">
        <div className="animate-fade-in space-y-24">
          <section className="text-center py-8 relative">
            <div className="glow-sphere w-[1100px] h-[1100px] bg-indigo-900/25 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"/>
            <div className="relative space-y-8 flex flex-col items-center">
              <div className="inline-flex items-center gap-3 badge-policy mx-auto"><Sparkles size={14}/> Official Governance Portal</div>
              <h1 className="hero-title text-gradient font-black uppercase tracking-tighter">AGI GOVERNANCE</h1>
              <p className="text-xl md:text-2xl text-white max-w-4xl mx-auto font-medium leading-relaxed text-center">이플림의 혁신을 이끄는 <span className="text-indigo-400 font-black">AGI원칙과 실무 지침</span></p>
              <GlobalSearchBar data={GOVERNANCE_DATA} onResultClick={navigateTo}/>
            </div>
          </section>
          <section id="constitution" className="scroll-mt-32 space-y-12">
            <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-white/20 pb-8 gap-6"><div className="space-y-3"><h2 className="text-3xl lg:text-5xl font-black text-gradient uppercase tracking-tight">AGI 규정</h2><p className="text-white/80 text-lg font-medium">이플림의 모든 AGI 활용의 근간이 되는 최상위 원칙</p></div><div className="px-5 py-2 badge-policy w-fit">Fixed Policy</div></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">{GOVERNANCE_DATA.constitution.map(c => (<div key={c.id} className="glass-panel p-8 space-y-6 group rounded-[2rem]"><CheckCircle2 size={32} className="text-indigo-500 group-hover:scale-110 transition-transform duration-500"/><div className="space-y-4"><h3 className="text-xl font-black tracking-tight leading-tight">{c.title}</h3><p className="text-base text-white/90 leading-relaxed font-medium">{c.description}</p></div></div>))}</div>
          </section>
          <section id="common-rules" className="scroll-mt-32 space-y-12">
            <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-white/20 pb-8 gap-6"><div className="space-y-3"><h2 className="text-3xl lg:text-5xl font-black text-gradient uppercase tracking-tight">공통 운영 규칙</h2><p className="text-white/80 text-lg font-medium">실무 프로세스 전반에 적용되는 실행 지침</p></div><div className="px-5 py-2 badge-policy w-fit">Operational</div></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">{GOVERNANCE_DATA.commonRules.map(r => (<div key={r.id} className="glass-panel p-10 space-y-8 rounded-[2.5rem]"><div className="w-14 h-14 bg-indigo-500/20 rounded-2xl flex items-center justify-center text-indigo-400 font-black text-xl border border-indigo-500/40">{r.id.replace('r','')}</div><div className="space-y-6"><h3 className="text-2xl font-black tracking-tight">{r.title}</h3><ul className="space-y-4">{r.items.map((it, i) => (<li key={i} className="flex items-start gap-4 font-bold text-white/90 text-lg tracking-tight group"><span className="w-2 h-2 bg-indigo-500 rounded-full mt-2.5 shrink-0 group-hover:scale-150 transition-transform" /><span className="group-hover:text-white transition-colors">{it}</span></li>))}</ul></div></div>))}</div>
          </section>
          <section id="modules" className="scroll-mt-32 space-y-12">
            <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-white/20 pb-8 gap-6"><div className="space-y-3"><h2 className="text-3xl lg:text-5xl font-black text-gradient uppercase tracking-tight">모듈별 가이드라인</h2><p className="text-white/80 text-lg font-medium">각 비즈니스 영역별 특화 수칙</p></div><div className="px-5 py-2 badge-policy w-fit">Specific</div></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {GOVERNANCE_DATA.modules.map(m => (
                <div key={m.id} onClick={() => navigateTo(m.id)} className="glass-panel p-8 cursor-pointer group space-y-8 rounded-[2rem] border-white/20 hover:border-indigo-500/60">
                  <Box size={36} className="text-indigo-400 group-hover:scale-110 transition-transform duration-500" /><div className="space-y-6"><h3 className="text-3xl font-black group-hover:text-indigo-300 transition-colors leading-tight">{m.name}</h3><ul className="space-y-3 opacity-90 text-[0.75rem] font-black uppercase tracking-[0.2em] text-white">{m.rules.map((r, i) => <li key={i} className="flex items-center gap-3"><span className="w-1.5 h-1.5 bg-indigo-500 rounded-full"/> {r}</li>)}</ul></div>
                  <div className="pt-6 border-t border-white/10 flex items-center gap-4 text-indigo-400 font-black text-[0.85rem] uppercase tracking-[0.25em] group-hover:translate-x-3 transition-transform">View Guidelines <ChevronRight size={18}/></div>
                </div>
              ))}
            </div>
          </section>
          <section id="faq" className="scroll-mt-32 space-y-12 pb-12">
            <div className="flex flex-col items-center justify-center border-b border-white/20 pb-8 gap-6 text-center"><div className="space-y-3"><h2 className="text-3xl lg:text-5xl font-black text-gradient uppercase tracking-tight">자주 묻는 질문</h2><p className="text-white/80 text-lg font-medium">AGI 활용 시 주요 궁금증 및 가이드</p></div><div className="px-5 py-2 badge-policy w-fit">FAQ</div></div>
            <div className="space-y-4 max-w-5xl mx-auto">{GOVERNANCE_DATA.faqs.map((f, i) => (<AccordionItem key={i} question={f.question} answer={f.answer} isOpen={openFaqIndex === i} onClick={() => setOpenFaqIndex(openFaqIndex === i ? null : i)}/>))}</div>
          </section>
        </div>
      </main>
      <footer className="py-16 border-t border-white/20 bg-black/60 text-center content-padding"><div className="section-container space-y-6"><Shield size={28} className="text-indigo-500 mx-auto" /><div className="space-y-2"><p className="text-lg font-black tracking-tighter uppercase">EPLIM AGI <span className="text-indigo-400">FRAMEWORK</span></p><p className="text-[0.65rem] text-white/70 uppercase tracking-[0.35em] font-black max-w-2xl mx-auto leading-loose">© 2025 EPLIM Governance Board. Restricted Internal Access.</p></div></div></footer>
      {isAssistantOpen && (
        <div className="fixed inset-0 z-[200] flex items-end md:items-center justify-center p-0 md:p-12 animate-fade-in">
          <div className="absolute inset-0 bg-black/95 backdrop-blur-3xl" onClick={() => setIsAssistantOpen(false)} />
          <div className="relative w-full max-w-5xl bg-[#080808] border md:border-white/20 md:rounded-[4rem] h-[95vh] md:h-[85vh] flex flex-col overflow-hidden shadow-2xl">
            <div className="p-12 border-b border-white/20 flex items-center justify-between bg-white/[0.04]"><div className="flex items-center gap-6"><Sparkles className="text-indigo-500" size={32}/><h3 className="text-3xl font-black tracking-tight uppercase">AGI ASSISTANT</h3></div><button onClick={() => setIsAssistantOpen(false)} className="p-4 hover:bg-white/10 rounded-full transition-all active:scale-90"><X size={44} className="text-white/70"/></button></div>
            <div className="flex-1 overflow-y-auto p-12 space-y-12">
              {chatHistory.length === 0 && <div className="h-full flex flex-col items-center justify-center text-center opacity-40 space-y-10"><MessageSquare size={100} strokeWidth={1}/><p className="text-2xl font-bold uppercase tracking-[0.4em]">무엇을 도와드릴까요?</p></div>}
              {chatHistory.map((m, i) => (<div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}><div className={`max-w-[80%] p-10 rounded-[3.5rem] text-xl font-medium leading-relaxed ${m.role === 'user' ? 'bg-indigo-600 text-white rounded-tr-none shadow-2xl' : 'glass-panel border-white/20 rounded-tl-none text-white'}`}>{m.content}</div></div>))}
              {isTyping && <div className="text-indigo-400 text-[0.8rem] font-black uppercase tracking-[0.4em] animate-pulse px-10">AGI가 분석 중입니다...</div>}
              <div ref={chatEndRef} />
            </div>
            <div className="p-12 border-t border-white/20 bg-black/60 flex gap-6"><input type="text" value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSendMessage()} placeholder="가이드라인에 대해 질문하세요..." className="flex-1 bg-white/10 border border-white/20 rounded-[2.5rem] px-12 py-8 text-xl font-medium focus:outline-none focus:ring-1 focus:ring-indigo-500/50 transition-all placeholder:text-white/40"/><button onClick={handleSendMessage} className="p-8 bg-indigo-600 rounded-[2.5rem] hover:bg-indigo-700 transition-all shadow-2xl active:scale-90"><Send size={36}/></button></div>
          </div>
        </div>
      )}
    </div>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(<App />);
