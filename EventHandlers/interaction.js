
const fs = require('fs')
const {ActionRowBuilder, ButtonBuilder, ButtonStyle} = require("discord.js");
const { channel } = require('diagnostics_channel');
const { table } = require('console');

let temp_list={}


/** @param {import('discord.js').Client} client */
module.exports = ({client, cmd, dm_list, tableData, pngCreate}) => {
    // stawia przyciski, jeśli ich za dużo to dzieli na kilka wiadomości
    async function placeButtons(buttons, msg, content=false, reply=false){
        let [first, msgGroup] = await getBtnGroup(msg)
        let channel=msg.channel

        if (!channel && msg.interaction){
            channel=msg.interaction.channel
        }
    
        // usuwa grupe jeśli nie jest pierwsza w chatcie
        if (!first){
            for (const m of msgGroup) await m.delete()
            msgGroup=[]
        }
    
        // stawia lub edytuje istniejące
        for(let i = 0; i < buttons.length / 5; i++){
            replace=msgGroup.pop()
    
            data = { components: [new ActionRowBuilder().addComponents(buttons.slice(5*i, 5*i+5))] }
            if (content && i==0) data.content=content
            
            if (replace) await replace.edit(data)
            else if(reply){ msg.reply(data); reply=false}
            else await channel.send(data)
        }
        if (msg.message) msg.deferUpdate()

        // usuwa pozostałe przyciski
        for (const m of msgGroup) await m.delete()   
    }

    // zwraca grupe z daną wiadomością
    async function getBtnGroup(srcMsg){
        if (!srcMsg.message) return [true,[]]
        let hasMsg=false
        let stopLoop=false
        let isFirst=true
        let msgGroup=[]
        const messages = await srcMsg.channel.messages.fetch({'limit':20})

        messages.forEach(msg => {
            // jeśli nie ma końca pętli i wiadomośc jest od bota
            if (!stopLoop){
                msgGroup.push(msg)
    
                // dobra grupa
                if (msg.id == srcMsg.message.id) hasMsg=true
    
                // znalazło dobrą grupe wiadomości, lub zaczyna szukać nowej
                if (msg.content != '' || msg.author.id != client.user.id){ 
                    if (hasMsg) stopLoop=true
                    else {msgGroup=[]; isFirst=false}
                }
            }
        })
        if (hasMsg) return [isFirst, msgGroup]
        return false
    }

    // usuwanie grupy wiadomości
    async function delBtnGroup(msg){
        let [, msgGroup] = await getBtnGroup(msg)
        if (msgGroup) for (const m of msgGroup) await m.delete()
        else await msg.delete()
    }

    // dodawianie i usuwanie z temp_list
    function tempList_add(userid,tab_id,value, add=true){
        // false jeśli nie istnieje data tabela
        if (!temp_list[userid]) {return false}
        if (!temp_list[userid][tab_id]) {return false}

        let tab=temp_list[userid][tab_id]
        if (add){
            if (!tab.includes(value)) tab.push(value)
        }
        else{
            const index = tab.indexOf(choice);
            if (index != -1) tab.splice(index, 1);
        }
        return temp_list[userid][tab_id]
    }

    client.on('interactionCreate', async (msg) => {
        if(!dm_list[msg.user.id]){
            await msg.user.send("dane są pobierane z **tebwroclaw.edupage.org**, więc mogą sie one różnić z planem z **librusa**");
            dm_list[msg.user.id] = {"list": []}
            fs.writeFileSync('./Other/dmList.json', JSON.stringify(dm_list, null, 2))
        }
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
                    .setCustomId('checkbox-group-'+g)
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
    
            // checkboxy
            else if(msg.customId.startsWith("checkbox-")){
                const msg_data=msg.customId.split('-')
                const type=msg_data[1]
                const choice=msg_data[2]
                const selected = msg.customId
                
                let set_true=false
                buttons=msg.message.components[0].components
    
                // tworzy identyczne przyciski
                let replace_btns = [] 
                for (const i of buttons){
                    const b=i.data
                    st=b.style
    
                    // zmienia kolor wybranej grupy
                    if (selected == b.custom_id){
                        st=ButtonStyle.Secondary
                        if (b.style==ButtonStyle.Secondary){
                            st=ButtonStyle.Primary
                            set_true=true
                        }
                    }
                    
                    replace_btns.push(new ButtonBuilder()
                    .setCustomId(b.custom_id)
                    .setLabel(b.label)
                    .setStyle(st)
                    );
                }

                // wybór grup przy dodawaniu klasy do listy
                if (type=="group"){
                    // jeśli nie ma w temp liście to wywala
                    if (!tempList_add(msg.user.id,'groups',choice,set_true)){
                        delBtnGroup(msg); return
                    }
                }
                else if (type=="alert"){
                    dm_list[msg.user.id].list[choice].alert=set_true
                }
                else if (type=="joined"){
                    join_tab = tempList_add(msg.user.id,'joined',choice,set_true)

                    // tworzy png od razu po wybraniu drugiego planu
                    if (join_tab.length>=2){
                        const t_data1=dm_list[msg.user.id].list[join_tab[0]]
                        const t_data2=dm_list[msg.user.id].list[join_tab[1]]
                        tab1 = await tableData.getTable(t_data1.type,t_data1.id)
                        tab2 = await tableData.getTable(t_data2.type,t_data2.id)

                        buffer = await pngCreate.gen_double_png(tab1,t_data1.groups,tab2,t_data2.groups)
                        msg.channel.send({files: [{ attachment: buffer }]})

                        // return żeby nie robiło przycisków
                        await delBtnGroup(msg)
                        return
                    }
                }
                else if (type=="addgroup"){
                    const tab_type=msg_data[2]
                    const tab_id=msg_data[3]
                    const btn_group=msg_data[4]
                    // bierze wiadomości z przyciskami
                    let [,msg_group] = await getBtnGroup(msg)
                    if (!msg_group){ return }

                    // z tych wiadomości pobiera wybrane już grupy
                    let groups=[]
                    if (set_true){groups.push(btn_group)}
                    for (const m of msg_group){
                        if (!m.components[0]){continue}
                        for (const g of m.components[0].components){
                            //push jeśli ta grupa jest zaznaczona
                            if (g.style==1 && g.label!=btn_group){
                                groups.push(g.label)
                            }
                        }
                    }
                    
                    // dodaje 7 dni jeśli jest wciśnięty przycisk "Następny tydzień"
                    let addDays=0
                    if (groups.includes("Następny tydzień")){
                        groups.splice(groups.indexOf("Następny tydzień"),1)
                        addDays=7
                    }
                    tab=await tableData.getTable(tab_type,tab_id.replace('_','-'),false,addDays)
                    
                    
                    if (groups.length!=0){tab=pngCreate.gen_group_table(tab,groups)}
                    buffer=pngCreate.gen_png(tab)
                    msg_group.pop().edit({content: `plan dla: ${tab.name}`,files: [{ attachment: buffer }]})


                }

                // podmiana przycisków na nowe
                await msg.message.edit({components: [new ActionRowBuilder().addComponents(replace_btns)]})
                msg.deferUpdate()
            }
    
            // zatwierdzono grupe
            else if(msg.customId=="g_ok"){
                user=msg.user.id
                await delBtnGroup(msg)
                // czy user jest w temp_liście
                tmp=temp_list[user]
                if (!tmp || !tmp.groups || !tmp.class) return
                if(dm_list[user]){
                    dm_list[user].list.push({
                        "id":tmp.class,
                        "type":"classes",
                        "groups":tmp.groups
                    })
                }

                else{
                    dm_list[user] = {"list": [{
                        "alert":false,
                        "id":tmp.class,
                        "type":"classes",
                        "groups":tmp.groups
                    }]}
                }
                
                fs.writeFileSync('./Other/dmList.json', JSON.stringify(dm_list, null, 2))
    
                c = tableData.idList.classes[tmp.class].name
                gr = tmp.groups.join(', ')
                if (gr!='') gr=`, grupa: **${gr}**`
                msg.channel.send(`Dodano cie do **${c}**${gr}`)
                delete temp_list[user]
            }

            if (msg.customId.startsWith("accept-")){
                const msg_data=msg.customId.split('-')
                const type = msg_data[1]
                if (type=='alert'){
                    fs.writeFileSync('./Other/dmList.json', JSON.stringify(dm_list, null, 2))
                    await delBtnGroup(msg)
                }
                else if (type=="plan"){
                    const plan_data=dm_list[msg.user.id].list[msg_data[2]]
                    let tab = await tableData.getTable(plan_data.type,plan_data.id)
                    if (plan_data.groups.length!=0){
                        tab=pngCreate.gen_group_table(tab,plan_data.groups)
                    }
                    buffer = await pngCreate.gen_png(tab);
                    await delBtnGroup(msg)
                    await msg.reply({files: [{ attachment: buffer }], ephemeral: true})
                }
            }

            else if(msg.customId=="close"){
                await delBtnGroup(msg)
            }
        }
        if(cmd[msg.commandName])
            cmd[msg.commandName]({msg, client, dm_list, temp_list, tableData, placeButtons})
    })
}