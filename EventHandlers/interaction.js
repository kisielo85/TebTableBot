
const fs = require('fs')
const {ActionRowBuilder, ButtonBuilder, ButtonStyle} = require("discord.js");

let temp_list={}


/** @param {import('discord.js').Client} client */
module.exports = ({client, cmd, dm_list, tableData, pngCreate}) => {
    // stawia przyciski, jeśli ich za dużo to dzieli na kilka wiadomości
    async function placeButtons(buttons, msg, content=false, reply=false){
        let [first, msgGroup] = await getBtnGroup(msg)
    
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
            else await msg.channel.send(data)
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
                const type = msg.customId.split('-')[1]
                if (type=='alert'){
                    fs.writeFileSync('./Other/dmList.json', JSON.stringify(dm_list, null, 2))
                }
                await delBtnGroup(msg)
            }
        }
        if(cmd[msg.commandName])
            cmd[msg.commandName]({msg, client, dm_list, temp_list, tableData, placeButtons, ButtonBuilder,ButtonStyle})
    })
}