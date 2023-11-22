const simple = require('../SimpleFunctions.js')
const tableData = require('./tableData.js')

/** 
 * @param {import('./dmList.json')} dm_list
 * @param {import('discord.js').Client} client
*/

module.exports = async (client, dm_list, tableData) => {

    let currentTime = new Date();
    let timeIndex = 0;

    for(let a of Object.keys(tableData.idList.periods)){

        let [hours, minutes] = tableData.idList.periods[a].endtime.split(':');
        hours = parseInt(hours); minutes = parseInt(minutes);

        if(!(hours + (minutes / 100) <= currentTime.getHours() + (currentTime.getMinutes() / 100))){
            timeIndex = parseInt(a);
            break
        }
    }
    
    while(true){
        currentTime = new Date();

        [hours, minutes] = tableData.idList.periods[timeIndex].endtime.split(':');
        hours = parseInt(hours); minutes = parseInt(minutes);

        console.log(((hours - currentTime.getHours()) * 60 * 60 + (minutes - currentTime.getMinutes()) * 60 - currentTime.getSeconds()), timeIndex)
        
        // jeśli są dzisiaj lekcje
        if(timeIndex < 10){
            await simple.sleep(((hours - currentTime.getHours()) * 60 * 60 + (minutes - currentTime.getMinutes()) * 60 - currentTime.getSeconds()) * 1000)
                timeIndex = timeIndex + 1
                for(let user_id of Object.keys(dm_list)){ // co usera z dmlist
                    if(!dm_list[user_id].alert){continue}
                    let message = ''
                    let toSend
                    
                    for(let plan of dm_list[user_id].list){ // 
                        for(const c of await tableData.getTable(plan.type, plan.id, true)){
                            if(parseInt(c.uniperiod) != timeIndex){continue}
                            let sent = []
                            
                            for(let g of c.groupnames){
                                if(plan.groups && plan.groups.includes(g) && !sent.includes(c.groupnames)){
                                    toSend = await client.users.fetch(user_id)
                                    sent.push(c.groupnames)
                                    message += `klasa **${tableData.idList[plan.type][plan.id].short}** grupa **${c.groupnames.join(', ')}** sala **${tableData.idList.classrooms[c.classroomids[0]].short}** o **${c.starttime}**` + "\n"
                                }
                            }
                        }
                    }
                    if(toSend)
                        await toSend.send(message)                        
                }
        }else{
            console.log("beep")
            timeIndex = 0
            await simple.sleep(((23 - currentTime.getHours()) * 60 + (60 - currentTime.getMinutes()) + 20) * 60 * 1000)
        }
    }
}
