import { useState } from 'react';
import { ChevronDown, ChevronUp, FileText } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Source } from '@/types/chat';
import { cn } from '@/lib/utils';

interface SourceCardProps {
  source: Source;
  index: number;
}

export function SourceCard({ source, index }: SourceCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const relevancePercent = Math.round(source.relevance_score * 100);
  const previewText = source.content.slice(0, 150) + (source.content.length > 150 ? '...' : '');

  return (
    <Card
      className={cn(
        "glass-panel border-border/50 overflow-hidden transition-all duration-300 cursor-pointer hover:border-primary/30",
        isExpanded && "border-primary/40"
      )}
      onClick={() => setIsExpanded(!isExpanded)}
    >
      <div className="p-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-6 h-6 rounded-md bg-primary/20 flex items-center justify-center flex-shrink-0">
              <FileText className="w-3 h-3 text-primary" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-foreground truncate">
                {source.project_name}
              </p>
              <Badge variant="secondary" className="text-xs mt-1">
                {source.chunk_type}
              </Badge>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="text-right">
              <p className="text-xs text-muted-foreground mb-1">Relevance</p>
              <div className="flex items-center gap-2">
                <Progress value={relevancePercent} className="w-16 h-1.5" />
                <span className="text-xs font-medium text-primary">{relevancePercent}%</span>
              </div>
            </div>
            {isExpanded ? (
              <ChevronUp className="w-4 h-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            )}
          </div>
        </div>

        <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
          {previewText}
        </p>

        {isExpanded && (
          <div className="mt-3 pt-3 border-t border-border/50 fade-in">
            <p className="text-sm text-foreground/90 whitespace-pre-wrap">
              {source.content}
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}
