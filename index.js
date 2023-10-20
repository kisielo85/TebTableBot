// Ver inDev
// Setup
const tableData = require('./tableData.js')

const axios = require('axios');
const fs    = require('fs');

const cfg = require('./config.json')
const token = cfg.token

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

// Commands

fs.readdir('./commands', (err, files) => {
  if (err) {
    console.error('err reading dir', err);
    return;
  }

  console.log(files);
});


// Main
client.on("ready", async () => {
    console.log(client.user.username + " Logged in");


    fs.readdir('./EventListeners/', (err, files) => {
        for(let file of files){
            require('./EventListeners/'+file)
        }
    });
      
    
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
                name: '_',
                description: 'wpisz klase, sale lub nauczyciela do wyszukania',
                type:ApplicationCommandOptionType.String,
                required: true
            }
        ]
    });
});

client.on('error', console.error);

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

    // jeżeli interakcja to przycisk
    if(msg.isButton()){
        await delMsg(msg.channel)

        // wybrany rocznik
        if(rocznikBtn = msg.customId.match(/r(\d+)/)){
            
            // przyciski z klasami
            let klasy = []
            for(let [c_id, c] of Object.entries(tableData.idList.classes)){
                if (c.year != rocznikBtn[1]){ continue } // pomija inne roczniki
                
                klasy.push(new ButtonBuilder()
                .setCustomId('k'+c_id)
                .setLabel(c.short)
                .setStyle(ButtonStyle.Secondary)
                );
            } 

            msg.channel.send(`Wybierz klase`)
            placeButtons(klasy,msg.channel)
        }

        // wybrana klasa
        if(msg.customId.match(/k(\d+)/) || msg.customId.match(/k-(\d+)/)){
            /* 
                trzeba zrobić żeby można było zaznaczyć kilka grup,
                i zatwierdzić jakimś przyciskiem
            */
            console.log(msg.customId.match(/k-(\d+)/))

            g_id='-'+msg.customId.match(/k-(\d+)/)[1]
            
            // przyciski grup
            let groups = [] 
            for(let g of tableData.idList.classes[g_id].groups){
                groups.push(new ButtonBuilder()
                .setCustomId('g-'+g)
                .setLabel(g)
                .setStyle(ButtonStyle.Secondary)
                );
            }

            msg.channel.send(`Wybierz grupy w których jesteś`)
            placeButtons(groups, msg.channel)
        }
        
        return
    }

    if(msg.commandName === "lekcje"){

        const row = new ActionRowBuilder()
            .addComponents(klasyButtons)

        let data = await msg.reply({
            content: `Wybierz rocznik by dostać wybrane powiadomienia`,
            components: [row]
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

    if(msg.commandName === "where"){
        find_str=msg.options.get('_').value
        info = await tableData.where(find_str)

        if (info) msg.reply({content: info})
        else msg.reply({content: `sorry, nie znalazłem "${find_str}"`})
    }
})

// usuwa swoje najnowsze wiadomości, aż trafi na jakąś która ma content
async function delMsg(channel){
    stopDel = false
    const messages = await channel.messages.fetch({'limit':20})
    messages.forEach(msg => {
        // jeśli wiadomośc jest od bota, i nie ma końca pętli
        if (msg.author.id == client.user.id && !stopDel){
            if (msg.content != ''){ stopDel=true }
            msg.delete()
        }
    })
}

// stawia przyciski, jeśli ich za dużo to dzieli na kilka wiadomości
async function placeButtons(buttons, channel){
    for(let i = 0; i < buttons.length / 5; i++){
        await channel.send({
            components: [new ActionRowBuilder().addComponents(buttons.slice(5*i, 5*i+5))],
        })
    }
}

client.login(token)

module.exports = {
    client: client
};