'use client';

import React, { useState, useEffect } from 'react';
import {
  Zap,
  Sun,
  Wind,
  Flame,
  Wrench,
  MessageSquare,
  ShieldAlert,
  Sliders,
  Send,
  Building2,
  ChevronRight,
  Wallet,
  Layers,
  RefreshCw,
  CreditCard,
  DollarSign,
  ArrowRightLeft,
  Building,
  PiggyBank,
  History,
  Phone,
  Mail,
  MapPin,
  Bot,
  LogOut,
  Square,
  CheckSquare,
  ArrowUpRight,
  ArrowDownRight,
  FileText,
  Truck,
  CheckCircle2,
  Lock,
  ArrowDownLeft
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

// Accounting Ledger Entry Interface
interface AccountingEntry {
  id: string;
  timestamp: string;
  description: string;
  fromParty: 'Generator' | 'Distributor' | 'Consumer' | 'Vendor';
  toParty: 'Generator' | 'Distributor' | 'Consumer' | 'Vendor';
  amountUSD: number;
  tatiTokens: number;
  energyMWh: number;
  status: 'SETTLED' | 'PENDING' | 'CLEARED';
  txHash: string;
}

export default function EnergyPlatform() {
  // Navigation & Portal Selection
  const [activePortal, setActivePortal] = useState<'PG' | 'PD' | 'C' | 'ACC' | null>('PG');

  // Login Form States
  const [pgEmail, setPgEmail] = useState('generator@rea.co.zw');
  const [pdEmail, setPdEmail] = useState('dispatch@rea.co.zw');
  const [cEmail, setCEmail] = useState('consumer@rea.co.zw');
  const [accEmail, setAccEmail] = useState('audit@rea.co.zw');

  // Simulation Controls
  const [isAutoSimulating, setIsAutoSimulating] = useState<boolean>(true);
  const [currentDemand, setCurrentDemand] = useState<number>(850); // Grid Load (kWh)

  // Generation Sources
  const [sources, setSources] = useState({
    solar: { active: true, baseCapacity: 450, output: 420, rate: 0.1975 },
    wind: { active: false, baseCapacity: 350, output: 0, rate: 0.1975 },
    hydro: { active: true, baseCapacity: 600, output: 520, rate: 0.1975 },
  });

  // Telemetry Graph History Data
  const [powerGraphData, setPowerGraphData] = useState([
    { time: '16:00', generation: 900, demand: 820 },
    { time: '16:05', generation: 920, demand: 840 },
    { time: '16:10', generation: 940, demand: 850 },
  ]);

  // Total Generation Output (Supply / Input)
  const totalGeneration = Object.values(sources).reduce((acc, s) => acc + s.output, 0);

  // Power Balance Accounting
  const powerDifference = totalGeneration - currentDemand;
  const isSurplus = powerDifference >= 0;

  // Automated Grid Balancing Logic
  const [gridState, setGridState] = useState<'STORE' | 'LOAD_SHED'>('STORE');

  useEffect(() => {
    if (totalGeneration < currentDemand) {
      setGridState('LOAD_SHED');
    } else {
      setGridState('STORE');
    }
  }, [totalGeneration, currentDemand]);

  // Banked Surplus Energy State (MWh / kWh)
  const [bankedEnergyKWh, setBankedEnergyKWh] = useState<number>(45000);

  // Automatic Real-Time Simulation Loop
  useEffect(() => {
    if (!isAutoSimulating) return;

    const interval = setInterval(() => {
      const demandDelta = Math.floor(Math.random() * 71) - 35;
      setCurrentDemand((prev) => Math.max(300, Math.min(1600, prev + demandDelta)));

      const now = new Date();
      const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;

      setPowerGraphData((prev) => [
        ...prev.slice(-9),
        { time: timeStr, generation: totalGeneration, demand: currentDemand }
      ]);

      if (totalGeneration > currentDemand) {
        const excessKWh = Math.round((totalGeneration - currentDemand) / 20);
        setBankedEnergyKWh((prev) => prev + excessKWh);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [isAutoSimulating, totalGeneration, currentDemand]);

  // Plant generation efficiency calculation
  useEffect(() => {
    const activeKeys = (Object.keys(sources) as Array<keyof typeof sources>).filter(
      (key) => sources[key].active
    );

    setSources((prev) => {
      const next = { ...prev };

      if (activeKeys.length === 0) {
        Object.keys(next).forEach((k) => {
          const key = k as keyof typeof sources;
          next[key] = { ...next[key], output: 0 };
        });
        return next;
      }

      Object.keys(next).forEach((k) => {
        const key = k as keyof typeof sources;
        if (next[key].active) {
          const capacity = next[key].baseCapacity;
          const efficiencyFactor = 0.85 + (Math.sin(Date.now() / 5000) * 0.08);
          next[key] = {
            ...next[key],
            output: Math.round(capacity * efficiencyFactor),
          };
        } else {
          next[key] = { ...next[key], output: 0 };
        }
      });

      return next;
    });
  }, [currentDemand, sources.solar.active, sources.wind.active, sources.hydro.active]);

  // Distributor Job Cards
  const [jobCards, setJobCards] = useState([
    { id: 1, title: 'Replace sub-station transformer #4', status: true, urgent: true },
    { id: 2, title: 'Attach high-voltage regional line', status: false, urgent: false },
    { id: 3, title: 'Calibrate Mutare feeder node #12', status: false, urgent: false },
  ]);

  // Interactive Grid Messages & Logistics State
  const [gridMessages, setGridMessages] = useState([
    { id: 1, sender: 'Nyanga Node Operations', title: 'Expansion Request', text: 'Grid expansion proposal submitted for Nyanga rural solar feeder line.', time: '10:15 AM', status: 'OPEN' },
    { id: 2, sender: 'Mutare Sub-station', title: 'Load Re-routing', text: 'High voltage line #3 requires scheduled maintenance window.', time: '01:40 PM', status: 'IN PROGRESS' }
  ]);
  const [newMessageTitle, setNewMessageTitle] = useState('');
  const [newMessageText, setNewMessageText] = useState('');

  // Consumer / Client Banking Portal State
  const [fiatBalance, setFiatBalance] = useState<number>(14850.00);
  const [consumerTati, setConsumerTati] = useState<number>(18.5);
  const [consumerPower, setConsumerPower] = useState<number>(18500);
  const [transferAmount, setTransferAmount] = useState<number>(1);
  const [recipientAccount, setRecipientAccount] = useState<string>('ACC-9982-HARARE');

  // =========================================================================
  // 4-PARTY ACCOUNTING ENGINE BALANCES & TRACEABILITY LEDGER
  // =========================================================================
  const [partyBalances, setPartyBalances] = useState({
    Generator: { usd: 42500.00, tati: 215.0, energyMWh: 215.0 },
    Distributor: { usd: 28400.00, tati: 140.0, energyMWh: 140.0 },
    Consumer: { usd: 14850.00, tati: 18.5, energyMWh: 18.5 },
    Vendor: { usd: 8900.00, tati: 45.0, energyMWh: 45.0 },
  });

  const [accountingLedger, setAccountingLedger] = useState<AccountingEntry[]>([
    {
      id: 'CLR-9011',
      timestamp: '2026-09-14 16:30 CAT',
      description: 'Consumer Bulk Energy Token Purchase',
      fromParty: 'Consumer',
      toParty: 'Distributor',
      amountUSD: 987.50,
      tatiTokens: 5,
      energyMWh: 5,
      status: 'SETTLED',
      txHash: '0x8f2a...9b41'
    },
    {
      id: 'CLR-8942',
      timestamp: '2026-09-14 14:15 CAT',
      description: 'Grid Wholesale Generation Tariff Settlement',
      fromParty: 'Distributor',
      toParty: 'Generator',
      amountUSD: 1975.00,
      tatiTokens: 10,
      energyMWh: 10,
      status: 'CLEARED',
      txHash: '0x3c1d...e7f9'
    },
    {
      id: 'CLR-8805',
      timestamp: '2026-09-14 11:00 CAT',
      description: 'BESS Battery Inverter Maintenance & Spares',
      fromParty: 'Generator',
      toParty: 'Vendor',
      amountUSD: 592.50,
      tatiTokens: 3,
      energyMWh: 3,
      status: 'SETTLED',
      txHash: '0x7e4b...1a02'
    }
  ]);

  // Vendor Payment Form State
  const [vendorPayAmount, setVendorPayAmount] = useState<number>(197.50);
  const [vendorPayTokens, setVendorPayTokens] = useState<number>(1);
  const [vendorSelectedParty, setVendorSelectedParty] = useState<'Generator' | 'Distributor'>('Distributor');
  const [vendorInvoiceRef, setVendorInvoiceRef] = useState<string>('INV-2026-BESS-08');

  // Execute Vendor Disbursement Transaction
  const handleVendorDisbursement = (e: React.FormEvent) => {
    e.preventDefault();
    const cost = vendorPayAmount;
    const tokens = vendorPayTokens;

    if (partyBalances[vendorSelectedParty].usd < cost) {
      alert(`Insufficient funds in ${vendorSelectedParty} ledger for vendor payment.`);
      return;
    }

    // Update balances across entities
    setPartyBalances((prev) => ({
      ...prev,
      [vendorSelectedParty]: {
        ...prev[vendorSelectedParty],
        usd: prev[vendorSelectedParty].usd - cost,
        tati: prev[vendorSelectedParty].tati - tokens,
      },
      Vendor: {
        ...prev.Vendor,
        usd: prev.Vendor.usd + cost,
        tati: prev.Vendor.tati + tokens,
      }
    }));

    // Add Audit Entry to Ledger
    const newEntry: AccountingEntry = {
      id: `CLR-${Math.floor(1000 + Math.random() * 9000)}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16) + ' CAT',
      description: `Equipment & Spares Vendor Payment (${vendorInvoiceRef})`,
      fromParty: vendorSelectedParty,
      toParty: 'Vendor',
      amountUSD: cost,
      tatiTokens: tokens,
      energyMWh: tokens,
      status: 'SETTLED',
      txHash: `0x${Math.random().toString(16).substring(2, 10)}...${Math.random().toString(16).substring(2, 6)}`
    };

    setAccountingLedger([newEntry, ...accountingLedger]);
    alert(`Payment of $${cost.toFixed(2)} USD (${tokens} TATI) settled to Vendor.`);
  };

  // Agent Chat State
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState([
    { sender: 'REF Agent', text: 'Welcome to Rural Electrification Operating System Support. How can we assist with your energy banking or feeder telemetry?' }
  ]);
  const [inputMsg, setInputMsg] = useState('');

  // Handlers
  const toggleSource = (key: keyof typeof sources) => {
    setSources((prev) => ({
      ...prev,
      [key]: { ...prev[key], active: !prev[key].active }
    }));
  };

  const toggleJobCard = (id: number) => {
    setJobCards((prev) =>
      prev.map((j) => (j.id === id ? { ...j, status: !j.status } : j))
    );
  };

  const handlePostGridMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessageTitle.trim() || !newMessageText.trim()) return;
    const newMsg = {
      id: Date.now(),
      sender: 'Dispatch Controller',
      title: newMessageTitle,
      text: newMessageText,
      time: 'Just now',
      status: 'OPEN'
    };
    setGridMessages([newMsg, ...gridMessages]);
    setNewMessageTitle('');
    setNewMessageText('');
  };

  const executeBankTransfer = () => {
    const totalCostUSD = transferAmount * 197.50;
    if (fiatBalance < totalCostUSD) {
      alert(`Insufficient account funds. Purchasing ${transferAmount} TATI requires $${totalCostUSD.toFixed(2)} USD.`);
      return;
    }

    setFiatBalance((prev) => prev - totalCostUSD);
    setConsumerTati((prev) => prev + transferAmount);
    setConsumerPower((prev) => prev + (transferAmount * 1000));

    // Synchronize Consumer to Distributor Accounting Entry
    setPartyBalances((prev) => ({
      ...prev,
      Consumer: {
        ...prev.Consumer,
        usd: prev.Consumer.usd - totalCostUSD,
        tati: prev.Consumer.tati + transferAmount,
      },
      Distributor: {
        ...prev.Distributor,
        usd: prev.Distributor.usd + totalCostUSD,
        tati: prev.Distributor.tati - transferAmount,
      }
    }));

    const newLedgerEntry: AccountingEntry = {
      id: `CLR-${Math.floor(1000 + Math.random() * 9000)}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16) + ' CAT',
      description: 'Consumer Retail Energy Credit Purchase',
      fromParty: 'Consumer',
      toParty: 'Distributor',
      amountUSD: totalCostUSD,
      tatiTokens: transferAmount,
      energyMWh: transferAmount,
      status: 'SETTLED',
      txHash: `0x${Math.random().toString(16).substring(2, 10)}...${Math.random().toString(16).substring(2, 6)}`
    };

    setAccountingLedger([newLedgerEntry, ...accountingLedger]);
  };

  const handleSendMessage = () => {
    if (!inputMsg.trim()) return;
    setMessages((prev) => [...prev, { sender: 'You', text: inputMsg }]);
    const userQuery = inputMsg;
    setInputMsg('');
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { sender: 'REF Agent', text: `Received request: "${userQuery}". Logged into REF central dispatch registry.` }
      ]);
    }, 1000);
  };

  // =========================================================================
  // LOGIN / PORTAL SELECTION
  // =========================================================================
  if (!activePortal) {
    return (
      <div className="min-h-screen bg-slate-100 text-slate-800 flex flex-col justify-between antialiased">
        {/* Top Official REF Gold Header Bar */}
        <div className="bg-[#c4902b] text-white px-6 py-2 text-xs flex justify-between items-center font-sans shadow-inner">
          <div className="flex items-center space-x-6">
            <span className="flex items-center space-x-1.5"><Mail className="h-3.5 w-3.5" /> <span>info@rea.co.zw</span></span>
            <span className="flex items-center space-x-1.5"><MapPin className="h-3.5 w-3.5" /> <span>Megawatt House 44 Samora Machel Avenue Harare</span></span>
          </div>
          <div className="flex items-center space-x-4">
            <span className="flex items-center space-x-1.5"><Phone className="h-3.5 w-3.5" /> <span>+263 -242 -7081101</span></span>
          </div>
        </div>

        {/* Brand Header */}
        <header className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-6 h-24 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-1 bg-white rounded-lg border border-slate-100 shadow-sm flex items-center justify-center">
                <img
                  src="/ref-logo.jpeg"
                  alt="Rural Electrification Agency Logo"
                  className="h-16 w-auto object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/REF LOGO.jpeg';
                  }}
                />
              </div>
              <div>
                <h1 className="text-xl font-black tracking-tight text-[#2d2175] uppercase">
                  Rural Electrification Operating System
                </h1>
                <p className="text-xs font-bold text-[#c4902b] tracking-wide">Rural Electrification Fund (REF) Zimbabwe</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 font-mono text-xs bg-emerald-50 text-[#04873b] px-4 py-2 rounded-full border border-emerald-200 font-bold">
              <span className="h-2.5 w-2.5 rounded-full bg-[#04873b] animate-pulse" />
              <span>Settlement Rate: 1 TATI = 1 MWh ($197.50)</span>
            </div>
          </div>
        </header>

        {/* Portal Options */}
        <main className="max-w-7xl mx-auto px-6 py-12 w-full">
          <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
            <h2 className="text-3xl font-extrabold text-[#2d2175]">Enterprise Operating Portals</h2>
            <p className="text-slate-600 text-sm">
              Select an authorized portal to manage generation telemetry, dispatch load shedding, client banking, or audit cross-party settlement ledgers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* PORTAL 1: POWER GENERATOR */}
            <div className="bg-white border-2 border-slate-200 rounded-2xl p-5 flex flex-col justify-between hover:border-[#2d2175] transition-all shadow-md group">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="p-3 bg-[#2d2175]/10 text-[#2d2175] rounded-xl group-hover:scale-105 transition-transform">
                    <Zap className="h-6 w-6" />
                  </div>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 bg-[#2d2175] text-white rounded-full">
                    PG PORTAL
                  </span>
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#2d2175]">Power Generator (PG)</h3>
                  <p className="text-xs text-slate-600 mt-1">
                    Solar, hydro, and wind station telemetry and generation tariffs.
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100">
                  <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Demo Account</label>
                  <input
                    type="text"
                    value={pgEmail}
                    onChange={(e) => setPgEmail(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-mono text-slate-800 focus:outline-none focus:border-[#2d2175]"
                  />
                </div>
              </div>

              <button
                onClick={() => setActivePortal('PG')}
                className="mt-6 w-full py-2.5 bg-[#2d2175] hover:bg-[#201759] text-white font-bold rounded-xl text-xs flex items-center justify-center space-x-2 shadow-md transition-all"
              >
                <span>Log In as Generator</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            {/* PORTAL 2: POWER DISTRIBUTOR */}
            <div className="bg-white border-2 border-slate-200 rounded-2xl p-5 flex flex-col justify-between hover:border-[#c4902b] transition-all shadow-md group">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="p-3 bg-[#c4902b]/10 text-[#c4902b] rounded-xl group-hover:scale-105 transition-transform">
                    <Building2 className="h-6 w-6" />
                  </div>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 bg-[#c4902b] text-white rounded-full">
                    PD PORTAL
                  </span>
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Power Distributor (PD)</h3>
                  <p className="text-xs text-slate-600 mt-1">
                    Automated load shedding triggers and battery reserve banking.
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100">
                  <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Demo Account</label>
                  <input
                    type="text"
                    value={pdEmail}
                    onChange={(e) => setPdEmail(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-mono text-slate-800 focus:outline-none focus:border-[#c4902b]"
                  />
                </div>
              </div>

              <button
                onClick={() => setActivePortal('PD')}
                className="mt-6 w-full py-2.5 bg-[#c4902b] hover:bg-[#a37620] text-white font-bold rounded-xl text-xs flex items-center justify-center space-x-2 shadow-md transition-all"
              >
                <span>Log In as Distributor</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            {/* PORTAL 3: CONSUMER / CLIENT */}
            <div className="bg-white border-2 border-slate-200 rounded-2xl p-5 flex flex-col justify-between hover:border-[#04873b] transition-all shadow-md group">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="p-3 bg-[#04873b]/10 text-[#04873b] rounded-xl group-hover:scale-105 transition-transform">
                    <Building className="h-6 w-6" />
                  </div>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 bg-[#04873b] text-white rounded-full">
                    CLIENT BANKING
                  </span>
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Consumer Banking</h3>
                  <p className="text-xs text-slate-600 mt-1">
                    Manage fiat accounts, buy 1 TATI ($197.50/MWh), and pay bills.
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100">
                  <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Demo Account</label>
                  <input
                    type="text"
                    value={cEmail}
                    onChange={(e) => setCEmail(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-mono text-slate-800 focus:outline-none focus:border-[#04873b]"
                  />
                </div>
              </div>

              <button
                onClick={() => setActivePortal('C')}
                className="mt-6 w-full py-2.5 bg-[#04873b] hover:bg-[#03692e] text-white font-bold rounded-xl text-xs flex items-center justify-center space-x-2 shadow-md transition-all"
              >
                <span>Access Consumer Banking</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            {/* PORTAL 4: 4-WAY ACCOUNTING ENGINE */}
            <div className="bg-white border-2 border-slate-200 rounded-2xl p-5 flex flex-col justify-between hover:border-indigo-600 transition-all shadow-md group">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="p-3 bg-indigo-100 text-indigo-700 rounded-xl group-hover:scale-105 transition-transform">
                    <FileText className="h-6 w-6" />
                  </div>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 bg-indigo-700 text-white rounded-full">
                    4-WAY LEDGER
                  </span>
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Accounting Clearing House</h3>
                  <p className="text-xs text-slate-600 mt-1">
                    Reconcile payments between PG, PD, Consumer, and Equipment Vendors.
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100">
                  <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Demo Account</label>
                  <input
                    type="text"
                    value={accEmail}
                    onChange={(e) => setAccEmail(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-mono text-slate-800 focus:outline-none focus:border-indigo-600"
                  />
                </div>
              </div>

              <button
                onClick={() => setActivePortal('ACC')}
                className="mt-6 w-full py-2.5 bg-indigo-700 hover:bg-indigo-800 text-white font-bold rounded-xl text-xs flex items-center justify-center space-x-2 shadow-md transition-all"
              >
                <span>Open Accounting Platform</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </main>

        <footer className="bg-[#2d2175] text-white py-6 border-t border-slate-800">
          <div className="max-w-7xl mx-auto px-6 text-center text-xs font-sans space-y-1">
            <p className="font-bold">Rural Electrification Fund (REF) Zimbabwe © 2026</p>
            <p className="text-slate-300">Powering Rural Communities Through Renewable Infrastructure</p>
          </div>
        </footer>
      </div>
    );
  }

  // =========================================================================
  // LOGGED IN WORKSPACE
  // =========================================================================
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased pb-20">
      {/* Top Banner */}
      <div className="bg-[#c4902b] text-white px-6 py-1.5 text-xs flex justify-between items-center font-sans">
        <span className="font-bold">Rural Electrification Operating System — REF Central Grid</span>
        <span className="font-mono text-[11px]">Valuation: 1 TATI = 1 MWh = $197.50 USD</span>
      </div>

      {/* Main App Navigation Bar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-1 bg-white rounded-lg border border-slate-100 shadow-sm flex items-center justify-center">
              <img
                src="/ref-logo.jpeg"
                alt="REF Logo"
                className="h-12 w-auto object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/REF LOGO.jpeg';
                }}
              />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-base font-black tracking-wider text-[#2d2175] uppercase">
                  {activePortal === 'PG' && 'Rural Power Generator Operations'}
                  {activePortal === 'PD' && 'REF Central Dispatch & Grid Control'}
                  {activePortal === 'C' && 'REF Consumer Energy Banking Platform'}
                  {activePortal === 'ACC' && 'REF 4-Party Accounting & Settlement Clearing House'}
                </h1>
                <span className="text-[10px] bg-slate-100 text-[#2d2175] font-mono px-2 py-0.5 rounded border border-slate-300 font-bold">
                  {activePortal === 'PG' && pgEmail}
                  {activePortal === 'PD' && pdEmail}
                  {activePortal === 'C' && cEmail}
                  {activePortal === 'ACC' && accEmail}
                </span>
              </div>
              <p className="text-[11px] font-bold text-[#c4902b] mt-0.5">
                Rural Electrification Fund (REF) Official Operational Console
              </p>
            </div>
          </div>

          <button
            onClick={() => setActivePortal(null)}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-xl text-xs font-bold text-slate-700 transition-all font-mono"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Switch Portal</span>
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* =================================================================
            1. POWER GENERATOR (PG) INTERFACE
        ================================================================= */}
        {activePortal === 'PG' && (
          <div className="space-y-8">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div>
                <h2 className="text-xl font-black text-[#2d2175]">Generator Telemetry & Rural Plant Feed</h2>
                <p className="text-xs text-slate-500">
                  Real-time supply vs load telemetry. Monitoring inputs and load variances across REF stations.
                </p>
              </div>
              <button
                onClick={() => setIsAutoSimulating(!isAutoSimulating)}
                className={`flex items-center space-x-2 px-3 py-1.5 rounded-xl text-xs font-mono font-bold border transition-all ${
                  isAutoSimulating
                    ? 'bg-emerald-50 text-[#04873b] border-emerald-300'
                    : 'bg-slate-100 text-slate-500 border-slate-300'
                }`}
              >
                <RefreshCw className={`h-3.5 w-3.5 ${isAutoSimulating ? 'animate-spin' : ''}`} />
                <span>{isAutoSimulating ? 'SIMULATION LIVE' : 'PAUSED'}</span>
              </button>
            </div>

            {/* Regional Grid Load Slider */}
            <div className="bg-white border border-slate-200 p-6 rounded-2xl space-y-3 shadow-sm">
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="text-[#2d2175] font-bold uppercase tracking-wider flex items-center space-x-2">
                  <Sliders className="h-4 w-4 text-[#c4902b]" />
                  <span>Regional Load Demand (kWh)</span>
                </span>
                <span className="text-[#d92525] font-black text-sm font-mono">{currentDemand} kWh</span>
              </div>
              <input
                type="range"
                min="300"
                max="1600"
                step="10"
                value={currentDemand}
                onChange={(e) => setCurrentDemand(Number(e.target.value))}
                className="w-full accent-[#c4902b] bg-slate-200 h-2 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] font-mono text-slate-500">
                <span>Low Demand (300 kWh)</span>
                <span>Normal Baseline (850 kWh)</span>
                <span>Peak Load Spike (1600 kWh)</span>
              </div>
            </div>

            {/* Generation Sources Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Solar */}
              <div className="bg-white border-2 border-slate-200 p-6 rounded-2xl space-y-4 shadow-sm relative overflow-hidden">
                <div className="flex justify-between items-start">
                  <div className="flex items-center space-x-2">
                    <div className="p-2 bg-amber-100 text-[#c4902b] rounded-xl">
                      <Sun className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-[#2d2175]">REF Solar Field</h3>
                      <span className="text-[10px] font-mono text-slate-500">Capacity: 450 kWh</span>
                    </div>
                  </div>
                  <button
                    onClick={() => toggleSource('solar')}
                    className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                      sources.solar.active
                        ? 'bg-emerald-100 text-[#04873b] border border-emerald-300'
                        : 'bg-slate-100 text-slate-400 border border-slate-200'
                    }`}
                  >
                    {sources.solar.active ? 'ONLINE' : 'OFFLINE'}
                  </button>
                </div>
                <div className="flex items-baseline space-x-2">
                  <span className="text-3xl font-black font-mono text-slate-900">{sources.solar.output}</span>
                  <span className="text-xs font-mono font-bold text-[#04873b] uppercase">kWh Input</span>
                </div>
                <div className="pt-3 border-t border-slate-100 text-[11px] font-mono text-slate-600 flex justify-between">
                  <span>Valuation ($197.50/MWh):</span>
                  <span className="text-[#c4902b] font-bold">${((sources.solar.output / 1000) * 197.50).toFixed(2)}</span>
                </div>
              </div>

              {/* Wind */}
              <div className="bg-white border-2 border-slate-200 p-6 rounded-2xl space-y-4 shadow-sm relative overflow-hidden">
                <div className="flex justify-between items-start">
                  <div className="flex items-center space-x-2">
                    <div className="p-2 bg-indigo-100 text-[#2d2175] rounded-xl">
                      <Wind className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-[#2d2175]">REF Wind Turbines</h3>
                      <span className="text-[10px] font-mono text-slate-500">Capacity: 350 kWh</span>
                    </div>
                  </div>
                  <button
                    onClick={() => toggleSource('wind')}
                    className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                      sources.wind.active
                        ? 'bg-emerald-100 text-[#04873b] border border-emerald-300'
                        : 'bg-slate-100 text-slate-400 border border-slate-200'
                    }`}
                  >
                    {sources.wind.active ? 'ONLINE' : 'OFFLINE'}
                  </button>
                </div>
                <div className="flex items-baseline space-x-2">
                  <span className="text-3xl font-black font-mono text-slate-900">{sources.wind.output}</span>
                  <span className="text-xs font-mono font-bold text-[#04873b] uppercase">kWh Input</span>
                </div>
                <div className="pt-3 border-t border-slate-100 text-[11px] font-mono text-slate-600 flex justify-between">
                  <span>Valuation ($197.50/MWh):</span>
                  <span className="text-[#c4902b] font-bold">${((sources.wind.output / 1000) * 197.50).toFixed(2)}</span>
                </div>
              </div>

              {/* Hydro */}
              <div className="bg-white border-2 border-slate-200 p-6 rounded-2xl space-y-4 shadow-sm relative overflow-hidden">
                <div className="flex justify-between items-start">
                  <div className="flex items-center space-x-2">
                    <div className="p-2 bg-blue-100 text-blue-700 rounded-xl">
                      <Flame className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-[#2d2175]">Micro-Hydro Station</h3>
                      <span className="text-[10px] font-mono text-slate-500">Capacity: 600 kWh</span>
                    </div>
                  </div>
                  <button
                    onClick={() => toggleSource('hydro')}
                    className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                      sources.hydro.active
                        ? 'bg-emerald-100 text-[#04873b] border border-emerald-300'
                        : 'bg-slate-100 text-slate-400 border border-slate-200'
                    }`}
                  >
                    {sources.hydro.active ? 'ONLINE' : 'OFFLINE'}
                  </button>
                </div>
                <div className="flex items-baseline space-x-2">
                  <span className="text-3xl font-black font-mono text-slate-900">{sources.hydro.output}</span>
                  <span className="text-xs font-mono font-bold text-[#04873b] uppercase">kWh Input</span>
                </div>
                <div className="pt-3 border-t border-slate-100 text-[11px] font-mono text-slate-600 flex justify-between">
                  <span>Valuation ($197.50/MWh):</span>
                  <span className="text-[#c4902b] font-bold">${((sources.hydro.output / 1000) * 197.50).toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Dynamic Telemetry Graph */}
            <div className="bg-white border border-slate-200 p-6 rounded-2xl space-y-4 shadow-sm">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-bold text-[#2d2175] uppercase tracking-wider">
                  Live Telemetry: Generation Input vs Regional Demand
                </h3>
                <div className="flex items-center space-x-4 text-xs font-mono font-bold">
                  <span className="flex items-center space-x-1.5 text-[#04873b]">
                    <span className="h-2.5 w-2.5 rounded-full bg-[#04873b]" />
                    <span>Total Generation Input</span>
                  </span>
                  <span className="flex items-center space-x-1.5 text-[#d92525]">
                    <span className="h-2.5 w-2.5 rounded-full bg-[#d92525]" />
                    <span>Regional Demand Load</span>
                  </span>
                </div>
              </div>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={powerGraphData}>
                    <XAxis dataKey="time" stroke="#64748b" fontSize={11} />
                    <YAxis stroke="#64748b" fontSize={11} />
                    <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', borderRadius: '8px' }} />
                    <Area type="monotone" dataKey="generation" stroke="#04873b" fill="#04873b" fillOpacity={0.15} strokeWidth={2.5} name="Generation Input (kWh)" />
                    <Area type="monotone" dataKey="demand" stroke="#d92525" fill="#d92525" fillOpacity={0.1} strokeWidth={2.5} name="Regional Load (kWh)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Reconciliation Accounting */}
            <div className="bg-white border border-slate-200 p-6 rounded-2xl space-y-4 shadow-sm">
              <h3 className="text-sm font-bold text-[#2d2175] uppercase tracking-wider">
                Automated Power Reconciliation & Credit Minting
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <span className="text-[10px] font-mono font-bold text-slate-500 uppercase">Total Generation Input</span>
                  <div className="text-2xl font-black font-mono text-[#04873b] mt-1">{totalGeneration} kWh</div>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <span className="text-[10px] font-mono font-bold text-slate-500 uppercase">Active Grid Load</span>
                  <div className="text-2xl font-black font-mono text-[#d92525] mt-1">{currentDemand} kWh</div>
                </div>

                <div className={`p-4 rounded-xl border ${
                  isSurplus 
                    ? 'bg-emerald-50 border-emerald-300 text-[#04873b]' 
                    : 'bg-rose-50 border-rose-300 text-[#d92525]'
                }`}>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold uppercase">Net Power Balance</span>
                    {isSurplus ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                  </div>
                  <div className="text-2xl font-black font-mono mt-1">
                    {isSurplus ? `+${powerDifference}` : powerDifference} kWh
                  </div>
                  <span className="text-[10px] font-mono font-bold uppercase mt-1 block">
                    {isSurplus ? 'SURPLUS AUTOMATICALLY BANKED' : 'AUTOMATIC LOAD SHEDDING TRIGGERED'}
                  </span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-mono">
                <span className="text-slate-600">Mintable On-Chain Tokens (1 TATI = 1 MWh = $197.50 USD):</span>
                <span className="text-[#2d2175] font-bold text-sm">{(totalGeneration / 1000).toFixed(3)} TATI (${((totalGeneration / 1000) * 197.50).toFixed(2)})</span>
              </div>
            </div>
          </div>
        )}

        {/* =================================================================
            2. POWER DISTRIBUTOR (PD) INTERFACE
        ================================================================= */}
        {activePortal === 'PD' && (
          <div className="space-y-8">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div>
                <h2 className="text-xl font-black text-[#2d2175]">Central Dispatch & Logistics Control</h2>
                <p className="text-xs text-slate-500">
                  Automated Load Shedding, BESS Reserve Banking, and Interactive Grid Logistics
                </p>
              </div>
              <div className="flex items-center space-x-2 text-xs font-mono font-bold text-[#c4902b] bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-xl">
                <Layers className="h-4 w-4" />
                <span>REF Dispatch Automation Active</span>
              </div>
            </div>

            {/* Grid Status Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm">
                <span className="text-xs font-bold text-slate-500 uppercase">Incoming Generation Input</span>
                <div className="text-2xl font-black font-mono text-[#04873b] mt-1">{totalGeneration} kWh</div>
              </div>

              <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm">
                <span className="text-xs font-bold text-slate-500 uppercase">Current Load Demand</span>
                <div className="text-2xl font-black font-mono text-[#d92525] mt-1">{currentDemand} kWh</div>
              </div>

              <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm">
                <span className="text-xs font-bold text-slate-500 uppercase">Grid Balancing Engine</span>
                <div className={`text-base font-black font-mono mt-1 ${gridState === 'LOAD_SHED' ? 'text-[#d92525]' : 'text-[#04873b]'}`}>
                  {gridState === 'LOAD_SHED' ? 'LOAD SHEDDING ACTIVE' : 'BANKING SURPLUS'}
                </div>
              </div>

              <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm">
                <span className="text-xs font-bold text-slate-500 uppercase">Banked BESS Reserve</span>
                <div className="text-2xl font-black font-mono text-[#2d2175] mt-1">{(bankedEnergyKWh / 1000).toFixed(2)} MWh</div>
              </div>
            </div>

            {/* AUTOMATED LOAD SHEDDING / BANK SURPLUS STATUS PANEL */}
            <div className="bg-white border border-slate-200 p-6 rounded-2xl space-y-4 shadow-sm">
              <h3 className="text-sm font-bold text-[#2d2175] uppercase tracking-wider">
                Automated Grid Balancing Status
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className={`p-5 rounded-2xl border flex items-center space-x-4 transition-all ${
                  gridState === 'STORE'
                    ? 'bg-emerald-50 border-[#04873b] text-[#04873b] shadow-sm'
                    : 'bg-slate-50 border-slate-200 text-slate-400'
                }`}>
                  <div className="p-3 bg-[#04873b]/10 rounded-xl text-[#04873b]">
                    <PiggyBank className="h-7 w-7" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm uppercase">BANK SURPLUS GENERATED ENERGY</h4>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Input generation exceeds load ({totalGeneration} kWh &gt; {currentDemand} kWh). Excess energy is automatically stored in regional BESS reserves.
                    </p>
                  </div>
                </div>

                <div className={`p-5 rounded-2xl border flex items-center space-x-4 transition-all ${
                  gridState === 'LOAD_SHED'
                    ? 'bg-rose-50 border-[#d92525] text-[#d92525] shadow-sm'
                    : 'bg-slate-50 border-slate-200 text-slate-400'
                }`}>
                  <div className="p-3 bg-[#d92525]/10 rounded-xl text-[#d92525]">
                    <ShieldAlert className="h-7 w-7" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm uppercase">AUTOMATIC LOAD SHEDDING TRIGGERED</h4>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Load exceeds input generation ({currentDemand} kWh &gt; {totalGeneration} kWh). Automated feeder shed triggered to prevent grid failure.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* INTERACTIVE GRID MESSAGES & LOGISTICS SECTION */}
            <div className="bg-white border border-slate-200 p-6 rounded-2xl space-y-6 shadow-sm">
              <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-sm font-bold text-[#2d2175] uppercase tracking-wider flex items-center space-x-2">
                    <MessageSquare className="h-4 w-4 text-[#c4902b]" />
                    <span>Grid Messages & Logistics Portal</span>
                  </h3>
                  <p className="text-xs text-slate-500">Dispatch controllers and field engineers interactive dispatch log</p>
                </div>
                <span className="text-[10px] font-mono bg-slate-100 text-[#2d2175] px-3 py-1 rounded-full font-bold border border-slate-200">
                  {gridMessages.length} Messages Active
                </span>
              </div>

              {/* Message Composer */}
              <form onSubmit={handlePostGridMessage} className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <span className="text-xs font-bold text-[#2d2175] block uppercase">Transmit New Dispatch Logistics Message</span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Logistics Subject / Location"
                    value={newMessageTitle}
                    onChange={(e) => setNewMessageTitle(e.target.value)}
                    className="bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-[#2d2175] font-mono"
                  />
                  <input
                    type="text"
                    placeholder="Message Details & Feeder Status..."
                    value={newMessageText}
                    onChange={(e) => setNewMessageText(e.target.value)}
                    className="bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-[#2d2175] font-mono"
                  />
                </div>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#2d2175] hover:bg-[#201759] text-white font-bold rounded-lg text-xs flex items-center space-x-2 shadow-sm transition-all"
                >
                  <Send className="h-3.5 w-3.5" />
                  <span>Transmit Grid Message</span>
                </button>
              </form>

              {/* Interactive Messages List */}
              <div className="space-y-3">
                {gridMessages.map((msg) => (
                  <div key={msg.id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-[#2d2175] font-bold text-xs font-mono">{msg.title}</span>
                      <span className="text-[10px] font-mono text-slate-400">{msg.time}</span>
                    </div>
                    <p className="text-xs text-slate-700 font-mono">{msg.text}</p>
                    <div className="pt-2 flex justify-between items-center text-[10px] font-mono text-slate-500">
                      <span>Sender: {msg.sender}</span>
                      <span className="px-2 py-0.5 bg-emerald-100 text-[#04873b] font-bold rounded">
                        {msg.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Maintenance Job Cards */}
            <div className="bg-white border border-slate-200 p-6 rounded-2xl space-y-4 shadow-sm">
              <h3 className="text-sm font-bold text-[#2d2175] uppercase tracking-wider flex items-center space-x-2">
                <Wrench className="h-4 w-4 text-[#c4902b]" />
                <span>Field Technician Job Cards</span>
              </h3>
              <div className="space-y-3">
                {jobCards.map((job) => (
                  <div
                    key={job.id}
                    onClick={() => toggleJobCard(job.id)}
                    className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer hover:border-[#2d2175] transition-all"
                  >
                    <div className="flex items-center space-x-3">
                      {job.status ? (
                        <CheckSquare className="h-5 w-5 text-[#04873b]" />
                      ) : (
                        <Square className="h-5 w-5 text-slate-400" />
                      )}
                      <span className={`text-xs font-mono font-medium ${job.status ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                        {job.title}
                      </span>
                    </div>
                    {job.urgent && (
                      <span className="text-[9px] font-mono font-bold px-2 py-0.5 bg-rose-100 text-[#d92525] border border-rose-200 rounded">
                        HIGH PRIORITY
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* =================================================================
            3. CONSUMER / CLIENT (C) PORTAL
        ================================================================= */}
        {activePortal === 'C' && (
          <div className="space-y-8">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div>
                <h2 className="text-xl font-black text-[#2d2175]">REF Consumer Energy Banking Platform</h2>
                <p className="text-xs text-slate-500">
                  Manage commercial USD accounts, purchase 1 TATI energy credits ($197.50/MWh), and settle utility balances.
                </p>
              </div>
              <div className="flex items-center space-x-2 text-xs font-mono font-bold text-[#04873b] bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl">
                <Building className="h-4 w-4" />
                <span>REF Digital Banking Verified</span>
              </div>
            </div>

            {/* Banking Account Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Fiat USD Account */}
              <div className="bg-gradient-to-br from-[#2d2175] to-[#1e1554] text-white p-6 rounded-2xl space-y-2 shadow-md">
                <div className="flex justify-between items-center text-slate-200">
                  <span className="text-xs font-mono font-bold uppercase">Primary Fiat Account</span>
                  <DollarSign className="h-5 w-5 text-[#c4902b]" />
                </div>
                <div className="text-3xl font-black font-mono">${partyBalances.Consumer.usd.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
                <div className="text-[10px] font-mono text-slate-300 pt-1">Acc #: 9088-2211-REF-ZIM</div>
              </div>

              {/* TATI Energy Token Balance */}
              <div className="bg-gradient-to-br from-[#c4902b] to-[#9c711e] text-white p-6 rounded-2xl space-y-2 shadow-md">
                <div className="flex justify-between items-center text-slate-100">
                  <span className="text-xs font-mono font-bold uppercase">Energy Credit Balance</span>
                  <Wallet className="h-5 w-5 text-white" />
                </div>
                <div className="text-3xl font-black font-mono">{partyBalances.Consumer.tati} TATI</div>
                <div className="text-[10px] font-mono text-slate-100 pt-1">
                  Valuation: ${(partyBalances.Consumer.tati * 197.50).toFixed(2)} USD (1 TATI = 1 MWh)
                </div>
              </div>

              {/* Connected Smart Meter Reserve */}
              <div className="bg-gradient-to-br from-[#04873b] to-[#025c27] text-white p-6 rounded-2xl space-y-2 shadow-md">
                <div className="flex justify-between items-center text-slate-100">
                  <span className="text-xs font-mono font-bold uppercase">Connected Smart Meter Reserve</span>
                  <Zap className="h-5 w-5 text-[#f2d011]" />
                </div>
                <div className="text-3xl font-black font-mono">{partyBalances.Consumer.energyMWh.toFixed(1)} MWh</div>
                <div className="text-[10px] font-mono text-slate-200 pt-1">Meter #: MUTARE-COMMERCIAL-08</div>
              </div>
            </div>

            {/* BANKING MODULE: ENERGY CREDIT PURCHASE & TRANSFER */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Purchase TATI Credits Form */}
              <div className="bg-white border border-slate-200 p-6 rounded-2xl space-y-6 shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="text-sm font-bold text-[#2d2175] uppercase tracking-wider flex items-center space-x-2">
                    <CreditCard className="h-4 w-4 text-[#04873b]" />
                    <span>Purchase Energy Credits</span>
                  </h3>
                  <span className="text-xs font-mono text-[#c4902b] font-bold">1 TATI = 1 MWh = $197.50</span>
                </div>

                <div className="space-y-4 font-mono text-xs">
                  <div>
                    <label className="text-slate-600 block mb-1 font-bold">Select Token Volume (TATI):</label>
                    <input
                      type="number"
                      min="1"
                      max="50"
                      value={transferAmount}
                      onChange={(e) => setTransferAmount(Math.max(1, Number(e.target.value)))}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-[#2d2175] text-sm font-bold focus:outline-none focus:border-[#2d2175]"
                    />
                  </div>

                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                    <div className="flex justify-between text-slate-600">
                      <span>Energy Equivalent:</span>
                      <span className="text-[#04873b] font-bold">{transferAmount} MWh ({transferAmount * 1000} kWh)</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Unit Rate:</span>
                      <span>$197.50 USD / MWh</span>
                    </div>
                    <div className="pt-2 border-t border-slate-200 flex justify-between text-sm">
                      <span className="text-slate-900 font-bold">Total USD Settlement:</span>
                      <span className="text-[#2d2175] font-black">${(transferAmount * 197.50).toFixed(2)} USD</span>
                    </div>
                  </div>

                  <button
                    onClick={executeBankTransfer}
                    className="w-full py-3.5 bg-[#04873b] hover:bg-[#03692e] text-white font-bold rounded-xl text-xs uppercase tracking-wider shadow-md transition-all"
                  >
                    Confirm Purchase & Credit Meter
                  </button>
                </div>
              </div>

              {/* Inter-Account Transfer Module */}
              <div className="bg-white border border-slate-200 p-6 rounded-2xl space-y-6 shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="text-sm font-bold text-[#2d2175] uppercase tracking-wider flex items-center space-x-2">
                    <ArrowRightLeft className="h-4 w-4 text-[#c4902b]" />
                    <span>Inter-Account Energy Transfer</span>
                  </h3>
                  <span className="text-xs font-mono text-slate-400">REF Network Settlement</span>
                </div>

                <div className="space-y-4 font-mono text-xs">
                  <div>
                    <label className="text-slate-600 block mb-1 font-bold">Recipient Account / Meter ID:</label>
                    <input
                      type="text"
                      value={recipientAccount}
                      onChange={(e) => setRecipientAccount(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:border-[#2d2175]"
                    />
                  </div>

                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                    <span className="text-[10px] text-[#c4902b] font-bold block uppercase">Rural Electrification Fund Policy</span>
                    <p className="text-[11px] text-slate-600">
                      Transferring energy credits allows rural businesses to subsidize local community schools and health clinics instantly.
                    </p>
                  </div>

                  <button
                    onClick={() => alert(`Transferred ${transferAmount} TATI (${transferAmount} MWh) to ${recipientAccount}.`)}
                    className="w-full py-3.5 bg-[#c4902b] hover:bg-[#a37620] text-white font-bold rounded-xl text-xs uppercase tracking-wider shadow-md transition-all"
                  >
                    Transfer TATI Energy Credits
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =================================================================
            4. 4-WAY ACCOUNTING ENGINE & VENDOR CLEARING HOUSE PORTAL
        ================================================================= */}
        {activePortal === 'ACC' && (
          <div className="space-y-8">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div>
                <h2 className="text-xl font-black text-[#2d2175]">4-Way Enterprise Energy Settlement Engine</h2>
                <p className="text-xs text-slate-500">
                  Real-time clearing house tracing payments between Power Generators, Distributors, Consumers, and Equipment Vendors.
                </p>
              </div>
              <div className="flex items-center space-x-2 text-xs font-mono font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-3 py-1.5 rounded-xl">
                <Lock className="h-4 w-4" />
                <span>Double-Entry Cryptographic Audit Trail</span>
              </div>
            </div>

            {/* 4-PARTY REAL-TIME BALANCE CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Generator Balance */}
              <div className="bg-white border-2 border-slate-200 p-5 rounded-2xl shadow-sm space-y-3">
                <div className="flex items-center justify-between text-slate-500">
                  <span className="text-xs font-mono font-bold uppercase">1. Power Generator</span>
                  <Zap className="h-4 w-4 text-[#2d2175]" />
                </div>
                <div className="text-2xl font-black font-mono text-[#2d2175]">
                  ${partyBalances.Generator.usd.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </div>
                <div className="flex justify-between text-[11px] font-mono text-slate-600 pt-2 border-t border-slate-100">
                  <span>$TATI Reserve:</span>
                  <span className="font-bold text-[#c4902b]">{partyBalances.Generator.tati} TATI</span>
                </div>
              </div>

              {/* Distributor Balance */}
              <div className="bg-white border-2 border-slate-200 p-5 rounded-2xl shadow-sm space-y-3">
                <div className="flex items-center justify-between text-slate-500">
                  <span className="text-xs font-mono font-bold uppercase">2. Power Distributor</span>
                  <Building2 className="h-4 w-4 text-[#c4902b]" />
                </div>
                <div className="text-2xl font-black font-mono text-[#c4902b]">
                  ${partyBalances.Distributor.usd.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </div>
                <div className="flex justify-between text-[11px] font-mono text-slate-600 pt-2 border-t border-slate-100">
                  <span>$TATI Reserve:</span>
                  <span className="font-bold text-[#c4902b]">{partyBalances.Distributor.tati} TATI</span>
                </div>
              </div>

              {/* Consumer Balance */}
              <div className="bg-white border-2 border-slate-200 p-5 rounded-2xl shadow-sm space-y-3">
                <div className="flex items-center justify-between text-slate-500">
                  <span className="text-xs font-mono font-bold uppercase">3. Consumer Client</span>
                  <Building className="h-4 w-4 text-[#04873b]" />
                </div>
                <div className="text-2xl font-black font-mono text-[#04873b]">
                  ${partyBalances.Consumer.usd.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </div>
                <div className="flex justify-between text-[11px] font-mono text-slate-600 pt-2 border-t border-slate-100">
                  <span>$TATI Reserve:</span>
                  <span className="font-bold text-[#c4902b]">{partyBalances.Consumer.tati} TATI</span>
                </div>
              </div>

              {/* Vendor Balance */}
              <div className="bg-white border-2 border-slate-200 p-5 rounded-2xl shadow-sm space-y-3">
                <div className="flex items-center justify-between text-slate-500">
                  <span className="text-xs font-mono font-bold uppercase">4. Hardware Vendor</span>
                  <Truck className="h-4 w-4 text-indigo-600" />
                </div>
                <div className="text-2xl font-black font-mono text-indigo-700">
                  ${partyBalances.Vendor.usd.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </div>
                <div className="flex justify-between text-[11px] font-mono text-slate-600 pt-2 border-t border-slate-100">
                  <span>$TATI Reserve:</span>
                  <span className="font-bold text-[#c4902b]">{partyBalances.Vendor.tati} TATI</span>
                </div>
              </div>
            </div>

            {/* VENDOR DISBURSEMENT PAYMENT MODULE */}
            <div className="bg-white border border-slate-200 p-6 rounded-2xl space-y-6 shadow-sm">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-[#2d2175] uppercase tracking-wider flex items-center space-x-2">
                  <Truck className="h-4 w-4 text-indigo-600" />
                  <span>Execute Equipment & Hardware Vendor Payment</span>
                </h3>
                <span className="text-xs font-mono text-slate-400">Direct Infrastructure Procurement</span>
              </div>

              <form onSubmit={handleVendorDisbursement} className="grid grid-cols-1 md:grid-cols-4 gap-4 font-mono text-xs">
                <div>
                  <label className="text-slate-600 block mb-1 font-bold">Debtor Account:</label>
                  <select
                    value={vendorSelectedParty}
                    onChange={(e) => setVendorSelectedParty(e.target.value as 'Generator' | 'Distributor')}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-slate-800 font-bold focus:outline-none focus:border-indigo-600"
                  >
                    <option value="Distributor">Distributor Account</option>
                    <option value="Generator">Generator Account</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-600 block mb-1 font-bold">Invoice Ref Number:</label>
                  <input
                    type="text"
                    value={vendorInvoiceRef}
                    onChange={(e) => setVendorInvoiceRef(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-slate-800 font-bold focus:outline-none focus:border-indigo-600"
                  />
                </div>

                <div>
                  <label className="text-slate-600 block mb-1 font-bold">TATI Token Volume:</label>
                  <input
                    type="number"
                    min="1"
                    value={vendorPayTokens}
                    onChange={(e) => {
                      const tokens = Math.max(1, Number(e.target.value));
                      setVendorPayTokens(tokens);
                      setVendorPayAmount(tokens * 197.50);
                    }}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-slate-800 font-bold focus:outline-none focus:border-indigo-600"
                  />
                </div>

                <div className="flex items-end">
                  <button
                    type="submit"
                    className="w-full py-2.5 bg-indigo-700 hover:bg-indigo-800 text-white font-bold rounded-xl text-xs uppercase tracking-wider shadow-md transition-all flex items-center justify-center space-x-2"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Settle Vendor Invoice</span>
                  </button>
                </div>
              </form>
            </div>

            {/* AUDIT TRACEABILITY CLEARING HOUSE TABLE */}
            <div className="bg-white border border-slate-200 p-6 rounded-2xl space-y-4 shadow-sm">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-[#2d2175] uppercase tracking-wider flex items-center space-x-2">
                  <FileText className="h-4 w-4 text-[#c4902b]" />
                  <span>Cross-Party Transaction Ledger Audit Trail</span>
                </h3>
                <span className="text-xs font-mono text-slate-400">Showing {accountingLedger.length} Cleared Transactions</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-slate-100 text-slate-600 uppercase text-[10px] border-b border-slate-200">
                    <tr>
                      <th className="p-3">Ref Code</th>
                      <th className="p-3">Timestamp</th>
                      <th className="p-3">From (P1)</th>
                      <th className="p-3">To (P2)</th>
                      <th className="p-3">Description</th>
                      <th className="p-3">USD Valuation</th>
                      <th className="p-3">TATI Token</th>
                      <th className="p-3">Crypto Tx Hash</th>
                      <th className="p-3 text-right">State</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {accountingLedger.map((tx) => (
                      <tr key={tx.id} className="hover:bg-slate-50">
                        <td className="p-3 text-[#2d2175] font-bold">{tx.id}</td>
                        <td className="p-3 text-slate-500">{tx.timestamp}</td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-300 font-bold text-slate-700">
                            {tx.fromParty}
                          </span>
                        </td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-300 font-bold text-slate-700">
                            {tx.toParty}
                          </span>
                        </td>
                        <td className="p-3 text-slate-800 font-medium">{tx.description}</td>
                        <td className="p-3 font-bold text-slate-900">${tx.amountUSD.toFixed(2)}</td>
                        <td className="p-3 font-bold text-[#c4902b]">{tx.tatiTokens} TATI</td>
                        <td className="p-3 text-slate-400 text-[10px]">{tx.txHash}</td>
                        <td className="p-3 text-right">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-100 text-[#04873b] border border-emerald-200">
                            {tx.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Floating REF Assistant Chat Widget */}
      <div className="fixed bottom-6 right-6 z-50">
        {!chatOpen ? (
          <button
            onClick={() => setChatOpen(true)}
            className="p-4 bg-[#04873b] hover:bg-[#03692e] text-white rounded-2xl shadow-xl flex items-center space-x-2 font-bold text-xs hover:scale-105 transition-all"
          >
            <Bot className="h-5 w-5" />
            <span>REF Support Agent</span>
          </button>
        ) : (
          <div className="w-80 bg-white border border-slate-300 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
            <div className="bg-[#2d2175] p-3.5 text-white flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Bot className="h-4 w-4 text-[#f2d011]" />
                <span className="text-xs font-bold uppercase">REF Central Support</span>
              </div>
              <button
                onClick={() => setChatOpen(false)}
                className="text-slate-300 hover:text-white text-xs font-mono font-bold"
              >
                ✕
              </button>
            </div>

            <div className="p-3 h-64 overflow-y-auto space-y-2 text-xs font-mono bg-slate-50">
              {messages.map((m, idx) => (
                <div
                  key={idx}
                  className={`p-2.5 rounded-xl max-w-[85%] ${
                    m.sender === 'You'
                      ? 'bg-[#2d2175] text-white ml-auto'
                      : 'bg-white text-slate-800 border border-slate-200 shadow-sm'
                  }`}
                >
                  <span className="text-[9px] font-bold text-slate-400 block mb-0.5">{m.sender}</span>
                  {m.text}
                </div>
              ))}
            </div>

            <div className="p-2.5 bg-white border-t border-slate-200 flex items-center space-x-2">
              <input
                type="text"
                placeholder="Ask REF support agent..."
                value={inputMsg}
                onChange={(e) => setInputMsg(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                className="flex-1 bg-slate-100 border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-[#2d2175] font-mono"
              />
              <button
                onClick={handleSendMessage}
                className="p-2 bg-[#2d2175] text-white rounded-lg font-bold hover:bg-[#201759]"
              >
                <Send className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
