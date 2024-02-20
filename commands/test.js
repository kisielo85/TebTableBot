module.exports = async ({msg}) => {
    let rand = Math.floor(Math.random()*10)
    if(rand == 1){
        msg.channel.send("https://static.wikia.nocookie.net/nicos-nextbots-fanmade/images/7/7c/Uncannyclose.png/revision/latest?cb=20230629050427").then(msg => setTimeout(() => msg.delete(), 200))
    }
}