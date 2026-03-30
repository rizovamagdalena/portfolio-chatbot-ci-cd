import { FolderOpen, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface ProjectsSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

// Mock projects - in real app, these would come from API
const PROJECTS = [
  { id: 'mealmake', name: 'MealMakeApp', category: 'Mobile' },
  { id: 'stylecast', name: 'StyleCast', category: 'AI/ML' },
  { id: 'cinescope', name: 'CineScope', category: 'Web' },
  { id: 'taskflow', name: 'TaskFlow', category: 'Productivity' },
  { id: 'datavis', name: 'DataVis Pro', category: 'Analytics' },
];

export function ProjectsSidebar({ isOpen, onClose }: ProjectsSidebarProps) {
  return (
    <>
      {/* Backdrop for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed md:relative top-0 left-0 h-full z-50 md:z-0",
          "w-72 glass-panel border-r border-border/50",
          "transition-transform duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0 md:hidden lg:block lg:translate-x-0"
        )}
      >
        <div className="flex items-center justify-between p-4 border-b border-border/50">
          <div className="flex items-center gap-2">
            <FolderOpen className="w-5 h-5 text-primary" />
            <h2 className="font-semibold">Projects</h2>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={onClose}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="p-4 space-y-2">
          {PROJECTS.map((project) => (
            <div
              key={project.id}
              className="p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors cursor-pointer"
            >
              <p className="font-medium text-sm">{project.name}</p>
              <Badge variant="outline" className="mt-1 text-xs">
                {project.category}
              </Badge>
            </div>
          ))}
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border/50">
          <p className="text-xs text-muted-foreground text-center">
            {PROJECTS.length} projects indexed
          </p>
        </div>
      </aside>
    </>
  );
}
