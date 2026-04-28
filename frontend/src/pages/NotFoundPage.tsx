import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

const NotFoundPage: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="center-state elevated not-found-page"
    >
      <Compass size={36} />
      <span className="eyebrow">404 Error</span>
      <h2>Page not found</h2>
      <p>The page you were trying to reach does not exist or may have been moved.</p>
      <div className="result-actions">
        <Link to="/roadmap" className="btn-primary">
          Go to Roadmap
        </Link>
        <Link to="/" className="btn-secondary">
          <ArrowLeft size={16} />
          Back Home
        </Link>
      </div>
    </motion.div>
  );
};

export default NotFoundPage;
