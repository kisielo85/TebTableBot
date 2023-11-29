const fs = require('fs')
const { idList } = require('../Other/tableData')
/** 
 * @param { import('discord.js').Events.InteractionCreate | import('discord.js').Events.MessageCreate } msg
 * @param { import('discord.js').Client } client
 */

module.exports = async ({msg, dm_list, temp_list, placeButtons,ButtonBuilder,ButtonStyle}) => {

    if (!dm_list[msg.user.id] && dm_list[msg.user.id].list){
        await msg.reply('nie masz zapisanych planów')
        return false
    }
    temp_list[msg.user.id]={joined:[]}

    let btns=[]
    for (row_id in dm_list[msg.user.id].list){

        e=dm_list[msg.user.id].list[row_id]
        let tab_name=idList[e.type][e.id].short
        if (e.groups.length!=0){tab_name+=` (${e.groups.join(', ')})`}

        btns.push(new ButtonBuilder()
            .setCustomId(`checkbox-joined-${row_id}`)
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

    placeButtons(btns,msg,'wybierz 2 plany:',true)
}
