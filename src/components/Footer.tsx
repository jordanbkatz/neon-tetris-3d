import React from 'react';

interface FooterProps {
  className?: string;
}

export const Footer: React.FC<FooterProps> = ({ className = "" }) => {
  return (
    <footer className={`absolute bottom-0 left-0 w-full z-30 py-1 bg-black/95 border-t border-black text-center text-[10px] font-orbitron uppercase tracking-widest text-slate-400 ${className}`}>
      <a 
        href="https://jordankatz.dev" 
        target="_blank" 
        rel="noopener noreferrer"
        className="hover:text-cyan-400 transition-colors"
      >
        a Jordan Katz project
      </a>
    </footer>
  );
};
