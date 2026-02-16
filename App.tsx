
import React, { useState, useMemo } from 'react';
import { 
  Shield, 
  Settings, 
  Box, 
  Download, 
  MessageSquare, 
  ChevronRight, 
  CheckCircle2, 
  Info,
  ArrowDown,
  Sparkles,
  Search,
  X,
  Send,
  Loader2
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

  const contextString = useMemo(() => {
    return JSON.stringify(GOVERNANCE_DATA, null, 2);
  }, []);

  const handleExport = () => {
    let output = '# AI 운영 헌법 및 규칙\n\n## 1. AI 헌법\n';
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
    a.download = 'AI_Governance_Rules.md';
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
      setChatHistory(prev => [...prev, { role: 'assistant', content: '오류가 발생했습니다. 다시 시도해주세요.' }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Background Gradients */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-900/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-900/10 blur-[120px] rounded-full" />
      </div>

      <div className="container mx-auto px-6 py-12 relative z-10 max-w-7xl">
        {/* Header Section */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16 animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
                <Shield className="w-7 h-7 text-white" />
              </div>
              <h1 className="text-4xl font-black tracking-tighter">AI Governance <span className="text-indigo-400">Portal</span></h1>
            </div>
            <p className="text-white/50 text-lg max-w-xl leading-relaxed">
              조직의 AI 활용 원칙을 체계적으로 관리하고 준수 여부를 확인하는 통합 거버넌스 플랫폼입니다.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={handleExport}
              className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl font-semibold flex items-center gap-2 transition-all active:scale-95"
            >
              <Download className="w-4 h-4" />
              Export MD
            </button>
            <button 
              onClick={() => setIsAssistantOpen(true)}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 rounded-xl font-bold flex items-center gap-2 shadow-xl shadow-indigo-500/20 transition-all active:scale-95"
            >
              <Sparkles className="w-4 h-4" />
              Ask AI Assistant
            </button>
          </div>
        </header>

        {/* Hierarchy Visualization */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-20">
          <div className="md:col-span-1 glass-panel p-6 rounded-2xl flex flex-col items-center justify-center gap-3 text-center border-indigo-500/30">
            <div className="p-3 bg-indigo-500/10 rounded-full">
              <Shield className="w-6 h-6 text-indigo-400" />
            </div>
            <div>
              <h4 className="font-bold text-sm">AI 헌법</h4>
              <p className="text-[10px] text-white/40 uppercase tracking-widest mt-1">Core Integrity</p>
            </div>
          </div>
          <div className="flex items-center justify-center text-white/20">
            <ChevronRight className="w-8 h-8 hidden md:block" />
            <ArrowDown className="w-8 h-8 md:hidden" />
          </div>
          <div className="md:col-span-1 glass-panel p-6 rounded-2xl flex flex-col items-center justify-center gap-3 text-center border-white/10">
            <div className="p-3 bg-white/5 rounded-full">
              <Settings className="w-6 h-6 text-white/60" />
            </div>
            <div>
              <h4 className="font-bold text-sm">운영 규칙</h4>
              <p className="text-[10px] text-white/40 uppercase tracking-widest mt-1">Common Protocols</p>
            </div>
          </div>
          <div className="flex items-center justify-center text-white/20">
            <ChevronRight className="w-8 h-8 hidden md:block" />
            <ArrowDown className="w-8 h-8 md:hidden" />
          </div>
          <div className="md:col-span-1 glass-panel p-6 rounded-2xl flex flex-col items-center justify-center gap-3 text-center border-white/10">
            <div className="p-3 bg-white/5 rounded-full">
              <Box className="w-6 h-6 text-white/60" />
            </div>
            <div>
              <h4 className="font-bold text-sm">모듈 가이드</h4>
              <p className="text-[10px] text-white/40 uppercase tracking-widest mt-1">Domain Specific</p>
            </div>
          </div>
        </div>

        {/* Sections Content */}
        <div className="space-y-24">
          {/* Constitution Section */}
          <section className="animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="flex items-center gap-4 mb-10 border-b border-white/10 pb-6">
              <h2 className="text-3xl font-black tracking-tight">AI 헌법</h2>
              <span className="px-3 py-1 bg-indigo-500/20 text-indigo-400 text-[10px] font-black uppercase tracking-widest rounded-full border border-indigo-500/30">
                Immutable
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {GOVERNANCE_DATA.constitution.map((rule) => (
                <div key={rule.id} className="glass-panel p-8 rounded-2xl border-white/5 hover:border-indigo-500/20 transition-all group">
                  <div className="mb-4 inline-flex items-center gap-2 text-indigo-400 font-bold text-sm">
                    <CheckCircle2 className="w-4 h-4" />
                    Principle
                  </div>
                  <h3 className="text-xl font-bold mb-4 group-hover:text-indigo-300 transition-colors">{rule.title}</h3>
                  <p className="text-white/50 text-sm leading-relaxed">{rule.description}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Common Rules Section */}
          <section className="animate-in fade-in slide-in-from-bottom-8 duration-700" style={{ animationDelay: '200ms' }}>
             <div className="flex items-center gap-4 mb-10 border-b border-white/10 pb-6">
              <h2 className="text-3xl font-black tracking-tight">공통 운영 규칙</h2>
              <span className="px-3 py-1 bg-white/5 text-white/40 text-[10px] font-black uppercase tracking-widest rounded-full border border-white/10">
                Execution
              </span>
            </div>
            <div className="space-y-4">
              {GOVERNANCE_DATA.commonRules.map((rule) => (
                <div key={rule.id} className="glass-panel p-6 rounded-xl flex items-start gap-6 hover:bg-white/[0.05] transition-colors border-white/5">
                  <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center shrink-0 border border-white/10">
                    <span className="text-lg font-bold text-white/40">{rule.id.replace('r', '')}</span>
                  </div>
                  <div className="py-1">
                    <h3 className="text-lg font-bold mb-1">{rule.title}</h3>
                    <p className="text-white/50 text-sm">{rule.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Modular Rules Grid */}
          <section className="animate-in fade-in slide-in-from-bottom-8 duration-700" style={{ animationDelay: '400ms' }}>
             <div className="flex items-center gap-4 mb-10 border-b border-white/10 pb-6">
              <h2 className="text-3xl font-black tracking-tight">모듈별 세부 규칙</h2>
              <span className="px-3 py-1 bg-white/5 text-white/40 text-[10px] font-black uppercase tracking-widest rounded-full border border-white/10">
                Specialized
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {GOVERNANCE_DATA.modules.map((module) => (
                <div key={module.id} className="glass-panel p-8 rounded-2xl border-white/5 hover:border-white/10 transition-all flex flex-col h-full">
                  <div className="flex items-center justify-between mb-8">
                    <h3 className="text-xl font-bold tracking-tight">{module.name}</h3>
                    <Box className="w-5 h-5 text-indigo-400/50" />
                  </div>
                  <ul className="space-y-4 flex-1">
                    {module.rules.map((r, idx) => (
                      <li key={idx} className="flex items-start gap-3 text-sm text-white/60">
                        <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-lg shadow-indigo-500/50 shrink-0" />
                        {r}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Footer */}
        <footer className="mt-32 pb-12 border-t border-white/5 pt-12 text-center">
          <div className="flex items-center justify-center gap-3 mb-6 opacity-30">
             <Shield className="w-5 h-5" />
             <div className="h-4 w-px bg-white" />
             <span className="text-xs font-bold uppercase tracking-widest">Lumina Governance</span>
          </div>
          <p className="text-white/20 text-xs">
            © 2025 AI Constitutional Compliance Board. All rights reserved.
          </p>
        </footer>
      </div>

      {/* AI Assistant Modal/Sidebar */}
      {isAssistantOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 md:p-12 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsAssistantOpen(false)} />
          <div className="w-full max-w-2xl bg-[#111] border border-white/10 rounded-3xl shadow-2xl flex flex-col h-[80vh] overflow-hidden relative z-10 animate-in zoom-in-95 duration-300">
            {/* Assistant Header */}
            <div className="p-6 border-b border-white/10 flex items-center justify-between bg-white/5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold">Governance Assistant</h3>
                  <p className="text-[10px] text-white/40 uppercase tracking-widest">Powered by Gemini 3</p>
                </div>
              </div>
              <button 
                onClick={() => setIsAssistantOpen(false)}
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {chatHistory.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-50">
                  <div className="p-4 bg-white/5 rounded-full">
                    <MessageSquare className="w-8 h-8" />
                  </div>
                  <p className="text-sm max-w-xs">
                    거버넌스 규칙에 대해 궁금한 점을 물어보세요.<br/>
                    예: "개인정보 보호 규칙이 어떻게 되나요?"
                  </p>
                </div>
              )}
              {chatHistory.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] p-4 rounded-2xl ${
                    msg.role === 'user' 
                      ? 'bg-indigo-600 text-white rounded-tr-none shadow-lg shadow-indigo-500/20' 
                      : 'bg-white/5 border border-white/10 text-white/80 rounded-tl-none'
                  }`}>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-white/5 border border-white/10 p-4 rounded-2xl rounded-tl-none flex items-center gap-3">
                    <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
                    <span className="text-xs text-white/40">규칙 검토 중...</span>
                  </div>
                </div>
              )}
            </div>

            {/* Chat Input */}
            <div className="p-6 bg-black/40 border-t border-white/10">
              <div className="relative group">
                <input 
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Ask about AI rules..."
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 pr-16 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all focus:bg-white/10"
                />
                <button 
                  onClick={handleSendMessage}
                  disabled={!chatInput.trim() || isTyping}
                  className="absolute right-3 top-3 bottom-3 aspect-square bg-indigo-600 rounded-xl flex items-center justify-center hover:bg-indigo-700 disabled:bg-white/10 disabled:cursor-not-allowed transition-all active:scale-90"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
