import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';

const root = document.getElementById('root');
if (!root) throw new Error('Missing #root');

createRoot(root).render(
  <StrictMode>
    <main className="flex min-h-dvh items-center justify-center p-6 text-center text-5xl font-bold">
      Matikkaseikkailu tulossa! 🚀
    </main>
  </StrictMode>,
);
