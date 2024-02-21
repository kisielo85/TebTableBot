module.exports = async ({msg, client}) => {
    commands = await client.application.commands.fetch()
    
    await msg.reply({ content:'\
    ```/add```zapisz plany lekcji które cie interesują.\
    działa dla klas, sal i nauczycieli\
    np. `/add find:AK`\
    *bez argumentu:*\
    włącza wybór klasy i grupy\
    \n\n```/list```wyświetla zapisane plany lekcji\
    \n\n```/del```usuwa zapisane plany\
    \n\n```/alert```włącz lub wyłącz powiadomienia o następnej lekcji\
    po włączeniu - 5 minut przed każdą przerwą dostaniesz wiadomość gdzie jest następna lekcja\
    \n\n```/where```szybko sprawdź gdzie teraz jest dany nauczyciel lub klasa\
    np. `/where find:4teip`\
    \n\n```/plan```generuje png wybranego planu lekcji\
    np. `/plan find:4teip`\
    *bez argumentu:*\
    otwiera wybór z zapisanych planów\
    \n\n```/joinedplan```stwórz pojedyńczy png z dwóch wcześniej zapisanych planów\
    \n\n```/forget```całkowicie usuwa cię z pamięci bota\
    \n\n```/clear```usuwa wiadomości bota\
    \n\n```/discord```daje link do naszego serwera discord\
    \n\n```/ping```ping', ephemeral: true });
}