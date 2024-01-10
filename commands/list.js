module.exports = async ({msg, dm_list,tableData}) => {

    if (dm_list[msg.user.id].list.length==0){
        await msg.reply({
            content:'nie masz żadnych zapisanych planów\nużyj komendy ``/lekcje``', 
            ephemeral: true
        })
        return false
    }

    let out=""
    var list=dm_list[msg.user.id].list
    for (p of list){
        nm=tableData.idList[p.type][p.id].short
        if (p.groups.length > 0){
            out+=`${nm}: ${p.groups.join(',')}\n`
        }
        else{ out+=`${nm}\n` }
    }
    msg.reply({content: `**lista twoich zapisanych planów**\n${out}`, ephemeral: true})
}