import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Loader2, Plus } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { createProject, CreateProjectRequest } from '@/lib/api';

export function AddProject() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<CreateProjectRequest>({
    name: '',
    description: '',
  });

  const handleInputChange = (field: keyof CreateProjectRequest) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.description.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in both project name and description.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await createProject(formData);

      toast({
        title: 'Project Created',
        description: `Project "${formData.name}" has been added successfully with ID: ${response.project_id}`,
      });

      // Clear form and close modal
      setFormData({ name: '', description: '' });
      setIsOpen(false);
    } catch (error) {
      console.error('Error creating project:', error);
      toast({
        title: 'Error',
        description: 'Failed to create project. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-blue-500/20 hover:from-blue-500/20 hover:to-purple-500/20 transition-all duration-300"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Project
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] bg-gradient-to-br from-slate-900/95 to-slate-800/95 backdrop-blur-xl border-slate-700/50">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Add New Project
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium text-slate-300">
              Project Name
            </label>
            <Input
              id="name"
              type="text"
              placeholder="Enter project name..."
              value={formData.name}
              onChange={handleInputChange('name')}
              className="bg-slate-800/50 border-slate-600/50 focus:border-blue-500/50 text-slate-100 placeholder:text-slate-400"
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-medium text-slate-300">
              Project Description
            </label>
            <Textarea
              id="description"
              placeholder="Describe your project..."
              value={formData.description}
              onChange={handleInputChange('description')}
              className="bg-slate-800/50 border-slate-600/50 focus:border-blue-500/50 text-slate-100 placeholder:text-slate-400 min-h-[100px] resize-none"
              disabled={isLoading}
            />
          </div>
          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isLoading}
              className="border-slate-600/50 text-slate-300 hover:bg-slate-700/50"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !formData.name.trim() || !formData.description.trim()}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Project
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}