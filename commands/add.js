const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js')

module.exports = async ({msg}) => {
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