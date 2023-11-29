const simple = require('../SimpleFunctions.js')
const tableData = require('./tableData.js')

/** 
 * @param {import('./dmList.json')} dm_list
 * @param {import('discord.js').Client} client
*/

var test = 'August 19, 1975 13:19:58'

module.exports = async (client, dm_list, tableData) => {
    let currentTime = new Date();

    // aktualna lekcja
    let timeIndex = 0;
    for(let period of Object.values(tableData.idList.periods)){
        let [hours, minutes] = period.starttime.split(':');

        if (currentTime.getHours()*60+currentTime.getMinutes() >= parseInt(hours)*60+parseInt(minutes)){
            timeIndex=parseInt(period.id)
        }
        else {break}
    }

    while(true){
        currentTime = new Date();

        [hours, minutes] = tableData.idList.periods[timeIndex].endtime.split(':');
        hours = parseInt(hours); minutes = parseInt(minutes)

        // 5min przed końcem lekcji
        var waitTime=(hours - currentTime.getHours()) * 60 * 60 + (minutes - currentTime.getMinutes() - 5) * 60 - currentTime.getSeconds()
        if (waitTime<0){timeIndex++; continue}
        console.log(waitTime, timeIndex)
        
        // jeśli są dzisiaj lekcje
        if(timeIndex < 10){
            await simple.sleep(waitTime * 1000)
            timeIndex++
            
            // co usera z dmlist
            for(let user_id of Object.keys(dm_list)){
                let message = ''
                let toSend = false
                if(dm_list[user_id] && dm_list[user_id].list)
                    for(let plan of dm_list[user_id].list){
                        if(!plan.alert){continue}
                        for(const c of await tableData.getTable(plan.type, plan.id, true)){
                            if(parseInt(c.uniperiod) != timeIndex){continue}
                            let sent = []
                            
                            for(let g of c.groupnames){
                                if(plan.groups && (plan.groups.includes(g) || g == '') && !sent.includes(c.groupnames)){
                                    toSend = await client.users.fetch(user_id)
                                    sent.push(c.groupnames)
                                    
                                    message+=`${tableData.idList[plan.type][plan.id].short}` //klasa
                                    if (g!=''){ message+=` (${plan.groups.join(', ')})`} //grupa
                                    message+=`:  ${tableData.idList.subjects[c.subjectid].name} ${tableData.idList.classrooms[c.classroomids[0]].short}   ${c.starttime} - ${c.endtime}\n` //przedmiot, klasa, godzina
                                }
                            }
                        }
                    }
                if(toSend)
                    await toSend.send(message)                        
            }
        }else{
            timeIndex = 0
            await simple.sleep(((23 - currentTime.getHours()) * 60 + (60 - currentTime.getMinutes()) + 20) * 60 * 1000)
        }
    }
}
