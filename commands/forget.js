const fs = require('fs')

module.exports = async ({msg, dm_list}) => {    
    delete dm_list[msg.user.id]
    fs.writeFileSync('./data/dmList.json', JSON.stringify(dm_list, null, 2))

    await msg.reply('usunięto cie z listy')
}
