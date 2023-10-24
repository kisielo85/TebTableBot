const simple = require('../SimpleFunctions.js')

async function test(){
    while(true){
        console.log(new Date())
        await simple.sleep(0, 0, 1)
    }
}test()
