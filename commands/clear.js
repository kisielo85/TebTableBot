const { sleep } = require("../utils/simpleFunctions");

let deleteing = {}
module.exports = async ({msg, client}) => {
    if(!deleteing[msg.user.id]){
        await msg.reply('clearing...');
        
        deleteing[msg.user.id] = await msg.channel.messages.fetch({'limit':100})

        for(let a of deleteing[msg.user.id]){
            console.log(a[1])
            
            if (a[1].author.id == client.user.id)
                await a[1].delete()
        }
        
        delete deleteing[msg.user.id];

    }else{
        await msg.reply("already deleting")
    }
}