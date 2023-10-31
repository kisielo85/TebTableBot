const { createCanvas } = require("canvas");
const fs = require("fs");
const tableData=require('./tableData.js')
var hsl = require('hsl-to-hex')
var hexToHsl = require('hex-to-hsl');

//tab = JSON.parse(fs.readFileSync('sample_data/table.json', 'utf-8'))
//gen_png(tab,'4Teip Technikum','classes')

f=tableData.find("ak")
tableData.getTable(f.type,f.id).then(tab=>gen_png(tab,f.name,f.type))

async function gen_png(table,name,type){
    const width = 1400;
    const height = 700;
    const cell_margin=2
    const margin_left=40
    const margin_top=90
    const margin_day=2

    const step_y=height/5
    const step_x=width/11

    const full_w=width+margin_left
    const full_h=height+margin_top+margin_day*5

    const canvas = createCanvas(full_w, full_h);
    const context = canvas.getContext("2d");
    context.fillStyle = '#fff';
    context.fillRect(0,0,full_w, full_h)

    // nazwa
    context.fillStyle = '#000'
    context.font = "40px sans-serif";
    var size=context.measureText(name)
    context.fillText(name, full_w/2-size.width/2, size.emHeightAscent);


    // dni tygodnia
    var iter=0
    context.font = "bold 20px sans-serif";
    for (const txt of ['Po','Wt','Śr','Cz','Pt']){
        //grid
        context.beginPath()
        context.strokeStyle = '#EEE';
        context.moveTo(0, (step_y+margin_day)*iter+margin_top+1);
        context.lineTo(full_w, (step_y+margin_day)*iter+margin_top+1);
        context.stroke()

        var size=context.measureText(txt)
        
        var txt_x=margin_left/2-size.width/2
        var txt_y=(step_y+margin_day)*iter+size.emHeightAscent/2+step_y/2+margin_top
        context.fillText(txt, txt_x, txt_y);
        iter+=1
    }
    context.stroke()

    // godziny
    iter=0
    for (const txt of ['7:10-7:55','8:00-8:45','8:50-9:35','9:45-10:30','10:40-11:25','11:35-12:20','12:40-13:25','13:30-14:15','14:25-15:10','15:15-16:00','16:05-16:50']){
        // grid 2
        context.moveTo(step_x*iter+margin_left+1, margin_top);
        context.lineTo(step_x*iter+margin_left+1, full_h);
        context.stroke();
        
 
        context.font = "bold 13px sans-serif";
        var size=context.measureText(txt)
        var txt_x=step_x*iter-size.width/2+step_x/2+margin_left
        var txt_y=margin_top-2

        context.fillText(txt, txt_x, txt_y);

        context.font = "23px sans-serif";
        var size=context.measureText(iter.toString())
        var txt_x=step_x*iter-size.width/2+step_x/2+margin_left
        var txt_y=margin_top-18
        context.fillText(iter.toString(), txt_x, txt_y);
        
        context.stroke()
        
        iter+=1
    }

    lastday=1
    for (const c of table){
        if (c.type != 'card') continue
        day=new Date(c.date).getDay()-1
        var cell_y=(step_y+margin_day)*day+margin_top+margin_day

        // długość lekcji
        var cell_width=step_x
        if (c.durationperiods){cell_width=step_x*c.durationperiods}
        

        // wysokość komórki
        var cell_height=step_y-margin_day

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
        const cell_x=(parseInt(c.uniperiod))*step_x+cell_margin+margin_left
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
        context.fillStyle = '#222';
        context.font = "bold 19px sans-serif";
        var txt=tableData.idList.subjects[c.subjectid].short
        var size=context.measureText(txt)
        
        var txt_x=cell_x+cell_width/2-size.width/2
        var txt_y=cell_y+cell_height/2+size.emHeightAscent/2
        context.fillText(txt, txt_x, txt_y);

        // sala
        context.fillStyle = '#222';
        context.font = "bold 14px sans-serif";
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