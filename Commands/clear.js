/** @param {import('discord.js').Events.InteractionCreate | import('discord.js').Events.MessageCreate} msg */
module.exports = async (msg, clientId) => {
    await msg.reply('clearing...');
    const messages = await msg.channel.messages.fetch({'limit':50})
    messages.forEach(async msg => {
        if (msg.author.id == clientId)
            await msg.delete()
    })
}