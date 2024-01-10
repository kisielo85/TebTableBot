const fs = require('fs')

module.exports = async ({msg, dm_list}) => {
    if (!dm_list[msg.user.id]){
        await msg.reply('nie ma cie na liście')
        return dm_list
    }
    
    delete dm_list[msg.user.id]
    fs.writeFileSync('./data/dmList.json', JSON.stringify(dm_list, null, 2))

    await msg.reply('usunięto cie z listy')
}
