import logging
from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup
from telegram.ext import (
    ApplicationBuilder, CommandHandler, MessageHandler, 
    CallbackQueryHandler, ContextTypes, filters
)

# Configuration
BOT_TOKEN = "8874175357:AAEqNBuQnL9O1ocRtitlcWqtipJCrdwzScg"
ADMIN_ID = 8453381252 # Telegram ID'ngizni yozing

# Bot ma'lumotlar bazasi (xotirada)
images_db = {}
user_states = {}
settings_db = {
    "channel": None,  # Masalan: "@kanalingiz"
    "sub_active": False  # Majburiy obuna holati
}

logging.basicConfig(level=logging.INFO)

# --- MAJBURITY OBUNA TEKSHIRUVI ---
async def check_subscription(user_id: int, context: ContextTypes.DEFAULT_TYPE) -> bool:
    if not settings_db["sub_active"] or not settings_db["channel"]:
        return True
    try:
        member = await context.bot.get_chat_member(chat_id=settings_db["channel"], user_id=user_id)
        return member.status in ['creator', 'administrator', 'member']
    except Exception:
        return True

async def send_sub_channel_msg(update: Update):
    ch_username = settings_db["channel"].replace('@', '')
    keyboard = InlineKeyboardMarkup([
        [InlineKeyboardButton("Kanalga a'zo bo'lish 📢", url=f"https://t.me/{ch_username}")],
        [InlineKeyboardButton("Tekshirish 🔄", callback_data="check_sub")]
    ])
    msg = "Botdan foydalanish uchun rasmiy kanalimizga obuna bo'ling:"
    if update.message:
        await update.message.reply_text(msg, reply_markup=keyboard)
    elif update.callback_query:
        await update.callback_query.message.reply_text(msg, reply_markup=keyboard)

# --- START & RO'YXAT ---
async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    user_id = update.effective_user.id
    if not await check_subscription(user_id, context):
        await send_sub_channel_msg(update)
        return

    if not images_db:
        await update.message.reply_text("Hozircha hech qanday rasm mavjud emas.")
        return

    text = "<b>Mavjud rasmlar ro'yxati:</b>\n\n"
    for code, data in images_db.items():
        text += f"/{code}. {data['title']} ({data['views']})\n"
    
    await update.message.reply_text(text, parse_mode="HTML")

# --- RASMLARNI YUBORISH ---
async def handle_commands(update: Update, context: ContextTypes.DEFAULT_TYPE):
    user_id = update.effective_user.id
    if not await check_subscription(user_id, context):
        await send_sub_channel_msg(update)
        return

    cmd = update.message.text.replace("/", "").strip()
    if cmd in images_db:
        images_db[cmd]['views'] += 1
        item = images_db[cmd]
        
        caption = f"<b>Nomi:</b> {item['title']}\n<b>Ko'rilgan:</b> {item['views']} marta"
        await update.message.reply_photo(
            photo=item['file_id'], 
            caption=caption, 
            parse_mode="HTML"
        )

# --- ADMIN PANEL ---
def get_admin_keyboard():
    status = "YOQILGAN 🟢" if settings_db["sub_active"] else "O'CHIRILGAN 🔴"
    ch_name = settings_db["channel"] if settings_db["channel"] else "Ulanmagan"
    
    return InlineKeyboardMarkup([
        [InlineKeyboardButton("➕ Rasm qo'shish", callback_data="add_img"),
         InlineKeyboardButton("🗑 Rasm o'chirish", callback_data="delete_img")],
        [InlineKeyboardButton(f"📢 Kanal: {ch_name}", callback_data="set_channel")],
        [InlineKeyboardButton(f"Obuna holati: {status}", callback_data="toggle_sub")]
    ])

async def admin_panel(update: Update, context: ContextTypes.DEFAULT_TYPE):
    if update.effective_user.id != ADMIN_ID:
        return
    await update.message.reply_text("<b>Admin Panel:</b>", reply_markup=get_admin_keyboard(), parse_mode="HTML")

async def callback_handler(update: Update, context: ContextTypes.DEFAULT_TYPE):
    query = update.callback_query
    await query.answer()
    
    if query.data == "check_sub":
        if await check_subscription(query.from_user.id, context):
            await query.message.reply_text("Obuna tasdiqlandi! Endi /start bosing.")
        else:
            await query.message.reply_text("Hali obuna bo'lmadingiz!")
        return

    if query.from_user.id != ADMIN_ID:
        return

    if query.data == "add_img":
        user_states[ADMIN_ID] = "WAITING_CODE"
        await query.message.reply_text("Rasm uchun kod kiriting (masalan: 1 yoki 2):")
        
    elif query.data == "delete_img":
        if not images_db:
            await query.message.reply_text("O'chirish uchun rasmlar yo'q.")
            return
        buttons = [[InlineKeyboardButton(f"❌ /{code} - {data['title']}", callback_data=f"del_{code}")] for code, data in images_db.items()]
        await query.message.reply_text("O'chirmoqchi bo'lgan rasmni tanlang:", reply_markup=InlineKeyboardMarkup(buttons))
        
    elif query.data.startswith("del_"):
        code = query.data.split("_")[1]
        if code in images_db:
            del images_db[code]
            await query.message.reply_text(f"/{code} kodi ostidagi rasm o'chirildi!")

    elif query.data == "set_channel":
        user_states[ADMIN_ID] = "WAITING_CHANNEL"
        await query.message.reply_text("Kanal username'ini kiriting (masalan: @kanalingiz):")

    elif query.data == "toggle_sub":
        if not settings_db["channel"]:
            await query.message.reply_text("Avval kanal username'ini kiriting!")
            return
        settings_db["sub_active"] = not settings_db["sub_active"]
        await query.edit_message_reply_markup(reply_markup=get_admin_keyboard())

async def handle_admin_inputs(update: Update, context: ContextTypes.DEFAULT_TYPE):
    user_id = update.effective_user.id
    if user_id != ADMIN_ID or user_id not in user_states:
        return

    state = user_states[user_id]

    if state == "WAITING_CHANNEL":
        channel_input = update.message.text.strip()
        if not channel_input.startswith("@"):
            channel_input = f"@{channel_input}"
        settings_db["channel"] = channel_input
        del user_states[user_id]
        await update.message.reply_text(f"✅ Kanal saqlandi: {channel_input}\nBotni kanalga admin qilishni unutmang!")

    elif state == "WAITING_CODE":
        context.user_data['new_code'] = update.message.text.replace("/", "").strip()
        user_states[user_id] = "WAITING_TITLE"
        await update.message.reply_text("Rasm nomini kiriting:")

    elif state == "WAITING_TITLE":
        context.user_data['new_title'] = update.message.text
        user_states[user_id] = "WAITING_PHOTO"
        await update.message.reply_text("Endi rasmni yuboring:")

    elif state == "WAITING_PHOTO" and update.message.photo:
        file_id = update.message.photo[-1].file_id
        code = context.user_data['new_code']
        title = context.user_data['new_title']

        images_db[code] = {"file_id": file_id, "title": title, "views": 0}
        del user_states[user_id]
        await update.message.reply_text(f"✅ Rasm qo'shildi!\nBuyruq: /{code}\nNomi: {title}")


# CloudBot Auto-injected Global Error Handler
async def _cloudbot_error_handler(update, context):
    if not context.error:
        return
    err_str = str(context.error)
    err_type = type(context.error).__name__
    transient = ('httpx.ReadError', 'httpx.ConnectError', 'httpx.RemoteProtocolError', 'httpx.ReadTimeout', 'httpx.ConnectTimeout', 'httpx.TimeoutException', 'ReadError', 'ConnectError', 'RemoteProtocolError', 'ReadTimeout', 'ConnectTimeout', 'TimeoutException', 'TimedOut', 'NetworkError', 'RetryAfter')
    if any(t in err_str or t in err_type for t in transient):
        return
    import logging
    logging.warning(f"Bot handler notice: {context.error}")

def main():
    app = ApplicationBuilder().token(BOT_TOKEN).build()

    app.add_handler(CommandHandler("start", start))
    app.add_handler(CommandHandler("admin", admin_panel))
    app.add_handler(CallbackQueryHandler(callback_handler))
    
    app.add_handler(MessageHandler(filters.PHOTO & filters.User(ADMIN_ID), handle_admin_inputs))
    app.add_handler(MessageHandler(filters.TEXT & filters.User(ADMIN_ID) & ~filters.COMMAND, handle_admin_inputs))
    app.add_handler(MessageHandler(filters.COMMAND, handle_commands))

    print("Bot ishga tushdi...")
    app.add_error_handler(_cloudbot_error_handler)
    app.run_polling()

if __name__ == "__main__":
    main()
