import { Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ExampleQueriesProps {
  onSelect: (query: string) => void;
  disabled?: boolean;
}

const EXAMPLE_QUERIES = [
  "Which projects use AI?",
  "Tell me about MealMakeApp",
  "What projects use Python?",
  "Do you have any cinema-related projects?",
];

export function ExampleQueries({ onSelect, disabled }: ExampleQueriesProps) {
  return (
    <div className="flex flex-wrap gap-2 justify-center">
      {EXAMPLE_QUERIES.map((query) => (
        <Button
          key={query}
          variant="outline"
          size="sm"
          className="glass-panel border-border/50 hover:border-primary/50 hover:bg-primary/10 text-sm transition-all"
          onClick={() => onSelect(query)}
          disabled={disabled}
        >
          <Sparkles className="w-3 h-3 mr-2 text-primary" />
          {query}
        </Button>
      ))}
    </div>
  );
}
