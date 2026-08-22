import React, { useState } from 'react';
import { motion } from 'motion/react';
import { BookOpen, Terminal, Rocket, Server, Shield, Code, ChevronRight, Menu, Send, ExternalLink } from 'lucide-react';
import { Button } from '../components/ui/button';

export const Docs: React.FC = () => {
  const [activeSection, setActiveSection] = useState('about');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const sections = [
    { id: 'about', title: 'Platforma haqida', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'how-it-works', title: 'Qanday ishlaydi?', icon: <Server className="w-4 h-4" /> },
    { id: 'uploading', title: 'Bot yuklash', icon: <Rocket className="w-4 h-4" /> },
    { id: 'supported', title: 'Qo\'llab-quvvatlanadigan tillar', icon: <Code className="w-4 h-4" /> },
    { id: 'limits', title: 'Tariflar va Limitlar', icon: <Server className="w-4 h-4" /> },
    { id: 'security', title: 'Xavfsizlik', icon: <Shield className="w-4 h-4" /> },
    { id: 'support', title: 'Yordam va Administrator', icon: <Send className="w-4 h-4 text-sky-400" /> },
  ];

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col md:flex-row bg-background">
      {/* Mobile Sidebar Toggle */}
      <div className="md:hidden border-b border-border p-4 flex items-center justify-between bg-card">
        <h2 className="font-semibold text-lg flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-primary" />
          Hujjatlar
        </h2>
        <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          <Menu className="w-5 h-5" />
        </Button>
      </div>

      {/* Sidebar */}
      <aside className={`w-full md:w-64 border-r border-border bg-card/50 flex-shrink-0 ${mobileMenuOpen ? 'block' : 'hidden md:block'}`}>
        <div className="p-6 sticky top-0">
          <h2 className="font-semibold text-lg mb-6 hidden md:flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary" />
            Hujjatlar
          </h2>
          <nav className="space-y-1">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => {
                  setActiveSection(section.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  activeSection === section.id 
                    ? 'bg-primary text-primary-foreground' 
                    : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                }`}
              >
                {section.icon}
                {section.title}
              </button>
            ))}
          </nav>
        </div>
      </aside>

      {/* Content */}
      <main className="flex-1 p-6 md:p-12 lg:p-16 max-w-4xl mx-auto w-full">
        <motion.div
          key={activeSection}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="prose prose-invert max-w-none"
        >
          {activeSection === 'about' && (
            <div className="space-y-6">
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">CloudBot platformasi haqida</h1>
              <p className="text-lg text-muted-foreground leading-relaxed">
                CloudBot — bu Telegram, Discord va boshqa platformalar uchun yaratilgan botlarni oson va tezkor yuklash,
                boshqarish hamda 24/7 rejimida uzluksiz ishlatish imkonini beruvchi zamonaviy cloud hosting platformasi.
              </p>
              <div className="grid sm:grid-cols-2 gap-6 mt-8">
                <div className="p-6 rounded-xl border border-border bg-card/30">
                  <Terminal className="w-8 h-8 text-primary mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">Avtomatlashtirilgan muhit</h3>
                  <p className="text-sm text-muted-foreground">Bizning tizim kodingizni avtomatik tahlil qiladi va mos keluvchi muhitni (Node.js, Python va h.k.) o'rnatadi.</p>
                </div>
                <div className="p-6 rounded-xl border border-border bg-card/30">
                  <Server className="w-8 h-8 text-primary mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">24/7 Barqarorlik</h3>
                  <p className="text-sm text-muted-foreground">Botlaringiz alohida konteynerlarda ishlaydi va tizim orqali doimiy nazorat qilinib turiladi.</p>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'how-it-works' && (
            <div className="space-y-6">
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">Platforma qanday ishlaydi?</h1>
              <p className="text-lg text-muted-foreground leading-relaxed">
                CloudBot orqali botingizni ishga tushirish jarayoni juda oddiy va 3 bosqichdan iborat:
              </p>
              
              <div className="space-y-8 mt-8">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-lg">1</div>
                  <div>
                    <h3 className="text-xl font-semibold text-foreground mb-2">Kodni import qilish</h3>
                    <p className="text-muted-foreground">Siz o'z botingiz kodini zip formatida yuklashingiz yoki to'g'ridan-to'g'ri GitHub repozitoriyangizni ulashingiz mumkin.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-lg">2</div>
                  <div>
                    <h3 className="text-xl font-semibold text-foreground mb-2">Avtomatik sozlash</h3>
                    <p className="text-muted-foreground">CloudBot sizning <code>package.json</code>, <code>requirements.txt</code> kabi fayllaringizni aniqlaydi va kerakli kutubxonalarni avtomatik o'rnatadi.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-lg">3</div>
                  <div>
                    <h3 className="text-xl font-semibold text-foreground mb-2">Ishga tushirish</h3>
                    <p className="text-muted-foreground">Tizim botni xavfsiz konteynerda ishga tushiradi va sizga real-time loglarni taqdim etadi.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'uploading' && (
            <div className="space-y-6">
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">Bot yuklash tartibi</h1>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Quyida yangi botni tizimga qo'shish jarayoni tushuntirilgan.
              </p>
              
              <div className="bg-secondary/50 rounded-xl p-6 border border-border mt-6">
                <h3 className="text-lg font-medium text-foreground mb-4 flex items-center gap-2">
                  <ChevronRight className="w-5 h-5 text-primary" />
                  GitHub orqali import qilish (Tavsiya etiladi)
                </h3>
                <ol className="list-decimal list-inside space-y-2 text-muted-foreground ml-2">
                  <li>Dashboard sahifasiga o'ting va "Yangi Bot" tugmasini bosing.</li>
                  <li>"GitHub'dan import qilish" bo'limiga repozitoriya havolasini kiriting.</li>
                  <li>Tizim avtomatik ravishda kodni tahlil qilib, tilni aniqlaydi.</li>
                  <li>Zarur bo'lgan Environment Variables (masalan, BOT_TOKEN) larni kiriting.</li>
                  <li>"Saqlash" tugmasini bosing va botingiz darhol ishga tushadi.</li>
                </ol>
              </div>

              <div className="bg-secondary/50 rounded-xl p-6 border border-border mt-6">
                <h3 className="text-lg font-medium text-foreground mb-4 flex items-center gap-2">
                  <ChevronRight className="w-5 h-5 text-primary" />
                  ZIP fayl orqali yuklash
                </h3>
                <ol className="list-decimal list-inside space-y-2 text-muted-foreground ml-2">
                  <li>Botingizning barcha fayllarini (<code>node_modules</code> yoki <code>venv</code> papkalarisiz) ZIP formatida arxivlang.</li>
                  <li>Dashboard sahifasidagi arxiv yuklash oynasiga tashlang.</li>
                  <li>Tizim kodni ochib, asosiy ishga tushirish faylini (masalan, <code>index.js</code> yoki <code>main.py</code>) qidiradi.</li>
                  <li>Kerakli maxfiy kalitlarni kiritib, tasdiqlang.</li>
                </ol>
              </div>
            </div>
          )}

          {activeSection === 'supported' && (
            <div className="space-y-6">
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">Qo'llab-quvvatlanadigan texnologiyalar</h1>
              <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                CloudBot deyarli barcha mashhur dasturlash tillari va freymvorklarini qo'llab-quvvatlaydi.
              </p>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="bg-card border border-border rounded-lg p-5">
                  <h3 className="text-lg font-semibold text-foreground mb-3 border-b border-border pb-2">Node.js (JavaScript/TypeScript)</h3>
                  <ul className="list-disc list-inside text-muted-foreground space-y-1 text-sm ml-1">
                    <li>Telegraf</li>
                    <li>node-telegram-bot-api</li>
                    <li>discord.js</li>
                    <li>grammY</li>
                  </ul>
                </div>
                <div className="bg-card border border-border rounded-lg p-5">
                  <h3 className="text-lg font-semibold text-foreground mb-3 border-b border-border pb-2">Python</h3>
                  <ul className="list-disc list-inside text-muted-foreground space-y-1 text-sm ml-1">
                    <li>aiogram</li>
                    <li>python-telegram-bot</li>
                    <li>discord.py</li>
                    <li>telebot</li>
                  </ul>
                </div>
              </div>
              <div className="bg-primary/5 rounded-lg border border-primary/20 p-4 mt-4">
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-primary inline-block"></span>
                  Barcha loyihalaringiz <strong>Linux (Ubuntu)</strong> muhitida Docker konteynerlar orqali ishlaydi.
                </p>
              </div>
            </div>
          )}

          {activeSection === 'limits' && (
            <div className="space-y-6">
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">Tariflar va Limitlar</h1>
              <p className="text-lg text-muted-foreground leading-relaxed">
                CloudBot platformasida foydalanuvchilar o'zlarining obuna tariflariga qarab quyidagi imtiyozlarga ega bo'lishadi:
              </p>
              
              <div className="space-y-6 mt-8">
                <div className="bg-card border border-border rounded-lg p-5">
                  <h3 className="text-xl font-semibold text-foreground mb-2 flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-slate-500"></span>
                    Bepul (Free) Obuna
                  </h3>
                  <p className="text-muted-foreground">
                    Bepul obunadagi foydalanuvchilar 2 tagacha bot yuklashlari mumkin. Har bir yuklangan bot <strong>2 oy davomida</strong> 24/7 rejimida ishlaydi. 2 oylik muddat tugagandan so'ng, bot avtomatik tarzda to'xtatiladi. Botning ishlashini davom ettirish uchun Pro yoki VIP tarifiga o'tish talab etiladi.
                  </p>
                </div>

                <div className="bg-card border border-primary/50 shadow-md shadow-primary/10 rounded-lg p-5">
                  <h3 className="text-xl font-semibold text-primary mb-2 flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-primary"></span>
                    Pro Obuna
                  </h3>
                  <p className="text-muted-foreground">
                    Pro obunadagi foydalanuvchilar 10 tagacha bot yuklashi mumkin. Pro obunada yaratilgan botlar <strong>10 oy davomida</strong> to'xtovsiz va kafolatli ishlaydi. Bu muddat yirik loyihalar uchun qulaylik yaratadi.
                  </p>
                </div>

                <div className="bg-card border border-amber-500/50 shadow-md shadow-amber-500/10 rounded-lg p-5">
                  <h3 className="text-xl font-semibold text-amber-500 mb-2 flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-amber-500"></span>
                    VIP Obuna
                  </h3>
                  <p className="text-muted-foreground">
                    VIP obunadagi foydalanuvchilarning botlariga muddat bo'yicha hech qanday cheklov qo'yilmaydi. Barcha 30 tagacha botlar <strong>cheksiz ravishda (umrbod)</strong> barqaror va maksimal tezlikda ishlab turadi.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'security' && (
            <div className="space-y-6">
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">Xavfsizlik va Maxfiylik</h1>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Botlaringiz kalitlari va foydalanuvchi ma'lumotlari xavfsizligi biz uchun eng ustuvor vazifadir.
              </p>
              
              <div className="space-y-6 mt-8">
                <div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">Environment Variables (ENV)</h3>
                  <p className="text-muted-foreground">
                    Sizning <code>BOT_TOKEN</code> kabi maxfiy kalitlaringiz ma'lumotlar bazasida kuchli shifrlangan holatda (AES-256) saqlanadi. Ular faqat botingiz ishga tushish vaqtida operativ xotiraga yuklanadi va hech qachon ochiq kodda ko'rinmaydi.
                  </p>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">Izolyatsiya qilingan muhit</h3>
                  <p className="text-muted-foreground">
                    Har bir bot o'zining shaxsiy ajratilgan konteynerida ishlaydi. Bu degani boshqa foydalanuvchilar sizning fayllaringizga kira olmaydi, shuningdek biror botdagi nosozlik boshqalariga ta'sir qilmaydi.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'support' && (
            <div className="space-y-6">
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">Texnik Yordam va Bog'lanish</h1>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Platforma bo'yicha savollaringiz, bot sozlamalari, maxsus tariflar yoki texnik muammolar bo'lsa, to'g'ridan-to'g'ri bosh administrator bilan bog'lanishingiz mumkin.
              </p>

              <div className="grid sm:grid-cols-2 gap-4 mt-6">
                <div className="p-6 rounded-2xl border border-sky-500/30 bg-sky-950/20 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 text-sky-400 font-semibold text-sm mb-2">
                      <Send className="w-5 h-5" />
                      <span>Telegram Administrator</span>
                    </div>
                    <p className="text-2xl font-mono font-bold text-white mb-2">@shoh_deweloper</p>
                    <p className="text-xs text-zinc-300">
                      Barcha texnik masalalar, to'lovlar va botlarni ko'chirish bo'yicha eng tezkor aloqa vositasi.
                    </p>
                  </div>
                  <a
                    href="https://t.me/shoh_deweloper"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-6 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-semibold text-xs transition-colors shadow-lg shadow-sky-950/50"
                  >
                    <span>Telegramda yozish</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>

                <div className="p-6 rounded-2xl border border-border bg-card/40 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm mb-2">
                      <Shield className="w-5 h-5" />
                      <span>Telefon / Muloqot</span>
                    </div>
                    <p className="text-xl font-mono font-bold text-white mb-2">+998 (77) 499-71-55</p>
                    <p className="text-xs text-zinc-400">
                      Email: ismoilovshohjahon750@gmail.com
                    </p>
                  </div>
                  <a
                    href="tel:+998774997155"
                    className="mt-6 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-semibold text-xs transition-colors border border-white/10"
                  >
                    <span>Qo'ng'iroq qilish</span>
                  </a>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
};
