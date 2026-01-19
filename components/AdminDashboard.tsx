import React, { useMemo, useState, useEffect } from 'react';
import { getDatabaseLogs } from '../services/databaseService';
import { LogEntry } from '../types';
import { Spinner } from './Spinner';

interface Props {
  onLogout: () => void;
}

export const AdminDashboard: React.FC<Props> = ({ onLogout }) => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [connectionError, setConnectionError] = useState(false);
  const [expandedRow, setExpandedRow] = useState<number | null>(null);

  // Fetch data on mount
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setConnectionError(false);
      const data = await getDatabaseLogs();
      
      if (data === null) {
        setConnectionError(true);
        setLogs([]);
      } else {
        setLogs(data);
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  // --- ANALYTICS CALCULATION ---
  const stats = useMemo(() => {
    let totalCost = 0;
    let totalTokens = 0;
    let totalTime = 0;
    let totalResponseCount = 0;
    const uniqueSessions = new Set<string>();

    const medalCount: Record<string, { gold: number; silver: number; bronze: number }> = {};

    logs.forEach(log => {
      uniqueSessions.add(log.sessionId);
      
      // Response Metrics
      log.responses.forEach(r => {
        totalCost += r.metrics.cost;
        totalTokens += r.metrics.tokens;
        totalTime += r.metrics.time;
        totalResponseCount++;
      });

      // Medal Calculation (Olympic Style)
      log.judgments.forEach(judge => {
        if (judge.rankings) {
          judge.rankings.forEach(rank => {
            if (!medalCount[rank.model]) {
              medalCount[rank.model] = { gold: 0, silver: 0, bronze: 0 };
            }
            if (rank.position === 1) medalCount[rank.model].gold++;
            if (rank.position === 2) medalCount[rank.model].silver++;
            if (rank.position === 3) medalCount[rank.model].bronze++;
          });
        }
      });
    });

    const avgCost = totalResponseCount > 0 ? totalCost / totalResponseCount : 0;
    const avgTokens = totalResponseCount > 0 ? totalTokens / totalResponseCount : 0;
    const avgTime = totalResponseCount > 0 ? totalTime / totalResponseCount : 0;

    // Sort Medals: Gold > Silver > Bronze
    const sortedMedals = Object.entries(medalCount).sort(([, a], [, b]) => {
      if (b.gold !== a.gold) return b.gold - a.gold;
      if (b.silver !== a.silver) return b.silver - a.silver;
      return b.bronze - a.bronze;
    });

    return {
      totalUsers: uniqueSessions.size,
      totalQuestions: logs.length,
      totalCost,
      avgCost,
      avgTokens,
      avgTime,
      sortedMedals
    };
  }, [logs]);

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 pb-20">
      {/* Admin Header */}
      <header className="bg-slate-900 text-white shadow-lg sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="bg-red-500 p-1.5 rounded-lg">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
              </div>
              <h1 className="text-xl font-bold tracking-tight">Admin Console</h1>
            </div>
            
            {/* Connection Status Badge */}
            {!loading && (
              <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${connectionError ? 'bg-red-900/50 border-red-700 text-red-200' : 'bg-green-900/50 border-green-700 text-green-200'}`}>
                <div className={`w-2 h-2 rounded-full ${connectionError ? 'bg-red-500' : 'bg-green-400'}`}></div>
                {connectionError ? 'DB Connection Failed' : 'PostgreSQL Connected'}
              </div>
            )}
          </div>
          <button onClick={onLogout} className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
            Logout
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="flex flex-col items-center gap-4">
              <Spinner />
              <p className="text-slate-500">Connecting to Neon PostgreSQL...</p>
            </div>
          </div>
        ) : connectionError ? (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
            <h3 className="text-lg font-bold text-red-800 mb-2">Database Connection Error</h3>
            <p className="text-red-600 mb-4">Could not connect to the PostgreSQL database.</p>
            <div className="text-left bg-white p-4 rounded border border-red-100 font-mono text-xs text-slate-600 overflow-auto max-w-2xl mx-auto">
              1. Check if the <strong>DATABASE_URL</strong> in .env.local is correct.<br/>
              2. Ensure your IP is allowed in Neon/Supabase settings (if applicable).<br/>
              3. Check server console logs for detailed error messages.
            </div>
          </div>
        ) : (
          <>
            {/* KPI Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Questions</p>
                <p className="text-3xl font-bold text-slate-900 mt-2">{stats.totalQuestions}</p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Users</p>
                <p className="text-3xl font-bold text-slate-900 mt-2">{stats.totalUsers}</p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Cost</p>
                <p className="text-3xl font-bold text-green-600 mt-2">${stats.totalCost.toFixed(4)}</p>
                <p className="text-xs text-slate-400 mt-1">Avg: ${stats.avgCost.toFixed(5)} / resp</p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Avg Latency</p>
                <p className="text-3xl font-bold text-indigo-600 mt-2">{(stats.avgTime / 1000).toFixed(2)}s</p>
                <p className="text-xs text-slate-400 mt-1">{Math.round(stats.avgTokens)} tokens / resp</p>
              </div>
            </div>

            {/* Olympic Medal Table */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                <h2 className="font-bold text-slate-800">Model Performance (Olympic Rank)</h2>
                <span className="text-xs text-slate-500 italic">Ranking methodology based on gold first, then silver, then bronze.</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      <th className="px-6 py-3">Rank</th>
                      <th className="px-6 py-3">Model</th>
                      <th className="px-6 py-3 text-center">🥇 Gold</th>
                      <th className="px-6 py-3 text-center">🥈 Silver</th>
                      <th className="px-6 py-3 text-center">🥉 Bronze</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {stats.sortedMedals.map(([model, counts], idx) => (
                      <tr key={model} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 font-mono text-slate-400">#{idx + 1}</td>
                        <td className="px-6 py-4 font-bold text-slate-900">{model}</td>
                        <td className="px-6 py-4 text-center font-bold text-yellow-600 bg-yellow-50">{counts.gold}</td>
                        <td className="px-6 py-4 text-center font-bold text-slate-500 bg-slate-100">{counts.silver}</td>
                        <td className="px-6 py-4 text-center font-bold text-amber-700 bg-amber-50">{counts.bronze}</td>
                      </tr>
                    ))}
                    {stats.sortedMedals.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-6 py-8 text-center text-slate-400 italic">No rankings recorded yet.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Data Logs Table */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
                <h2 className="font-bold text-slate-800">Detailed Data Logs (PostgreSQL)</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      <th className="px-6 py-3">Timestamp</th>
                      <th className="px-6 py-3">Question</th>
                      <th className="px-6 py-3">Status</th>
                      <th className="px-6 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {logs.map((log, idx) => (
                      <React.Fragment key={idx}>
                        <tr className="hover:bg-slate-50 cursor-pointer" onClick={() => setExpandedRow(expandedRow === idx ? null : idx)}>
                          <td className="px-6 py-4 text-sm text-slate-500 whitespace-nowrap">
                            {new Date(log.timestamp).toLocaleString()}
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-900 font-medium truncate max-w-xs">
                            {log.question}
                          </td>
                          <td className="px-6 py-4 text-sm">
                            {log.status === 'SUCCESS' ? (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                                Success
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                                Error
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-sm text-indigo-600 hover:text-indigo-900 font-medium">
                            {expandedRow === idx ? 'Close' : 'View Details'}
                          </td>
                        </tr>
                        {expandedRow === idx && (
                          <tr className="bg-slate-50">
                            <td colSpan={4} className="px-6 py-4">
                              <div className="bg-white rounded-lg border border-slate-200 p-4 font-mono text-xs overflow-auto max-h-64 whitespace-pre-wrap">
                                {JSON.stringify(log, null, 2)}
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
                    {logs.length === 0 && (
                      <tr>
                        <td colSpan={4} className="px-6 py-8 text-center text-slate-400 italic">No logs found in database.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

      </main>
    </div>
  );
};