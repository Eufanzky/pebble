export type AgentName = 'CalmSense' | 'AdaptLens' | 'SimplifyCore' | 'PebbleVoice' | 'WhyBot' | 'BridgeBot';

export interface ActivityEntry {
  id: string;
  timestamp: Date;
  agent: AgentName;
  action: string;
  reasoning: string;
  safetyStatus: 'passed' | 'flagged';
}
