// Setup
const axios = require('axios');
const fs    = require('fs');
const { Client, GatewayIntentBits, Partials} = require("discord.js");
    //data
    const dm_list = require('./dmList.json');
    console.log(dm_list)

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.MessageContent,
    ],
    partials: [Partials.Message, Partials.Channel]
});

// Main
client.on("ready", async () => {
    console.log(client.user.username + " Loggen in");
});

client.on('error', console.error);

client.on('messageCreate', msg => {
    if(msg.author.id !== '1161186269406179359'){ // jeżeli to nie wiadomosc bota
        console.log(dm_list)

        msg.content = msg.content.toLowerCase()

        if(msg.content.startsWith('!help')){
            msg.reply('!dm me wysyła wiadomośći gdzy plan sie zmieni, zwolni sie lekcja itp.\n!stop dm przestałe wysyłać powiadomiena o planu lekcjach')
        }

        if(match = msg.content.match('!dm me (.*)')){ // !dm me <klasa> dodaje do listy
            let found = false;
            if(!dm_list.find((id) => {
                if(id !== null && id[0] === msg.author.id){
                    found = true
                    return
                }
            }))
            if(found){
                msg.reply('jesteś już na liście')
            }else{
                dm_list.push([msg.author.id, match[1]])
                fs.writeFileSync('./dmList.json', JSON.stringify(dm_list))
                msg.reply('dodano cie do listy powiadomień')
            }
            
        }

        if(msg.content.startsWith('!stop dm')){ // stop dm usuwa zy listy
            let found = false;
            dm_list.find((id, index) => {
                if(id !== null && id[0] === msg.author.id){
                    dm_list[index] = null
                    found = true
                    return
                }
            })
            if(found){
                fs.writeFileSync('./dmList.json', JSON.stringify(dm_list))
                msg.reply('usunięto cie z listy')
            }else{
                msg.reply('nie ma cie na liście')
            }
        }
    }
})


client.login('MTE2MTE4NjI2OTQwNjE3OTM1OQ.GmI-Cm.gQq5Kp47SHwEkCXgsK8QH0OR-a6nzy8jxjPR_M')