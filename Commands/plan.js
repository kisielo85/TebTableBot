const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js')
const pngCreate = require('../Other/pngCreate.js')
/** @param {import('discord.js').Events.InteractionCreate | import('discord.js').Events.MessageCreate} msg */

module.exports = async ({msg, tableData, dm_list, placeButtons}) => {

    // jeśli podano plan do wyszukania
    if (msg.options.get('plan')){
        find_str = msg.options.get('plan').value
        
        if (info = await tableData.find(find_str)){
            tab = await tableData.getTable(info.type,info.id)
            buffer = await pngCreate.gen_png(tab);
    
            
            let btns=[]
            if (info.type == "classes"){
                for (const g of tableData.idList.classes[info.id].groups){
                    btns.push(new ButtonBuilder()
                    .setCustomId(`checkbox-addgroup-${info.id.replace('-','_')}-${g}`)
                    .setLabel(g)
                    .setStyle(ButtonStyle.Secondary)
                    );
                }
            }

            let msg2 = await msg.reply({content:`plan dla: ${info.name}`,files: [{ attachment: buffer }],
            components: [new ActionRowBuilder().addComponents(btns.slice(0, 5))]})
            
            placeButtons(btns.slice(5),msg2)
        }
    
        else msg.reply({content: `sorry, nie znalazłem "${find_str}"`, ephemeral: true})
    }else{
        let btns=[]
        for (row_id in dm_list[msg.user.id].list){

            e=dm_list[msg.user.id].list[row_id]
            let tab_name=idList[e.type][e.id].short
            if (e.groups.length!=0){tab_name+=` (${e.groups.join(', ')})`}

            btns.push(new ButtonBuilder()
                .setCustomId(`accept-plan-${row_id}`)
                .setLabel(tab_name)
                .setStyle(ButtonStyle.Secondary)
                );
        }
        // zamknięcie edycji
            btns.push(new ButtonBuilder()
            .setCustomId('close')
            .setLabel("x")
            .setStyle(ButtonStyle.Danger)
        );

        placeButtons(btns,msg,'wybierz plan do wygenerowania:',true)
    }
}