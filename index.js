const axios = require('axios');
const fs = require('fs');

// jeśli nie ma config.json, tworzy na podstawie config_example
if (!fs.existsSync('config.json')){
    fs.copyFile("config_example.json", "config.json", (err2)=>{})
    console.log("check config.json")
    return
}

const cfg = require('./config.json')
const token = cfg.token

const {Client, GatewayIntentBits, Partials, ApplicationCommandOptionType} = require("discord.js");
    //data



const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.MessageContent,
    ],
    partials: [Partials.Message, Partials.Channel]
});

// komendy i handlery

var commands = {} // lista komend z commands

for(let a of fs.readdirSync('./Commands')){
    commands[a.replace('.js', '')] = require('./Commands/' + a)
}

for(let a of fs.readdirSync('./EventHandlers')){
    require('./EventHandlers/'+a)(client, commands)
}




// Main
client.on("ready", async () => {
    console.log(client.user.username + " Logged in");
    
    await client.application.commands.create({
        name: 'lekcje',
        description: 'możesz sie dodać do listy by mieć powiadomienia o twoim planie lekcji',
    });

    await client.application.commands.create({
        name: 'stop',
        description: 'możesz sie usunąć z listy powiadomień'
    });

    await client.application.commands.create({
        name: 'where',
        description: 'znajdź klase lub nauczyciela',
        options: [
            {
                name: 'find',
                description: 'wpisz klase, sale lub nauczyciela do wyszukania',
                type:ApplicationCommandOptionType.String,
                required: true
            }
        ]
    });

    await client.application.commands.create({
        name: 'clear',
        description: 'usuń wiadomości bota'
    });

    await client.application.commands.create({
        name: 'alert',
        description: 'powiadomienia o następnej lekcji co przerwe'
    });
});

client.on('error', console.error);


client.login(token)

