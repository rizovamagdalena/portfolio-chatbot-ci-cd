import { Bot, Trash2, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ChatHeaderProps {
  onClear: () => void;
  onToggleSidebar?: () => void;
}

export function ChatHeader({ onClear, onToggleSidebar }: ChatHeaderProps) {
  return (
    <header className="glass-panel border-b border-border/50 px-4 py-3">
      <div className="flex items-center justify-between max-w-4xl mx-auto">
        <div className="flex items-center gap-3">
          {onToggleSidebar && (
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={onToggleSidebar}
            >
              <Menu className="w-5 h-5" />
            </Button>
          )}
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-glow-sm">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-semibold text-foreground">Portfolio AI</h1>
            <p className="text-xs text-muted-foreground">Ask about your projects</p>
          </div>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={onClear}
          className="text-muted-foreground hover:text-destructive"
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Clear Chat
        </Button>
      </div>
    </header>
  );
}
