import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE || '/api';

const LandingPage = () => {
    const canvasRef = useRef(null);
    const navigate = useNavigate();
    const [intensity, setIntensity] = useState(1);
    const [clickCount, setClickCount] = useState(0);
    const [clickEffects, setClickEffects] = useState([]);

    // Party mode state
    const [partyStatus, setPartyStatus] = useState(null);
    const [userRole, setUserRole] = useState(null); // 'host' or 'guest'
    const [isAuthenticating, setIsAuthenticating] = useState(false);
    const [showPasswordScreen, setShowPasswordScreen] = useState(true); // Show password gate by default
    const [passwordInput, setPasswordInput] = useState('');



    // Fetch party status on mount and poll
    useEffect(() => {
        let pollInterval = null;
        let isCancelled = false;

        const joinAndPoll = async () => {
            // Check if user just logged out (prevent immediate re-auth loop)
            const justLoggedOut = localStorage.getItem('justLoggedOut');
            const shouldSkipAuth = justLoggedOut && (Date.now() - parseInt(justLoggedOut)) < 2000;
            const storedToken = localStorage.getItem('partySessionToken');

            if (shouldSkipAuth) {
                // Clear the flag and just poll status without authenticating
                localStorage.removeItem('justLoggedOut');
                console.log('Skipping auto-auth after logout');
                setShowPasswordScreen(true); // Show password gate after logout
            } else if (storedToken) {
                // Only auto-auth if user has a valid token (already authenticated before)
                // 1. Authenticate with existing token
                try {
                    const headers = { 'Content-Type': 'application/json' };
                    headers['x-session-token'] = storedToken;

                    const response = await fetch(`${API_BASE}/party/authenticate`, {
                        method: 'POST',
                        headers,
                        body: JSON.stringify({ passkey: 'welcome' })
                    });

                    if (isCancelled) return;

                    if (response.ok) {
                        const data = await response.json();
                        if (data.token) localStorage.setItem('partySessionToken', data.token);
                        setUserRole(data.role);
                        setPartyStatus(data);
                    } else {
                        // Even on 403 (Party Over), parse data for display
                        const data = await response.json();
                        setPartyStatus(data);
                    }
                } catch (error) {
                    console.error('Auto-join failed:', error);
                }
            }

            if (isCancelled) return;

            // 2. Poll for updates
            const fetchStatus = async () => {
                try {
                    const token = localStorage.getItem('partySessionToken');
                    const headers = {};
                    if (token) headers['x-session-token'] = token;

                    const response = await fetch(`${API_BASE}/party/status`, { headers });
                    const data = await response.json();

                    // Check if session is still valid
                    if (token && data.sessionValid === false) {
                        // Session invalidated (admin logged out) - reset to password screen
                        console.log('Session invalidated, clearing token');
                        localStorage.removeItem('partySessionToken');
                        setUserRole(null);
                        setShowPasswordScreen(true);
                    }

                    setPartyStatus(data);
                } catch (error) {
                    console.error('Failed to fetch party status:', error);
                }
            };

            // Start polling
            pollInterval = setInterval(fetchStatus, 5000);
        };

        // Debounce to prevent double-fire in Strict Mode
        const timer = setTimeout(() => {
            joinAndPoll();
        }, 100);

        return () => {
            isCancelled = true;
            clearTimeout(timer);
            if (pollInterval) clearInterval(pollInterval);
        };
    }, []);

    // Handle page clicks to increase intensity
    const handlePageClick = (e) => {
        setClickCount(prev => prev + 1);
        setIntensity(prev => {
            const newIntensity = prev + 1;
            // Cycle back to 1 after reaching 10
            return newIntensity > 10 ? 1 : newIntensity;
        });

        // Add floating number effect - Binary 0/1
        const newEffect = {
            id: Date.now(),
            x: e.clientX,
            y: e.clientY,
            count: Math.round(Math.random()) // Random 0 or 1
        };
        setClickEffects(prev => [...prev, newEffect]);

        // Remove effect after animation
        setTimeout(() => {
            setClickEffects(prev => prev.filter(effect => effect.id !== newEffect.id));
        }, 1000);
    };

    // Handle password submission
    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        if (isAuthenticating) return;

        setIsAuthenticating(true);

        try {
            const response = await fetch(`${API_BASE}/party/authenticate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ passkey: passwordInput })
            });

            if (response.ok) {
                const data = await response.json();
                if (data.token) localStorage.setItem('partySessionToken', data.token);
                setUserRole(data.role);
                setPartyStatus(data);
                setPasswordInput(''); // Clear input

                // Only admin can proceed past the password gate
                if (data.role === 'host') {
                    setShowPasswordScreen(false); // Hide password gate for admin
                    // Admin stays on landing page to see pills and can click Red Pill
                } else {
                    // Guests are blocked - show message
                    alert('Access granted as Guest. The party is already in progress. Please wait on this screen.');
                    // Password screen stays visible for guests
                }
            } else {
                // Invalid password
                alert('Invalid password');
                setPasswordInput('');
            }
        } catch (error) {
            console.error('Authentication failed:', error);
            alert('Authentication failed');
        } finally {
            setIsAuthenticating(false);
        }
    };

    const intensityRef = useRef(intensity);

    // Keep ref in sync with state
    useEffect(() => {
        intensityRef.current = intensity;
    }, [intensity]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        let drops = [];
        let columns;
        const chars = '01';
        const primaryColor = '#00ff41';

        // Generate Fibonacci sequence
        const getFibonacci = (max) => {
            const fib = [1, 1];
            while (fib[fib.length - 1] < max) {
                fib.push(fib[fib.length - 1] + fib[fib.length - 2]);
            }
            return fib;
        };

        const init = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;

            const baseFontSize = 20;
            const fontSize = baseFontSize / intensityRef.current;
            columns = Math.ceil(canvas.width / fontSize);

            drops = [];
            for (let i = 0; i < columns; i++) {
                drops[i] = Math.random() * -50;
            }
        };

        const draw = () => {
            const currentIntensity = intensityRef.current;
            const fadeAmount = 0.05 + (currentIntensity / 50);
            ctx.fillStyle = `rgba(0, 0, 0, ${fadeAmount})`;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            const baseFontSize = 20;
            const fontSize = baseFontSize / currentIntensity;
            ctx.font = `${fontSize}px 'JetBrains Mono', monospace`;

            // Generate MORE Fibonacci lines at higher intensity
            let verticalFib = getFibonacci(Math.floor(canvas.height / fontSize));
            let horizontalFib = getFibonacci(Math.floor(canvas.width / fontSize));

            // At higher intensity, add MORE fibonacci values by interpolating
            const expandedVerticalFib = [];
            const expandedHorizontalFib = [];

            // Create denser pattern by adding intermediate values
            verticalFib.forEach((num, idx) => {
                expandedVerticalFib.push(Math.floor(num / (11 - currentIntensity)));
                if (currentIntensity > 5 && idx < verticalFib.length - 1) {
                    const next = verticalFib[idx + 1];
                    const steps = Math.floor((currentIntensity - 5) / 2) + 1;
                    for (let s = 1; s <= steps; s++) {
                        const interpolated = Math.floor(num + (next - num) * (s / (steps + 1)));
                        expandedVerticalFib.push(Math.floor(interpolated / (11 - currentIntensity)));
                    }
                }
            });

            horizontalFib.forEach((num, idx) => {
                expandedHorizontalFib.push(Math.floor(num / (11 - currentIntensity)));
                if (currentIntensity > 5 && idx < horizontalFib.length - 1) {
                    const next = horizontalFib[idx + 1];
                    const steps = Math.floor((currentIntensity - 5) / 2) + 1;
                    for (let s = 1; s <= steps; s++) {
                        const interpolated = Math.floor(num + (next - num) * (s / (steps + 1)));
                        expandedHorizontalFib.push(Math.floor(interpolated / (11 - currentIntensity)));
                    }
                }
            });

            // Ensure we have enough drops for the current column count
            const currentColumns = Math.ceil(canvas.width / fontSize);
            while (drops.length < currentColumns) {
                drops.push(Math.random() * -50);
            }

            for (let i = 0; i < currentColumns; i++) {
                const char = chars[Math.floor(Math.random() * chars.length)];
                const x = i * fontSize;
                const y = drops[i] * fontSize;

                const verticalLine = Math.floor(drops[i]);
                const horizontalCol = i;

                const isVerticalFibLine = expandedVerticalFib.includes(verticalLine);
                const isHorizontalFibLine = expandedHorizontalFib.includes(horizontalCol);

                if (isVerticalFibLine || isHorizontalFibLine) {
                    ctx.fillStyle = primaryColor;
                    ctx.shadowColor = primaryColor;
                    ctx.shadowBlur = 8 + (currentIntensity / 2);
                } else {
                    const dimAmount = 0.3 - (currentIntensity / 50);
                    ctx.fillStyle = `rgba(0, 255, 65, ${Math.max(0.1, dimAmount)})`;
                    ctx.shadowColor = 'transparent';
                    ctx.shadowBlur = 0;
                }

                ctx.fillText(char, x, y);

                if (y > canvas.height && Math.random() > 0.97) {
                    drops[i] = 0;
                }
                // Speed increases with intensity
                drops[i] += 0.3 + (currentIntensity / 10);
            }

            ctx.shadowColor = 'transparent';
        };

        init();
        const interval = setInterval(draw, 50);

        const handleResize = () => init();
        window.addEventListener('resize', handleResize);

        return () => {
            clearInterval(interval);
            window.removeEventListener('resize', handleResize);
        };
    }, []); // Run once, reads intensity from ref

    return (
        <div
            className="relative w-full h-screen bg-black overflow-hidden cursor-pointer"
            onClick={handlePageClick}
        >
            <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

            {/* Password Gate Overlay */}
            {showPasswordScreen && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-black bg-opacity-95">
                    <form onSubmit={handlePasswordSubmit} className="flex flex-col items-center gap-6 p-8">
                        <h2 className="font-mono text-3xl font-bold text-green-500 mb-4" style={{ textShadow: '0 0 10px #00ff41' }}>
                            ENTER PASSWORD
                        </h2>
                        <input
                            type="password"
                            value={passwordInput}
                            onChange={(e) => setPasswordInput(e.target.value)}
                            placeholder="welcome"
                            autoFocus
                            className="w-80 px-6 py-4 bg-black border-2 border-green-500 text-green-500 font-mono text-xl rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            style={{ boxShadow: '0 0 20px rgba(0, 255, 65, 0.3)' }}
                        />
                        <button
                            type="submit"
                            disabled={isAuthenticating}
                            className="px-8 py-3 bg-green-500 text-black font-mono font-bold text-lg rounded-lg hover:bg-green-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            style={{ boxShadow: '0 0 20px rgba(0, 255, 65, 0.5)' }}
                        >
                            {isAuthenticating ? 'AUTHENTICATING...' : 'ENTER'}
                        </button>
                    </form>
                </div>
            )}

            {/* Matrix Pill Choice */}
            <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
                <div className="flex gap-8 md:gap-12 items-center pointer-events-auto">
                    {/* Red Pill - Enter (Host Only) */}
                    <div className="flex flex-col items-center gap-4">
                        <button
                            onClick={async (e) => {
                                e.stopPropagation();

                                // Only admin can access home page
                                if (userRole !== 'host') {
                                    return; // Guests cannot click
                                }

                                try {
                                    const storedToken = localStorage.getItem('partySessionToken');
                                    const headers = { 'Content-Type': 'application/json' };
                                    if (storedToken) headers['x-session-token'] = storedToken;

                                    // Background authentication
                                    fetch(`${API_BASE}/party/authenticate`, {
                                        method: 'POST',
                                        headers,
                                        body: JSON.stringify({ passkey: 'welcome' })
                                    }).then(res => res.json()).then(data => {
                                        if (data.token) localStorage.setItem('partySessionToken', data.token);
                                    }).catch(console.error);

                                    // Navigate to Home (Admin only)
                                    navigate('/home');
                                } catch (error) {
                                    console.error('Navigation failed:', error);
                                    navigate('/home'); // Fallback
                                }
                            }}
                            disabled={userRole !== 'host'}
                            className="group relative rounded-full overflow-hidden transition-all duration-500 hover:scale-110 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100"
                            style={{
                                width: `${8 + intensity * 2}rem`,
                                height: `${8 + intensity * 2}rem`,
                                background: userRole === 'host'
                                    ? 'radial-gradient(circle at 30% 30%, #ff4444, #cc0000, #880000)'
                                    : 'radial-gradient(circle at 30% 30%, #666, #444, #222)',
                                boxShadow: userRole === 'host'
                                    ? `0 0 ${30 + intensity * 3}px rgba(255, 0, 0, ${0.5 + intensity * 0.05}), inset 0 0 20px rgba(255, 100, 100, 0.3)`
                                    : 'none',
                            }}
                        >
                            {/* Realistic CSS Gear Implementation */}
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
                                <div
                                    className="gears-container"
                                    style={{
                                        fontSize: `${1.5 + intensity * 0.5}rem`, // Gear scales with intensity
                                        opacity: 0.4 + (intensity * 0.04)        // Becomes more visible
                                    }}
                                >
                                    <div
                                        className="gear-rotate"
                                        style={{
                                            animationDuration: `${1.5 / (1 + intensity * 0.3)}s` // Spins faster with intensity
                                        }}
                                    ></div>
                                </div>
                            </div>

                            {/* Ripple effect on hover */}
                            <div
                                className="absolute inset-0 opacity-0 group-hover:opacity-100"
                                style={{
                                    background: 'radial-gradient(circle, rgba(255, 100, 100, 0.6) 0%, transparent 70%)',
                                    animation: 'ripple 1.5s ease-out infinite'
                                }}
                            />
                            <div
                                className="absolute inset-0 animate-pulse"
                                style={{
                                    background: 'radial-gradient(circle at 50% 50%, rgba(255, 100, 100, 0.4), transparent)',
                                    animation: 'redPulse 3s ease-in-out infinite'
                                }}
                            />
                            <div className="relative z-10 flex items-center justify-center h-full">
                                <ArrowRight className="w-12 h-12 text-white drop-shadow-lg transition-transform group-hover:translate-x-1" />
                            </div>
                        </button>
                        <span className="font-mono text-sm md:text-base text-red-500 tracking-wider uppercase font-bold">
                            Enter
                        </span>
                    </div>

                    {/* Blue Pill - Party Tank */}
                    <div className="flex flex-col items-center gap-4">
                        <button
                            onClick={async (e) => {
                                e.stopPropagation();
                                // Check status and handle Admin Secret Access
                                try {
                                    const storedToken = localStorage.getItem('partySessionToken');
                                    const headers = { 'Content-Type': 'application/json' };
                                    if (storedToken) headers['x-session-token'] = storedToken;

                                    // Refresh status/auth to get latest role and fullness
                                    const response = await fetch(`${API_BASE}/party/authenticate`, {
                                        method: 'POST',
                                        headers,
                                        body: JSON.stringify({ passkey: 'welcome' })
                                    });

                                    const data = await response.json();
                                    setPartyStatus(data);

                                    // If Admin AND Party is Full (or enough guests) -> Go to Secret
                                    if (data.role === 'host' && data.isFull) {
                                        navigate('/secret');
                                    }
                                } catch (error) {
                                    console.error('Failed to fetch status:', error);
                                }
                            }}
                            className="group relative rounded-full overflow-hidden transition-all duration-500 hover:scale-110"
                            style={{
                                width: `${30 - intensity * 2}rem`,
                                height: `${30 - intensity * 2}rem`,
                                background: 'radial-gradient(circle at 30% 30%, #4488ff, #0044cc, #002288)',
                                boxShadow: `0 0 ${30 + intensity * 3}px rgba(0, 100, 255, ${0.5 + intensity * 0.05}), inset 0 0 20px rgba(100, 150, 255, 0.3)`,
                            }}
                        >
                            {/* Rising Water Body - Dynamic based on party status */}
                            <div
                                className="absolute inset-x-0 bottom-0 pointer-events-none transition-all duration-700 ease-in-out"
                                style={{
                                    height: partyStatus ? `${partyStatus.tankLevel || 0}%` : `${5 + intensity * 9.5}%`,
                                    background: 'rgba(40, 100, 200, 1)'
                                }}
                            >
                                {/* SVG Wave Surface */}
                                <svg
                                    className="waves absolute bottom-full left-0 w-full"
                                    xmlns="http://www.w3.org/2000/svg"
                                    xmlnsXlink="http://www.w3.org/1999/xlink"
                                    viewBox="0 24 150 28"
                                    preserveAspectRatio="none"
                                    shapeRendering="auto"
                                    style={{
                                        height: '40px',
                                        marginBottom: '-1px' // Prevent gap
                                    }}
                                >
                                    <defs>
                                        <path id="gentle-wave" d="M-160 44c30 0 58-18 88-18s 58 18 88 18 58-18 88-18 58 18 88 18 v44h-352z" />
                                    </defs>
                                    <g className="parallax">
                                        <use xlinkHref="#gentle-wave" x="48" y="0" fill="rgba(100, 180, 255, 0.7)" />
                                        <use xlinkHref="#gentle-wave" x="48" y="3" fill="rgba(100, 180, 255, 0.5)" />
                                        <use xlinkHref="#gentle-wave" x="48" y="5" fill="rgba(100, 180, 255, 0.3)" />
                                        <use xlinkHref="#gentle-wave" x="48" y="7" fill="rgba(40, 100, 200, 1)" />
                                    </g>
                                </svg>
                            </div>

                            <div className="relative z-10 flex items-center justify-center h-full">
                                <svg className="w-12 h-12 text-white drop-shadow-lg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                </svg>
                            </div>
                        </button>
                        <span className="font-mono text-sm md:text-base text-blue-400 tracking-wider uppercase font-bold">
                            {partyStatus ? `${partyStatus.totalUsers || 0} / ${partyStatus.maxUsers || 5}` : '0 / 5'}
                        </span>
                    </div>
                </div>
            </div >

            {/* Floating Click Numbers */}
            {clickEffects.map(effect => (
                <div
                    key={effect.id}
                    className="absolute pointer-events-none font-mono text-xl font-bold z-50"
                    style={{
                        left: effect.x,
                        top: effect.y,
                        color: '#00ff41',
                        textShadow: '0 0 10px #00ff41',
                        animation: 'floatUp 1s ease-out forwards',
                        transform: 'translate(-50%, -50%)'
                    }}
                >
                    {effect.count}
                </div>
            ))}

            <style>{`
                .parallax > use {
                    animation: move-forever 25s cubic-bezier(.55,.5,.45,.5) infinite;
                }
                .parallax > use:nth-child(1) { animation-delay: -2s; animation-duration: 7s; }
                .parallax > use:nth-child(2) { animation-delay: -3s; animation-duration: 10s; }
                .parallax > use:nth-child(3) { animation-delay: -4s; animation-duration: 13s; }
                .parallax > use:nth-child(4) { animation-delay: -5s; animation-duration: 20s; }
                
                @keyframes move-forever {
                    0% { transform: translate3d(-90px,0,0); }
                    100% { transform: translate3d(85px,0,0); }
                }

                @keyframes floatUp {
                    0% {
                        opacity: 1;
                        transform: translate(-50%, -50%) scale(1);
                    }
                    100% {
                        opacity: 0;
                        transform: translate(-50%, -150%) scale(1.5);
                    }
                }

                @keyframes redPulse {
                    0%, 100% { 
                        opacity: 0.3;
                        transform: scale(1);
                    }
                    33% { 
                        opacity: 0.6;
                        transform: scale(1.05);
                    }
                    66% { 
                        opacity: 0.9;
                        transform: scale(1.1);
                    }
                }

                @keyframes waterFlow {
                    0% {
                        background-position: 0% 0%;
                    }
                    100% {
                        background-position: 200% 200%;
                    }
                }

                @keyframes waterPulse {
                    0%, 100% {
                        opacity: 0.4;
                        transform: scale(0.95);
                    }
                    50% {
                        opacity: 0.8;
                        transform: scale(1.05);
                    }
                }

                @keyframes ripple {
                    0% {
                        transform: scale(0.8);
                        opacity: 0.6;
                    }
                    50% {
                        transform: scale(1.2);
                        opacity: 0.3;
                    }
                    100% {
                        transform: scale(1.5);
                        opacity: 0;
                    }
                }

                .gears-container {
                    width: 4em;
                    height: 4em;
                    position: relative;
                }

                .gear-rotate {
                    width: 2em;
                    height: 2em;
                    top: 50%; 
                    left: 50%; 
                    margin-top: -1em;
                    margin-left: -1em;
                    background: #ff4444; /* Red Pill Base */
                    position: absolute;
                    border-radius: 1em;
                    animation: gear-rotate 2s linear infinite;
                }

                .gear-rotate::before {
                    width: 2.8em;
                    height: 2.8em;
                    background: 
                        linear-gradient(0deg, transparent 39%, #ff4444 39%, #ff4444 61%, transparent 61%),
                        linear-gradient(60deg, transparent 42%, #ff4444 42%, #ff4444 58%, transparent 58%),
                        linear-gradient(120deg, transparent 42%, #ff4444 42%, #ff4444 58%, transparent 58%);
                    position: absolute;
                    content: "";
                    top: -.4em;
                    left: -.4em;
                    border-radius: 1.4em;
                }

                .gear-rotate::after {
                    width: 1em;
                    height: 1em;
                    background: rgba(0,0,0,0.2);
                    position: absolute;
                    content: "";
                    top: .5em;
                    left: .5em;
                    border-radius: .5em;
                }

                @keyframes gear-rotate {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `}</style>

        </div >
    );
};

export default LandingPage;
