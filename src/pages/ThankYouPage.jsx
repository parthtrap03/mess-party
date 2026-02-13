import React from 'react';
import { CheckCircle2, PartyPopper, Sparkles } from 'lucide-react';

const ThankYouPage = () => {
    return (
        <div className="min-h-screen bg-black flex items-center justify-center p-6 font-mono overflow-hidden relative">
            {/* Animated background particles */}
            <div className="absolute inset-0 opacity-20">
                {[...Array(20)].map((_, i) => (
                    <div
                        key={i}
                        className="absolute w-2 h-2 bg-green-500 rounded-full animate-pulse"
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                            animationDelay: `${Math.random() * 2}s`,
                            animationDuration: `${2 + Math.random() * 2}s`
                        }}
                    />
                ))}
            </div>

            <div className="relative z-10 text-center space-y-8 max-w-lg">
                {/* Success icon */}
                <div className="flex justify-center mb-6">
                    <div className="relative">
                        <div className="absolute inset-0 bg-green-500 rounded-full blur-2xl opacity-50 animate-pulse" />
                        <div className="relative bg-green-500/20 p-8 rounded-full border-2 border-green-500">
                            <CheckCircle2 className="w-16 h-16 text-green-500" />
                        </div>
                    </div>
                </div>

                {/* Main message */}
                <div className="space-y-4">
                    <h1 className="text-5xl font-black text-white uppercase tracking-tighter animate-in fade-in slide-in-from-bottom duration-700">
                        Thank You!
                    </h1>
                    <p className="text-green-500 text-lg tracking-wider uppercase">
                        You've joined the celebration
                    </p>
                </div>

                {/* Decorative elements */}
                <div className="flex justify-center gap-4 py-6">
                    <PartyPopper className="w-8 h-8 text-blue-400 animate-bounce" style={{ animationDelay: '0s' }} />
                    <Sparkles className="w-8 h-8 text-yellow-400 animate-bounce" style={{ animationDelay: '0.2s' }} />
                    <PartyPopper className="w-8 h-8 text-pink-400 animate-bounce" style={{ animationDelay: '0.4s' }} />
                </div>

                {/* Message */}
                <div className="bg-white/5 backdrop-blur-xl border border-green-500/20 rounded-2xl p-8 space-y-4">
                    <p className="text-white/80 text-sm leading-relaxed">
                        Your contribution has been recorded! The birthday celebration is filling up with joy.
                    </p>
                    <p className="text-green-500/60 text-xs uppercase tracking-widest">
                        You can close this tab now
                    </p>
                </div>

                {/* Auto-close indicator */}
                <div className="text-xs text-white/40 uppercase tracking-widest">
                    <div className="inline-flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-ping" />
                        Session complete
                    </div>
                </div>
            </div>

            <style>{`
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
};

export default ThankYouPage;
