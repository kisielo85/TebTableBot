const tableData = require('../tableData.js');

/** @param {import('discord.js').Events.InteractionCreate | import('discord.js').Events.InteractionCreate} msg */
module.exports = async (msg) => {
    find_str = msg.options.get('find').value
    info = await tableData.where(find_str)

    if (info) msg.reply({content: info, ephemeral: true})
    else msg.reply({content: `sorry, nie znalazłem "${find_str}"`, ephemeral: true})
}