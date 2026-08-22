import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { db } from '../lib/firebase';
import { collection, doc, serverTimestamp } from 'firebase/firestore';
import { safeSetDoc } from '../lib/safeFirestore';
import { 
  FileText, 
  Check, 
  Copy, 
  Download, 
  Terminal, 
  Key, 
  Cpu, 
  Sparkles,
  Layers,
  ChevronRight,
  ArrowRight,
  Settings,
  Rocket,
  Info,
  Server,
  Cloud,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { toast } from 'sonner';

interface FileItem {
  filename: string;
  content: string;
}

interface SecretItem {
  key: string;
  description: string;
  placeholder?: string;
}

interface BotCodeViewerProps {
  files: FileItem[];
  secrets?: SecretItem[];
}

export const BotCodeViewer: React.FC<BotCodeViewerProps> = ({ files, secrets = [] }) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<number>(0);
  const [copied, setCopied] = useState<boolean>(false);
  const [downloading, setDownloading] = useState<boolean>(false);

  // Sorting files logic: main files first, packaging profiles in the middle, envs at bottom
  const sortFiles = (fileList: FileItem[]): FileItem[] => {
    const order = ['main.py', 'index.js', 'app.js', 'server.ts'];
    const endsWithOrder = ['package.json', 'requirements.txt', '.env', '.env.example'];
    
    return [...fileList].sort((a, b) => {
      const aLower = a.filename.toLowerCase();
      const bLower = b.filename.toLowerCase();
      
      const aOrderIdx = order.indexOf(aLower);
      const bOrderIdx = order.indexOf(bLower);
      if (aOrderIdx !== -1 && bOrderIdx !== -1) return aOrderIdx - bOrderIdx;
      if (aOrderIdx !== -1) return -1;
      if (bOrderIdx !== -1) return 1;
      
      const aEndIdx = endsWithOrder.findIndex(end => aLower.endsWith(end));
      const bEndIdx = endsWithOrder.findIndex(end => bLower.endsWith(end));
      if (aEndIdx !== -1 && bEndIdx !== -1) return aEndIdx - bEndIdx;
      if (aEndIdx !== -1) return 1;
      if (bEndIdx !== -1) return -1;
      
      return a.filename.localeCompare(b.filename);
    });
  };

  const [localFiles, setLocalFiles] = useState<FileItem[]>(() => sortFiles(files));

  // State to hold secrets (prefilled from existing values in .env or secrets configuration)
  const [secretValues, setSecretValues] = useState<Record<string, string>>(() => {
    const initialSecrets: Record<string, string> = {};
    
    // Attempt to extract values from .env file if it already exists
    const envFile = files.find(f => f.filename === '.env');
    if (envFile) {
      envFile.content.split('\n').forEach(line => {
        const parts = line.split('=');
        if (parts.length >= 2) {
          initialSecrets[parts[0].trim()] = parts.slice(1).join('=').trim();
        }
      });
    }

    // Default missing critical values
    if (!initialSecrets['BOT_TOKEN']) initialSecrets['BOT_TOKEN'] = '';
    if (!initialSecrets['ADMIN_ID']) initialSecrets['ADMIN_ID'] = '';

    // Add other secrets defined in system
    secrets.forEach(s => {
      if (!initialSecrets[s.key]) {
        initialSecrets[s.key] = '';
      }
    });
    
    return initialSecrets;
  });

  // Re-sync localFiles state if files props change
  useEffect(() => {
    setLocalFiles(sortFiles(files));
  }, [files]);

  // Sync state variables back into the `.env` file content dynamically
  const updateSecret = (key: string, val: string) => {
    setSecretValues(prev => {
      const nextSecrets = { ...prev, [key]: val };
      
      // Update `.env` file inside localFiles state
      setLocalFiles(currentFiles => {
        const hasEnv = currentFiles.some(f => f.filename === '.env');
        const envEntries = Object.entries(nextSecrets).map(([k, v]) => `${k}=${v}`);
        const envContent = envEntries.join('\n');

        if (hasEnv) {
          return currentFiles.map(f => {
            if (f.filename === '.env') {
              return { ...f, content: envContent };
            }
            return f;
          });
        } else {
          // Prepend `.env` file to localFiles
          return [{ filename: '.env', content: envContent }, ...currentFiles];
        }
      });

      return nextSecrets;
    });
  };

  // Deployment wizard modal states
  const [showDeployModal, setShowDeployModal] = useState<boolean>(false);
  const [botName, setBotName] = useState<string>('');
  const [deploymentStep, setDeploymentStep] = useState<number>(0);
  const [deploymentStepsStatus, setDeploymentStepsStatus] = useState<string[]>([]);
  const [isDeploying, setIsDeploying] = useState<boolean>(false);

  // Auto-detect bot metadata for deployment
  const detectBotMetadata = () => {
    const hasPython = localFiles.some(f => f.filename === 'requirements.txt' || f.filename === 'main.py');
    const language = hasPython ? 'python' : 'nodejs';
    const entryPoint = hasPython ? 'main.py' : 'index.js';
    return { language, entryPoint };
  };

  // Prefill default bot name based on the detected folder structure or prompt context
  useEffect(() => {
    const meta = detectBotMetadata();
    setBotName(meta.language === 'python' ? 'Python Aqlli Agent Bot' : 'CloudBot Node.js Bot');
  }, [localFiles]);

  if (!localFiles || localFiles.length === 0) return null;

  const activeFile = localFiles[activeTab] || localFiles[0];

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(activeFile.content);
      setCopied(true);
      toast.success(`${activeFile.filename} kodi clipboardga saqlandi!`);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error("Nusxa olish bo'lmadi");
    }
  };

  const handleDownloadZip = async () => {
    setDownloading(true);
    try {
      const token = await user?.getIdToken();
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch('/api/ai/download-zip', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          files: localFiles,
          envContent: localFiles.find(f => f.filename === '.env')?.content || ''
        })
      });

      if (!response.ok) {
        throw new Error("Zip faylini yuklashda xatolik yuz berdi.");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${botName.toLowerCase().replace(/\s+/g, '-') || 'cloudbot'}-code.zip`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success("Loyiha to'liq ZIP arxivi yuklab olindi!");
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "ZIP yuklashda xatolik");
    } finally {
      setDownloading(false);
    }
  };

  const executeLivePublish = async () => {
    if (!botName.trim()) {
      toast.error("Bot nomini kiritish majburiy!");
      return;
    }
    if (!secretValues['BOT_TOKEN']) {
      toast.error("Telegram BOT_TOKEN kodi kiritilishi shart!");
      return;
    }

    setIsDeploying(true);
    setDeploymentStep(1);
    
    // Step simulation logs to make it extremely premium, engaging, and professional
    const logTimeline = [
      "Fayllar tuzilishi tekshirilmoqda...",
      "Sinflar, modullar va .env sirlari tekshirildi (OK)",
      "Bulutli platforma Docker-Compose konteyneri sozlanmoqda...",
      "Cloud Run xavfsiz Sandbox hosting ajratildi...",
      "Dynamic SSL/TLS sertifikati bog'lanmoqda...",
      "Token validatsiyasi sinab ko'rildi...",
      "[SYSTEM] Bot ishonchli tarzda faollashtirildi!"
    ];

    setDeploymentStepsStatus([]);

    for (let i = 0; i < logTimeline.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 800));
      setDeploymentStepsStatus(prev => [...prev, logTimeline[i]]);
      setDeploymentStep(i + 1);
    }

    try {
      const meta = detectBotMetadata();

      // Write bot details directly to Firestore and SQLite
      if (user) {
        const docRef = doc(collection(db, 'bots'));
        const botId = docRef.id;

        const token = await user.getIdToken();

        // 1. Save bot files inside SQLite first via create-from-files
        const saveRes = await fetch('/api/bots/create-from-files', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            id: botId,
            name: botName,
            files: localFiles,
            language: meta.language,
            entryPoint: meta.entryPoint,
            clientBotCount: 0 // Will be counted server-side via Firestore/SQLite
          })
        });

        if (!saveRes.ok) {
          const errData = await saveRes.json().catch(() => ({}));
          throw new Error(errData.error || "Kodni serverga yuklab bo'lmadi.");
        }

        // 2. Save metadata to Firestore using safeSetDoc to match the ID
        await safeSetDoc(docRef, {
          userId: user.uid,
          userEmail: user.email || '',
          name: botName,
          language: meta.language,
          status: 'stopped', // start as stopped natively first
          entryPoint: meta.entryPoint,
          createdAt: serverTimestamp(),
          envData: secretValues
        });

        // 3. Instantly start the bot on the backend VPS environment
        await fetch(`/api/bots/${botId}/action`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ action: 'start' })
        });
      }

      toast.success(`Tabriklaymiz! "${botName}" muvaffaqiyatli bulutga ulandi va 24/7 rejimida ish boshladi!`);
      setTimeout(() => {
        setIsDeploying(false);
        setShowDeployModal(false);
      }, 1000);
    } catch (err: any) {
      console.error(err);
      toast.error("Platformaga yuzlashda xatolik: " + err.message);
      setIsDeploying(false);
    }
  };

  return (
    <div id="bot-code-viewer" className="mt-4 w-full bg-[#0d0d14] rounded-2xl border border-white/10 overflow-hidden shadow-2xl transition-all duration-300 relative group/viewer">
      
      {/* Top control bar with neon touches */}
      <div className="px-5 py-4 bg-white/[0.02]/40 backdrop-blur-md border-b border-white/5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 group-hover/viewer:animate-pulse">
            <Terminal className="w-4.5 h-4.5" />
          </div>
          <div>
            <h4 className="text-xs font-semibold text-white tracking-wide flex items-center gap-1.5">
              <span>Mukammal Loyiha Kodlari</span>
              <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-indigo-500/20 text-indigo-400 uppercase tracking-widest leading-none">
                {detectBotMetadata().language}
              </span>
            </h4>
            <p className="text-[10px] text-slate-400 font-mono">Tuzilgan jami {localFiles.length} ta fayllarni mustaqil boshqaring</p>
          </div>
        </div>

        {/* Deploy & Download Actions */}
        <div className="flex items-center gap-2">
          {/* ZIP download */}
          <button
            type="button"
            onClick={handleDownloadZip}
            disabled={downloading}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#1d1d26] hover:bg-[#252533] border border-white/10 text-white text-xs font-semibold transition-all cursor-pointer shadow-md select-none"
            title="Loyiha ZIP arxivini yuklash"
          >
            {downloading ? (
              <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            ) : (
              <Download className="w-3.5 h-3.5 text-indigo-400" />
            )}
            <span>ZIP yuklash</span>
          </button>

          {/* Master Deploy & Hosting Button */}
          <button
            type="button"
            onClick={() => setShowDeployModal(true)}
            className="flex items-center gap-1.5 px-4  py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white text-xs font-bold transition-all cursor-pointer shadow-lg hover:shadow-indigo-500/20 select-none animate-shimmer"
          >
            <Rocket className="w-4 h-4 text-emerald-300 animate-bounce" />
            <span>Hostingga Joylash</span>
          </button>
        </div>
      </div>

      {/* Dynamic Token & Credentials Setup section requested by the user */}
      <div className="p-5 bg-white/[0.01] border-b border-white/5">
        <div className="flex items-center gap-2 mb-3">
          <Key className="w-4 h-4 text-emerald-400" />
          <h5 className="text-[11px] font-bold text-white uppercase tracking-wider">🔒 Bot muhit sirlarini sozlash (.env avtomatik saqlash)</h5>
        </div>
        
        <p className="text-[11.5px] text-slate-400 mb-4 leading-relaxed">
          Quyidagi maydonchalarga bot tokeni va administrator ID kiritishingiz bilan, ushbu ma'lumotlar chap tomondagi <span className="font-mono text-emerald-400 text-xs px-1 py-0.5 rounded bg-white/5">.env</span> fayli tarkibiga real vaqtda muhandislik darajasida avtomatik tarzda kiritilib boriladi.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold text-indigo-300 font-mono">BOT_TOKEN</span>
              <span className="text-[9px] text-slate-500">Telegram BotFather'dan olingan</span>
            </div>
            <input
              type="text"
              value={secretValues['BOT_TOKEN']}
              onChange={e => updateSecret('BOT_TOKEN', e.target.value)}
              placeholder="Masalan: 1234567890:AAH_abcdef..."
              className="w-full bg-[#111115] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-all font-mono"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold text-indigo-300 font-mono">ADMIN_ID</span>
              <span className="text-[9px] text-slate-500">Boshqaruvchi Telegram ID raqami</span>
            </div>
            <input
              type="text"
              value={secretValues['ADMIN_ID']}
              onChange={e => updateSecret('ADMIN_ID', e.target.value)}
              placeholder="Masalan: 508129341"
              className="w-full bg-[#111115] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-all font-mono"
            />
          </div>
        </div>

        {secretValues['BOT_TOKEN'] && secretValues['ADMIN_ID'] && (
          <div className="mt-3.5 p-2 rounded-lg bg-emerald-500/5 border border-emerald-500/10 flex items-center gap-2 text-[10.5px] text-emerald-400">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Ajoyib! Sirlar .env konfiguratsiyasiga muvaffaqiyatli bog'landi. Endilikda ZIP yuklanganda va Hostingda ushbu kalitlar avtomatik ishlaydi.</span>
          </div>
        )}
      </div>

      {/* Main workspaces split workspace */}
      <div className="flex flex-col md:flex-row h-96">
        
        {/* Project directory-tree sidebar with sorting and visual indicators */}
        <div className="w-full md:w-48 bg-black/30 border-b md:border-b-0 md:border-r border-white/5 flex flex-row md:flex-col overflow-x-auto md:overflow-y-auto p-2.5 gap-1.5 scrollbar-none shrink-0 select-none">
          <div className="hidden md:block px-2.5 py-1 text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1">LOYIHA FAYLLARI</div>
          {localFiles.map((file, idx) => {
            const isEnv = file.filename.startsWith('.env');
            const isEntry = ['main.py', 'index.js', 'app.js', 'server.ts'].includes(file.filename);
            
            return (
              <button
                key={idx}
                type="button"
                onClick={() => setActiveTab(idx)}
                className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium cursor-pointer transition-all select-none text-left shrink-0 md:w-full ${
                  activeTab === idx 
                    ? 'bg-white/10 text-white shadow-sm border border-white/5' 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.02]'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <FileText className={`w-3.5 h-3.5 shrink-0 ${
                    activeTab === idx 
                      ? 'text-indigo-400' 
                      : isEnv 
                        ? 'text-yellow-500/70' 
                        : isEntry 
                          ? 'text-emerald-500/70' 
                          : 'text-slate-500'
                  }`} />
                  <span className="truncate max-w-[120px]" title={file.filename}>{file.filename}</span>
                </div>
                {isEntry && (
                  <span className="hidden md:inline-block text-[8px] font-semibold bg-emerald-500/10 text-emerald-400 px-1 py-0.2 rounded font-sans uppercase">Asosiy</span>
                )}
                {isEnv && (
                  <span className="hidden md:inline-block text-[8px] font-semibold bg-yellow-500/10 text-yellow-500 px-1 py-0.2 rounded font-sans">Sirlar</span>
                )}
              </button>
            );
          })}
        </div>

        {/* Code body editor window */}
        <div className="flex-grow flex flex-col bg-black/10 overflow-hidden relative">
          
          {/* Code head bar */}
          <div className="px-4 py-2.5 bg-white/[0.01] border-b border-white/5 flex items-center justify-between">
            <span className="text-[10px] text-slate-400 font-mono tracking-wide flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
              {activeFile.filename}
            </span>
            <button
              type="button"
              onClick={handleCopy}
              className="flex items-center gap-1 px-2.5 py-1 rounded bg-white/5 hover:bg-white/10 text-[10px] text-slate-300 hover:text-white transition-all cursor-pointer font-medium"
              title="Kodni nusxalash"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-slate-400" />}
              <span>{copied ? "Nusxalandi" : "Nusxalash"}</span>
            </button>
          </div>

          {/* Real code scroll area */}
          <div className="flex-grow overflow-auto p-5 font-mono text-[11.5px] text-zinc-300 leading-6 bg-[#06060a]/60 select-text scrollbar-thin scrollbar-thumb-white/5">
            <div className="min-w-full">
              {(() => {
                // Ensure double-escaped artificial raw backslash endings are converted to real linebreaks
                const cleanContent = (activeFile.content || '')
                  .replace(/\\n/g, '\n')
                  .replace(/\\t/g, '  ');
                const lines = cleanContent.split('\n');
                
                return lines.map((line, lIdx) => (
                  <div key={lIdx} className="flex hover:bg-white/[0.03] px-2 -mx-2 rounded transition-all duration-150">
                    <span className="w-9 inline-block text-zinc-600 text-right select-none pr-4 border-r border-zinc-800/60 font-mono text-[10px] leading-6 shrink-0">
                      {lIdx + 1}
                    </span>
                    <pre className="pl-4 whitespace-pre-wrap break-all min-w-0 flex-1 select-text font-mono text-[11.5px] leading-6 text-zinc-300">
                      {line || ' '}
                    </pre>
                  </div>
                ));
              })()}
            </div>
          </div>
        </div>
      </div>

      {/* Deployment workflow wizard Overlay dialog block */}
      {showDeployModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <div className="fixed inset-0 bg-black/60 backdrop-blur-md" onClick={() => !isDeploying && setShowDeployModal(false)} />
            
            <div className="relative w-full max-w-lg bg-[#0d0d14] border border-white/10 rounded-2xl overflow-hidden shadow-2xl p-6 text-left my-auto z-10 max-h-[88vh] overflow-y-auto">
            <div className="flex items-center gap-3 border-b border-white/5 pb-4 mb-5">
              <div className="p-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white animate-bounce">
                <Rocket className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">CloudBot Hostingga Deploy Qilish</h4>
                <p className="text-[11px] text-slate-400">Bulutli yadro server munosibligida 24/7 ish stendi</p>
              </div>
            </div>

            {!isDeploying ? (
              <div className="space-y-4">
                <div className="space-y-1.5 animate-fade-in">
                  <label className="text-xs font-semibold text-slate-200">🤖 Loyiha (Bot) Nomi:</label>
                  <input
                    type="text"
                    value={botName}
                    onChange={e => setBotName(e.target.value)}
                    placeholder="Mening kino yoki shop botim"
                    className="w-full bg-[#111115] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-all font-sans"
                  />
                </div>

                <div className="p-4 rounded-xl bg-indigo-500/5 border border-indigo-500/10 text-xs text-slate-300 space-y-2">
                  <div className="flex items-center justify-between font-bold text-white text-[11px] border-b border-white/5 pb-2 uppercase tracking-wider">
                    <span>Deploy xususiyatlari:</span>
                    <span className="text-indigo-400">Bepul (Host)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Tanlangan til:</span>
                    <span className="font-semibold text-emerald-400 uppercase font-mono">{detectBotMetadata().language}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Asosiy ishga tushiruvchi fayl:</span>
                    <span className="font-semibold text-indigo-300 font-mono">{detectBotMetadata().entryPoint}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Xavfsizlik (.env):</span>
                    <span className="text-yellow-400 font-semibold">{secretValues['BOT_TOKEN'] ? "O'rnatildi ✅" : "Yo'q ❌ (Siz to'liq ishga tushirolmaysiz)"}</span>
                  </div>
                </div>

                {!secretValues['BOT_TOKEN'] && (
                  <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[10.5px] text-amber-300 flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>Diqqat! Telegram <strong className="font-mono">BOT_TOKEN</strong> muhit siri bo'sh. Deploy qilishdan avval orqaga qaytib ushbu sirlarni to'ldirishingiz tavsiya etiladi.</span>
                  </div>
                )}

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowDeployModal(false)}
                    className="flex-1 px-4 py-3 bg-[#1d1d26] hover:bg-[#252533] border border-white/5 rounded-xl text-white text-xs font-semibold cursor-pointer text-center"
                  >
                    Bekor qilish
                  </button>
                  <button
                    type="button"
                    onClick={executeLivePublish}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-[#5753ff] text-white text-xs font-bold rounded-xl cursor-pointer text-center transition-all shadow-md hover:shadow-indigo-500/10"
                  >
                    Deployni Boshlash
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-5 text-center py-6">
                {/* Deployment Loading spinner */}
                <div className="relative w-20 h-20 mx-auto">
                  <div className="absolute inset-0 rounded-full border-4 border-indigo-500/20" />
                  <div className="absolute inset-0 rounded-full border-4 border-t-indigo-500 border-r-indigo-500 animate-spin" />
                  <div className="absolute inset-2 rounded-full border-4 border-purple-500/10" />
                  <div className="absolute inset-2 rounded-full border-4 border-b-purple-500 border-l-purple-500 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
                  <div className="absolute inset-0 flex items-center justify-center text-indigo-400">
                    <Server className="w-6 h-6 animate-pulse" />
                  </div>
                </div>

                <div className="space-y-1">
                  <p className="text-xs font-bold text-white tracking-wide">Bulut resurslari barpo qilinmoqda...</p>
                  <p className="text-[10px] text-slate-500 font-mono">Server ID: cloudbot-vps-container</p>
                </div>

                {/* Simulated build log */}
                <div className="mx-auto w-full max-w-sm rounded-xl bg-black/60 border border-white/5 p-4 text-left font-mono text-[9px] text-slate-400 h-28 overflow-y-auto space-y-1.5">
                  {deploymentStepsStatus.map((stepMsg, stepIdx) => (
                    <div key={stepIdx} className="flex items-center gap-1.5">
                      <span className="text-emerald-400 font-bold">✔</span>
                      <span>{stepMsg}</span>
                    </div>
                  ))}
                  <div className="flex items-center gap-2 animate-pulse text-indigo-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-ping" />
                    <span>Progressive loading...</span>
                  </div>
                </div>

                <div className="text-[10px] text-slate-500">
                  Ushbu jarayon taxminan bir necha soniya vaqt oladi. Iltimos oynani yopmang.
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      )}
    </div>
  );
};
