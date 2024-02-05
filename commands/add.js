const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js')
const fs = require('fs')

module.exports = async ({msg, dm_list, tableData}) => {

    // podano plan do wyszukania
    if (msg.options.get('find')){
        find_str = msg.options.get('find').value

        info = await tableData.find(find_str)
        // nie znalazło
        if (!info){
            msg.reply(
                {content: `sorry, nie znalazłem "${find_str}"`,
                ephemeral: true
            })
            return false
        }

        // znalazło
        dm_list[msg.user.id].list.push(
            {
                "id":info.id,
                "type": info.type,
                "groups":[]
            }
        )
        fs.writeFileSync('./data/dmList.json', JSON.stringify(dm_list, null, 2))
        msg.reply(
            {content: `dodano "${info.name}" do listy`,
            ephemeral: true
        })
        return true


    }
    // nie podano planu
    else {
        let klasyButtons = [];
        
        for(let i = 1; i <= 5; i++){
            klasyButtons.push(new ButtonBuilder()
                .setCustomId('r-'+i)
                .setLabel(''+i)
                .setStyle(ButtonStyle.Secondary));
        }
        
        const row = new ActionRowBuilder()
            .addComponents(klasyButtons);
        
        const data={
            content: `Wybierz rocznik`, 
            components: [row]
        }
        
        // jeśli komenda była wywołana na serwerze
        if (msg.guild != null){
            await msg.user.send(data);

            await msg.reply({content: `Wysłano dm z wyborem klasy`, ephemeral: true});
        }
        else{ await msg.reply(data) }
    }

}