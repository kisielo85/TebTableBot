let { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js')

/** @param {import('discord.js').Events.InteractionCreate | import('discord.js').Events.MessageCreate} msg */
module.exports = async (msg) => {
    let klasyButtons = [];
    
    for(let i = 1; i <= 5; i++){
        klasyButtons.push(new ButtonBuilder()
            .setCustomId('r-'+i)
            .setLabel(''+i)
            .setStyle(ButtonStyle.Secondary));
    }
    
    const row = new ActionRowBuilder()
        .addComponents(klasyButtons);
    await msg.reply({
        content: `Wybierz rocznik by dostać wybrane powiadomienia`,
        components: [row]
    });
    return true
}



