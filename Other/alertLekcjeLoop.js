const simple = require('../SimpleFunctions.js')
const tableData = require('./tableData.js')

/** 
 * @param {import('./dmList.json')} dm_list
 * @param {import('discord.js').Client} client
*/

module.exports = async (client, dm_list) => {

    //console.log(tableData.idList)

    let currentTime = new Date();
    let timeIndex = 0;

    for(let a of Object.keys(tableData.idList.periods)){

        let [hours, minutes] = tableData.idList.periods[a].endtime.split(':');
        hours = parseInt(hours); minutes = parseInt(minutes);

        if(!(hours + (minutes / 100) <= currentTime.getHours() + (currentTime.getMinutes() / 100))){
            timeIndex = parseInt(a)
            break
        }
    }

    while(true){
        currentTime = new Date();

        [hours, minutes] = tableData.idList.periods[timeIndex].endtime.split(':');
        hours = parseInt(hours); minutes = parseInt(minutes);

        //console.log(((hours - currentTime.getHours()) * 60 * 60 + (minutes - currentTime.getMinutes()) * 60 - currentTime.getSeconds()), timeIndex)
        await simple.sleep(((hours - currentTime.getHours()) * 60 * 60 + (minutes - currentTime.getMinutes()) * 60 - currentTime.getSeconds()) * 1000)
        
            timeIndex = timeIndex + 1 <= 10 ? timeIndex + 1 : 0 
            for(let a of Object.keys(dm_list)){
                if(dm_list[a].alert){
                    //for()
                    //var toSend = await client.users.fetch(a)
                    //await toSend.send('nowa lekcja uppi')
                }
            }
    }
}
