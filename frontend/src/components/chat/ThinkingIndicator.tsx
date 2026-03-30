import { Bot } from 'lucide-react';

export function ThinkingIndicator() {
  return (
    <div className="flex items-start gap-3 fade-in">
      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
        <Bot className="w-4 h-4 text-primary" />
      </div>
      <div className="glass-panel rounded-2xl rounded-tl-md px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">AI is thinking</span>
          <div className="flex gap-1">
            <div className="w-2 h-2 rounded-full bg-primary pulse-dot" />
            <div className="w-2 h-2 rounded-full bg-primary pulse-dot" />
            <div className="w-2 h-2 rounded-full bg-primary pulse-dot" />
          </div>
        </div>
      </div>
    </div>
  );
}
