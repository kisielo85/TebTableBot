const { idList } = require('../utils/tableData')
const { ButtonBuilder, ButtonStyle} = require("discord.js");

module.exports = async ({msg, dm_list, placeButtons}) => {

    if (!dm_list[msg.user.id]){
        await msg.reply('nie ma cie na liście')
        return false
    }
    
    let btns=[]
    for (i in dm_list[msg.user.id].list){

        e=dm_list[msg.user.id].list[i]
        let nm=idList[e.type][e.id].short
        if (e.groups.length!=0){nm+=` (${e.groups.join(', ')})`}
        
        // sprawdzenie czy włączony alert
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
        .setCustomId('accept-alert')
        .setLabel("✔")
        .setStyle(ButtonStyle.Success)
    );

    
    // jeśli komenda była wywołana na serwerze
    await placeButtons(btns,msg,
        content = 'wybierz na których planach chcesz powiadomienia:',
        reply = true,
        guild_msg = `wysłano dm z ustawieniami powiadomień`)
}
