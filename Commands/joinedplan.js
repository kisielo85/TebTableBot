const fs = require('fs')
const { idList } = require('../Other/tableData')
/** 
 * @param { import('discord.js').Events.InteractionCreate | import('discord.js').Events.MessageCreate } msg
 * @param { import('discord.js').Client } client
 */

module.exports = async ({msg, dm_list, placeButtons,ButtonBuilder,ButtonStyle}) => {

    if (!dm_list[msg.user.id]){
        await msg.reply('nie masz zapisanych planów')
        return false
    }
    
    let btns=[]
    for (row_id in dm_list[msg.user.id].list){

        e=dm_list[msg.user.id].list[row_id]
        let tab_name=idList[e.type][e.id].short
        if (e.groups.length!=0){tab_name+=` (${e.groups.join(', ')})`}

        console.log(tab_name)
        style=ButtonStyle.Secondary
        if (e.alert){style=ButtonStyle.Primary}

        btns.push(new ButtonBuilder()
            .setCustomId(`checkbox-joined-${row_id}`)
            .setLabel(tab_name)
            .setStyle(style)
            );
    }
    // zamknięcie edycji
        btns.push(new ButtonBuilder()
        .setCustomId('accept-joined')
        .setLabel("✔")
        .setStyle(ButtonStyle.Success)
    );

    placeButtons(btns,msg,'wybierz 2 plany:',true)
}
