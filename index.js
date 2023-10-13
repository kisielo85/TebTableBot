// Ver inDev
// Setup
const tableData = require('./tableData.js')
const axios = require('axios');
const fs    = require('fs');
const {Client, GatewayIntentBits, Partials, ApplicationCommandOptionType, ActionRowBuilder, ButtonBuilder, ButtonStyle} = require("discord.js");
    //data
    const dm_list = {}//require('./dmList.json');

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

// Klasy
var klasyButtons = [];

for(let i = 1; i <= 5; i++){
    klasyButtons.push(new ButtonBuilder()
    .setCustomId('r'+i)
    .setLabel(''+i)
    .setStyle(ButtonStyle.Secondary)
    )
}

// Komendy
client.on('interactionCreate', async (msg) => {

    if(msg.isButton()){ // jeżeli interakcja to przycisk
        console.log(await msg.message.delete())
        if(rocznikBtn = msg.customId.match(/r(\d+)/)){



            let profile = []
            for(let a of tableData.classes[''+rocznikBtn[1]]){
                    profile.push(new ButtonBuilder()
                    .setCustomId('k'+a.id)
                    .setLabel(a.short)
                    .setStyle(ButtonStyle.Secondary)
                    );
            }
            let ileMsg = tableData.classes[''+rocznikBtn[1]].length / 5;
            ileMsg - parseInt(ileMsg) > 0 ? parseInt(ileMsg) + 1 : parseInt(ileMsg)
            msg.user.send(`Wybierz klase`)
            for(let i = 0; i<ileMsg; i++){
                await msg.user.send({
                    components: [new ActionRowBuilder().addComponents(profile.slice(5*i, 5*i+5))],
                })
            }
        }

        console.log(msg.customId)

        if(msg.customId.match(/k(\d+)/) || msg.customId.match(/k-(\d+)/)){
            await msg.message.delete()
            console.log(msg.customId.match(/k-(\d+)/))
        }
 
        return
    }

    if(msg.commandName === "lekcje"){

        const row = new ActionRowBuilder()
            .addComponents(klasyButtons)

        let data = await msg.reply({
            content: `Wybierz rocznik by dostać wybrane powiadomienia`,
            components: [row],
            ephemeral: true
        })
        if(tableData[msg.user.id]){

        }else{
            tableData[msg.user.id] = {
                alert:{
                    klasy:[] // klasy['4Teip'] = ['inf', 'esport'] jesli pusto to wszyskie
                },
                /*messagesIds:{
                    rocznik:data.interaction.id,
                    klasy:[],
                    grupy:[]
                }*/
            }

        }
        //console.log(await test.interaction.deleteReply())
        /*
        if(found){
            msg.reply('jesteś już na liście')
        }else{
            dm_list.push([msg.user.id, klasa])
            fs.writeFileSync('./dmList.json', JSON.stringify(dm_list))
            msg.reply('dodano cie do listy powiadomień')
        }*/
      
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