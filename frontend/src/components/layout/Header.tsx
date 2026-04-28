import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="mb-16 text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-sm font-semibold mb-6"
      >
        <Sparkles size={16} />
        AI-Powered Career Guidance
      </motion.div>
      
      <h1 className="text-5xl md:text-7xl font-extrabold mb-6 tracking-tight">
        Chart Your <span className="bg-gradient-to-r from-purple-400 via-blue-400 to-indigo-400 bg-clip-text text-transparent">Future Path</span>
      </h1>
      
      <p className="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
        Bridge the gap between your current skills and your dream career with 
        data-driven roadmaps and personalized AI coaching.
      </p>
    </header>
  );
};

export default Header;
