const axios = require('axios');
const fs = require('fs');

// jeśli nie ma config.json, tworzy na podstawie config_example
fs.access("config.json", fs.F_OK, (err) => {
    if (err) fs.copyFile("config_example.json", "config.json", (err2)=>{})
})

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
        /*options: [
            {
                name: 'klasa',
                description: 'wybierz klase by powiadomić cie o twoich lekcjach',
                type:ApplicationCommandOptionType.String,
                choices:[ // TU DEJ TE KLASY WEHIGWEHGIGHU
                    {
                        name:'Teip4',
                        value:'-7'
                    }
                ],
                required: true
            },
            {
                name:'grupa',
                description:'grupa to grupa',
                type:ApplicationCommandOptionType.String,
                choices:[ // TU DAJ ME GRUPY
                    {
                        name:'EsportŚmierdzi',
                        value:'esport'
                    },
                    {
                        name:'Seksiaki',
                        value:'progr'
                    }
                ],
                required:true
            }
        ]*/
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
});

client.on('error', console.error);


client.login(token)

