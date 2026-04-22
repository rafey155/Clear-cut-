import React from 'react';
import ImageUploader from './components/ImageUploader';
import { Scissors } from 'lucide-react';

function App() {
  return (
    <div className="min-h-screen bg-slate-950 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black text-slate-100 flex flex-col relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-primary/20 blur-[120px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-indigo-600/20 blur-[120px] rounded-full pointer-events-none"></div>

      {/* Header */}
      <header className="w-full p-6 relative z-10">
        <div className="max-w-6xl mx-auto flex items-center justify-center sm:justify-start">
          <div className="flex items-center gap-3">
            <div className="bg-primary/20 p-2 rounded-xl backdrop-blur-sm border border-primary/30 shadow-[0_0_15px_rgba(99,102,241,0.2)]">
              <Scissors className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">Clear Cut</h1>
              <p className="text-xs font-semibold text-primary tracking-widest uppercase">AI Background Remover</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center relative z-10 w-full py-12">
        <div className="text-center max-w-3xl mx-auto px-4 mb-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <h2 className="text-5xl md:text-7xl font-extrabold mb-6 leading-tight tracking-tight">
            Cut the background,<br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-indigo-400 to-purple-500">keep the focus</span>
          </h2>
          <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Instantly remove backgrounds from your images in one click. 
            No sign-up required, 100% free and automatic.
          </p>
        </div>

        <ImageUploader />
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-slate-800/60 bg-slate-900/30 backdrop-blur-md py-8 relative z-10 mt-auto">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <p className="text-sm text-slate-400 font-medium tracking-wide leading-relaxed">
            © 2026 Clear Cut — Privacy First Image Background Remover — Developed by Mohd Rafey
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
