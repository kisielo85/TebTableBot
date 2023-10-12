const config = require('./config.json')
const fs = require('fs');
const axios = require('axios');

// zwraca daty początku i końca aktualnego tygodnia
function getDate(next=false,oneDay=false){
  date = new Date();
  var out = {}
  out.year=date.getFullYear()
  if (next) date.setDate(date.getDate() + 7);

  function add0(x){ return String(x).padStart(2,'0') }

  // jeśli ma pobrać cały tydzień - bierze poniedziałek
  if (!oneDay)
    date.setDate(date.getDate() - date.getDay()+1);
  
  // od, do
  out.from=`${date.getFullYear()}-${add0(date.getMonth()+1)}-${add0(date.getDate())}`
  if (oneDay){ out.to = out.from }
  else{
    date.setDate(date.getDate() + 6);
    out.to=`${date.getFullYear()}-${add0(date.getMonth()+1)}-${add0(date.getDate())}`
  }
  console.log(out)
  return out
}


// zwraca tabele: classes, teachers, classrooms
async function getTable(tableName, id,nextWeek=false,oneDay=false){
  d=getDate(nextWeek,oneDay)
  const requestData = {
    __args:[ null,
      {
        "year": d.year,
        "datefrom": d.from,
        "dateto": d.to,
        "table": tableName,
        "id": String(id),
        "showColors": true,
        "showIgroupsInClasses": false,
        "showOrig": true
      }
  ], __gsh:"00000000"
  };

  const response = await axios.post('https://tebwroclaw.edupage.org/timetable/server/currenttt.js?__func=curentttGetData', requestData)
  return response.data.r.ttitems
}

// pobiera id klas, nauczycieli itp. do idList
// zapisuje klasy razem z grupami w classes
idList={}
classes={}
async function loadInitialData(){
  d=getDate()
  const requestData = {
    __args:['null',d.year,{
      "vt_filter":{
        "datefrom":d.from,
        "dateto":d.to
      }},
      {"op":"fetch","needed_part":{"teachers":["short"],"classes":["short","name"],"classrooms":["short"],"subjects":["short","name"]}}]
    , __gsh:"00000000"
  };

    const response = await axios.post('https://tebwroclaw.edupage.org/rpr/server/maindbi.js?__func=mainDBIAccessor', requestData)
    
    // tabele z danymi: teachers / subjects / classrooms / classes    
    for (const table of response.data.r.tables){
        idList[table.id]={}

        for (const row of table.data_rows){
            idList[table.id][row.id]={short:row.short}
            if (row.name)
                idList[table.id][row.id].name=row.name
        }
    }

    // zapis wszystkich klas z podziałem na roczniki
    for (const c in idList.classes){
        n=idList.classes[c].short
        process.stdout.write(n+' ');
        
        //rocznik
        r=n[0]
        if (!classes[r]) classes[r]=[]

        // pobieranie grup w klasie
        cards=await getTable("classes",c)
        groups=[]
        for (const c of cards){
            for (const g of c.groupnames){
                if (g!='' && !groups.includes(g))
                    groups.push(g)
            }
        }

        classes[r].push({
            id:c,
            short:n,
            name:idList.classes[c].name,
            groups:groups
        })
    }
}

if (!config.debug){
  loadInitialData().then( ()=>{
    //fs.writeFileSync('sample_data/idList.json', JSON.stringify(idList, null, 2))
    //fs.writeFileSync('sample_data/classes.json', JSON.stringify(classes, null, 2))
  })
}else{
  classes = JSON.parse(fs.readFileSync('sample_data/classes.json', 'utf-8'))
  idList = JSON.parse(fs.readFileSync('sample_data/idList.json', 'utf-8'))
}

module.exports = {
  classes,
  idList
};

// szuka klasy/nauczyciela
async function where(name){
  
  // szukanie po nauczycielach, klasach, salach
  found={}
  for (const type in idList){
    if (!['teachers', 'classes', 'classrooms'].includes(type)) continue

    for (id in idList[type]){
      short=idList[type][id].short.toLowerCase()
      nm=name.toLowerCase()

      // jeśli bez literki F lub H, to też wyszuka
      if (short==nm || (type=='classrooms' && (short.slice(0, -1) == nm))){
        found.id=id
        found.type=type
        if (idList[type][id].name){ found.name=idList[type][id].name }
        else {found.name=idList[type][id].short}
        break
      }
    }
  }
  if (found=={}) return false

  // pobieranie planu
  getTable(found.type,found.id,false,true).then(a=>
    console.log(a)
  )
}