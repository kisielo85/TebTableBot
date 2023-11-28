/** @param {import('discord.js').Events.InteractionCreate | import('discord.js').Events.MessageCreate} msg */
module.exports = async ({msg, client}) => {
    if(msg.channel.type != 1)// sprawdza czy kanał to dm 
        await msg.reply({
            content: "check dm", 
            ephemeral: true,
        }).then(tmsg => {setTimeout(() => tmsg.delete(), 3000)})
    let time = Date.now();
    await msg.user.send({
        content: `Pong! recive time ${Date.now() - msg.createdTimestamp}ms API ${client.ws.ping}ms`, 
        ephemeral: true,
    })
    await msg.user.send({
        content: `send time ${Date.now() - time}ms`, 
        ephemeral: true,
    })
}