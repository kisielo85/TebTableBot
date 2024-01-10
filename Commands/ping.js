module.exports = async ({msg, client}) => {
    let time = Date.now();
    await msg.reply({
        content: `Pong! recive time ${Date.now() - msg.createdTimestamp}ms API ${client.ws.ping}ms`
    })
    await msg.channel.send({
        content: `Send time ${Date.now() - time}ms`
    })
}