# -*- coding: utf-8 -*-
from config import BOT_NAME, BOT_USERNAME, TARIFFS, MIN_TOPUP_SOM, CARD_NUMBER, CARD_OWNER

BANNER_CAPTION = f"🤖 {BOT_NAME}\n24/7 • Avto javob"

def welcome_text(first_name: str, connected: bool = False) -> str:
    if connected:
        return (
            f"🤖 Salom {first_name} | <b>{_now_time()}</b>\n\n"
            f"❔ <b>Chatbot akkauntingizga ulangan</b> — sizga yozadigan\n"
            f"odamlarga avto javob beradi.\n\n"
            f"❓ Quyidagi tugmalar orqali buyruqlar, avto javoblar va\n"
            f"sozlamalarni boshqaring 📱"
        )
    return (
        f"👋 Salom {first_name} | <b>{_now_time()}</b>\n\n"
        f"❓ Bu botni akkauntingizga ulasangiz, sizga yozadigan odamlarga\n"
        f"avto javob beradi va boshqa zo'r funksiyalar bor.\n\n"
        f"❓ Qanday ulanadi:\n\n"
        f"1. \"🔗 Botni ulash\" tugmasini bosing.\n\n"
        f"2. Telegram Business ➝ Chatbots bo'limiga kirib, qidiruvga:\n"
        f"@{BOT_USERNAME} ni yozing va qo'shishni bosing."
    )

def _now_time() -> str:
    from datetime import datetime
    return datetime.now().strftime("%H:%M")

def profile_text(user) -> str:
    info = user.tariff_info()
    if user.tariff == "pro":
        if user.tariff_until:
            until_str = user.tariff_until.strftime("%d.%m.%Y")
            tariff_line = f"💎 Pro tarif — <b>{until_str}</b> gacha"
        else:
            tariff_line = "💎 Pro tarif — <b>muddatsiz</b>"
    else:
        tariff_line = "🆓 Start tarif (bepul)"
    lines = [
        "👤 <b>Profil</b>\n",
        tariff_line,
        "",
        f"💬 Avto javoblar: {len(user.auto_replies)}/{info['auto_reply_limit']}",
        f"⭐ Stars balans: {user.balance_stars}",
        f"💰 So'm balans: {user.balance_som:,} so'm".replace(",", " "),
        f"👥 Takliflaringiz: {user.referrals} ta",
    ]
    if user.tariff != "pro":
        lines += [
            "",
            "💎 <b>Pro tarifga o'ting</b> va quyidagilarni oching:\n  ⏰ Profilga jonli soat\n  🟢 24/7 online holat\n  🕵️ Shpion rejimi (o'chirilgan xabarlar)"
        ]
    return "\n".join(lines)

def tariff_compare_text() -> str:
    free = TARIFFS['free']
    pro = TARIFFS['pro']
    return (
        f"🏷 <b>Tariflar</b>\n\n"
        f"🆓 <b>Start (bepul)</b>\n"
        f"  • Avto javob: {free['auto_reply_limit']} ta\n"
        f"  • Kalit so'zli javoblar ✅\n"
        f"  • Chatbot (AI) ✅\n"
        f"  • Mijozlar CRM ✅\n"
        f"  • ⏰ Profilga soat ❌\n"
        f"  • 🟢 24/7 online ❌\n"
        f"  • 🕵️ Shpion rejimi ❌\n\n"
        f"💎 <b>Pro</b> — <b>{pro['price_month']:,} so'm/oy</b>\n"
        f"  • Avto javob: {pro['auto_reply_limit']} ta\n"
        f"  • Kalit so'zli javoblar ✅\n"
        f"  • Chatbot (AI) ✅\n"
        f"  • Mijozlar CRM ✅\n"
        f"  • ⏰ Profilga soat ✅\n"
        f"  • 🟢 24/7 online ✅\n"
        f"  • 🕵️ Shpion rejimi ✅"
    ).replace(",", " ")

def buy_pro_text(user) -> str:
    pro = TARIFFS['pro']
    price = pro['price_month']
    bal = user.balance_som
    text = (
        f"💎 <b>Pro tarifga o'tish</b>\n\n"
        f"Narxi: <b>{price:,} so'm / oy</b>\n"
        f"Balansingiz: <b>{bal:,} so'm</b>\n\n"
        f"Pro tarifda nima ochiladi:\n"
        f"  ⏰ Profilga jonli soat\n"
        f"  🟢 24/7 online holat\n"
        f"  🕵️ Shpion rejimi — sizga kelgan xabarlar uchun\n\n"
        f"To'lov usulini tanlang 👇"
    )
    return text.replace(",", " ")

def balance_menu_text(user) -> str:
    return (
        f"💳 Balansni to'ldirish\n\n"
        f"Joriy balans: <b>{user.balance_som:,} so'm</b>\n"
        f"⭐ Stars balans: <b>{user.balance_stars}</b> ⭐\n\n"
        f"To'lov usulini tanlang 👇"
    ).replace(",", " ")

def ask_amount_text() -> str:
    return f"📝 To'ldirmoqchi summani yozing (so'm)\n\n<i>Eng kam: {MIN_TOPUP_SOM:,} so'm</i>".replace(",", " ")

def invoice_text(amount: int) -> str:
    return (
        f"Balansni to'ldirish\n\n"
        f"💵 Summa: {amount:,} so'm\n"
        f"💳 Karta: {CARD_NUMBER}\n"
        f"👤 Egasi: {CARD_OWNER}\n\n"
        f"⏰ 5 daqiqa ichida to'lang\n\n"
        f"「 Aynan shu summani o'tkazing — to'lov avtomatik aniqlanadi. 」\n\n"
        f"<i>(Demo rejim: bu yerda haqiqiy to'lov amalga oshmaydi, chunki\n"
        f"siz Bepul tarifdasiz va balansingiz mavjud emas.)</i>"
    ).replace(",", " ")

def demo_payment_pending_text() -> str:
    return (
        f"⏳ To'lov tekshirilmoqda...\n\n"
        f"Bu — demo rejim, shuning uchun haqiqiy to'lov amalga oshirilmaydi.\n"
        f"Ishlab chiquvchi to'lov tizimini (Payme/Click/Stars) ulaganidan so'ng\n"
        f"bu joyda avtomatik tasdiqlash ishlaydi."
    )

def referral_text(user_id: int) -> str:
    link = f"https://t.me/{BOT_USERNAME}?start=ref_{user_id}"
    return (
        f"👥 Taklif havolangiz:\n\n"
        f"<code>{link}</code>\n\n"
        f"Har bir do'stingiz shu havola orqali botga kirsa, sizga yulduzcha ⭐ qo'shiladi."
    )

def connect_bot_text() -> str:
    return (
        f"❓ Bu botni akkauntingizga ulasangiz, sizga yozadigan odamlarga\n"
        f"HAQIQIY avto javob beradi (Telegram Business orqali).\n\n"
        f"❓ Qanday ulanadi:\n\n"
        f"1. Pastdagi \"⚙️ Sozlamalarni ochish\" tugmasini bosing (yoki\n"
        f"qo'lda Telegram ➝ <b>Sozlamalar</b>ga o'ting) ➝ <b>Telegram\n"
        f"Business</b> ➝ <b>Chatbots</b> bo'limiga kiring.\n\n"
        f"2. \"Qo'shish\" tugmasini bosing va qidiruvga <b>@{BOT_USERNAME}</b>\n"
        f"deb yozib, botni tanlang va ulaning.\n\n"
        f"3. Tayyor! Ulanish tasdiqlangach, sizga alohida xabar keladi va\n"
        f"shu paytdan boshlab sizga yozgan odamlarga bot avtomatik javob beradi.\n\n"
        f"<i>Eslatma: bu funksiya faqat Telegram Business (Premium) obunasi\n"
        f"bo'lgan akkauntlarda mavjud — bu Telegram'ning o'zi qo'ygan shart,\n"
        f"botga bog'liq emas.</i>"
    )

HELP_TEXT = (
    "🤖 <b>Buyruqlari:</b>\n\n"
    ".help – 📖 ChatBot'dan foydalanish qo'llanmasi!\n\n"
    ".ping – 🚀 ChatBot tezligi!\n\n"
    ".settings – ⚙️ ChatBot sozlanmalari!\n\n"
    ".add <matn> – ➕ Avto javob qo'shish!\n\n"
    ".list – 💬 Avto javoblarni ko'rish!\n\n"
    ".clear – 🗑 Barcha avto javoblarni o'chirish!\n\n"
    ".info – 👥 Ikki tomon haqida ma'lumot!\n\n"
    ".type <matn> – 📝 Harfma-harf yozish animatsiya!\n\n"
    ".soat – 🕔 Profilga nikga soat qo'yish!\n\n"
    ".online – 🟢 24 soat online rejimni yoqish!\n\n"
    ".offline – 🟢 24 soat online rejimni o'chirish!\n\n"
    ".emoji <matn> – 🔤 Matnni premium emoji qilish!\n\n"
    ".dice – 🎲🎯🎳🎰⚽🏀 rand — har safar har xil yuboriladi!\n\n"
    ".dice1 – 🎲 yuborish!\n\n"
    ".dice2 – 🎯 yuborish!\n\n"
    ".dice3 – 🎳 yuborish!\n\n"
    ".dice4 – 🎰 yuborish!\n\n"
    ".dice5 – ⚽️ yuborish!\n\n"
    ".dice6 – 🏀 yuborish!\n\n"
    "---\n"
    "🗺 <b>Haqiqiy suhbatlaringizda ishlatiladigan buyruqlar</b> (bularni botga\n"
    "emas, ulangan hisobingiz orqali suhbatdoshingizga yozayotganda\n"
    "ishlating):\n\n"
    ".loc <joy nomi yoki lat,lng> – 📍 Shu suhbatga lokatsiya yuboradi.\n"
    "Masalan: <code>.loc Toshkent</code> yoki <code>.loc 41.31, 69.24</code>.\n\n"
    "💎 <b>Faqat Pro tarifida:</b>\n"
    ".ok – 🖼 Suhbatdosh yuborgan rasm/video/GIF'ga javob qilib\n"
    "<code>.ok</code> yozing — o'sha media <b>spoiler</b> (yashirin/blur)\n"
    "holatiga o'tkaziladi."
)

SPY_CONSENT_TEXT = (
    "🕵️ <b>Shpion rejimini yoqishdan oldin</b>\n\n"
    "Bu rejim yoqilsa, hisobingizga kelgan HAR bir xabar (matn, rasm,\n"
    "video, ovozli) — siz uni telefoningizda hali ochib ulgurmagan\n"
    "bo'lsangiz ham — darhol shu botga nusxa qilib yuboriladi.\n\n"
    "Iltimos, shuni unutmang:\n"
    "• Bu — sizning shaxsiy hisobingiz, shuning uchun mas'uliyat ham\n"
    "sizning zimmangizda: kelgan xabarlarni faqat o'zingiz uchun ko'ring,\n"
    "boshqalarga ulashmang yoki suiiste'mol qilmang.\n"
    "• Suhbatdoshingiz sizga xabar yozayotganda, buni odatiy holatda ham\n"
    "sizning hisobingiz qabul qiladi — bot faqat shu xabarning nusxasini\n"
    "sizga qulayroq ko'rsatadi.\n"
    "• Istalgan vaqtda shu bo'limdan qayta o'chirib qo'yishingiz mumkin.\n\n"
    "Davom etishga rozimisiz?"
)

def settings_text(user) -> str:
    s = user.settings
    is_pro = user.tariff == "pro"
    lines = ["⚙️ <b>Sozlamalar</b>\n"]

    if is_pro:
        lines += [
            f"⏰ Profilga soat: {'on ✅' if s.profil_soat else 'off ❌'}\n(batafsil — «⏰ Profilga soat» tugmasi)",
            f"🟢 24/7 online: {'on ✅' if s.online_24_7 else 'off ❌'}",
        ]
        if s.online_24_7 and not user.telethon_session:
            lines.append(
                "  <i>⚠️ Hisobingiz Telegram'da haqiqatan \"online\" ko'rinishi\n"
                "uchun avval «⏰ Profilga soat» orqali telefon raqamingizni\n"
                "tasdiqlang (bitta tasdiqlash ikkalasi uchun ham yetarli).</i>"
            )

    lines += [
        f"✉️ «.ok» so'zi: <code>{s.ok_text}</code>",
        f"📍 «.loc» so'zi: <code>{s.loc_text}</code>",
    ]

    if is_pro:
        lines.append(f"🕵️ Shpion rejimi: {'on ✅' if s.spy_mode else 'off ❌'}")
        if s.spy_mode:
            lines.append(
                "  <i>Yoqilgan: akkauntingizga kelgan har bir xabar (matn/rasm/\n"
                "video) — o'zingiz uni telefoningizdan hali ochib ulgurmagan\n"
                "bo'lsangiz ham — shu botga darhol nusxa qilib yuboriladi.</i>"
            )
    else:
        lines.append(
            "\n🔒 <i>⏰ Profilga soat, 🟢 24/7 online va 🕵️ Shpion rejimi —\n"
            "faqat 💎 Pro tarifida mavjud.</i>"
        )

    return "\n".join(lines)

def chatbot_settings_text(user) -> str:
    s = user.settings
    mode_desc = (
        "Har bir suhbatdoshga <b>FAQAT bir marta</b> avto-javob yuboriladi —\n"
        "keyin u qancha yozsa ham bot jim turadi (siz shaxsan javob\n"
        "berguningizcha)."
        if s.autoreply_mode == "once" else
        "Suhbatdosh <b>har safar</b> yozganda avto-javob qayta yuboriladi."
    )
    wh_desc = (
        f"Faqat <b>{s.work_hours_start}–{s.work_hours_end}</b> oralig'ida\n"
        f"oddiy avto-javob yuboriladi; undan tashqarida " +
        (f"«{s.after_hours_text}» matni yuboriladi." if s.after_hours_text
           else "hech narsa yuborilmaydi (matn qo'yilmagan).")
        if s.work_hours_enabled else
        "O'chirilgan — avto-javob kuning istalgan vaqtida yuboriladi."
    )
    lines = [
        "🐥 <b>Chatbotni sozlash</b>\n",
        f"🔁 Avto-javob rejimi: <b>{'Faqat 1 marta' if s.autoreply_mode == 'once' else 'Har doim'}</b>\n",
        f"  <i>{mode_desc}</i>\n",
        f"⏰ Ish vaqti: <b>{'yoqilgan' if s.work_hours_enabled else 'o`chirilgan'}</b>\n",
        f"  <i>{wh_desc}</i>\n",
        f"✏️ Tahrirlanish: {'on ✅' if s.edit_notify else 'off ❌'}\n",
        f"  <i>Suhbatdosh o'ziga yuborilgan xabarini tahrirlasa, shu suhbatga\n"
        f"avtomatik javob (pastdagi matn) yuboriladi.</i>\n",
        f"🗑 O'chirishlar: {'on ✅' if s.delete_notify else 'off ❌'}\n",
        f"  <i>Suhbatdosh o'zi yuborgan xabarini o'chirsa, shu suhbatga\n"
        f"avtomatik javob (pastdagi matn) yuboriladi.</i>\n",
        f"🤖 APK o'chirish: {'on ✅' if s.apk_autodelete else 'off ❌'}\n",
        f"  <i>Suhbatdosh sizga .apk fayl yuborsa, avtomatik o'chiriladi.\n"
        f"Buning uchun botni ulaganda Telegram'dan bu botga \"Xabarlarni\n"
        f"o'chirish\" huquqini berishingiz kerak.</i>\n",
        f"⌨️ Yozmoqda: {'on ✅' if s.typing_notify else 'off ❌'}\n",
        f"  <i>Avto-javob yuborishdan oldin bir necha soniya \"yozmoqda...\"\n"
        f"holati ko'rsatiladi — javob tabiiyroq ko'rinadi.</i>\n",
        f"✏️ Tahrirlash matni: <code>{s.edit_notify_text}</code>",
        f"🗑 O'chirish matni: <code>{s.delete_notify_text}</code>",
    ]
    return "\n".join(lines)

def soat_text(user) -> str:
    s = user.settings
    holati = "yoqilgan ✅" if s.profil_soat else "o'chirilgan ❌"
    lines = [
        f"⏰ <b>Profilga soat</b>\nAkkauntingiz <b>ismiga</b> joriy vaqt qo'shib turiladi.\n🕰 Holati: {holati}",
    ]
    if user.base_first_name:
        preview_name = f"{user.base_first_name}{' | ' if s.soat_sep else ' '}"
        import profile_clock
        preview_name += profile_clock.preview(s.soat_font)
        lines.append(f"👀 Ko'rinishi: {preview_name}")
    lines.append("\n<i>Shriftni va ajratuvchini quyidan tanlang</i> 👇")
    if not user.telethon_session:
        lines.append(
            "\n⚠️ Bu funksiya ishlashi uchun avval hisobingizni tasdiqlashingiz\n"
            "kerak (telefon raqami orqali). «Profilga soat: off»ni bosganingizda\n"
            "bot sizdan telefon raqamingizni so'raydi."
        )
    elif s.profil_soat:
        import profile_clock
        wait = profile_clock.soat_flood_wait_remaining(user.user_id)
        if wait > 0:
            minutes = max(1, wait // 60)
            lines.append(
                f"\n⏳ Telegram hozircha ism o'zgartirishni vaqtincha\n"
                f"cheklab qo'ygan (bu — Telegram'ning o'zi qo'ygan cheklov,\n"
                f"tez-tez ism o'gartirilganda ishga tushadi). Taxminan\n"
                f"{minutes} daqiqadan so'ng soat avtomatik davom etadi,\n"
                f"hech narsa qilish shart emas."
            )
    return "\n".join(lines)

def soat_not_configured_text() -> str:
    return (
        f"⚠️ «Profilga soat» funksiyasi hozircha sozlanmagan.\n\n"
        f"Bu funksiya ishlashi uchun bot egasi (admin) .env fayliga\n"
        f"<code>TELEGRAM_API_ID</code> va <code>TELEGRAM_API_HASH</code>\n"
        f"qiymatlarini (my.telegram.org saytidan bepul olinadi) qo'shishi kerak."
    )

def soat_ask_phone_text() -> str:
    return (
        f"📱 Telefon raqamingizni xalqaro formatda yuboring\n"
        f"(masalan: <code>+998901234567</code>).\n\n"
        f"<i>Bu raqam faqat sizning ismingizga soat qo'yish uchun ishlatiladi va\n"
        f"hech kimga ko'rsatilmaydi.</i>"
    )

def soat_ask_code_text() -> str:
    return (
        f"🔐 Telegram ilovangizga (Saqlangan xabarlar / \"Telegram\" xizmat\n"
        f"xabari sifatida yoki SMS orqali) kelgan kodni yuboring.\n\n"
        f"⚠️ <b>Muhim:</b> agar kod, masalan, <code>12345</code> bo'lsa, uni\n"
        f"shu shaklda emas, balki orasiga nuqta qo'yib <code>12.345</code> deb\n"
        f"yuboring — aks holda Telegram bu kodni xavfsizlik maqsadida avtomatik\n"
        f"yashirib/bekor qilib qo'yishi mumkin. Bot nuqtani o'zi olib tashlab,\n"
        f"kodni to'g'ri o'qiydi."
    )

def soat_ask_password_text() -> str:
    return (
        f"🔒 Hisobingizda 2 bosqichli tasdiqlash (parol) yoqilgan.\n"
        f"Parolingizni yuboring:"
    )

def autoreplies_text(user, limit: int) -> str:
    replies = user.auto_replies
    if not replies:
        return (
            f"💬 <b>Avto javoblar ro'yxati</b>\n\n"
            f"🤷 Hali avto javoblaringiz yo'q.\n\n"
            f"Qo'shish uchun: <code>.add matn</code>"
        )
    lines = [f"{i + 1}. {t}" for i, t in enumerate(replies)]
    return (
        f"💬 <b>Avto javoblar ro'yxati</b>\n"
        f"({len(replies)}/{limit})\n\n" + "\n".join(lines) +
        f"\nYangi qo'shish: <code>.add matn</code>\n"
        f"Hammasini o'chirish: <code>.clear</code>"
    )

def ping_text(ms: float) -> str:
    return f"🚀 Pong! Javob vaqti: <b>{ms:.0f} ms</b>"

# ============================================================================
#                            🛠 ADMIN PANEL matnlari
# ============================================================================

def admin_home_text(pending: int = 0, banned: int = 0) -> str:
    alert = ""
    if pending:
        alert += f"⏳ <b>{pending}</b> ta to'lov tasdiqni kutmoqda\n"
    if banned:
        alert += f"🚫 <b>{banned}</b> ta foydalanuvchi bloklangan\n"
    alert_block = f"\n{alert}" if alert else ""
    return (
        f"🛠 <b>Admin panel</b>\n{alert_block}\n"
        f"Quyidagi bo'limlardan birini tanlang, yoki tezkor buyruqlardan\n"
        f"foydalaning:\n"
        f"• <code>/credit user_id summa</code> — balansga qo'lda pul qo'shish\n"
        f"• <code>/admin_stats</code> — qisqa statistika\n"
        f"• 👥 <b>Foydalanuvchilar</b> bo'limida <code>user_id</code> yuborib\n"
        f"istalgan foydalanuvchini boshqarishingiz mumkin (balans, blok,\n"
        f"avto-javob xotirasini tozalash)."
    )

def admin_stats_text(s: dict) -> str:
    total = s['total'] or 1
    connected_pct = round(s['connected'] * 100 / total)
    online_pct = round(s['online'] * 100 / total)
    banned_pct = round(s['banned'] * 100 / total)
    avg_balance = round(s['balance_sum'] / total) if s['total'] else 0

    tariff_lines = []
    for tariff, count in s['by_tariff'].items():
        tariff_lines.append(f"  • {TARIFFS.get(tariff, {}).get('title', tariff)}: {count}")

    text = (
        f"📊 <b>To'liq statistika</b>\n\n"
        f"👥 <b>Foydalanuvchilar</b>\n"
        f"  • Jami: <b>{s['total']}</b>\n"
        f"  • Business orqali ulangan: <b>{s['connected']}</b> ({connected_pct}%)\n"
        f"  • 24/7 online yoqilgan: <b>{s['online']}</b> ({online_pct}%)\n"
        f"  • Bloklangan: <b>{s['banned']}</b> ({banned_pct}%)\n\n"
        f"💰 <b>Moliya</b>\n"
        f"  • Balanslar jami: <b>{s['balance_sum']:,} so'm</b>\n"
        f"  • O'rtacha balans: <b>{avg_balance:,} so'm</b>\n"
        f"  • Kutilayotgan to'lovlar: <b>{s['pending_topups']}</b>\n\n"
        f"💬 <b>Faollik</b>\n"
        f"  • Jami avto-javoblar: <b>{s['autoreply_count']}</b>\n\n"
        f"🏷 <b>Tariflar bo'yicha</b>\n" +
        "\n".join(tariff_lines)
    )
    return text.replace(",", " ")

def admin_user_not_found_text(user_id: int) -> str:
    return (
        f"🤷 <code>{user_id}</code> — bunday foydalanuvchi hali botdan\n"
        f"foydalanmagan (bazada yo'q)."
    )

def admin_user_card_text(user) -> str:
    info = user.tariff_info()
    if user.tariff == "pro":
        if user.tariff_until:
            tariff_str = f"💎 Pro ({user.tariff_until.strftime('%d.%m.%Y')} gacha)"
        else:
            tariff_str = "💎 Pro (muddatsiz)"
    else:
        tariff_str = "🆓 Start"
    conn_str = "✅ ha" if user.connected else "❌ bog'lanmagan"
    lines = [
        f"👤 <b>Foydalanuvchi:</b> {user.first_name or '—'} (<code>{user.user_id}</code>)\n",
        f"🏷 Tarif: {tariff_str}",
        f"🔗 Ulangan: {conn_str}",
        f"🟢 24/7 online: {'✅ on' if user.settings.online_24_7 else '❌ off'}",
        f"⏰ Profilga soat: {'✅ on' if user.settings.profil_soat else '❌ off'}",
        f"🕵️ Shpion: {'✅ on' if user.settings.spy_mode else '❌ off'}",
        f"💬 Avto javoblar: {len(user.auto_replies)}/{info['auto_reply_limit']}",
        f"💰 Balans: {user.balance_som:,} so'm".replace(",", " "),
        f"⭐ Stars: {user.balance_stars}",
        f"👥 Takliflar: {user.referrals}",
        f"🚫 Holati: {'BLOKLANGAN' if user.is_banned else 'faol'}",
    ]
    return "\n".join(lines)

def admin_emoji_text(emoji_map: dict) -> str:
    lines = ["🎨 <b>Premium emoji boshqaruvi</b>\n"]
    if not emoji_map:
        lines.append("<i>Hozircha premium emoji yo'q.</i>\n")
    else:
        lines.append("Quyidagi emojila premium (custom) ko'rinishda chiqadi:\n")
        for char, cid in emoji_map.items():
            lines.append(f"  {char}  →  <code>{cid}</code>")
        lines.append("")
    lines.append(
        "➕ <b>Qo'shish uchun:</b> emoji belgisini yuboring, keyin uning\n"
        "custom_emoji_id raqamini yuboring.\n"
        "<i>Masalan: Telegram Desktop'da @stickers botidan premium\n"
        "emojilarning ID'sini topishingiz mumkin.</i>"
    )
    return "\n".join(lines)

def admin_give_pro_text() -> str:
    return (
        f"💎 <b>Pro tarif berish</b>\n\n"
        f"Foydalanuvchi ID'sini yuboring, keyin necha kun berish kerakligini\n"
        f"yozing.\n\n"
        f"Masalan: <code>123456789</code>"
    )

def admin_banned_list_text(users: list, offset: int = 0, shown_total: int = None) -> str:
    if not users and offset == 0:
        return "🚫 <b>Bloklangan foydalanuvchilar</b>\n\nHozircha hech kim bloklanmagan."
    if not users:
        return "🚫 <b>Bloklangan foydalanuvchilar</b>\n\nBoshqa yozuv yo'q."
    start = offset + 1
    end = offset + len(users)
    lines = [f"🚫 <b>Bloklangan foydalanuvchilar</b> ({start}–{end}):\n"]
    for u in users:
        lines.append(f"• {u.first_name or '—'} — <code>{u.user_id}</code>")
    return "\n".join(lines)

def admin_ban_confirm_text(user) -> str:
    return (
        f"⚠️ <b>{user.first_name or '—'}</b> (<code>{user.user_id}</code>)\n"
        f"foydalanuvchisini bloklamoqchimisiz?\n\n"
        f"Bloklangach, u botdan foydalana olmaydi (avto-javob, sozlamalar va\n"
        f"boshqa buyruqlar ishlamaydi), toki siz uni qayta blokdan\n"
        f"chiqarmaguningizcha."
    )

def admin_broadcast_preview_text(text: str, total: int) -> str:
    return (
        f"📢 <b>Xabar oldindan ko'rish</b>\n\n"
        f"Quyidagi matn <b>barcha</b> foydalanuvchilarga (jami\n"
        f"<b>{total}</b> ta) yuboriladi:\n\n"
        f"――――――――――――――――\n{text}\n――――――――――――――――\n\n"
        f"Yuborishni tasdiqlaysizmi?"
    )

def admin_broadcast_sending_text(sent: int, total: int) -> str:
    return f"📤 Yuborilmoqda... {sent}/{total}"

def admin_broadcast_result_text(sent: int, failed: int) -> str:
    return (
        f"✅ <b>Xabar yuborildi</b>\n\n"
        f"• Muvaffaqiyatli: <b>{sent}</b>\n"
        f"• Yuborilmadi: <b>{failed}</b>"
    )

def admin_pending_text(rows: list) -> str:
    if not rows:
        return "⏳ <b>Kutilayotgan to'lovlar</b>\n\nHozircha kutilayotgan to'lov so'rovlari yo'q."
    lines = [f"⏳ <b>Kutilayotgan to'lovlar</b> ({len(rows)} ta):\n"]
    for r in rows[:30]:
        lines.append(
            f"#{r['id']} — user <code>{r['user_id']}</code> —\n"
            f"{r['amount']:,} so'm ({r['method']}) ".replace(",", " ")
        )
    if len(rows) > 30:
        lines.append(f"\n<i>... yana {len(rows) - 30} ta</i>")
    return "\n".join(lines)

def admin_report_text(r: dict) -> str:
    return (
        f"📈 <b>Bugungi hisobot</b>\n\n"
        f"🆕 Bugun ro'yxatdan o'tganlar: <b>{r['new_today']}</b>\n"
        f"💬 Bugun yozgan mijozlar (barcha botlar bo'yicha): <b>{r['active_contacts_today']}</b>"
    )

def admin_logs_text(rows: list, offset: int = 0) -> str:
    if not rows and offset == 0:
        return "🧾 <b>Loglar</b>\n\nHozircha yozuv yo'q."
    if not rows:
        return "🧾 <b>Loglar</b>\n\nBoshqa yozuv yo'q."
    title = "🧾 <b>Oxirgi admin harakatlari:</b>" if offset == 0 else "🧾 <b>Admin harakatlari (davomi):</b>"
    lines = [f"{title}\n"]
    for r in rows:
        ts = (r['ts'] or "")[:16].replace("T", " ")
        lines.append(f"• {ts} — {r['action']} — <code>{r['target_id']}</code> {r['detail']}")
    return "\n".join(lines)

def banned_notice_text() -> str:
    return "🚫 Siz botdan foydalanishdan bloklangansiz."

# ============================================================================
#                            👥 MIJOZLAR
# ============================================================================

def contacts_list_text(contacts) -> str:
    if not contacts:
        return (
            f"👥 <b>Mijozlar</b>\n\n"
            f"Hozircha hech kim sizga yozmagan. Bu yerda sizga yozgan\n"
            f"odamlar avtomatik paydo bo'lib boradi — teg va izoh qo'shishingiz\n"
            f"mumkin bo'ladi."
        )
    lines = [f"👥 <b>Mijozlar</b> (oxirgi {len(contacts)} ta)\n"]
    for c in contacts:
        tag = f" [{c['tag']}]" if c['tag'] else ""
        lines.append(f"• {c['name'] or c['chat_id']}{tag} — {c['message_count']} xabar")
    lines.append("\n<i>Birini tanlang</i> 👇")
    return "\n".join(lines)

def contact_card_text(c) -> str:
    lines = [
        f"👤 <b>{c['name'] or c['chat_id']}</b>\n",
        f"🏷 Teg: {c['tag'] or '— belgilanmagan'}",
        f"📝 Izoh: {c['note'] or '— yo`q'}",
        f"💬 Xabarlar soni: {c['message_count']}",
        f"🕓 Oxirgi yozishma: {(c['last_seen'] or '')[:16].replace('T', ' ')}",
    ]
    return "\n".join(lines)

# ============================================================================
#                       🔑 KALIT SO'ZLI JAVOBLAR
# ============================================================================

def keywords_text(rows) -> str:
    lines = [
        f"🔑 <b>Kalit so'zli javoblar</b>\n\n"
        f"Suhbatdosh xabarida shu so'z uchrasa, oddiy avto-javob o'rniga\n"
        f"shu maxsus javob yuboriladi (ish vaqti va \"1 marta\" cheklovlariga\n"
        f"qaramasdan — har safar).\n",
    ]
    if not rows:
        lines.append("<i>Hozircha yo'q.</i>")
    else:
        for r in rows:
            lines.append(f"• <b>{r['keyword']}</b> → {r['reply_text']}")
    return "\n".join(lines)

def info_text(user, chat_first_name: str) -> str:
    info = user.tariff_info()
    suhbatdosh = chat_first_name if chat_first_name else "Noma'lum"
    return (
        "👥 Ikki tomon haqida ma'lumot:\n\n"
        f"🙋 Siz: {user.first_name} (tarif: {info['title']})\n"
        f"💬 Suhbatdosh: {suhbatdosh}"
    )

# ============================================================================
# 🎨 Premium emoji — avtomatik qo'llash
# ============================================================================
import functools as _functools
import types as _types
import pemoji as _pemoji

_RAW_CONSTANTS = {}
for _name in ("HELP_TEXT", "SPY_CONSENT_TEXT"):
    _RAW_CONSTANTS[_name] = globals()[_name]
    del globals()[_name]

def __getattr__(name):
    if name in _RAW_CONSTANTS:
        return _pemoji.wrap(_RAW_CONSTANTS[name])
    raise AttributeError(f"module 'texts' has no attribute {name!r}")

def _wrap_fn(fn):
    @_functools.wraps(fn)
    def _wrapped(*args, **kwargs):
        result = fn(*args, **kwargs)
        if isinstance(result, str):
            return _pemoji.wrap(result)
        return result
    return _wrapped

for _name, _obj in list(globals().items()):
    if _name.startswith("_"):
        continue
    if isinstance(_obj, _types.FunctionType):
        globals()[_name] = _wrap_fn(_obj)
