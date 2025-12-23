
import React, { useState, useEffect } from 'react';
import { Task, TaskCategory, TaskStatus } from '../types';
import Button from './Button';
import { enhanceTaskContent } from '../services/geminiService';

interface TaskFormProps {
  onSubmit: (task: Omit<Task, 'id' | 'createdAt'>) => void;
  initialData?: Task;
  onCancel: () => void;
}

const TaskForm: React.FC<TaskFormProps> = ({ onSubmit, initialData, onCancel }) => {
  const [title, setTitle] = useState(initialData?.title || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [category, setCategory] = useState<TaskCategory>(initialData?.category || TaskCategory.PERSONAL);
  const [status, setStatus] = useState<TaskStatus>(initialData?.status || TaskStatus.TODO);
  const [isEnhancing, setIsEnhancing] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onSubmit({ title, description, category, status });
  };

  const handleEnhance = async () => {
    if (!title && !description) return;
    setIsEnhancing(true);
    const result = await enhanceTaskContent(title, description);
    if (result) {
      setTitle(result.refinedTitle);
      setDescription(result.refinedDescription);
      // Ensure suggestedCategory matches enum
      if (Object.values(TaskCategory).includes(result.suggestedCategory as TaskCategory)) {
        setCategory(result.suggestedCategory as TaskCategory);
      }
    }
    setIsEnhancing(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-6 glass rounded-2xl">
      <h2 className="text-xl font-bold text-slate-800 mb-4">
        {initialData ? 'Edit Task' : 'Create New Task'}
      </h2>
      
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
          placeholder="What needs to be done?"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all min-h-[100px]"
          placeholder="Add some details..."
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as TaskCategory)}
            className="w-full px-4 py-2 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {Object.values(TaskCategory).map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as TaskStatus)}
            className="w-full px-4 py-2 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {Object.values(TaskStatus).map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 pt-4">
        <Button type="submit" variant="primary">
          {initialData ? 'Update Task' : 'Save Task'}
        </Button>
        <Button 
          type="button" 
          variant="ai" 
          onClick={handleEnhance} 
          isLoading={isEnhancing}
          title="Enhance with Gemini AI"
        >
          <i className="fa-solid fa-wand-magic-sparkles"></i> AI Refine
        </Button>
        <Button type="button" variant="ghost" onClick={onCancel} className="ml-auto">
          Cancel
        </Button>
      </div>
    </form>
  );
};

export default TaskForm;
