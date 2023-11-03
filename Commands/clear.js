/** 
 * @param {import('discord.js').Events.InteractionCreate | import('discord.js').Events.MessageCreate} msg 
 * @param {import('discord.js').Client} client
*/

module.exports = async ({msg, client}) => {
    await msg.reply('clearing...');
    const messages = await msg.channel.messages.fetch({'limit':50})
    messages.forEach(async msg => {
        if (msg.author.id == client.user.id)
            await msg.delete()
    })
}