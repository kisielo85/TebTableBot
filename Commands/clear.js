module.exports = async ({msg, client}) => {
    await msg.reply('clearing...');
    const messages = await msg.channel.messages.fetch({'limit':50})
    messages.forEach(async msg => {
        if (msg.author.id == client.user.id)
            await msg.delete()
    })
}