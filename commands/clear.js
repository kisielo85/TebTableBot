
let deleting = {}
module.exports = async ({msg, client}) => {
    if(!deleting[msg.user.id]){
        await msg.reply('clearing...');
        
        deleting[msg.user.id] = await msg.channel.messages.fetch({'limit':100})

        for(let a of deleting[msg.user.id]){
            if (a[1].author.id == client.user.id)
                await a[1].delete()
        }
        
        delete deleting[msg.user.id];

    }else{
        await msg.reply("already deleting")
    }
}