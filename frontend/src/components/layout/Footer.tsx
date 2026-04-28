import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="relative mt-24 border-t border-white/5 py-8 text-center text-gray-600 text-sm">
      <p>© {new Date().getFullYear()} AI Roadmap Generator. Built for the future of learning.</p>
    </footer>
  );
};

export default Footer;
