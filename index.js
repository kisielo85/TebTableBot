// Ver inDev
// Setup
const tableData = require('./tableData.js')
const axios = require('axios');
const fs    = require('fs');

const cfg = require('./config.json')
const token = cfg.token

const {Client, GatewayIntentBits, Partials, ApplicationCommandOptionType, ActionRowBuilder, ButtonBuilder, ButtonStyle} = require("discord.js");
const { group } = require('console');
    //data
var dm_list = require('./dmList.json');
var temp_list={}

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
                name: '_',
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

// Klasy
var klasyButtons = [];

for(let i = 1; i <= 5; i++){
    klasyButtons.push(new ButtonBuilder()
    .setCustomId('r-'+i)
    .setLabel(''+i)
    .setStyle(ButtonStyle.Secondary)
    )
}

// Komendy
client.on('interactionCreate', async (msg) => {
    // jeżeli interakcja to przycisk
    if(msg.isButton()){
        
        // wybrany rocznik
        if(msg.customId.startsWith("r-")){
            r_id=msg.customId.slice(2)

            // przyciski z klasami
            let klasy = []
            for(let [c_id, c] of Object.entries(tableData.idList.classes)){
                if (c.year != r_id){ continue } // pomija inne roczniki
                
                klasy.push(new ButtonBuilder()
                .setCustomId('k-'+c_id)
                .setLabel(c.short)
                .setStyle(ButtonStyle.Secondary)
                );
            } 

            placeButtons(klasy,msg,'Wybierz klase')
        }

        // wybrana klasa
        else if(msg.customId.startsWith("k-")){
            k_id=msg.customId.slice(2)

            // tymczasowy zapis klasy
            temp_list[msg.user.id]={class:k_id, groups:[]}

            // przyciski grup
            let groups = [] 
            for(let g of tableData.idList.classes[k_id].groups){
                groups.push(new ButtonBuilder()
                .setCustomId('g-'+g)
                .setLabel(g)
                .setStyle(ButtonStyle.Secondary)
                );
            }

            // zatwierdzenie wyboru
            groups.push(new ButtonBuilder()
                .setCustomId('g_ok')
                .setLabel("✔")
                .setStyle(ButtonStyle.Success)
            );
            
            placeButtons(groups, msg, 'Wybierz grupy w których jesteś')
        }

        // wybrano grupe
        else if(msg.customId.startsWith("g-")){
            selected = msg.customId.slice(2)
            set_true=false
            buttons=msg.message.components[0].components

            // tworzy identyczne przyciski
            let groups = [] 
            for (const i of buttons){
                b=i.data
                st=b.style

                // zmienia kolor wybranej grupy
                if (selected == b.label){
                    st=ButtonStyle.Secondary
                    if (b.style==ButtonStyle.Secondary){
                        st=ButtonStyle.Primary
                        set_true=true
                    }
                }
                
                groups.push(new ButtonBuilder()
                .setCustomId(b.custom_id)
                .setLabel(b.label)
                .setStyle(st)
                );
            }
            
            // czy user jest w temp_liście
            if (!temp_list[msg.user.id] || !temp_list[msg.user.id].groups){delBtnGroup(msg); return}

            // dodawanie do temp_list
            tab=temp_list[msg.user.id].groups
            if (set_true){
                if (!tab.includes(selected)) tab.push(selected)
            }
            else{
                const index = tab.indexOf(selected);
                if (index != -1) tab.splice(index, 1);
            }

            await msg.message.edit({components: [new ActionRowBuilder().addComponents(groups)]})
            msg.deferUpdate()
        }

        // zatwierdzono grupe
        else if(msg.customId=="g_ok"){
            user=msg.user.id
            delBtnGroup(msg)
            // czy user jest w temp_liście
            tmp=temp_list[user]
            if (!tmp || !tmp.groups || !tmp.class) return

            dm_list[user]=tmp
            delete temp_list[user]
            fs.writeFileSync('dmList.json', JSON.stringify(dm_list, null, 2))

            c = tableData.idList.classes[dm_list[user].class].name
            gr = dm_list[user].groups.join(', ')
            if (gr!='') gr=`, grupa: **${gr}**`
            msg.channel.send(`Dodano cie do **${c}**${gr}`)
        }
    }

    else if(msg.commandName === "lekcje"){
        const row = new ActionRowBuilder()
            .addComponents(klasyButtons)

        let data = await msg.reply({
            content: `Wybierz rocznik by dostać wybrane powiadomienia`,
            components: [row]
        })
    }

    else if(msg.commandName === "stop"){
        if (!dm_list[msg.user.id]){
            msg.reply('nie ma cie na liście')
            return
        }

        delete dm_list[msg.user.id]
        fs.writeFileSync('./dmList.json', JSON.stringify(dm_list))
        msg.reply('usunięto cie z listy')
    }

    else if(msg.commandName === "where"){
        find_str=msg.options.get('_').value
        info = await tableData.where(find_str)

        if (info) msg.reply({content: info})
        else msg.reply({content: `sorry, nie znalazłem "${find_str}"`})
    }

    else if(msg.commandName === "clear"){
        const messages = await msg.channel.messages.fetch({'limit':20})
        messages.forEach(msg => {
            if (msg.author.id == client.user.id) msg.delete()

        })

    }
})

async function delBtnGroup(msg){
    let [, msgGroup] = await getBtnGroup(msg)
    if (msgGroup) for (const m of msgGroup) await m.delete()
    else await msg.delete()
}

// zwraca wiadomości "zgrupowane" z tą podaną
// + czy ta grupa jest najnowsza w chacie
async function getBtnGroup(srcMsg){
    hasMsg=false; stopLoop=false; isFirst=true
    msgGroup=[]
    // sprawdza ostatie 20 wiadomości z chatu
    const messages = await srcMsg.channel.messages.fetch({'limit':20})
    messages.forEach(msg => {
        if (!stopLoop){
            msgGroup.push(msg)

            // dobra grupa
            if (msg.id == srcMsg.message.id) hasMsg=true

            // jeśli trafiło na content lub użytkownika - koniec grupy
            if (msg.content != '' || msg.author.id != client.user.id){ 
                if (hasMsg) stopLoop=true
                else {msgGroup=[]; isFirst=false}
            }
            
        }
    })
    if (hasMsg) return [isFirst, msgGroup]
    return [false, false]
}

// stawia przyciski
// - jeśli są stare to je podmienia
// - jeśli ich za dużo to dzieli na kilka wiadomości
async function placeButtons(buttons, msg, content=false){
    let [first, msgGroup] = await getBtnGroup(msg)

    // usuwa grupe jeśli nie jest pierwsza w chatcie
    if (!first){
        for (const m of msgGroup) await m.delete()
        msgGroup=[]
    }

    // stawia przyciski lub edytuje istniejące
    for(let i = 0; i < buttons.length / 5; i++){
        replace=msgGroup.pop()

        data = { components: [new ActionRowBuilder().addComponents(buttons.slice(5*i, 5*i+5))] }
        if (content && i==0) data.content=content

        if (replace) await replace.edit(data)
        else await msg.channel.send(data)
    }

    msg.deferUpdate()
    // usuwa pozostałe przyciski
    for (const m of msgGroup) await m.delete()
}

client.login(token)