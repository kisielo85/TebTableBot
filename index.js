const fs = require('fs');

if (!fs.existsSync('./Other/dmList.json')){fs.writeFileSync('./Other/dmList.json', '{}')}
var dm_list = require('./Other/dmList.json');

const tableData = require('./Other/tableData.js');
const pngCreate = require('./Other/pngCreate.js');

// jeśli nie ma config.json, tworzy na podstawie config_example
if (!fs.existsSync('config.json')){
    fs.copyFile("config_example.json", "config.json", (err2)=>{})
    console.log("check config.json")
    return
}

const cfg = require('./config.json')
const token = cfg.token

const {Client, GatewayIntentBits, Partials} = require("discord.js");

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

for(let a of fs.readdirSync('./Commands')){ // przygotowanie komend
    commands[a.replace('.js', '')] = require('./Commands/' + a)
}

for(let a of fs.readdirSync('./EventHandlers')){ // startowanie eventHandleruw
    require('./EventHandlers/'+a)({client, cmd:commands, dm_list, tableData, pngCreate})
}

// Main
client.on("ready", async () => {
    console.log(client.user.username + " Logged in");

    require('./Other/alertLekcjeLoop.js')(client, dm_list, tableData) // sktypt co przerwe wysyła powiadomienie o lekcji
    
    // tworzenie komend aplikacji
    require("./Other/interactionCreate.js")(client)
});

client.on('error', console.error);


client.login(token)

