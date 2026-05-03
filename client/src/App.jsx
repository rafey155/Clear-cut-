import React, { useState, useEffect } from 'react';
import ImageUploader from './components/ImageUploader';
import { Scissors, Sun, Moon } from 'lucide-react';

function App() {
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') || 'dark';
    }
    return 'dark';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark');

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 dark:bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] dark:from-slate-900 dark:via-slate-950 dark:to-black text-slate-900 dark:text-slate-100 flex flex-col relative overflow-hidden transition-colors duration-300">
      {/* Decorative background elements */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-primary/10 dark:bg-primary/20 blur-[120px] rounded-full pointer-events-none transition-colors duration-300"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-indigo-600/10 dark:bg-indigo-600/20 blur-[120px] rounded-full pointer-events-none transition-colors duration-300"></div>

      {/* Header */}
      <header className="w-full p-6 relative z-10">
        <div className="max-w-6xl mx-auto flex items-center justify-between w-full">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 dark:bg-primary/20 p-2 rounded-xl backdrop-blur-sm border border-primary/20 dark:border-primary/30 shadow-md dark:shadow-[0_0_15px_rgba(99,102,241,0.2)] transition-colors duration-300">
              <Scissors className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-800 to-slate-500 dark:from-white dark:to-slate-400">Clear Cut</h1>
              <p className="text-xs font-semibold text-primary tracking-widest uppercase">AI Background Remover</p>
            </div>
          </div>
          
          <button
            onClick={toggleTheme}
            className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all shadow-sm"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center relative z-10 w-full py-12">
        <div className="text-center max-w-3xl mx-auto px-4 mb-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <h2 className="text-5xl md:text-7xl font-extrabold mb-6 leading-tight tracking-tight text-slate-900 dark:text-white transition-colors duration-300">
            Cut the background,<br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-indigo-500 to-purple-600 dark:from-primary dark:via-indigo-400 dark:to-purple-500">keep the focus</span>
          </h2>
          <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed transition-colors duration-300">
            Instantly remove backgrounds from your images in one click. 
            No sign-up required, 100% free and automatic.
          </p>
        </div>

        <ImageUploader />
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-slate-200 dark:border-slate-800/60 bg-white/50 dark:bg-slate-900/30 backdrop-blur-md py-8 relative z-10 mt-auto transition-colors duration-300">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium tracking-wide leading-relaxed transition-colors duration-300">
            © 2026 Clear Cut — Privacy First Image Background Remover — Developed by Mohd Rafey
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
