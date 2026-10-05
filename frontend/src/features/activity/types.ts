type AgentName = 'CalmSense' | 'AdaptLens' | 'SimplifyCore' | 'PebbleVoice' | 'WhyBot' | 'BridgeBot';

export interface ActivityEntry {
  id: string;
  timestamp: Date;
  agent: AgentName;
  action: string;
  reasoning: string;
  safetyStatus: 'passed' | 'flagged';
  /** WhyBot's plain-language "why" (7.4); empty for older entries and held-back messages. */
  explanation: string;
}
