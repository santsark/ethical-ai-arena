import React, { useState } from 'react';

interface Props {
  onLogin: (mode: 'USER' | 'ADMIN') => void;
}

export const Login: React.FC<Props> = ({ onLogin }) => {
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: isAdminMode ? 'admin' : 'user',
          password
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        onLogin(data.role);
      } else {
        setError(data.error || 'Invalid credentials');
      }
    } catch (err) {
      setError('Connection failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden relative">

        {/* Toggle Mode */}
        <div className="absolute top-4 right-4 z-10">
          <button
            onClick={() => {
              setIsAdminMode(!isAdminMode);
              setError('');
              setPassword('');
            }}
            className="text-xs font-medium text-slate-400 hover:text-indigo-600 transition-colors"
          >
            {isAdminMode ? '← Back to User Login' : 'Admin Access'}
          </button>
        </div>

        {/* Header */}
        <div className={`p-8 text-center transition-colors ${isAdminMode ? 'bg-slate-800' : 'bg-indigo-900'}`}>
          <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full text-white mb-4 shadow-lg ring-4 ring-opacity-20 ${isAdminMode ? 'bg-red-500 ring-red-400' : 'bg-indigo-500 ring-indigo-400'}`}>
            {isAdminMode ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
            )}
          </div>
          <h2 className="text-2xl font-bold text-white">{isAdminMode ? 'Admin Console' : 'Ethical AI Arena'}</h2>
          <p className="text-slate-400 mt-2 text-sm">{isAdminMode ? 'System Analytics & Logs' : 'Analyst Access Portal'}</p>
        </div>

        {/* Form */}
        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                {isAdminMode ? 'Admin Password' : 'Access Password'}
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full px-4 py-3 rounded-lg border focus:ring-2 transition-all bg-slate-50 outline-none ${isAdminMode ? 'border-red-200 focus:border-red-500 focus:ring-red-200' : 'border-slate-300 focus:border-indigo-500 focus:ring-indigo-500'}`}
                placeholder={isAdminMode ? "Admin Key" : "••••••••"}
                autoFocus
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg flex items-center gap-2">
                <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                {error}
              </div>
            )}

            <button
              type="submit"
              className={`w-full text-white py-3 rounded-lg font-bold transition-colors shadow-lg ${isAdminMode ? 'bg-slate-800 hover:bg-slate-900 shadow-slate-300' : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200'}`}
            >
              {isAdminMode ? 'Enter Console' : 'Authenticate'}
            </button>
          </form>

          {!isAdminMode && (
            <div className="mt-8 pt-6 border-t border-slate-100">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-slate-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <p className="text-xs text-slate-500 leading-relaxed text-justify">
                  This application captures the ethical question submitted and the generated judging results for analytical purposes.
                  <strong>We do not capture user personal details.</strong> The system is intended strictly for evaluating AI model performance.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};