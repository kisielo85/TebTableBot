const { createCanvas } = require("canvas");
const fs = require("fs");
const tableData=require('./tableData.js')
var hsl = require('hsl-to-hex')
var hexToHsl = require('hex-to-hsl');
const { Console } = require("console");

/*f=tableData.find("4teip")
tab = JSON.parse(fs.readFileSync('sample_data/table.json', 'utf-8'))
tab.name=f.name; tab.type=f.type
tab=gen_group_table(tab,['progr'])
console.log(tab.name)
f=tableData.find("3tfr")
tableData.getTable(f.type,f.id).then(tab2=>{
    tab2=gen_group_table(tab2,['fot'])
    

    gen_double_png(tab2,tab).then(buffer=>fs.writeFileSync("./image.png", buffer))
})*/

//gen_png_with_group(tab,['progr','politech']).then(buffer=>fs.writeFileSync("./image.png", buffer))

//gen_png(tab,1).then(buffer=>fs.writeFileSync("./image.png", buffer))


/*
f=tableData.find("4teip")
tableData.getTable(f.type,f.id).then(tab=>
    gen_png_with_group(tab,f.name,f.type,['progr']).then(buffer=>
        fs.writeFileSync("./image.png", buffer)
        )
    )*/



// zwraca buffer z obrazem
function gen_png(table, double=0,canvas=false){
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

    if (double!=2){
        var canvas = createCanvas(full_w, full_h);
        var context = canvas.getContext("2d");
        context.fillStyle = '#fff';
        context.fillRect(0,0,full_w, full_h)

        // nazwa
        context.fillStyle = '#000'
        context.font = "40px sans-serif";
        var size=context.measureText(table.name)
        context.fillText(table.name, full_w/2-size.width/2, size.emHeightAscent);

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
        for (const p in tableData.idList.periods){
            period=tableData.idList.periods[p]
            var txt=`${period.starttime}-${period.endtime}`
            // grid 2
            context.moveTo(step_x*parseInt(p)+margin_left+1, margin_top);
            context.lineTo(step_x*parseInt(p)+margin_left+1, full_h);
            context.stroke();
            
    
            context.font = "bold 13px sans-serif";
            var size=context.measureText(txt)
            var txt_x=step_x*parseInt(p)-size.width/2+step_x/2+margin_left
            var txt_y=margin_top-2

            context.fillText(txt, txt_x, txt_y);

            context.font = "23px sans-serif";
            var size=context.measureText(p)
            var txt_x=step_x*parseInt(p)-size.width/2+step_x/2+margin_left
            var txt_y=margin_top-18
            context.fillText(parseInt(p), txt_x, txt_y);
            
            context.stroke()
        }
    }else {var context = canvas.getContext("2d");}

    for (const c of table){
        if (c.type != 'card') continue
        day=new Date(c.date).getDay()-1
        var cell_y=(step_y+margin_day)*day+margin_top+margin_day

        // długość lekcji
        var cell_width=step_x
        if (c.durationperiods){cell_width=step_x*c.durationperiods}
        

        // wysokość komórki
        var cell_height=step_y-margin_day

        if (double!=0){
            if (c.cellSlices){
                if (double==1){c.cellSlices=c.cellSlices+'0'.repeat(c.cellSlices.length)}
                else if(double==2){c.cellSlices='0'.repeat(c.cellSlices.length)+c.cellSlices}
            }
            else{
                if(double==1){c.cellSlices='10'}
                else {c.cellSlices='01'}
            }
        }
        
        // jeśli wiele grup
        if (c.cellSlices || double!=0 ){
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
        var font_size=23;
        context.font = `bold ${font_size}px sans-serif`;
        var txt=tableData.idList.subjects[c.subjectid].short
        var size=context.measureText(txt)
        // żeby test sie mieścił w komórce
        while(size.width >= cell_width || size.emHeightAscent >= cell_height){
            font_size-=1
            context.font = `bold ${font_size}px sans-serif`;
            size=context.measureText(txt)
        }
        var txt_x=cell_x+cell_width/2-size.width/2
        var txt_y=cell_y+cell_height/2+size.emHeightAscent/2
        context.fillText(txt, txt_x, txt_y);

        // sala
        context.font = "bold 14px sans-serif";
        if (table.type != 'classrooms'){
            txt=tableData.idList.classrooms[c.classroomids[0]].short
            size=context.measureText(txt)
            txt_x=cell_x+cell_width-size.width-2
            txt_y=cell_y+size.emHeightAscent
            context.fillText(txt, txt_x, txt_y);
        }

        // nauczyciel
        if (table.type != 'teachers'){
            txt=tableData.idList.teachers[c.teacherids[0]].short
            size=context.measureText(txt)
            if (table.type=='classrooms'){ txt_x=cell_x+cell_width-size.width-2}
            else { txt_x=cell_x+4 }
            txt_y=cell_y+cell_height-4
            context.fillText(txt, txt_x, txt_y);
        }
        
        // grupy
        if (c.groupnames[0] != ''){
            txt=c.groupnames.join(', ')
            size=context.measureText(txt)
            txt_x=cell_x+4
            txt_y=cell_y+size.emHeightAscent
            context.fillText(txt, txt_x, txt_y);
        }

        // klasa
        if (table.type != 'classes'){
            txt=tableData.idList.classes[c.classids[0]].short
            txt_x=cell_x+4
            txt_y=cell_y+cell_height-4
            context.fillText(txt, txt_x, txt_y);
        }
    }
    if (double==1) return canvas;
    return canvas.toBuffer("image/png");
}

// coś w stylu between
function b(num,from,to){return (num >= from && num <= to)}

function gen_group_table(table,groups){
    table.name += ' ('+groups.join(', ')+')'

    var last_gr={from:0, to:0, cards:[],date:''}

    const tab_len=table.length
    for(let c_id=0; c_id<=tab_len; c_id++){
        
        //jeśli koniec tablicy, to pomija wszystko oprócz ustawień komórek
        if (c_id!=tab_len){

            var c=table[c_id]
            if (c.type!='card'){ continue }

            // jeśli jest podział na grupy, decyduje czy skipnąć karte
            if (c.groupnames[0] != ''){
                skip=true

                // nie skipuje jeśli dopasuje grupe
                for (const g of c.groupnames){
                    if (groups.includes(g)){skip=false}
                }
                if (skip){table[c_id].type='skip'; continue}
            }

            c_time={from:parseInt(c.uniperiod),to: (c.durationperiods) ? parseInt(c.uniperiod)+c.durationperiods-1 : parseInt(c.uniperiod)}
        }
        
        // sprawdza czy pokrywa się z ostatnimi komórkami, dodaje do grupy
        if (c_id!=tab_len && (b(c_time.from,last_gr.from,last_gr.to)||b(c_time.to,last_gr.from,last_gr.to)||
            b(last_gr.from,c_time.from,c_time.to)||b(last_gr.to,c_time.from,c_time.to))){
            last_gr.cards.push(c_id)
        }else{// koniec grupy
            
            // czy jest wiele linii
            let len=0
            if (last_gr.cards[0] && table[last_gr.cards[0]].cellSlices){

                lines=[] // wstępne ustalenie liczby linii
                for (var i = 0; i < table[last_gr.cards[0]].cellSlices.length; i++) lines.push([])
                
                // dodanie komórek do linii
                for (const gr_c_id of last_gr.cards){
                    const gr_c=table[gr_c_id ]

                    for (const s in gr_c.cellSlices){
                        if (gr_c.cellSlices[s]==1){ lines[s].push(gr_c_id) }
                    }
                }

                // usuwanie pustych i powielonych linii
                for (l in lines){
                    for (l2 in lines){
                        if (l==l2 || JSON.stringify(lines[l]) != JSON.stringify(lines[l2])){ continue }
                        lines.splice(l2,1)
                    }
                    if (lines[l].length==0){lines.splice(l,1)}
                }

                // smoll poprawa dla komórek co są na sobie (zazwyczaj pol_obcy i rel)
                if (lines.length==1 && lines[0].length!=1){
                    temp=[]
                    for (const l_c_id of lines[0]){
                        temp.push([l_c_id])
                    }
                    lines=temp
                }

                // nadpisywanie cellSlices
                for (const l_id in lines){
                    for (const l_c_id of lines[l_id]){
                        table[l_c_id].cellSlices='0'.repeat(l_id)+'1'+'0'.repeat(lines.length-l_id-1)
                    }
                }

                if (c_id==tab_len){break}//koniec tablicy
            }
            last_gr.cards=[c_id] // rozpoczęcie nowej grupy komórek
        }
        
        // nadpisanie poprzedniej grupy komórek
        if (last_gr.to<c_time.to || last_gr.date!=c.date) last_gr.to=c_time.to
        last_gr.from=c_time.from
        last_gr.date=c.date
        
    }
    return table;
}

// przystosowuje plan do wybranych grup u zwraca obraz z gen_png()
async function gen_png_with_group(table,groups){
    table=gen_group_table(table,groups);
    return gen_png(table)
}

async function gen_double_png(table1,group1,table2,group2){
    if (group1.length!=0){table1 = gen_group_table(table1,group1)}
    if (group2.length!=0){table2 = gen_group_table(table2,group2)}

    table1.name+=' + '+table2.name
    return gen_png(table2,2,gen_png(table1,1))
}
module.exports = {
    gen_png,
    gen_png_with_group,
    gen_double_png,
    gen_group_table
};