import { Bot } from "grammy";
import { type Chat, Message } from "grammy/out/types";
import { isEmpty } from "lodash";

// Create a bot using the Telegram token
const bot = new Bot(process.env.TELEGRAM_TOKEN || "");
const introductionMessage = `
<b>Команды</b>
/statistic - Выдает количество подписчиков на данный момент
/start [Часы] - Выбор периода отправки сообщений в часах
`;

let chatid : any;
let chat: number;
let username: any;
let privatechannel: boolean;
bot.on(["channel_post", ":forward_date"], (ctx) => {
   
    chat = ctx.chat.id;
    const data : Chat | undefined = ctx.msg.forward_from_chat;
    const parseddata = JSON.parse(JSON.stringify(data));
    if (isEmpty(parseddata.username)) {
        privatechannel = true;
    }
    chatid = data?.id;
    
});

bot.command("statistic",(ctx) => {
                                                        chat = ctx.chat.id;
                                                        if (isNaN(chatid) || privatechannel)
                                                        {
                                                            ctx.api.sendMessage(chat, `chatid неверный или отсутствует`)
                                                        }
                                                        else{
                                                            ctx.api.getChatMemberCount(chatid).then((response) => ctx.reply(`${response}`))}});


let hours: number = 3600;
let multiply: number = 0.5;
bot.command("timer",(ctx) => { multiply = Number(ctx.match)});

bot.api.setMyCommands([
    { command: "setchatid", description: "Выбор отслеживаемой группы" },
    { command: "statistic", description: "Выдает количество подписчиков на данный момент" },
    { command: "timer", description: "Выбор периода отправки сообщений в часах"}
]);



setInterval(() => {
    if (isNaN(chatid) || privatechannel){
        
        }
    else {
        const Count =  bot.api.getChatMemberCount(chatid).then((response) => {bot.api.sendMessage(chat, `${response}`);});
        console.log(Count)
        console.log(hours* multiply)
    }
}, hours * multiply);

 


const replyWithIntro = (ctx: any) =>
    ctx.reply(introductionMessage, {
        parse_mode: "HTML",
    });
bot.on("message", replyWithIntro);

bot.start()

function substr(): any {
    throw new Error("Function not implemented.");
}
