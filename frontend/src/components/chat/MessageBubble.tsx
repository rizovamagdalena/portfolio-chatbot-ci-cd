import { useState } from 'react';
import { Bot, User, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Message } from '@/types/chat';
import { SourceCard } from './SourceCard';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';

interface MessageBubbleProps {
  message: Message;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === 'user';

  const handleCopy = async () => {
    await navigator.clipboard.writeText(message.content);
    setCopied(true);
    toast({
      title: 'Copied!',
      description: 'Message copied to clipboard.',
    });
    setTimeout(() => setCopied(false), 2000);
  };

  // Simple markdown-like rendering for bold text
  const renderContent = (text: string) => {
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i}>{part.slice(2, -2)}</strong>;
      }
      // Handle line breaks
      return part.split('\n').map((line, j, arr) => (
        <span key={`${i}-${j}`}>
          {line}
          {j < arr.length - 1 && <br />}
        </span>
      ));
    });
  };

  return (
    <div
      className={cn(
        "flex gap-3 slide-up",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
          <Bot className="w-4 h-4 text-primary" />
        </div>
      )}

      <div className={cn("max-w-[80%] md:max-w-[70%]", isUser && "order-first")}>
        <div
          className={cn(
            "rounded-2xl px-4 py-3",
            isUser
              ? "user-bubble text-white rounded-tr-md"
              : "ai-bubble border border-border/50 rounded-tl-md"
          )}
        >
          <div className="text-sm leading-relaxed">
            {renderContent(message.content)}
          </div>
        </div>

        {!isUser && message.content && (
          <div className="flex items-center gap-2 mt-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
              onClick={handleCopy}
            >
              {copied ? (
                <Check className="w-3 h-3 mr-1" />
              ) : (
                <Copy className="w-3 h-3 mr-1" />
              )}
              {copied ? 'Copied' : 'Copy'}
            </Button>
          </div>
        )}

        {message.projectsSearched && message.projectsSearched.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            <span className="text-xs text-muted-foreground">Searched:</span>
            {message.projectsSearched.map((project) => (
              <Badge key={project} variant="outline" className="text-xs">
                {project}
              </Badge>
            ))}
          </div>
        )}

        {message.sources && message.sources.length > 0 && (
          <div className="mt-3 space-y-2">
            <p className="text-xs text-muted-foreground font-medium">Sources</p>
            {message.sources.map((source, index) => (
              <SourceCard key={`${source.project_id}-${index}`} source={source} index={index} />
            ))}
          </div>
        )}
      </div>

      {isUser && (
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center flex-shrink-0">
          <User className="w-4 h-4 text-white" />
        </div>
      )}
    </div>
  );
}
