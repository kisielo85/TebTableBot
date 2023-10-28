const { createCanvas } = require("canvas");
const fs = require("fs");
const tableData=require('./tableData.js')
var hsl = require('hsl-to-hex')
var hexToHsl = require('hex-to-hsl');

//tab = JSON.parse(fs.readFileSync('sample_data/table.json', 'utf-8'))
//gen_png(tab)

f=tableData.find("4teip")
tableData.getTable(f.type,f.id).then(tab=>gen_png(tab))



function gen_png(table){
    const width = 1400;
    const height = 600;
    const cell_margin=2

    var step_y=height/5
    var step_x=width/10
    const canvas = createCanvas(width, height);
    const context = canvas.getContext("2d");
    context.fillStyle = '#fff';
    context.fillRect(0,0,width,height)

    lastday=1
    for (const c of table){
        if (c.type != 'card') continue
        day=new Date(c.date).getDay()-1
        var cell_y=height/5*day

        // długość lekcji
        var cell_width=step_x
        if (c.durationperiods){cell_width=step_x*c.durationperiods}
        

        // wysokość komórki
        var cell_height=step_y

        // jeśli wiele grup
        if (c.cellSlices){
            const c_count=c.cellSlices.length
            
            var count_h=0
            var count_top=0
            var hastop=false

            for (i=0; i< c_count; i++){
                if (c.cellSlices[i]=='1'){
                    count_h+=1
                    hastop=true
                }
                else if(!hastop){ count_top+=1 }
            }

            cell_y+=cell_height/c_count*count_top
            cell_height=cell_height/c_count*count_h
                
        }

        cell_width-=cell_margin
        cell_height-=cell_margin
        cell_y+=cell_margin
            
        // postawienie komórki
        const cell_x=(parseInt(c.uniperiod)-1)*step_x+cell_margin
        const cell_clr=hexToHsl(c.colors[0])
        l=cell_clr[2]
        while (l<=60){l+=(100-l)*0.4}
        context.fillStyle = hsl(cell_clr[0],cell_clr[1]*0.6,l);
        context.beginPath();
        context.strokeStyle = '#CCC';
        context.roundRect(cell_x, cell_y, cell_width, cell_height, [3]);
        context.fill()
        context.stroke();
        
        // nazwa przedmiotu
        context.fillStyle = '#000';
        context.font = "bold 16px sans-serif";
        var txt=tableData.idList.subjects[c.subjectid].short
        var size=context.measureText(txt)
        
        var txt_x=cell_x+cell_width/2-size.width/2
        var txt_y=cell_y+cell_height/2+size.emHeightAscent/2
        context.fillText(txt, txt_x, txt_y);

        // sala
        context.font = "13px sans-serif";
        txt=tableData.idList.classrooms[c.classroomids[0]].short
        size=context.measureText(txt)
        txt_x=cell_x+cell_width-size.width-2
        txt_y=cell_y+size.emHeightAscent
        context.fillText(txt, txt_x, txt_y);

        // nauczyciel
        txt=tableData.idList.teachers[c.teacherids[0]].short
        txt_x=cell_x+4
        txt_y=cell_y+cell_height-4
        context.fillText(txt, txt_x, txt_y);

        // grupy
        if (c.groupnames[0]!=''){
            txt=c.groupnames.join(', ')
            size=context.measureText(txt)
            txt_x=cell_x+4
            txt_y=cell_y+size.emHeightAscent
            context.fillText(txt, txt_x, txt_y);
        }
    }

    const buffer = canvas.toBuffer("image/png");
    fs.writeFileSync("./image.png", buffer);
}
