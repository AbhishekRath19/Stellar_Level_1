import React, { useState, useEffect } from 'react';
import { 
  isConnected, 
  requestAccess, 
} from "@stellar/freighter-api";
import { Wallet, LogOut, ExternalLink, ShieldCheck, AlertCircle, RefreshCw } from 'lucide-react';

// Truncate address utility
const truncateAddress = (address: string) => {
  if (!address) return '';
  return `${address.slice(0, 4)}...${address.slice(-4)}`;
};

const App: React.FC = () => {
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isFreighterInstalled, setIsFreighterInstalled] = useState<boolean>(true);

  useEffect(() => {
    checkFreighter();
  }, []);

  const checkFreighter = async () => {
    const result = await isConnected();
    setIsFreighterInstalled(!!result?.isConnected);
  };

  const handleConnect = async () => {
    setLoading(true);
    setError(null);
    try {
      const connection = await isConnected();
      if (!connection?.isConnected) {
        setError("Freighter wallet is not installed.");
        setLoading(false);
        return;
      }

      // requestAccess triggers the approval popup if not already allowed
      const { address, error: apiError } = await requestAccess();
      
      if (apiError) {
        setError(apiError);
      } else if (address) {
        setPublicKey(address);
      } else {
        setError("User denied connection or no account found.");
      }
    } catch (err: any) {
      console.error("Connection error:", err);
      setError(err.message || "Failed to connect to Freighter.");
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = () => {
    setPublicKey(null);
    setError(null);
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#0f172a] text-white p-4 font-sans selection:bg-stellar-blue/30">
      {/* Background decoration */}
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-stellar-blue/10 blur-[120px] rounded-full pointer-events-none"></div>
      <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 blur-[120px] rounded-full pointer-events-none"></div>

      <div className="w-full max-w-md z-10">
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-stellar-gradient shadow-xl mb-4">
            <Wallet className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight mb-2">
            Stellar <span className="text-stellar-blue">Freighter</span>
          </h1>
          <p className="text-slate-400 font-medium">Connect your wallet to access the Stellar Network</p>
        </div>

        {/* Main Content Card */}
        <div className="glass-card p-8 rounded-3xl">
          {!publicKey ? (
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <h2 className="text-xl font-bold">Ready to Connect?</h2>
                <p className="text-sm text-slate-400">
                  Securely link your Freighter wallet to start interacting with the Stellar blockchain.
                </p>
              </div>

              {!isFreighterInstalled && (
                <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-xl flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                  <div className="text-xs text-amber-200/80">
                    <p className="font-semibold mb-1">Freighter Not Found</p>
                    <p>Please install the <a href="https://www.freighter.app/" target="_blank" rel="noreferrer" className="underline decoration-amber-500/50 hover:text-amber-400">Freighter extension</a> to proceed.</p>
                  </div>
                </div>
              )}

              {error && (
                <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                  <p className="text-xs text-red-200/80">{error}</p>
                </div>
              )}

              <button
                onClick={handleConnect}
                disabled={loading}
                className="w-full btn-primary flex items-center justify-center gap-2 group"
              >
                {loading ? (
                  <RefreshCw className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <span>Connect Wallet</span>
                    <ExternalLink className="w-4 h-4 opacity-50 group-hover:opacity-100 transition-opacity" />
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Success Badge */}
              <div className="flex justify-center">
                <div className="bg-emerald-500/10 text-emerald-400 px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-2 border border-emerald-500/20">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  CONNECTED TO TESTNET
                </div>
              </div>

              {/* Wallet Info */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-4">
                <div className="flex flex-col items-center">
                  <span className="text-xs font-medium text-slate-400 uppercase tracking-widest mb-2">Connected Address</span>
                  <code className="text-2xl font-mono font-bold text-stellar-blue tracking-tighter">
                    {truncateAddress(publicKey)}
                  </code>
                </div>
                
                <div className="h-px bg-white/5 w-full"></div>
                
                <div className="flex justify-between items-center px-2">
                  <span className="text-xs text-slate-400">Provider</span>
                  <span className="text-xs font-semibold">Freighter Wallet</span>
                </div>
              </div>

              {/* Actions */}
              <div className="grid grid-cols-1 gap-3">
                <button
                  onClick={handleDisconnect}
                  className="w-full btn-secondary flex items-center justify-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Disconnect Wallet</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="mt-8 text-center">
          <p className="text-xs text-slate-500 flex items-center justify-center gap-2">
            Powered by <span className="text-white font-semibold">Stellar SDK</span> • Secure Connection
          </p>
        </div>
      </div>
    </div>
  );
};

export default App;
