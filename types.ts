
export interface Rule {
  id: string;
  title: string;
  description: string;
}

export interface Module {
  id: string;
  name: string;
  rules: string[];
}

export interface GovernanceData {
  constitution: Rule[];
  commonRules: Rule[];
  modules: Module[];
}

export type AppView = 'dashboard' | 'constitution' | 'rules' | 'modules' | 'assistant';
