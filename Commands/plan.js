/** @param {import('discord.js').Events.InteractionCreate | import('discord.js').Events.InteractionCreate} msg */
const pngCreate = require('../Other/pngCreate.js')

module.exports = async ({msg, tableData}) => {
    find_str = msg.options.get('_').value
    info = await tableData.find(find_str)
    
    if (info){
        tab = await tableData.getTable(info.type,info.id)
        buffer = await pngCreate.gen_png(tab,tab.name);

        msg.reply({files: [
            { attachment: buffer }
        ]})
    }

    else msg.reply({content: `sorry, nie znalazłem "${find_str}"`, ephemeral: true})
}