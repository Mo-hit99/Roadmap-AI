import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { Send, Bot, User, Loader2, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
import { mentorService } from '../services/api';
import type { MentorChatRequest } from '../services/api';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const quickActions = [
  'What should I do today?',
  'Am I on track?',
  'Give me a shortcut',
  'What are my weak areas?',
];

const MentorPage: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [contextOpen, setContextOpen] = useState(true);
  const [goal, setGoal] = useState('');
  const [skills, setSkills] = useState('');
  const [hours, setHours] = useState(10);
  const [deadline, setDeadline] = useState('');
  const [progress, setProgress] = useState('');
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
  };

  const sendMessage = async (text: string) => {
    if (!text.trim() || !goal.trim()) return;

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: text.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    scrollToBottom();

    try {
      const payload: MentorChatRequest = {
        goal,
        skills: skills.split(',').map((s) => s.trim()).filter(Boolean),
        hours,
        deadline,
        progress,
        message: text.trim(),
      };

      const { reply } = await mentorService.chat(payload);

      const aiMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: reply,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      const errMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: 'Sorry, I couldn\'t process that. Please try again.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setLoading(false);
      scrollToBottom();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  return (
    <div className="mentor-page">
      <div className="page-title-row">
        <div>
          <span className="eyebrow">AI Mentor</span>
          <h1>Career Chat</h1>
        </div>
      </div>

      <div className="mentor-layout">
        {/* Context Panel */}
        <div className={`mentor-context-panel ${contextOpen ? 'open' : 'collapsed'}`}>
          <button
            type="button"
            className="context-toggle"
            onClick={() => setContextOpen(!contextOpen)}
          >
            <Sparkles size={16} />
            <span>Your Context</span>
            {contextOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>

          <AnimatePresence>
            {contextOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="context-fields"
              >
                <label className="form-label">
                  <span>Goal</span>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="e.g. Full Stack Developer"
                    value={goal}
                    onChange={(e) => setGoal(e.target.value)}
                  />
                </label>
                <label className="form-label">
                  <span>Skills</span>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="e.g. HTML, CSS, JavaScript"
                    value={skills}
                    onChange={(e) => setSkills(e.target.value)}
                  />
                </label>
                <div className="form-row">
                  <label className="form-label">
                    <span>Hours/Week</span>
                    <input
                      type="number"
                      className="input-field"
                      value={hours}
                      onChange={(e) => setHours(parseInt(e.target.value) || 10)}
                      min={1}
                    />
                  </label>
                  <label className="form-label">
                    <span>Deadline</span>
                    <input
                      type="date"
                      className="input-field"
                      value={deadline}
                      onChange={(e) => setDeadline(e.target.value)}
                    />
                  </label>
                </div>
                <label className="form-label">
                  <span>Current Progress</span>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="e.g. Completed HTML/CSS basics"
                    value={progress}
                    onChange={(e) => setProgress(e.target.value)}
                  />
                </label>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Chat Area */}
        <div className="mentor-chat-area">
          <div className="chat-messages">
            {messages.length === 0 && (
              <div className="chat-empty-state">
                <Bot size={48} />
                <h2>Your AI Mentor is ready</h2>
                <p>Set your context above, then ask anything about your career plan.</p>
                <div className="quick-actions">
                  {quickActions.map((action) => (
                    <button
                      key={action}
                      type="button"
                      className="btn-secondary quick-action-btn"
                      onClick={() => sendMessage(action)}
                      disabled={!goal.trim() || loading}
                    >
                      {action}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={`chat-bubble ${msg.role}`}
              >
                <div className="bubble-avatar">
                  {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                </div>
                <div className="bubble-content">
                  {msg.role === 'assistant' ? (
                    <div className="bubble-markdown"><ReactMarkdown>{msg.content}</ReactMarkdown></div>
                  ) : (
                    <p>{msg.content}</p>
                  )}
                  <span className="bubble-time">
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </motion.div>
            ))}

            {loading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="chat-bubble assistant"
              >
                <div className="bubble-avatar"><Bot size={16} /></div>
                <div className="bubble-content">
                  <div className="typing-indicator">
                    <span /><span /><span />
                  </div>
                </div>
              </motion.div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* Quick Actions (shown when chat has messages) */}
          {messages.length > 0 && (
            <div className="chat-quick-bar">
              {quickActions.map((action) => (
                <button
                  key={action}
                  type="button"
                  className="quick-chip"
                  onClick={() => sendMessage(action)}
                  disabled={!goal.trim() || loading}
                >
                  {action}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <form className="chat-input-bar" onSubmit={handleSubmit}>
            <input
              type="text"
              className="chat-input"
              placeholder={goal.trim() ? 'Ask your mentor anything...' : 'Set your goal above first...'}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={!goal.trim() || loading}
            />
            <button
              type="submit"
              className="chat-send-btn"
              disabled={!input.trim() || !goal.trim() || loading}
            >
              {loading ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default MentorPage;
