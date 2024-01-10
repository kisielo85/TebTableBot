const fs = require('fs');
const tableData = require('./utils/tableData.js');
const pngCreate = require('./utils/pngCreate.js');

// jeśli nie ma dmList to tworzy pusty plik
if (!fs.existsSync('./data/dmList.json')){fs.writeFileSync('./data/dmList.json', '{}')}
var dm_list = require('./data/dmList.json');

// jeśli nie ma config.json, tworzy na podstawie config_example
if (!fs.existsSync('config/config.json')){
    fs.copyFile("config/config_example.json", "config/config.json", (err2)=>{})
    console.log("check config/config.json")
    return
}

const cfg = require('./config/config.json')
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


// przygotowanie komend
var commands = {} 
for(let a of fs.readdirSync('./commands')){ 
    commands[a.replace('.js', '')] = require('./commands/' + a)
}
require('./events/interaction.js')({client, cmd:commands, dm_list, tableData, pngCreate})


// Main
client.on("ready", async () => {
    console.log(client.user.username + " Logged in");

    // skrypt co przerwe wysyła powiadomienie o lekcji
    require('./utils/alertLekcjeLoop.js')(client, dm_list, tableData)
    
    // tworzenie komend aplikacji
    require('./events/interactionCreate.js')(client)
});

client.on('error', console.error);

client.login(token)