
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  Shield, 
  Settings, 
  Box, 
  Download, 
  MessageSquare, 
  ChevronRight, 
  CheckCircle2, 
  ArrowDown,
  Sparkles,
  X,
  Send,
  Loader2,
  ExternalLink,
  ChevronDown
} from 'lucide-react';
import { Rule, Module, GovernanceData } from './types';
import { askRuleAssistant } from './services/geminiService';

const GOVERNANCE_DATA: GovernanceData = {
  constitution: [
    { id: 'c1', title: '1. 인간 중심 원칙', description: 'AI는 인간의 판단을 보조하는 도구이며, 최종 의사결정과 책임은 항상 인간에게 있다. AI의 제안은 참고사항이며, 비판적으로 검토되어야 한다.' },
    { id: 'c2', title: '2. 투명성 및 설명가능성', description: 'AI가 생성한 모든 결과물은 그 과정과 근거를 명확히 설명할 수 있어야 하며, AI 사용 여부를 명시적으로 공개한다.' },
    { id: 'c3', title: '3. 데이터 보안 및 프라이버시', description: '고객 및 조직의 민감 정보는 AI 시스템에 입력하지 않으며, 개인정보보호법 및 데이터 보호 규정을 철저히 준수한다.' },
    { id: 'c4', title: '4. 공정성 및 편향 방지', description: 'AI 결과물에서 성별, 인종, 종교, 국적 등에 대한 차별이나 편향이 없도록 지속적으로 모니터링하고 개선한다.' },
    { id: 'c5', title: '5. 법적 준수', description: '저작권, 초상권, 상표권 등 지적재산권을 존중하며, 모든 관련 법규와 윤리 기준을 준수한다.' },
  ],
  commonRules: [
    { id: 'r1', title: '1. 프롬프트 작성 원칙', description: '목적과 맥락을 명확히 정의하고, 예상 결과물의 형식과 톤을 지정하며 제약사항을 명시합니다.' },
    { id: 'r2', title: '2. 결과물 검증 프로세스', description: '사실관계 및 정확성을 확인하고 브랜드 가이드라인 준수 여부를 검토하여 최소 1인 이상의 승인을 거칩니다.' },
    { id: 'r3', title: '3. 버전 관리 및 기록', description: '사용 모델 버전을 기록하고 프롬프트와 결과물을 아카이빙하여 문제 발생 시 추적이 가능하도록 합니다.' },
    { id: 'r4', title: '4. 지속적 학습 및 개선', description: '월 1회 활용 성과를 리뷰하고 베스트 프랙티스를 공유하며 팀원 교육을 정기적으로 실시합니다.' },
  ],
  modules: [
    { id: 'm1', name: '모듈 A - 콘텐츠', rules: ['브랜드 톤앤매너 명시', '표절 검사 도구 활용', '출처 교차 검증', 'AI 생성 표기 의무', 'SEO 자연어 유지'] },
    { id: 'm2', name: '모듈 B - 이커머스', rules: ['실제 스펙 100% 일치', '과장 광고 금지', '가격 자동화 불가', '리뷰 왜곡 방지', '알고리즘 편향 모니터링'] },
    { id: 'm3', name: '모듈 C - 생산성', rules: ['반복 작업 우선 자동화', '비용 대비 효과 측정', '이메일 자동 회신 제한', '회의록 참석자 확인', '프로세스 분기 리뷰'] },
    { id: 'm4', name: '모듈 D - 데이터 분석', rules: ['데이터 소스 명시', '통계적 유의성 표기', '전문가 해석 병기', '개인정보 비식별화', '예측 모델 오차 공개'] },
    { id: 'm5', name: '모듈 E - 자동화', rules: ['코드 리뷰 후 배포', 'Failsafe 알림 설정', '금융/법적 문서 제외', '인간 전환 옵션 필수', '감사 로그 1년 보관'] },
  ]
};

const App: React.FC = () => {
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState<{ role: 'user' | 'assistant'; content: string }[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatHistory, isTyping]);

  const contextString = useMemo(() => JSON.stringify(GOVERNANCE_DATA, null, 2), []);

  const handleExport = () => {
    let output = '# EPLIM AI 운영 규정 및 규칙\n\n## 1. 규정\n';
    GOVERNANCE_DATA.constitution.forEach(r => output += `### ${r.title}\n${r.description}\n\n`);
    output += '## 2. 공통 운영 규칙\n';
    GOVERNANCE_DATA.commonRules.forEach(r => output += `### ${r.title}\n${r.description}\n\n`);
    output += '## 3. 모듈별 세부 규칙\n';
    GOVERNANCE_DATA.modules.forEach(m => {
      output += `### ${m.name}\n`;
      m.rules.forEach(r => output += `- ${r}\n`);
      output += '\n';
    });

    const blob = new Blob([output], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'EPLIM_AI_Governance.md';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSendMessage = async () => {
    if (!chatInput.trim() || isTyping) return;
    
    const userMessage = chatInput;
    setChatInput('');
    setChatHistory(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsTyping(true);

    try {
      const response = await askRuleAssistant(userMessage, contextString);
      setChatHistory(prev => [...prev, { role: 'assistant', content: response }]);
    } catch (error) {
      setChatHistory(prev => [...prev, { role: 'assistant', content: '죄송합니다. 현재 어시스턴트 연결에 문제가 발생했습니다. 나중에 다시 시도해주세요.' }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white selection:bg-indigo-500/30">
      {/* Dynamic Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-900/10 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-900/10 blur-[120px] rounded-full animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <div className="container mx-auto px-6 py-16 relative z-10 max-w-7xl">
        {/* Header */}
        <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-24 animate-in fade-in slide-in-from-top-8 duration-1000">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold tracking-widest uppercase">
              <Sparkles className="w-3.5 h-3.5" />
              Official Portal
            </div>
            <div className="space-y-2">
              <h1 className="text-5xl lg:text-7xl font-black tracking-tighter text-gradient leading-tight uppercase">
                EPLIM AI<br />Governance
              </h1>
              <p className="text-white/50 text-xl max-w-2xl font-light leading-relaxed">
                이플림의 혁신을 이끄는 AI원칙과 실무 지침을 한눈에 확인하세요.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <button 
              onClick={handleExport}
              className="group px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl font-bold flex items-center gap-3 transition-all active:scale-95"
            >
              <Download className="w-5 h-5 group-hover:translate-y-0.5 transition-transform" />
              Download Rules
            </button>
            <button 
              onClick={() => setIsAssistantOpen(true)}
              className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 rounded-2xl font-black flex items-center gap-3 shadow-2xl shadow-indigo-500/40 transition-all active:scale-95 hover:shadow-indigo-500/60"
            >
              <MessageSquare className="w-5 h-5" />
              AI Assistant
            </button>
          </div>
        </header>

        {/* Hierarchy Flow */}
        <div className="relative mb-32">
          <div className="absolute inset-0 bg-indigo-500/5 blur-3xl rounded-full" />
          <div className="relative grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
            <div className="glass-panel p-8 rounded-3xl text-center border-indigo-500/30">
              <Shield className="w-8 h-8 text-indigo-400 mx-auto mb-4" />
              <h3 className="font-bold text-lg">규정</h3>
              <p className="text-[10px] text-indigo-400/60 uppercase font-black tracking-tighter mt-1">Core Integrity</p>
            </div>
            <div className="flex justify-center opacity-20"><ChevronRight className="w-8 h-8 hidden md:block" /><ChevronDown className="w-8 h-8 md:hidden" /></div>
            <div className="glass-panel p-8 rounded-3xl text-center">
              <Settings className="w-8 h-8 text-white/40 mx-auto mb-4" />
              <h3 className="font-bold text-lg">운영 규칙</h3>
              <p className="text-[10px] text-white/30 uppercase font-black tracking-tighter mt-1">Protocols</p>
            </div>
            <div className="flex justify-center opacity-20"><ChevronRight className="w-8 h-8 hidden md:block" /><ChevronDown className="w-8 h-8 md:hidden" /></div>
            <div className="glass-panel p-8 rounded-3xl text-center">
              <Box className="w-8 h-8 text-white/40 mx-auto mb-4" />
              <h3 className="font-bold text-lg">모듈 가이드</h3>
              <p className="text-[10px] text-white/30 uppercase font-black tracking-tighter mt-1">Execution</p>
            </div>
          </div>
        </div>

        {/* Main Content Sections */}
        <div className="space-y-40">
          {/* Constitution */}
          <section id="constitution" className="animate-in fade-in slide-in-from-bottom-12 duration-1000">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 border-b border-white/5 pb-8">
              <div className="space-y-2">
                <h2 className="text-4xl font-black tracking-tight">규정</h2>
                <p className="text-white/40 text-lg">이플림의 모든 AI 시스템이 준수해야 하는 5대 원칙입니다.</p>
              </div>
              <div className="px-4 py-1.5 bg-indigo-500/10 text-indigo-400 text-[10px] font-black uppercase tracking-widest border border-indigo-500/20 rounded-full">
                FIXED POLICY
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {GOVERNANCE_DATA.constitution.map((rule) => (
                <div key={rule.id} className="glass-panel p-10 rounded-3xl group relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-10 transition-opacity">
                    <Shield className="w-16 h-16" />
                  </div>
                  <CheckCircle2 className="w-6 h-6 text-indigo-500 mb-6" />
                  <h3 className="text-2xl font-bold mb-4 group-hover:text-indigo-300 transition-colors">{rule.title}</h3>
                  <p className="text-white/50 leading-relaxed text-sm lg:text-base">{rule.description}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Modular Rules */}
          <section id="modules" className="animate-in fade-in slide-in-from-bottom-12 duration-1000" style={{ animationDelay: '200ms' }}>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 border-b border-white/5 pb-8">
              <div className="space-y-2">
                <h2 className="text-4xl font-black tracking-tight">영역별 가이드라인</h2>
                <p className="text-white/40 text-lg">각 비즈니스 모듈에 최적화된 AI 활용 수칙입니다.</p>
              </div>
              <button className="flex items-center gap-2 text-white/40 hover:text-white transition-colors text-sm font-medium">
                View All Modules <ExternalLink className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {GOVERNANCE_DATA.modules.map((module) => (
                <div key={module.id} className="glass-panel p-10 rounded-3xl flex flex-col hover:border-white/20">
                  <div className="flex items-center justify-between mb-10">
                    <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10">
                      <Box className="w-6 h-6 text-indigo-400" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-tighter text-white/20">{module.id}</span>
                  </div>
                  <h3 className="text-2xl font-bold mb-8 tracking-tight">{module.name}</h3>
                  <ul className="space-y-5 flex-1">
                    {module.rules.map((r, idx) => (
                      <li key={idx} className="flex items-start gap-4 text-sm text-white/60 group">
                        <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-indigo-500/40 group-hover:bg-indigo-500 transition-colors shrink-0" />
                        <span className="group-hover:text-white/90 transition-colors">{r}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Footer */}
        <footer className="mt-64 pt-16 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
          <div className="space-y-4">
            <div className="flex items-center justify-center md:justify-start gap-3">
              <div className="w-8 h-8 bg-white/5 rounded-lg flex items-center justify-center">
                <Shield className="w-4 h-4 text-indigo-500" />
              </div>
              <span className="font-black tracking-tighter text-xl uppercase">EPLIM <span className="text-indigo-400">AI Governance</span></span>
            </div>
            <p className="text-white/20 text-xs max-w-sm">
              © 2025 EPLIM AI Governance Board. 이플림의 모든 AI 정책은 법률 및 윤리 기준을 엄격히 준수합니다.
            </p>
          </div>
          <div className="flex gap-8 text-xs font-bold uppercase tracking-widest text-white/20">
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">Compliance</a>
          </div>
        </footer>
      </div>

      {/* AI Assistant Overlay */}
      {isAssistantOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 lg:p-12 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={() => setIsAssistantOpen(false)} />
          <div className="w-full max-w-3xl bg-[#0f0f0f] border border-white/10 rounded-[2.5rem] shadow-2xl flex flex-col h-[85vh] overflow-hidden relative z-10 animate-in zoom-in-95 duration-300">
            {/* Assistant Header */}
            <div className="px-8 py-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-indigo-500/40">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">EPLIM Assistant</h3>
                  <div className="flex items-center gap-1.5 text-[10px] text-green-500 font-black uppercase tracking-widest">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                    AI System Online
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setIsAssistantOpen(false)}
                className="p-3 hover:bg-white/5 rounded-2xl transition-all"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Chat History */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-8 space-y-8 scroll-smooth">
              {chatHistory.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-6 opacity-30">
                  <div className="p-6 bg-white/5 rounded-full">
                    <MessageSquare className="w-12 h-12" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-lg font-bold">무엇을 도와드릴까요?</p>
                    <p className="text-sm max-w-xs mx-auto font-light">
                      이플림의 AI 거버넌스 규정, 프롬프트 작성 지침 등에 대해 물어보세요.
                    </p>
                  </div>
                  <div className="flex flex-wrap justify-center gap-2 pt-4">
                    {['데이터 분석 규칙 알려줘', '인간 중심 원칙이란?', '콘텐츠 생성 시 주의사항'].map(q => (
                      <button 
                        key={q}
                        onClick={() => { setChatInput(q); }}
                        className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-full text-xs font-medium border border-white/10 transition-colors"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {chatHistory.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] px-6 py-4 rounded-3xl ${
                    msg.role === 'user' 
                      ? 'bg-indigo-600 text-white rounded-tr-none shadow-xl shadow-indigo-500/20' 
                      : 'bg-white/5 border border-white/10 text-white/90 rounded-tl-none font-light leading-relaxed'
                  }`}>
                    {msg.content}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-white/5 border border-white/10 px-6 py-4 rounded-3xl rounded-tl-none flex items-center gap-4">
                    <Loader2 className="w-5 h-5 animate-spin text-indigo-500" />
                    <span className="text-xs text-white/30 font-bold uppercase tracking-widest">규정 문서를 확인 중입니다...</span>
                  </div>
                </div>
              )}
            </div>

            {/* Input Area */}
            <div className="p-8 bg-white/[0.01] border-t border-white/5">
              <div className="relative">
                <input 
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="AI 정책에 대해 질문하세요..."
                  className="w-full bg-white/5 border border-white/10 rounded-3xl px-8 py-5 pr-16 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:bg-white/10 transition-all text-sm lg:text-base placeholder:text-white/20"
                />
                <button 
                  onClick={handleSendMessage}
                  disabled={!chatInput.trim() || isTyping}
                  className="absolute right-3 top-3 bottom-3 aspect-square bg-indigo-600 rounded-2xl flex items-center justify-center hover:bg-indigo-700 disabled:bg-white/5 disabled:text-white/20 transition-all active:scale-90 shadow-lg shadow-indigo-500/20"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
              <p className="mt-4 text-[10px] text-center text-white/20 font-medium uppercase tracking-tighter">
                Answers are based on the official EPLIM AI Policy document.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;