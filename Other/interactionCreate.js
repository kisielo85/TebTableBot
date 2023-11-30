const { ApplicationCommandOptionType } = require("discord.js");
module.exports = async (client) => {
    await client.application.commands.create({
        name: 'lekcje',
        description: 'możesz sie dodać do listy by mieć powiadomienia o twoim planie lekcji',
    });

    await client.application.commands.create({
        name: 'stop',
        description: 'możesz sie usunąć z listy powiadomień'
    });
    
    await client.application.commands.create({
        name: 'ping',
        description: 'czy żyje'
    });

    await client.application.commands.create({
        name: 'where',
        description: 'znajdź klase lub nauczyciela',
        options: [
            {
                name: 'find',
                description: 'wpisz klase, sale lub nauczyciela do wyszukania',
                type:ApplicationCommandOptionType.String,
                required: true
            }
        ]
    });

    await client.application.commands.create({
        name: 'list',
        description: 'wyświetl zapisane plany',
    });

    await client.application.commands.create({
        name: 'plan',
        description: 'wygeneruj plan',
        options: [
            {
                name: 'plan',
                description: 'wpisz czyj plan wygenerować',
                type:ApplicationCommandOptionType.String,
                required: false
            }
        ]
    });

    await client.application.commands.create({
        name: 'clear',
        description: 'usuń wiadomości bota'
    });

    await client.application.commands.create({
        name: 'alert',
        description: 'powiadomienia o następnej lekcji co przerwe'
    });

    await client.application.commands.create({
        name: 'joinedplan',
        description: 'wygeneruj plan 2 w jednym'
    });

    await client.application.commands.create({
        name: 'discord',
        description: 'daje link do głównego discorda',
    });
}