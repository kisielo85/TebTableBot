/** @param {import('discord.js').Events.InteractionCreate | import('discord.js').Events.MessageCreate} msg */
module.exports = async ({msg}) => {
    await msg.reply({
        content: 'zapraszamy https://discord.gg/HYazSHbkHk', 
        ephemeral: true,
    });
}