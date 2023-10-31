const simple = require('../SimpleFunctions.js')
/*
async function test(){
    while(true){
        console.log(new Date())
        await simple.sleep(0, 0, 1)
    }
}test()
*/

/** 
 * @param { import('discord.js').Events.InteractionCreate | import('discord.js').Events.MessageCreate } msg
 * @param { import('discord.js').Client } client
 */

// jezeli client jest nie potrzebny to usun
module.exports = async ({msg, client}) => {

    return true
}
