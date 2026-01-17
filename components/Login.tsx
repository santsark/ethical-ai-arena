import React, { useState } from 'react';

interface Props {
  onLogin: () => void;
}

export const Login: React.FC<Props> = ({ onLogin }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Hardcoded for client-side demo as requested
    if (password === '91981149') {
      onLogin();
    } else {
      setError('Invalid access code. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
        {/* Header */}
        <div className="bg-slate-900 p-8 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-indigo-500 text-white mb-4 shadow-lg ring-4 ring-slate-800">
             <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
          </div>
          <h2 className="text-2xl font-bold text-white">Ethical AI Arena</h2>
          <p className="text-slate-400 mt-2 text-sm">Analyst Access Portal</p>
        </div>

        {/* Form */}
        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Access Password</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all bg-slate-50 outline-none"
                placeholder="••••••••"
                autoFocus
              />
            </div>
            
            {error && (
              <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg flex items-center gap-2">
                <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/></svg>
                {error}
              </div>
            )}

            <button 
              type="submit" 
              className="w-full bg-indigo-600 text-white py-3 rounded-lg font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
            >
              Authenticate
            </button>
          </form>
          
          <div className="mt-8 pt-6 border-t border-slate-100">
             <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-slate-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <p className="text-xs text-slate-500 leading-relaxed text-justify">
                   This application captures the ethical question submitted and the generated judging results for analytical purposes. 
                   <strong>We do not capture user personal details.</strong> The system is intended strictly for evaluating AI model performance. 
                   Access is restricted to authorized personnel.
                </p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};