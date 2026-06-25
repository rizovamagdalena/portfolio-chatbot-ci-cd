import { FolderOpen, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';
import { getProjects } from '@/lib/api';

interface ProjectsSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Project {
  project_id: string;
  name: string;
  description: string;
}

export function ProjectsSidebar({ isOpen, onClose }: ProjectsSidebarProps) {
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const data = await getProjects();
        setProjects(data as unknown as Project[]);
      } catch (error) {
        console.error('Failed to fetch projects:', error);
      }
    };
    fetchProjects();
  }, []);

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={onClose}
        />
      )}

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
          {projects.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-4">
              No projects yet. Add your first project!
            </p>
          ) : (
            projects.map((project) => (
              <div
                key={project.project_id}
                className="p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors cursor-pointer"
              >
                <p className="font-medium text-sm">{project.name}</p>
              </div>
            ))
          )}
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border/50">
          <p className="text-xs text-muted-foreground text-center">
            {projects.length} projects indexed
          </p>
        </div>
      </aside>
    </>
  );
}