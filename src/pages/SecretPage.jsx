import { useState, useEffect, useRef, useCallback } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const DODGE_LIMIT = 7;

const SecretPage = () => {
    const navigate = useNavigate();
    const [isOn, setIsOn] = useState(true);
    const [loading, setLoading] = useState(true);
    const [time, setTime] = useState(new Date());

    // Clock chase game state
    const [clockPos, setClockPos] = useState({ x: 50, y: 85 });
    const [dodgeCount, setDodgeCount] = useState(0);
    const [caught, setCaught] = useState(false);
    const [showMessage, setShowMessage] = useState('');
    const [showPills, setShowPills] = useState(false);
    const [billboardActive, setBillboardActive] = useState(false);
    const clockRef = useRef(null);
    const billboardCanvasRef = useRef(null);

    // Update time every second
    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    // Verify admin
    useEffect(() => {
        const verifyAdmin = async () => {
            const token = localStorage.getItem('partySessionToken');
            if (!token) { navigate('/'); return; }
            try {
                const response = await fetch('/api/party/authenticate', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'x-session-token': token },
                    body: JSON.stringify({ passkey: 'welcome' })
                });
                const data = await response.json();
                if (data.role !== 'host') { navigate('/'); }
                else { setLoading(false); }
            } catch (error) { navigate('/'); }
        };
        verifyAdmin();
    }, [navigate]);

    // Dodge logic
    const handleDodge = useCallback(() => {
        if (caught || dodgeCount >= DODGE_LIMIT) return;
        const newDodgeCount = dodgeCount + 1;
        setDodgeCount(newDodgeCount);

        if (newDodgeCount >= DODGE_LIMIT) {
            setClockPos({ x: 50, y: 80 });
            setShowMessage('I give up... click me 😔');
            setTimeout(() => setShowMessage(''), 2000);
            return;
        }

        const newX = 15 + Math.random() * 70;
        const newY = 15 + Math.random() * 70;
        setClockPos({ x: newX, y: newY });

        const taunts = [
            'Too slow! 😜', 'Not even close!', 'Catch me if you can!',
            'Nope! 💨', 'Almost! 😏', 'Try again!', 'Haha! 🏃‍♂️'
        ];
        setShowMessage(taunts[newDodgeCount - 1] || 'Missed!');
        setTimeout(() => setShowMessage(''), 800);
    }, [dodgeCount, caught]);

    // Catch clock
    const handleCatchClock = () => {
        if (dodgeCount < DODGE_LIMIT) return;
        setCaught(true);
        setShowMessage('Caught You');
        // Do NOT clear the message — it stays permanently clickable
    };

    // Click "Caught You" to reveal pills
    const handleMessageClick = () => {
        if (caught && !showPills && !billboardActive) {
            setShowPills(true);
        }
    };

    // Red Pill -> Birthday Billboard
    const handleRedPill = () => {
        setShowPills(false);
        setShowMessage('');
        setBillboardActive(true);
    };

    // Blue Pill -> Logout
    const handleBluePill = async () => {
        const token = localStorage.getItem('partySessionToken');

        // Set logout flag to prevent immediate re-auth loop
        localStorage.setItem('justLoggedOut', Date.now().toString());

        // Call logout endpoint to reset party if admin
        if (token) {
            try {
                await fetch('/api/party/logout', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-session-token': token
                    }
                });
            } catch (error) {
                console.error('Logout error:', error);
            }
        }

        localStorage.removeItem('partySessionToken');
        navigate('/');
    };

    const handleToggle = () => {
        setIsOn(false);
        setTimeout(() => navigate('/'), 300);
    };

    // Matrix Fibonacci animation for billboard
    useEffect(() => {
        if (!billboardActive || !billboardCanvasRef.current) return;

        const canvas = billboardCanvasRef.current;
        const ctx = canvas.getContext('2d');

        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const fibonacci = [1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89];
        const columns = Math.floor(canvas.width / 20);
        const drops = Array(columns).fill(1);

        // Track mouse for interaction
        let mouse = { x: -1000, y: -1000 };
        const handleMouseMove = (e) => {
            mouse.x = e.clientX;
            mouse.y = e.clientY;
        };
        window.addEventListener('mousemove', handleMouseMove);

        const draw = () => {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            ctx.font = '15px monospace';

            for (let i = 0; i < drops.length; i++) {
                const text = fibonacci[Math.floor(Math.random() * fibonacci.length)];
                const x = i * 20;
                const y = drops[i] * 20;

                // Calculate distance to mouse
                const dist = Math.hypot(x - mouse.x, y - mouse.y);

                // Glitch effect near cursor
                if (dist < 100) {
                    ctx.fillStyle = '#ffffff'; // White hot center
                    ctx.shadowBlur = 15;
                    ctx.shadowColor = '#00ff41'; // Green glow
                } else {
                    ctx.fillStyle = '#00ff41';
                    ctx.shadowBlur = 0;
                }

                ctx.fillText(text, x, y);

                // Reset shadow for next iteration/rect clear
                ctx.shadowBlur = 0;

                if (drops[i] * 20 > canvas.height && Math.random() > 0.975) {
                    drops[i] = 0;
                }
                drops[i]++;
            }
        };

        const interval = setInterval(draw, 33);

        const handleResize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            // Recalculate columns on resize
            const newColumns = Math.floor(canvas.width / 20);
            // Preserve existing drops if possible, or pad/truncate
            // Start simple: just reset or it might look weird
        };
        window.addEventListener('resize', handleResize);

        return () => {
            clearInterval(interval);
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('mousemove', handleMouseMove);
        };
    }, [billboardActive]);

    if (loading) return <div className="min-h-screen bg-white flex items-center justify-center">Loading...</div>;

    const isSurrendered = dodgeCount >= DODGE_LIMIT;

    return (
        <div className={`min-h-screen flex flex-col items-center justify-center transition-colors duration-1000 relative overflow-hidden select-none ${caught ? 'bg-black' : 'bg-white'}`}>

            {/* ===== BILLBOARD OVERLAY ===== */}
            {billboardActive && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-black overflow-hidden">
                    <canvas ref={billboardCanvasRef} className="absolute inset-0 w-full h-full" />
                    <div className="billboard-track relative z-10">
                        <span className="billboard-text">
                            HAPPY BIRTHDAY PROGRAMMER &nbsp;✦&nbsp; HAPPY BIRTHDAY PROGRAMMER &nbsp;✦&nbsp; HAPPY BIRTHDAY PROGRAMMER &nbsp;✦&nbsp;
                        </span>
                    </div>
                </div>
            )}

            {/* Back Button */}
            {!billboardActive && (
                <button
                    onClick={() => navigate('/')}
                    className="absolute top-8 left-8 p-2 rounded-full hover:bg-gray-100 transition-colors z-30"
                >
                    <ArrowLeft className="w-6 h-6 text-gray-600" />
                </button>
            )}

            {/* Main Content (Family + Switch) — fades on catch */}
            <div className={`flex flex-col items-center gap-12 transition-opacity duration-1000 ${caught ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
                <h1 className="font-serif text-6xl text-gray-800 tracking-wide">Family</h1>
                <button
                    onClick={handleToggle}
                    className={`relative w-24 h-12 rounded-full transition-colors duration-300 ease-in-out focus:outline-none focus:ring-4 focus:ring-[#8B4513]/30 ${isOn ? 'bg-[#8B4513]' : 'bg-gray-300'}`}
                >
                    <span className={`absolute top-1 left-1 bg-white w-10 h-10 rounded-full shadow-md transform transition-transform duration-300 ease-in-out ${isOn ? 'translate-x-12' : 'translate-x-0'}`} />
                </button>
            </div>

            {/* Taunt Messages (for dodge phase — these fade out) */}
            {showMessage && !caught && (
                <div
                    className="absolute top-1/4 left-1/2 z-40 font-mono font-bold rounded-lg taunt-msg"
                    style={{
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        color: '#333',
                        border: '1px solid #ddd',
                        boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                        fontSize: '1.25rem',
                        padding: '0.75rem 1.5rem',
                        transform: 'translate(-50%, -50%)',
                    }}
                >
                    {showMessage}
                </div>
            )}

            {/* "CAUGHT YOU" message — stays visible, clickable */}
            {caught && !billboardActive && (
                <div
                    onClick={handleMessageClick}
                    className="absolute top-1/4 left-1/2 z-40 font-mono font-bold rounded-lg caught-msg"
                    style={{
                        transform: 'translate(-50%, -50%)',
                        backgroundColor: 'rgba(0, 0, 0, 0.9)',
                        color: '#00ff41',
                        border: '2px solid #00ff41',
                        boxShadow: '0 0 30px #00ff41, inset 0 0 20px rgba(0, 255, 65, 0.2)',
                        fontSize: '3rem',
                        padding: '2rem 4rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.2em',
                        cursor: 'pointer',
                    }}
                >
                    CAUGHT YOU
                </div>
            )}

            {/* ===== RED & BLUE PILLS ===== */}
            {showPills && !billboardActive && (
                <div className="absolute top-[55%] left-1/2 z-50 flex gap-16 pills-container" style={{ transform: 'translate(-50%, -50%)' }}>
                    {/* Red Pill */}
                    <button
                        onClick={handleRedPill}
                        className="pill-btn"
                        style={{
                            width: '7rem',
                            height: '3.5rem',
                            borderRadius: '9999px',
                            background: 'linear-gradient(135deg, #ff1744, #d50000)',
                            border: '2px solid #ff5252',
                            boxShadow: '0 0 25px rgba(255, 23, 68, 0.6), 0 0 60px rgba(255, 23, 68, 0.3)',
                            cursor: 'pointer',
                            transition: 'transform 0.3s, box-shadow 0.3s',
                        }}
                        onMouseEnter={e => { e.target.style.transform = 'scale(1.15)'; e.target.style.boxShadow = '0 0 40px rgba(255,23,68,0.8)'; }}
                        onMouseLeave={e => { e.target.style.transform = 'scale(1)'; e.target.style.boxShadow = '0 0 25px rgba(255,23,68,0.6), 0 0 60px rgba(255,23,68,0.3)'; }}
                    />

                    {/* Blue Pill */}
                    <button
                        onClick={handleBluePill}
                        className="pill-btn"
                        style={{
                            width: '7rem',
                            height: '3.5rem',
                            borderRadius: '9999px',
                            background: 'linear-gradient(135deg, #2979ff, #0d47a1)',
                            border: '2px solid #448aff',
                            boxShadow: '0 0 25px rgba(41, 121, 255, 0.6), 0 0 60px rgba(41, 121, 255, 0.3)',
                            cursor: 'pointer',
                            transition: 'transform 0.3s, box-shadow 0.3s',
                        }}
                        onMouseEnter={e => { e.target.style.transform = 'scale(1.15)'; e.target.style.boxShadow = '0 0 40px rgba(41,121,255,0.8)'; }}
                        onMouseLeave={e => { e.target.style.transform = 'scale(1)'; e.target.style.boxShadow = '0 0 25px rgba(41,121,255,0.6), 0 0 60px rgba(41,121,255,0.3)'; }}
                    />
                </div>
            )}

            {/* Dodge Counter */}
            {!caught && (
                <div className="absolute top-8 right-8 font-mono text-sm text-gray-400 z-30">
                    Attempts: {dodgeCount} / {DODGE_LIMIT}
                </div>
            )}

            {/* ===== DODGING CLOCK ===== */}
            {!billboardActive && (
                <div
                    ref={clockRef}
                    onMouseEnter={!isSurrendered ? handleDodge : undefined}
                    onClick={isSurrendered && !caught ? handleCatchClock : (!isSurrendered ? handleDodge : undefined)}
                    className="absolute flex flex-col items-center gap-2 px-8 py-4 rounded-lg z-20"
                    style={{
                        left: `${clockPos.x}%`,
                        top: `${clockPos.y}%`,
                        transform: 'translate(-50%, -50%)',
                        transition: isSurrendered ? 'all 0.5s ease-out' : 'all 0.15s ease-out',
                        backgroundColor: caught ? 'rgba(0, 0, 0, 0.9)' : 'rgba(255, 255, 255, 0.8)',
                        border: caught ? '2px solid #00ff41' : isSurrendered ? '2px solid #ff4444' : 'none',
                        cursor: isSurrendered && !caught ? 'pointer' : 'default',
                        boxShadow: caught
                            ? '0 0 30px rgba(0, 255, 65, 0.4)'
                            : isSurrendered
                                ? '0 0 20px rgba(255, 68, 68, 0.2)'
                                : '0 4px 20px rgba(0, 0, 0, 0.05)',
                        animation: isSurrendered && !caught ? 'clockShake 0.5s ease-in-out' : undefined,
                    }}
                >
                    <span className="font-mono text-xs uppercase tracking-wider" style={{ color: caught ? '#00ff41' : isSurrendered ? '#ff6666' : '#9ca3af' }}>
                        {caught ? 'Matrix Mode' : isSurrendered ? 'Click me...' : 'System Time'}
                    </span>
                    <div className="flex items-center justify-center pt-1">
                        <span className="font-mono text-4xl font-bold tracking-tighter" style={{ color: caught ? '#00ff41' : '#1f2937', textShadow: caught ? '0 0 20px #00ff41' : 'none' }}>
                            {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}
                        </span>
                    </div>
                </div>
            )}

            {/* ===== STYLES ===== */}
            <style>{`
                .taunt-msg {
                    animation: tauntPop 0.8s ease-out forwards;
                }
                @keyframes tauntPop {
                    0% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
                    20% { opacity: 1; transform: translate(-50%, -50%) scale(1.05); }
                    80% { opacity: 1; }
                    100% { opacity: 0; transform: translate(-50%, -50%) scale(0.95); }
                }

                .caught-msg {
                    animation: caughtPulse 2s ease-in-out infinite;
                }
                @keyframes caughtPulse {
                    0%, 100% { box-shadow: 0 0 30px #00ff41, inset 0 0 20px rgba(0,255,65,0.2); }
                    50% { box-shadow: 0 0 50px #00ff41, inset 0 0 30px rgba(0,255,65,0.3); }
                }

                @keyframes clockShake {
                    0%, 100% { transform: translate(-50%, -50%) rotate(0deg); }
                    25% { transform: translate(-50%, -50%) rotate(-3deg); }
                    75% { transform: translate(-50%, -50%) rotate(3deg); }
                }

                .pills-container {
                    animation: pillsFadeIn 0.6s ease-out forwards;
                }
                @keyframes pillsFadeIn {
                    from { opacity: 0; transform: translate(-50%, -30%); }
                    to { opacity: 1; transform: translate(-50%, -50%); }
                }

                .billboard-track {
                    width: 100%;
                    overflow: hidden;
                    display: flex;
                    align-items: center;
                }
                .billboard-text {
                    display: inline-block;
                    white-space: nowrap;
                    font-family: monospace;
                    font-size: 5rem;
                    font-weight: bold;
                    color: #00ff41;
                    text-shadow: 0 0 20px #00ff41, 0 0 40px #00ff41;
                    animation: scrollMarquee 12s linear infinite;
                }
                @keyframes scrollMarquee {
                    0% { transform: translateX(100%); }
                    100% { transform: translateX(-100%); }
                }
            `}</style>
        </div>
    );
};

export default SecretPage;
