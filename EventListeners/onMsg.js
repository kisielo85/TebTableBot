let { client } = require('../index.js')

client.on('messageCreate', msg => {
    if(msg.content === '!test'){
        const { createCanvas, loadImage } = require('canvas')
        const canvas = createCanvas(200, 200)
        const ctx = canvas.getContext('2d')
        const fs = require('fs')

        // Write "Awesome!"
        ctx.font = '30px Sans'
        ctx.rotate(0.1)
        ctx.fillText('Awesome!', 50, 100)

        // Draw line under text
        var text = ctx.measureText('Awesome!')
        ctx.strokeStyle = 'rgba(0,0,0,0.5)'
        ctx.beginPath()
        ctx.lineTo(50, 102)
        ctx.lineTo(50 + text.width, 102)
        ctx.stroke()

        // Draw cat with lime helmet
        loadImage('./lime-cat.jpg').then((image) => {
        ctx.drawImage(image, 50, 0, 70, 70)
        msg.reply({files:[canvas.toBuffer()]})
        })
    }
})