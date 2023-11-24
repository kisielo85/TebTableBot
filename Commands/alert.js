const fs = require('fs')
const interaction = require('../EventHandlers/interaction')
const { idList } = require('../Other/tableData')
/** 
 * @param { import('discord.js').Events.InteractionCreate | import('discord.js').Events.MessageCreate } msg
 * @param { import('discord.js').Client } client
 */

module.exports = async ({msg, dm_list, placeButtons,ButtonBuilder,ButtonStyle}) => {

    if (!dm_list[msg.user.id]){
        await msg.reply('nie ma cie na liście')
        return false
    }
    
    let btns=[]
    for (i in dm_list[msg.user.id].list){

        e=dm_list[msg.user.id].list[i]
        let nm=idList[e.type][e.id].short
        if (e.groups.length!=0){nm+=` (${e.groups.join(', ')})`}
        console.log(nm)
        style=ButtonStyle.Secondary
        if (e.alert){style=ButtonStyle.Primary}

        btns.push(new ButtonBuilder()
            .setCustomId(`checkbox-alert-${i}`)
            .setLabel(nm)
            .setStyle(style)
            );
    }
    // zamknięcie edycji
        btns.push(new ButtonBuilder()
        .setCustomId('close')
        .setLabel("✔")
        .setStyle(ButtonStyle.Success)
    );

    placeButtons(btns,msg,'wybierz na których planach chcesz powiadomienia:')
}
