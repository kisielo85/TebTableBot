const { idList } = require('../utils/tableData')
const { ButtonBuilder, ButtonStyle} = require("discord.js");

module.exports = async ({msg, dm_list, placeButtons}) => {

    if (dm_list[msg.user.id].list.length == 0){
        await msg.reply('nie masz zapisanych planów')
        return false
    }
    
    let btns=[]
    for (i in dm_list[msg.user.id].list){

        e=dm_list[msg.user.id].list[i]
        let nm=idList[e.type][e.id].short
        if (e.groups.length!=0){nm+=` (${e.groups.join(', ')})`}

        btns.push(new ButtonBuilder()
            .setCustomId(`checkbox-del-${i}`)
            .setLabel(nm)
            .setStyle(ButtonStyle.Secondary)
            );
    }
    // zamknięcie edycji
        btns.push(new ButtonBuilder()
        .setCustomId('accept-del')
        .setLabel("✔")
        .setStyle(ButtonStyle.Success)
    );

    // jeśli komenda była wywołana na serwerze
    await placeButtons(btns,msg,
    content = 'wybierz plany do usunięcia:',
    reply = true,
    guild_msg = `wysłano dm z wyborem planów do usunięcia`)
}