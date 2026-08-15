import React, { useState, useRef, useEffect } from 'react';
import api from '../services/api';

const AiAssistant = () => {
  const [messages, setMessages] = useState([
    { role: 'assistant', text: 'Hello! I am your ParkOps AI Assistant. Ask me about expected occupancy, revenue forecasts, or peak hours.' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input.trim();
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setInput('');
    setLoading(true);

    try {
      const res = await api.post('/admin/ai/ask', { question: userMessage });
      if (res.data.success) {
        setMessages(prev => [...prev, { role: 'assistant', structured: res.data.data.structured }]);
      } else {
        setMessages(prev => [...prev, { role: 'assistant', text: 'Sorry, I encountered an error.' }]);
      }
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', text: 'Error: Could not connect to AI service. Ensure you have the required permissions.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] gap-4">
      <div className="flex flex-col">
        <h1 className="text-2xl font-bold font-display text-slate-100 flex items-center gap-2">
          <svg className="w-6 h-6 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
          AI Assistant
        </h1>
        <p className="text-xs text-slate-400">Natural language insights into your parking operations.</p>
      </div>

      <div className="flex-1 glass-card flex flex-col bg-slate-900/40 overflow-hidden relative">
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] rounded-xl p-4 ${msg.role === 'user' ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-slate-800 text-slate-200 rounded-bl-none border border-slate-700'}`}>
                
                {msg.text && <p className="text-sm">{msg.text}</p>}
                
                {msg.structured && (
                  <div className="space-y-3 text-sm">
                    <div>
                      <span className="font-semibold text-indigo-300">Answer: </span>
                      <span>{msg.structured.answer}</span>
                    </div>
                    {msg.structured.evidence !== 'N/A' && (
                      <div className="p-2 bg-slate-900/50 rounded border border-slate-700/50 text-slate-300">
                        <span className="font-semibold text-slate-400 text-xs uppercase tracking-wider block mb-1">Evidence</span>
                        {msg.structured.evidence}
                      </div>
                    )}
                    {msg.structured.recommendation !== 'N/A' && (
                      <div className="p-2 bg-indigo-500/10 rounded border border-indigo-500/20 text-indigo-200">
                        <span className="font-semibold text-indigo-400 text-xs uppercase tracking-wider block mb-1">Recommendation</span>
                        {msg.structured.recommendation}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-slate-800 text-slate-400 rounded-xl rounded-bl-none p-4 flex gap-1 items-center">
                <span className="w-2 h-2 rounded-full bg-slate-500 animate-bounce"></span>
                <span className="w-2 h-2 rounded-full bg-slate-500 animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                <span className="w-2 h-2 rounded-full bg-slate-500 animate-bounce" style={{ animationDelay: '0.4s' }}></span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSend} className="p-4 border-t border-slate-800 bg-slate-900/80">
          <div className="relative flex items-center">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about revenue, occupancy, or peak hours..."
              className="w-full bg-slate-800 border border-slate-700 rounded-full py-3 pl-4 pr-12 text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="absolute right-2 p-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-700 disabled:text-slate-500 text-white rounded-full transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
          <div className="text-center mt-2">
            <span className="text-[10px] text-slate-500 uppercase tracking-widest">AI predictions may be inaccurate. Verify critical operations.</span>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AiAssistant;
