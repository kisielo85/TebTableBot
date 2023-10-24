async function sleep(ms = 0, sec = 0, min = 0, h = 0, days = 0){
    return new Promise( resolve => setTimeout(resolve, ms + (sec * 1000) + ((min * 1000) * 60)) + (((h * 1000) * 60)*60) + ((((h * 1000) * 60)*60) * 24))
}

module.exports = {
    sleep
}