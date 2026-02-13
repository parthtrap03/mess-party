import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Lock, Shield, BarChart, RefreshCw, LogOut, Loader2, CheckCircle2, AlertCircle, Compass, ArrowRight } from 'lucide-react';

// Import original frontend components
import Layout from './components/layout/Layout';
import LandingPage from './pages/LandingPage';
import SecretPage from './pages/SecretPage';
import Home from './pages/Home';
import Explore from './pages/Explore';
import Messages from './pages/Messages';
import Profile from './pages/Profile';
import AIChat from './pages/AIChat';

const API_BASE = import.meta.env.VITE_API_BASE || '/api';

// --- Shared UI Components ---

const Button = ({ children, onClick, variant = 'primary', className = '', disabled = false, loading = false }) => {
  const variants = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20',
    danger: 'bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-500/20',
    secondary: 'bg-gray-700 hover:bg-gray-600 text-white shadow-lg shadow-black/20',
    success: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-500/20',
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`px-6 py-2.5 rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-95 ${variants[variant]} ${className}`}
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : children}
    </button>
  );
};

const Card = ({ children, className = '' }) => (
  <div className={`bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl ${className}`}>
    {children}
  </div>
);

// --- Matrix Entry Gate Component with Hidden Party Mode ---

function MatrixGate({ onProceed, onTracker }) {
  const [passkey, setPasskey] = useState('');
  const [unlocked, setUnlocked] = useState(false);
  const [error, setError] = useState('');
  const [isPaneOpen, setIsPaneOpen] = useState(false);
  const canvasRef = useRef(null);
  const GATE_PASSKEY = 'welcome';

  // Matrix animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationId;

    const chars = '01';
    const primaryColor = '#00ff41';
    let columns;
    let drops = [];

    const init = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      const fontSize = 20;
      columns = Math.ceil(canvas.width / fontSize);
      drops = Array(columns).fill(0).map(() => Math.random() * -100);
    };

    const draw = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.font = '20px "JetBrains Mono", monospace';

      for (let i = 0; i < drops.length; i++) {
        const text = chars[Math.floor(Math.random() * chars.length)];
        const x = i * 20;
        const y = drops[i] * 20;

        ctx.fillStyle = primaryColor;
        ctx.shadowBlur = 10;
        ctx.shadowColor = primaryColor;
        ctx.fillText(text, x, y);

        if (y > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i] += 0.5;
      }
      ctx.shadowBlur = 0;
      animationId = requestAnimationFrame(draw);
    };

    init();
    draw();
    window.addEventListener('resize', init);
    const timer = setTimeout(() => setIsPaneOpen(true), 500);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', init);
      clearTimeout(timer);
    };
  }, []);

  const handleUnlock = (e) => {
    e.preventDefault();
    if (passkey === GATE_PASSKEY) {
      setUnlocked(true);
      setError('');
    } else {
      setError('ACCESS_DENIED: UNAUTHORIZED');
    }
  };

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden font-mono text-green-500">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full opacity-40" />

      {/* Sliding Pane */}
      <div
        className={`fixed top-0 right-0 h-full w-full md:w-[500px] bg-black/90 backdrop-blur-2xl border-l border-green-500/20 transition-all duration-1000 ease-[cubic-bezier(0.23,1,0.32,1)] z-50 flex flex-col shadow-[-20px_0_50px_rgba(0,0,0,0.5)] ${isPaneOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="p-8 flex-1 flex flex-col">
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-1.5 h-6 bg-green-500 animate-pulse" />
              <h2 className="text-xl font-bold tracking-widest uppercase">Access_Gate</h2>
            </div>
            <div className="h-[1px] w-full bg-gradient-to-r from-green-500/50 to-transparent" />
          </div>

          {!unlocked ? (
            <div className="space-y-12 animate-in fade-in slide-in-from-right duration-700">
              <div className="space-y-4">
                <p className="text-xs opacity-50 uppercase tracking-[0.3em]">System Authentication</p>
                <h1 className="text-4xl font-black text-white leading-none tracking-tighter">WAKE_UP<br />NEO</h1>
              </div>

              <form onSubmit={handleUnlock} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest opacity-40">Access_Code</label>
                  <input
                    type="password"
                    placeholder="ENTER_PASSKEY"
                    value={passkey}
                    onChange={(e) => setPasskey(e.target.value)}
                    className="w-full bg-green-500/5 border border-green-500/20 rounded-xl px-6 py-5 text-green-400 placeholder-green-900/50 focus:outline-none focus:border-green-500 focus:bg-green-500/10 transition-all text-2xl tracking-[0.4em] font-bold"
                    autoFocus
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-green-500 hover:bg-green-400 text-black font-black py-5 rounded-xl transition-all active:scale-[0.98] flex items-center justify-center gap-3 uppercase tracking-widest shadow-[0_0_30px_rgba(34,197,94,0.3)] group"
                >
                  <Lock className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                  Enter_Matrix
                </button>
              </form>

              {error && (
                <div className="flex items-center gap-3 text-red-500 font-bold text-xs uppercase tracking-wider animate-shake">
                  <AlertCircle className="w-5 h-5" /> {error}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-10 animate-in fade-in slide-in-from-bottom duration-1000">
              <div className="space-y-4">
                <p className="text-xs text-blue-400 uppercase tracking-[0.3em]">Authentication Successful</p>
                <h1 className="text-4xl font-black text-white leading-none tracking-tighter">SELECT_PATH</h1>
              </div>

              <div className="space-y-4">
                <button
                  onClick={onProceed}
                  className="w-full group relative flex flex-col p-6 rounded-2xl border border-blue-500/30 bg-blue-500/5 hover:bg-blue-600 hover:border-blue-400 transition-all duration-500 text-left"
                >
                  <div className="flex items-center justify-between mb-2">
                    <Compass className="w-8 h-8 text-blue-500 group-hover:text-white transition-colors" />
                    <div className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />
                  </div>
                  <span className="text-2xl font-black text-white uppercase tracking-tighter group-hover:translate-x-2 transition-transform">Proceed</span>
                  <p className="text-xs text-blue-400 group-hover:text-blue-100 transition-colors">INITIATE SOCIAL EXPERIENCE PROTOCOL</p>
                </button>

                <button
                  onClick={onTracker}
                  className="w-full group relative flex flex-col p-6 rounded-2xl border border-red-500/30 bg-red-500/5 hover:bg-red-600 hover:border-red-400 transition-all duration-500 text-left"
                >
                  <div className="flex items-center justify-between mb-2">
                    <BarChart className="w-8 h-8 text-red-500 group-hover:text-white transition-colors" />
                    <div className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                  </div>
                  <span className="text-2xl font-black text-white uppercase tracking-tighter group-hover:translate-x-2 transition-transform">Look Around</span>
                  <p className="text-xs text-red-400 group-hover:text-red-100 transition-colors">ACCESS NETWORK TELEMETRY</p>
                </button>
              </div>
            </div>
          )}

          <div className="mt-auto pt-10 text-[10px] opacity-20 uppercase tracking-[0.5em] text-center">
            System_Online | Matrix_Protocol_Active
          </div>
        </div>
      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        .animate-shake { animation: shake 0.2s ease-in-out infinite; }
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slide-in-from-bottom {
          from { transform: translateY(20px); }
          to { transform: translateY(0); }
        }
        .animate-in {
          animation: fade-in 0.7s ease-out, slide-in-from-bottom 0.7s ease-out;
        }
      `}</style>
    </div>
  );
}

// --- Tracker System Components ---

function TrackerPublic() {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const track = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${API_BASE}/track-request`, { method: 'POST' });
        const data = await response.json();
        setStatus(data);
      } catch (error) {
        setStatus({ error: 'OFFLINE' });
      } finally {
        setLoading(false);
      }
    };
    track();
  }, []);

  if (loading) return <div className="min-h-screen flex items-center justify-center text-green-500 animate-pulse uppercase tracking-widest text-sm">Synchronizing_Metrics...</div>;

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6">
      <Card className="max-w-md w-full border-green-500/20 text-center space-y-8 p-12">
        <div className="space-y-2">
          <Shield className="w-12 h-12 text-green-500 mx-auto mb-4" />
          <h1 className="text-3xl font-black text-white uppercase tracking-tighter">Network_Status</h1>
          <p className="text-green-500/50 text-xs tracking-widest uppercase">Real-Time telemetry stream</p>
        </div>

        {status?.error ? (
          <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-500 font-bold uppercase text-xs tracking-widest">Connection_Failure: System_Offline</div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            <div className="p-6 bg-white/5 rounded-2xl border border-white/5">
              <span className="text-[10px] text-green-500/40 uppercase tracking-widest block mb-2">Total_Hits</span>
              <span className="text-4xl font-black text-white tracking-tighter">{status?.currentCount}</span>
            </div>
            <div className="p-6 bg-white/5 rounded-2xl border border-white/5">
              <span className="text-[10px] text-blue-500/40 uppercase tracking-widest block mb-2">Available</span>
              <span className="text-4xl font-black text-blue-500 tracking-tighter">{status?.remainingRequests}</span>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}

function TrackerAdmin() {
  const [passkey, setPasskey] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const [stats, setStats] = useState(null);

  const fetchStats = async () => {
    try {
      const response = await fetch(`${API_BASE}/admin/stats`, { headers: { 'x-passkey': passkey } });
      const data = await response.json();
      if (response.ok) { setStats(data); setAuthenticated(true); }
    } catch { }
  };

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-6">
        <Card className="max-w-md w-full border-red-500/20 text-center space-y-8">
          <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">Admin_Terminal</h2>
          <form onSubmit={e => { e.preventDefault(); fetchStats(); }} className="space-y-4">
            <input type="password" value={passkey} onChange={e => setPasskey(e.target.value)} className="w-full bg-white/5 border border-white/10 p-4 rounded-xl text-white text-center tracking-widest" placeholder="CORE_PASSKEY" />
            <Button className="w-full" type="submit" variant="danger">Access_Core</Button>
          </form>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black p-8 text-green-500">
      <Card className="max-w-2xl mx-auto border-green-500/20 p-12">
        <h2 className="text-2xl font-black text-white mb-8 border-b border-green-500/20 pb-4 uppercase italic">Root_Metrics</h2>
        <div className="grid grid-cols-2 gap-8 mb-12">
          <div><p className="text-xs opacity-50 mb-1">DATA_POINTS</p><p className="text-5xl font-black text-white">{stats?.currentCount}</p></div>
          <div><p className="text-xs opacity-50 mb-1">BUFFER_SIZE</p><p className="text-5xl font-black text-blue-500">{stats?.remainingRequests}</p></div>
        </div>
        <div className="flex gap-4">
          <Button onClick={fetchStats} className="flex-1">Refresh_Stream</Button>
          <Button onClick={() => setAuthenticated(false)} variant="secondary" className="flex-1">Terminate_Session</Button>
        </div>
      </Card>
    </div>
  );
}

function TrackerApp({ onExit }) {
  const [tab, setTab] = useState('public');
  return (
    <div className="min-h-screen bg-black text-green-500 font-mono">
      <nav className="p-6 border-b border-white/5 flex justify-between items-center">
        <div className="font-black text-2xl tracking-tighter text-white italic">TRACKER_OS<span className="text-red-600">.v1</span></div>
        <div className="flex items-center gap-4">
          <button onClick={() => setTab('public')} className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${tab === 'public' ? 'bg-red-600 text-white' : 'text-white/40 hover:text-white'}`}>Public</button>
          <button onClick={() => setTab('admin')} className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${tab === 'admin' ? 'bg-red-600 text-white' : 'text-white/40 hover:text-white'}`}>Admin</button>
          <button onClick={onExit} className="p-2 text-white/20 hover:text-red-500 transition-colors"><LogOut className="w-5 h-5" /></button>
        </div>
      </nav>
      {tab === 'public' ? <TrackerPublic /> : <TrackerAdmin />}
    </div>
  );
}

// --- Main Root Component ---

function App() {
  const [mode, setMode] = useState('gate');

  if (mode === 'gate') {
    return <MatrixGate onProceed={() => setMode('main')} onTracker={() => setMode('tracker')} />;
  }

  if (mode === 'tracker') {
    return <TrackerApp onExit={() => setMode('gate')} />;
  }

  return (
    <Router>
      <div className="min-h-screen relative bg-black">
        <button
          onClick={() => setMode('gate')}
          className="fixed bottom-6 right-6 z-[9999] p-3 bg-white/5 backdrop-blur-3xl rounded-2xl text-white/20 hover:text-green-500 hover:border-green-500/50 transition-all border border-white/5 shadow-2xl"
          title="Back to Gate"
        >
          <Lock className="w-5 h-5" />
        </button>

        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/secret" element={<SecretPage />} />
          <Route path="/home" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="explore" element={<Explore />} />
            <Route path="messages" element={<Messages />} />
            <Route path="profile" element={<Profile />} />
            <Route path="ai-chat" element={<AIChat />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
