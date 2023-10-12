// Setup
const tableData = require('./tableData.js')
const axios = require('axios');
const fs    = require('fs');
const {Client, GatewayIntentBits, Partials, ApplicationCommandOptionType} = require("discord.js");
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
       await client.application.commands.create({
            name: 'lekcje',
            description: 'możesz sie dodać do listy by mieć powiadomienia o twoim planie lekcji',
            options: [
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
            ]
       });
      await client.application.commands.create({
            name: 'stop',
            description: 'możesz sie usunąć z listy powiadomień'
      });
      await client.application.commands.create({
        name: 'test',
        description: 'ur a sussy baka'
  });
});

client.on('error', console.error);
/*
client.on('messageCreate', msg => {
    if(msg.author.id !== '1161186269406179359'){ // jeżeli to nie wiadomosc bota

    }
})
*/



// Komendy

client.on('interactionCreate', async (msg) => {
    if(!msg.isChatInputCommand()) return;

    if(msg.commandName === "lekcje"){
        let klasa = msg.options.get('klasa').value

        let found = false;
        if(!dm_list.find((id) => {
            if(id !== null && id[0] === msg.user.id){
                found = true
                return
            }
        }))
        if(found){
            msg.reply('jesteś już na liście')
        }else{
            dm_list.push([msg.user.id, klasa])
            fs.writeFileSync('./dmList.json', JSON.stringify(dm_list))
            msg.reply('dodano cie do listy powiadomień')
        }
        console.log(klasa)
    }

    if(msg.commandName === "stop"){
        let found = false;
        dm_list.find((id, index) => {
            if(id !== null && id[0] === msg.user.id){
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

    // wybór klasy, to by sie przydało rozbić na 3 wiadomości z reakcjami/przyciskami
    // przy grupach powinna być opcja zaznaczenia kilku grup,
    // zaznaczenie żadnej grupy równoznaczne z zaznaczeniem każdej
    if(msg.commandName === "test"){
        out=""
        //roczniki
        for (const r in tableData.classes){
            out+='``klasy '+r+'``\n'

            //klasy
            for (const c of tableData.classes[r]){
                out+=`**${c.short}**\n`

                //grupy
                for (const g of c.groups){
                    out+=`- ${g}\n`
                }
            }
        }
        msg.reply(out)
    }
    
})
client.login('MTE2MTE4NjI2OTQwNjE3OTM1OQ.GmI-Cm.gQq5Kp47SHwEkCXgsK8QH0OR-a6nzy8jxjPR_M')