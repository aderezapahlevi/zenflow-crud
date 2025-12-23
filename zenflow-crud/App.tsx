
import React, { useState, useEffect, useMemo } from 'react';
import { Task, TaskStatus, TaskCategory } from './types';
import TaskForm from './components/TaskForm';
import Button from './components/Button';

const App: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>(undefined);
  const [filter, setFilter] = useState<TaskCategory | 'All'>('All');
  const [searchTerm, setSearchTerm] = useState('');

  // Persist tasks to local storage
  useEffect(() => {
    const saved = localStorage.getItem('zenflow_tasks');
    if (saved) {
      try {
        setTasks(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse saved tasks", e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('zenflow_tasks', JSON.stringify(tasks));
  }, [tasks]);

  const addTask = (taskData: Omit<Task, 'id' | 'createdAt'>) => {
    const newTask: Task = {
      ...taskData,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: Date.now(),
    };
    setTasks([newTask, ...tasks]);
    setShowForm(false);
  };

  const updateTask = (taskData: Omit<Task, 'id' | 'createdAt'>) => {
    if (!editingTask) return;
    setTasks(tasks.map(t => t.id === editingTask.id ? { ...t, ...taskData } : t));
    setEditingTask(undefined);
    setShowForm(false);
  };

  const deleteTask = (id: string) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      setTasks(tasks.filter(t => t.id !== id));
    }
  };

  const filteredTasks = useMemo(() => {
    return tasks
      .filter(t => filter === 'All' || t.category === filter)
      .filter(t => 
        t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
  }, [tasks, filter, searchTerm]);

  const toggleStatus = (id: string) => {
    setTasks(tasks.map(t => {
      if (t.id === id) {
        const statuses = Object.values(TaskStatus);
        const currentIndex = statuses.indexOf(t.status);
        const nextIndex = (currentIndex + 1) % statuses.length;
        return { ...t, status: statuses[nextIndex] };
      }
      return t;
    }));
  };

  const categoryColors = {
    [TaskCategory.WORK]: 'bg-blue-100 text-blue-700',
    [TaskCategory.PERSONAL]: 'bg-emerald-100 text-emerald-700',
    [TaskCategory.IDEAS]: 'bg-amber-100 text-amber-700',
    [TaskCategory.URGENT]: 'bg-rose-100 text-rose-700',
  };

  return (
    <div className="min-h-screen pb-12">
      {/* Header */}
      <header className="sticky top-0 z-30 w-full glass mb-8 border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">Z</div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">ZenFlow</h1>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="relative hidden md:block">
              <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"></i>
              <input 
                type="text" 
                placeholder="Search tasks..." 
                className="pl-10 pr-4 py-1.5 rounded-full border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-100 outline-none text-sm w-64 transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="primary" onClick={() => { setEditingTask(undefined); setShowForm(true); }}>
              <i className="fa-solid fa-plus"></i> New Task
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4">
        {/* Filters */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-6 no-scrollbar">
          {['All', ...Object.values(TaskCategory)].map(cat => (
            <button
              key={cat}
              onClick={() => setFilter(cat as any)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                filter === cat 
                ? 'bg-slate-800 text-white shadow-md' 
                : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main List */}
          <div className={`${showForm ? 'lg:col-span-7' : 'lg:col-span-12'} space-y-4`}>
            {filteredTasks.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-300">
                <div className="text-5xl mb-4 text-slate-200">
                  <i className="fa-solid fa-wind"></i>
                </div>
                <h3 className="text-lg font-medium text-slate-500">No tasks found.</h3>
                <p className="text-slate-400">Time to clear your mind or add something new.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredTasks.map(task => (
                  <div key={task.id} className="group bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300">
                    <div className="flex justify-between items-start mb-3">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] uppercase tracking-wider font-bold ${categoryColors[task.category]}`}>
                        {task.category}
                      </span>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => { setEditingTask(task); setShowForm(true); }}
                          className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg"
                        >
                          <i className="fa-solid fa-pen-to-square"></i>
                        </button>
                        <button 
                          onClick={() => deleteTask(task.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg"
                        >
                          <i className="fa-solid fa-trash"></i>
                        </button>
                      </div>
                    </div>
                    
                    <h3 className={`text-lg font-semibold text-slate-800 mb-2 ${task.status === TaskStatus.DONE ? 'line-through text-slate-400' : ''}`}>
                      {task.title}
                    </h3>
                    
                    <p className="text-slate-600 text-sm mb-4 line-clamp-2">
                      {task.description || "No description provided."}
                    </p>
                    
                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-50">
                      <button 
                        onClick={() => toggleStatus(task.id)}
                        className={`text-xs font-semibold flex items-center gap-2 transition-colors ${
                          task.status === TaskStatus.DONE ? 'text-emerald-600' : 'text-slate-500 hover:text-indigo-600'
                        }`}
                      >
                        <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                          task.status === TaskStatus.DONE ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-300'
                        }`}>
                          {task.status === TaskStatus.DONE && <i className="fa-solid fa-check text-[10px]"></i>}
                        </span>
                        {task.status}
                      </button>
                      
                      <span className="text-[10px] text-slate-400 uppercase font-medium">
                        {new Date(task.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Form Side Panel */}
          {showForm && (
            <div className="lg:col-span-5 lg:sticky lg:top-24">
              <TaskForm 
                onSubmit={editingTask ? updateTask : addTask}
                initialData={editingTask}
                onCancel={() => { setShowForm(false); setEditingTask(undefined); }}
              />
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default App;
