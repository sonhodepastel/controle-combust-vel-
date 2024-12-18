from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup
from telegram.ext import Updater, CommandHandler, CallbackQueryHandler, CallbackContext

TOKEN = '7550422055:AAE0BGBx4aELF0Q5d91mZKqc7J2W8h7JCpw'

def start(update: Update, context: CallbackContext) -> None:
    keyboard = [
        [InlineKeyboardButton("Ver Cardápio", callback_data='1')],
        [InlineKeyboardButton("Fazer Pedido", callback_data='2')]
    ]
    reply_markup = InlineKeyboardMarkup(keyboard)
    update.message.reply_text('Bem-vindo à Pastelaria! Escolha uma opção:', reply_markup=reply_markup)

def button(update: Update, context: CallbackContext) -> None:
    query = update.callback_query
    query.answer()
    if query.data == '1':
        query.edit_message_text(text="Nosso Cardápio:\n1. Pastel de Carne - R$5,00\n2. Pastel de Queijo - R$5,00\n3. Pastel de Frango - R$5,00")
    elif query.data == '2':
        query.edit_message_text(text="Para fazer um pedido, por favor, envie uma mensagem com o item desejado.")

def main() -> None:
    updater = Updater(TOKEN)
    dispatcher = updater.dispatcher
    dispatcher.add_handler(CommandHandler('start', start))
    dispatcher.add_handler(CallbackQueryHandler(button))
    updater.start_polling()
    updater.idle()

if __name__ == '__main__':
    main()
