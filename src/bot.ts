import { Bot } from "grammy";
import { type Chat } from "grammy/out/types";
import { isEmpty } from "lodash";
import fs from 'node:fs';
import {clearInterval} from "timers";

// Create a bot using the Telegram token
const bot = new Bot('6429183919:AAE3gBhKoQyD1TeDPoTxY8FgxX7NqVf5THA');
const replyWithIntro = (ctx: any) =>
    ctx.reply(introductionMessage, {
        parse_mode: "HTML",
    });
const introductionMessage = `
<b>Команды</b>
/statistic - Выдает количество подписчиков на данный момент
/start [Часы] - Выбор периода отправки сообщений в часах
`;
bot.api.setMyCommands([
    { command: "statistic", description: "Выдает количество подписчиков на данный момент" },
    { command: "start", description: "Выбор периода отправки сообщений в часах"}
]);
let chatid : any;
let chat: number;
let privatechannel: boolean;
let hour: number = 3600 * 1000;
let hours: number = 0.5;

bot.on(["channel_post", ":forward_date"], (ctx) => {
    
    chat = ctx.chat.id;
    const data : Chat | undefined = ctx.msg.forward_from_chat;
    const parseddata = JSON.parse(JSON.stringify(data));
    if (isEmpty(parseddata.username)) {
        privatechannel = true;
    }
    chatid = data?.id;
    fs.writeFileSync('base.txt','');
    
});

bot.command("statistic",(ctx) => {
    chat = ctx.chat.id;
    if (isNaN(chatid) || privatechannel)
    {
        ctx.api.sendMessage(chat, `chatid неверный или отсутствует`)
    }
    else{
        ctx.api.getChatMemberCount(chatid).then((response) => ctx.reply(`${response}`))}
        });

let timer: NodeJS.Timer;
let StartChecker: Boolean = false;
bot.command("start",(ctx) => { 
    hours = Number(ctx.match);
    console.log(hour * hours);
    if (hour * hours < 5000)
    {
        ctx.reply(`Слишком маленький перерыв между сообщениями`);
    }
    else if (((hours* hour) >= Number.MAX_VALUE))
    {
        ctx.reply(`Слишком большой перерыв между сообщениями`);
    }
    else if (isEmpty(timer))
    {
        if (StartChecker == false)
        {
            StartChecker = true;
        }
        else
        {
            chat = NaN;
        }
        let timer = setInterval(() => {
            if (isNaN(chat) || privatechannel) {
                clearInterval(timer)
                return;
            } 
            else
            {
                console.log(timer);
                const Count = bot.api.getChatMemberCount(chatid).then((response) => {
                    fs.appendFileSync("base.txt", (String(response)+' '));
                    const file = (fs.readFileSync("base.txt").toString('utf-8')).split(' ');
                    const a = Number(file[file.length - 2]);
                    const b = Number(file[file.length - 3]);
                    console.log(timer)
                    if (a > b)
                    {
                        const dif = ((a-b)/a) * 100
                        bot.api.sendMessage(chat, `
                            Число подписчиков: ${response} 
                            прирост: ${dif.toFixed(2)}%`);
                    }
                    if (a < b)
                    {
                        const dif = ((b-a)/a) * 100
                        bot.api.sendMessage(chat, `
                            Число подписчиков: ${response} 
                            отрицательный прирост: ${dif.toFixed(2)}%`);
                    }
                    if (a == b || isNaN(b))
                    {
                        const dif = 0
                        bot.api.sendMessage(chat, `
                            Число подписчиков: ${response}`);
                    }});
            }
            }, hour * hours);
        }});


bot.on("message", replyWithIntro);

bot.start()
