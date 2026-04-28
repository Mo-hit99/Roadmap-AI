import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, Loader2, ArrowRight, CheckCircle2 } from 'lucide-react';

interface AuthFormProps {
  title: string;
  buttonText: string;
  onSubmit: (email: string, password: string) => Promise<void>;
  linkText: string;
  linkHref: string;
  onLinkClick: () => void;
}

const AuthForm: React.FC<AuthFormProps> = ({ title, buttonText, onSubmit, linkText, onLinkClick }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await onSubmit(email, password);
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="auth-layout noise"
    >
      <section className="auth-brand-panel">
        <div className="auth-logo">RAI</div>
        <h1>Roadmap AI</h1>
        <p>Build a roadmap for your life with AI.</p>
        <div className="auth-feature-list">
          {['Career Roadmaps', 'Skill Analysis', 'Goal Planning'].map((feature) => (
            <span key={feature}>
              <CheckCircle2 size={16} />
              {feature}
            </span>
          ))}
        </div>
      </section>

      <section className="auth-form-panel">
        <form onSubmit={handleSubmit} className="auth-card">
          <span className="eyebrow">Secure workspace</span>
          <h2>{title}</h2>

          <label className="form-label">
            <span>
              <Mail size={17} />
              Email Address
            </span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field"
              autoComplete="email"
            />
          </label>

          <label className="form-label">
            <span>
              <Lock size={17} />
              Password
            </span>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field"
              autoComplete={buttonText.toLowerCase().includes('create') ? 'new-password' : 'current-password'}
            />
          </label>

          {error && <p className="form-error">{error}</p>}

          <button type="submit" disabled={loading} className="btn-primary auth-submit">
            {loading ? <Loader2 className="animate-spin" size={20} /> : buttonText}
            {!loading && <ArrowRight size={18} />}
          </button>

          <p className="auth-link">
            <button type="button" onClick={onLinkClick}>
              {linkText}
            </button>
          </p>
        </form>
      </section>
    </motion.div>
  );
};

export default AuthForm;
