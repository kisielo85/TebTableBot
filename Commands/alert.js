const fs = require('fs')
/** 
 * @param { import('discord.js').Events.InteractionCreate | import('discord.js').Events.MessageCreate } msg
 * @param { import('discord.js').Client } client
 */

module.exports = async ({msg, dm_list}) => {

    if (!dm_list[msg.user.id]){
        await msg.reply('nie ma cie na liście')
        return false
    }
    
    dm_list[msg.user.id].alert = !dm_list[msg.user.id].alert

    if(dm_list[msg.user.id].alert)
        await msg.reply('masz powiadomienia wariacie')
    else
        await msg.reply('już cie nie powiadamiam wariacie')

    fs.writeFileSync('./Other/dmList.json', JSON.stringify(dm_list, null, 2))
}
