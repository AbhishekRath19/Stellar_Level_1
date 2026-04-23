import React, { useState, useEffect } from 'react';
import { 
  isConnected, 
  requestAccess,
  signTransaction
} from "@stellar/freighter-api";
import { 
  Horizon,
  TransactionBuilder, 
  Networks, 
  Operation, 
  Asset, 
  BASE_FEE 
} from "@stellar/stellar-sdk";
import { 
  Wallet, 
  LogOut, 
  ExternalLink, 
  ShieldCheck, 
  AlertCircle, 
  RefreshCw, 
  Coins, 
  Send, 
  CheckCircle2 
} from 'lucide-react';

const server = new Horizon.Server("https://horizon-testnet.stellar.org");

// Truncate address utility
const truncateAddress = (address: string) => {
  if (!address) return '';
  return `${address.slice(0, 4)}...${address.slice(-4)}`;
};

const App: React.FC = () => {
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [balance, setBalance] = useState<string | null>(null);
  const [destinationAddress, setDestinationAddress] = useState<string>('');
  const [amount, setAmount] = useState<string>('1.0');
  const [loading, setLoading] = useState<boolean>(false);
  const [txLoading, setTxLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [txResult, setTxResult] = useState<string | null>(null);
  const [isFreighterInstalled, setIsFreighterInstalled] = useState<boolean>(true);

  useEffect(() => {
    checkFreighter();
  }, []);

  useEffect(() => {
    if (publicKey) {
      fetchBalance(publicKey);
    }
  }, [publicKey]);

  const checkFreighter = async () => {
    try {
      const result = await isConnected();
      setIsFreighterInstalled(!!result?.isConnected);
    } catch (err) {
      setIsFreighterInstalled(false);
    }
  };

  const fetchBalance = async (address: string) => {
    try {
      const account = await server.loadAccount(address);
      const xlmBalance = account.balances?.find((b: any) => b.asset_type === 'native');
      setBalance(xlmBalance ? xlmBalance.balance : '0');
    } catch (err) {
      console.error("Error fetching balance:", err);
      setBalance('Account not found on Testnet');
    }
  };

  const handleConnect = async () => {
    setLoading(true);
    setError(null);
    setTxResult(null);
    try {
      const connection = await isConnected();
      if (!connection?.isConnected) {
        setError("Freighter wallet is not installed.");
        setLoading(false);
        return;
      }

      const response = await requestAccess();
      const address = typeof response === 'string' ? response : response?.address;
      const apiError = typeof response === 'object' ? response?.error : null;
      
      if (apiError) {
        setError(typeof apiError === 'string' ? apiError : JSON.stringify(apiError));
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

  const handleSendTransaction = async () => {
    if (!publicKey || !destinationAddress || !amount) {
      setError("Please provide a destination address and amount.");
      return;
    }
    setTxLoading(true);
    setError(null);
    setTxResult(null);

    try {
      // 1. Load account
      const account = await server.loadAccount(publicKey);

      // 2. Build transaction
      const transaction = new TransactionBuilder(account, {
        fee: BASE_FEE,
        networkPassphrase: Networks.TESTNET,
      })
        .addOperation(
          Operation.payment({
            destination: destinationAddress,
            asset: Asset.native(),
            amount: amount,
          })
        )
        .setTimeout(30)
        .build();

      // 3. Sign with Freighter
      const xdr = transaction.toXDR();
      const signResponse = await signTransaction(xdr, {
        networkPassphrase: Networks.TESTNET,
      });

      const signedTxXdr = typeof signResponse === 'string' ? signResponse : signResponse?.signedTxXdr;
      const signError = typeof signResponse === 'object' ? signResponse?.error : null;

      if (signError) {
        throw new Error(typeof signError === 'string' ? signError : JSON.stringify(signError));
      }

      if (!signedTxXdr) {
        throw new Error("Failed to sign transaction.");
      }

      // 4. Submit to Horizon
      const result = await server.submitTransaction(signedTxXdr);
      console.log("Transaction success:", result);
      setTxResult(result.hash);
      
      // Refresh balance
      await fetchBalance(publicKey);
    } catch (err: any) {
      console.error("Transaction failed:", err);
      setError(err.message || "Transaction failed.");
    } finally {
      setTxLoading(false);
    }
  };

  const handleDisconnect = () => {
    setPublicKey(null);
    setBalance(null);
    setError(null);
    setTxResult(null);
    setDestinationAddress('');
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#0f172a] text-white p-4 font-sans selection:bg-stellar-blue/30">
      {/* Background decoration */}
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-stellar-blue/10 blur-[120px] rounded-full pointer-events-none"></div>
      <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 blur-[120px] rounded-full pointer-events-none"></div>

      <div className="w-full max-w-lg z-10">
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-stellar-gradient shadow-xl mb-4">
            <Wallet className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight mb-2">
            Stellar <span className="text-stellar-blue">Freighter</span>
          </h1>
          <p className="text-slate-400 font-medium tracking-tight">Testnet Dashboard & Explorer</p>
        </div>

        {/* Main Content Card */}
        <div className="glass-card p-8 rounded-3xl">
          {!publicKey ? (
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <h2 className="text-xl font-bold">Ready to Connect?</h2>
                <p className="text-sm text-slate-400">
                  Connect your Freighter wallet to manage assets on the Stellar Testnet.
                </p>
              </div>

              {!isFreighterInstalled && (
                <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-xl flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                  <div className="text-xs text-amber-200/80">
                    <p className="font-semibold mb-1">Freighter Not Found</p>
                    <p>Please install the <a href="https://www.freighter.app/" target="_blank" rel="noreferrer" className="underline decoration-amber-500/50 hover:text-amber-400">Freighter extension</a>.</p>
                  </div>
                </div>
              )}

              {error && (
                <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                  <p className="text-xs text-red-200/80 truncate">{error}</p>
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
              {/* Status Header */}
              <div className="flex justify-between items-center">
                <div className="bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full text-[10px] font-bold flex items-center gap-2 border border-emerald-500/20 tracking-wider">
                  <ShieldCheck className="w-3 h-3" />
                  TESTNET ACTIVE
                </div>
                <button 
                  onClick={handleDisconnect}
                  className="text-slate-500 hover:text-white transition-colors flex items-center gap-1.5 text-xs font-medium"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Disconnect
                </button>
              </div>

              {/* Wallet Info Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Address</span>
                  <code className="text-lg font-mono font-bold text-stellar-blue tracking-tighter" title={publicKey}>
                    {truncateAddress(publicKey)}
                  </code>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Balance</span>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-2xl font-bold text-white tracking-tighter">
                      {balance !== null ? (isNaN(parseFloat(balance)) ? "0.00" : parseFloat(balance).toFixed(2)) : "..."}
                    </span>
                    <span className="text-sm font-bold text-slate-400">XLM</span>
                  </div>
                </div>
              </div>

              {/* Transaction Result Alert */}
              {txResult && (
                <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-2xl space-y-2">
                  <div className="flex items-center gap-2 text-emerald-400">
                    <CheckCircle2 className="w-5 h-5" />
                    <span className="text-sm font-bold">Transaction Successful!</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Hash</span>
                    <div className="flex items-center justify-between gap-2">
                      <code className="text-[10px] font-mono text-emerald-200/60 truncate bg-black/20 p-2 rounded-lg flex-1">
                        {txResult}
                      </code>
                      <a 
                        href={`https://stellar.expert/explorer/testnet/tx/${txResult}`} 
                        target="_blank" 
                        rel="noreferrer"
                        className="p-2 bg-emerald-500/20 rounded-lg hover:bg-emerald-500/30 transition-colors"
                        title="View on Explorer"
                      >
                        <ExternalLink className="w-4 h-4 text-emerald-400" />
                      </a>
                    </div>
                  </div>
                </div>
              )}

              {/* Error Alert */}
              {error && (
                <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                  <p className="text-xs text-red-200/80 break-all">{error}</p>
                </div>
              )}

              {/* Transaction Form */}
              <div className="space-y-4 pt-2">
                <div className="flex items-center gap-2 px-1">
                  <Send className="w-4 h-4 text-stellar-blue" />
                  <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500">Send Payment</h3>
                </div>
                
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Destination Address</label>
                    <input 
                      type="text" 
                      value={destinationAddress}
                      onChange={(e) => setDestinationAddress(e.target.value)}
                      placeholder="G..."
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-stellar-blue/50 transition-colors placeholder:text-slate-600"
                    />
                  </div>
                  
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Amount (XLM)</label>
                    <input 
                      type="number" 
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="1.0"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-stellar-blue/50 transition-colors placeholder:text-slate-600"
                    />
                  </div>
                </div>
                
                <button
                  onClick={handleSendTransaction}
                  disabled={txLoading || !destinationAddress || !amount || isNaN(parseFloat(balance || '0'))}
                  className="w-full btn-primary py-4 flex items-center justify-center gap-3 relative overflow-hidden"
                >
                  {txLoading ? (
                    <RefreshCw className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <Coins className="w-5 h-5" />
                      <span className="font-bold">Send Transaction</span>
                    </>
                  )}
                </button>
                
                {isNaN(parseFloat(balance || '0')) && (
                  <p className="text-center text-[10px] text-slate-500 italic">
                    Tip: Visit <a href="https://laboratory.stellar.org/#account-creator?network=testnet" target="_blank" rel="noreferrer" className="text-stellar-blue hover:underline">Stellar Lab</a> to fund this account on Testnet.
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="mt-8 text-center">
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em] flex items-center justify-center gap-3">
            Securely powered by <span className="text-white">Stellar Horizon API</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default App;
