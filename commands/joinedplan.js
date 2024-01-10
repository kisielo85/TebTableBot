const { ButtonBuilder, ButtonStyle } = require('discord.js')
const { idList } = require('../utils/tableData')

module.exports = async ({msg, dm_list, temp_list, placeButtons}) => {

    if (dm_list[msg.user.id].list.length==0){
        await msg.reply({
            content:'nie masz żadnych zapisanych planów\nużyj komendy ``/lekcje``', 
            ephemeral: true
        })
        return false
    }
    else if (dm_list[msg.user.id].list.length<2){
        await msg.reply({
            content:'musisz zapisać przynajmniej 2 plany',
            ephemeral: true
        })
        return false
    }

    temp_list[msg.user.id]={joined:[]}

    // plany do wyboru
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
