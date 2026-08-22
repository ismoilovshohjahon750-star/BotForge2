import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Copy, 
  Check, 
  Smartphone, 
  Database, 
  QrCode, 
  ShieldCheck, 
  Download, 
  RefreshCw, 
  Bot, 
  MessageSquare, 
  Wallet, 
  Sparkles,
  ArrowRight,
  Info
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { toast } from 'sonner';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

interface UniqueIdModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UniqueIdModal: React.FC<UniqueIdModalProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'id' | 'qr' | 'export'>('id');
  const [exporting, setExporting] = useState(false);

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const uniqueId = user?.uid || '';
  const userEmail = user?.email || 'Noma\'lum';
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(uniqueId)}&color=0284c7&bgcolor=0f172a`;

  const handleCopy = () => {
    if (!uniqueId) return;
    navigator.clipboard.writeText(uniqueId);
    setCopied(true);
    toast.success('Unikal ID buferga nusxalandi!', {
      description: 'Android APK ilovangizga kiriting.',
      icon: '✨'
    });
    setTimeout(() => setCopied(false), 2500);
  };

  const handleExportData = async () => {
    if (!user) return;
    setExporting(true);
    try {
      // Collect user data from Firestore
      const botsRef = collection(db, 'bots');
      const q = query(botsRef, where('userId', '==', user.uid));
      const querySnap = await getDocs(q);
      
      const userBots = querySnap.docs.map(d => ({ id: d.id, ...d.data() }));

      const backupData = {
        app: 'CloudBot SaaS',
        version: '2.0.0',
        exportDate: new Date().toISOString(),
        user: {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
        },
        bots: userBots,
      };

      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backupData, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', `cloudbot-backup-${user.uid.slice(0, 8)}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();

      toast.success('Barcha ma\'lumotlaringiz JSON fayl shaklida yuklab olindi!');
    } catch (err: any) {
      console.error('Data export error:', err);
      toast.error('Ma\'lumotlarni yuklab olishda xatolik yuz berdi.');
    } finally {
      setExporting(false);
    }
  };

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] overflow-y-auto flex min-h-screen items-center justify-center p-3 sm:p-6">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-0"
          />

          {/* Modal Window */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-lg bg-card border border-border/80 rounded-2xl shadow-2xl overflow-hidden z-10 text-left text-foreground flex flex-col max-h-[88vh] my-auto"
          >
              {/* Header */}
              <div className="flex items-center justify-between p-4 sm:p-5 border-b border-border/60 bg-muted/30 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base sm:text-lg leading-tight flex items-center gap-2">
                      Unikal ID & Sinxronlash
                      <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        24/7 Cloud
                      </span>
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Android APK ilovasiga ma'lumotlarni o'tkazish
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer shrink-0"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body */}
              <div className="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1">
            {/* Tabs */}
            <div className="grid grid-cols-3 gap-1 p-1 bg-muted/60 rounded-xl border border-border/50 text-xs font-semibold">
              <button
                onClick={() => setActiveTab('id')}
                className={`py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                  activeTab === 'id'
                    ? 'bg-card text-primary shadow-sm font-bold'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                Unikal ID
              </button>
              <button
                onClick={() => setActiveTab('qr')}
                className={`py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                  activeTab === 'qr'
                    ? 'bg-card text-primary shadow-sm font-bold'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <QrCode className="w-3.5 h-3.5" />
                QR Kod
              </button>
              <button
                onClick={() => setActiveTab('export')}
                className={`py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                  activeTab === 'export'
                    ? 'bg-card text-primary shadow-sm font-bold'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Download className="w-3.5 h-3.5" />
                Eksport (JSON)
              </button>
            </div>

            {/* Content per Tab */}
            {activeTab === 'id' && (
              <div className="space-y-4">
                {/* ID Display Box */}
                <div className="p-4 rounded-xl bg-muted/40 border border-border/80 space-y-2">
                  <div className="flex items-center justify-between text-xs text-muted-foreground font-medium">
                    <span>Hisobingizning Unikal IDsi:</span>
                    <span className="flex items-center gap-1 text-emerald-400 font-mono text-[11px]">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      Yagona Baza Faol
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <code className="flex-1 p-3 rounded-lg bg-background border border-border font-mono text-sm sm:text-base font-bold text-primary truncate select-all tracking-wider">
                      {uniqueId || 'Tizimga kirmagansiz'}
                    </code>
                    <button
                      onClick={handleCopy}
                      disabled={!uniqueId}
                      className="p-3 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 disabled:opacity-50 shrink-0 cursor-pointer"
                    >
                      {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                      <span className="hidden sm:inline">{copied ? 'Nusxalandi!' : 'Nusxalash'}</span>
                    </button>
                  </div>
                </div>

                {/* Uzbek Instructions */}
                <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    Android APK ga o'tkazish Yo'riqnomasi:
                  </h4>
                  <ol className="space-y-2 text-xs text-foreground/90 font-medium leading-relaxed">
                    <li className="flex items-start gap-2">
                      <span className="w-5 h-5 rounded-full bg-primary/20 text-primary font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">1</span>
                      <span>Android telefondagi <strong>CloudBot APK</strong> ilovasini oching.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-5 h-5 rounded-full bg-primary/20 text-primary font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">2</span>
                      <span>Ilovadagi <strong>"Unikal ID orqali Kirish"</strong> bo'limini tanlang.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-5 h-5 rounded-full bg-primary/20 text-primary font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">3</span>
                      <span>Yuqoridagi Unikal ID ni joylashtiring (yoki QR kodni skanerlang).</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">4</span>
                      <span>Saytdagi barcha <strong>botlar, xabarlar, balans va obunangiz</strong> Android ilovangizda darhol aks etadi!</span>
                    </li>
                  </ol>
                </div>
              </div>
            )}

            {activeTab === 'qr' && (
              <div className="flex flex-col items-center justify-center p-4 text-center space-y-3">
                <div className="p-3 bg-slate-900 border-2 border-primary/40 rounded-2xl shadow-xl">
                  {uniqueId ? (
                    <img 
                      src={qrUrl} 
                      alt="Unikal ID QR Kod" 
                      className="w-48 h-48 rounded-lg object-contain bg-slate-950 p-2"
                    />
                  ) : (
                    <div className="w-48 h-48 flex items-center justify-center text-xs text-muted-foreground">
                      QR Kod hosil qilish uchun tizimga kiring
                    </div>
                  )}
                </div>
                <p className="text-xs text-muted-foreground max-w-xs">
                  Android APK ilovangizdagi QR skaner orqali tezkor kirish va sinxronlash imkoniyati.
                </p>
                <button
                  onClick={handleCopy}
                  className="px-4 py-2 rounded-xl bg-muted hover:bg-muted/80 text-xs font-semibold flex items-center gap-2 transition-all border border-border"
                >
                  <Copy className="w-3.5 h-3.5 text-primary" />
                  ID ni Nusxalash
                </button>
              </div>
            )}

            {activeTab === 'export' && (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-muted/40 border border-border space-y-3 text-xs">
                  <div className="flex items-center gap-2 text-foreground font-bold text-sm">
                    <Download className="w-4 h-4 text-primary" />
                    Barcha Ma'lumotlarni Zaxira Fayl (JSON) ko'rinishida ko'chirish
                  </div>
                  <p className="text-muted-foreground leading-relaxed">
                    Ushbu tugma orqali saytdagi barcha botlaringiz, ularning kodlari, xabarlaringiz va sozlamalaringizni o'z ichiga olgan JSON backup faylini yuklab olasiz. Android ilovangizda ushbu faylni "Import Data" orqali yuklashingiz ham mumkin.
                  </p>
                  <button
                    onClick={handleExportData}
                    disabled={exporting || !user}
                    className="w-full py-2.5 px-4 rounded-xl bg-primary text-primary-foreground font-bold flex items-center justify-center gap-2 hover:bg-primary/90 transition-all shadow-md cursor-pointer disabled:opacity-50"
                  >
                    {exporting ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Yuklanmoqda...
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4" />
                        JSON Zaxira Faylini Yuklab Olish
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Synchronized Data Features List */}
            <div className="pt-2 border-t border-border/60">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block mb-2">
                Sayt va Android Ilova o'rtasida Sinxronlashuvchi Ma'lumotlar:
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-lg bg-muted/30 border border-border/40 flex items-center gap-2">
                  <Bot className="w-4 h-4 text-primary shrink-0" />
                  <span className="font-medium text-foreground">Barcha Botlar & Kodlar</span>
                </div>
                <div className="p-2.5 rounded-lg bg-muted/30 border border-border/40 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="font-medium text-foreground">Xabarlar va Muloqotlar</span>
                </div>
                <div className="p-2.5 rounded-lg bg-muted/30 border border-border/40 flex items-center gap-2">
                  <Wallet className="w-4 h-4 text-amber-400 shrink-0" />
                  <span className="font-medium text-foreground">Hisob Balansi va Obuna</span>
                </div>
                <div className="p-2.5 rounded-lg bg-muted/30 border border-border/40 flex items-center gap-2">
                  <Database className="w-4 h-4 text-sky-400 shrink-0" />
                  <span className="font-medium text-foreground">Real-vaqt Firestore Baza</span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-border/60 bg-muted/30 flex items-center justify-between text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5 font-mono text-[11px]">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Yagona Firestore Database
            </span>
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg bg-muted hover:bg-muted/80 text-foreground font-semibold transition-colors cursor-pointer"
            >
              Yopish
            </button>
          </div>
        </motion.div>
          </div>
        )}
      </AnimatePresence>,
      document.body
    );
  };
