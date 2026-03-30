import { useState, KeyboardEvent } from 'react';
import { Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

export function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (input.trim() && !disabled) {
      onSend(input.trim());
      setInput('');
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="glass-panel rounded-2xl p-2 shadow-glow-sm">
      <div className="flex items-end gap-2">
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask about your projects..."
          className={cn(
            "min-h-[44px] max-h-[200px] resize-none border-0 bg-transparent",
            "focus-visible:ring-0 focus-visible:ring-offset-0",
            "placeholder:text-muted-foreground/60"
          )}
          rows={1}
          disabled={disabled}
        />
        <Button
          onClick={handleSend}
          disabled={disabled || !input.trim()}
          size="icon"
          className="h-10 w-10 rounded-xl bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity flex-shrink-0"
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
