const fs = require('fs')
/** @param {import('discord.js').Events.InteractionCreate | import('discord.js').Events.MessageCreate} msg */
module.exports = async (msg, dm_list) => {
    if (!dm_list[msg.user.id]){
        await msg.reply('nie ma cie na liście')
        return dm_list
    }
    
    delete dm_list[msg.user.id]
    console.log("SAVE:",dm_list)
    fs.writeFileSync('./dmList.json', JSON.stringify(dm_list))

    await msg.reply('usunięto cie z listy')

    return dm_list
}
