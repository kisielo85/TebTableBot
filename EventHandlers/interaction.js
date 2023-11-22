const tableData = require('../Other/tableData.js');
const fs = require('fs')


const {ActionRowBuilder, ButtonBuilder, ButtonStyle} = require("discord.js");

let temp_list={}



/** @param {import('discord.js').Client} client */
module.exports = ({client, cmd, dm_list}) => {
    // stawia przyciski, jeśli ich za dużo to dzieli na kilka wiadomości
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
    
    // zwraca grupe z daną wiadomością
    async function getBtnGroup(srcMsg){
        hasMsg=false
        stopLoop=false
        isFirst=true
        msgGroup=[]
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

    async function delBtnGroup(msg){
        let [, msgGroup] = await getBtnGroup(msg)
        if (msgGroup) for (const m of msgGroup) await m.delete()
        else await msg.delete()
    }
    


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
                await delBtnGroup(msg)
                // czy user jest w temp_liście
                tmp=temp_list[user]
                console.log(JSON.stringify(temp_list))
                if (!tmp || !tmp.groups || !tmp.class) return
                if(dm_list[user])
                    dm_list[user].class[tmp.class] = tmp.groups
                else{
                    dm_list[user] = { "alert":true, "class": {[tmp.class]:tmp.groups}}
                }
                
                fs.writeFileSync('./Other/dmList.json', JSON.stringify(dm_list, null, 2))
    
                c = tableData.idList.classes[temp_list[user].class].name
                gr = dm_list[user].class[temp_list[user].class].join(', ')
                if (gr!='') gr=`, grupa: **${gr}**`
                msg.channel.send(`Dodano cie do **${c}**${gr}`)
                delete temp_list[user]
            }
        }
        if(cmd[msg.commandName])
            cmd[msg.commandName]({msg, client, dm_list, tableData})
    })
    
}