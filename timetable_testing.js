const axios = require('axios');

// zwraca daty początku i końca aktualnego tygodnia
function getDate(next=false){
  date = new Date();
  var out = {}
  out.year=date.getFullYear()
  if (next) date.setDate(date.getDate() + 7);

  function add0(x){ return String(x).padStart(2,'0') }

  //poczatek tygodnia
  date.setDate(date.getDate() - date.getDay()+1);
  // od, do
  out.from=`${date.getFullYear()}-${add0(date.getMonth()+1)}-${add0(date.getDate())}`
  date.setDate(date.getDate() + 6);
  out.to=`${date.getFullYear()}-${add0(date.getMonth()+1)}-${add0(date.getDate())}`

  return out
}



// zwraca tabele: classes, teachers, classrooms
function getTable(tableName, id){
  d=getDate()
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

  axios.post('https://tebwroclaw.edupage.org/timetable/server/currenttt.js?__func=curentttGetData', requestData)
    .then(response => {
      return response.data.r.ttitems
    })
    .catch(error => {
      console.error('Błąd:', error);
    });
}

// pobiera id klas, nauczycieli itp. do idList
idList={}
function loadIdList(){
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

  axios.post('https://tebwroclaw.edupage.org/rpr/server/maindbi.js?__func=mainDBIAccessor', requestData)
    .then(response => {
      // tabele z danymi: teachers / subjects / classrooms / classes
      for (const table of response.data.r.tables){
        idList[table.id]={}

        for (const row of table.data_rows){
          idList[table.id][row.id]={short:row.short}
          if (row.name)
            idList[table.id][row.id].name=row.name
        }

      }
      console.log(idList)
    })
    .catch(error => {
      console.error('Błąd:', error);
    });
}
loadIdList()

/*
  -43 1Lep
  -44 1Lgm
  -45 1Lk
  -35 1Te
  -36 1Tf
  -37 1Ti
  -38 1Tp
  -39 1Tr
  -40 1Tsa
  -41 1Tsb
  -42 1Tw
  -20 2Tei
  -23 2Ter
  -21 2Tf
  -22 2Tp
  -24 2Ts
  -1 3Tea
  -2 3Teb
  -3 3Tfr
  -4 3Tiw
  -5 3Tp
  -7 4Teip
  -25 4Tew
  -8 4Tf
  -27 5Te/5
  -28 5Tew/5
  -29 5Tfi/5
*/
