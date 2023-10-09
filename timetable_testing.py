import requests
import json

# pobiera id: sal / przedmiotów / nauczycieli
#             classrooms / subjects / teachers
idList={}
def loadIdList():    
    s = requests.session()
    data=s.post("https://tebwroclaw.edupage.org/rpr/server/maindbi.js",
        params={"__func": "mainDBIAccessor"},
        json={"__args":['null',2023,{"vt_filter":{"datefrom":"2023-10-09","dateto":"2023-10-15"}},{"op":"fetch","needed_part":{"teachers":["short","name","firstname","lastname","subname","code","cb_hidden","expired","firstname","lastname","short"],"classes":["short","name","firstname","lastname","subname","code","classroomid"],"classrooms":["short","name","firstname","lastname","subname","code","name","short"],"igroups":["short","name","firstname","lastname","subname","code"],"students":["short","name","firstname","lastname","subname","code","classid"],"subjects":["short","name","firstname","lastname","subname","code","name","short"],"events":["typ","name"],"event_types":["name","icon"],"subst_absents":["date","absent_typeid","groupname"],"periods":["short","name","firstname","lastname","subname","code","period","starttime","endtime"],"dayparts":["starttime","endtime"],"dates":["tt_num","tt_day"]},"needed_combos":{}}],"__gsh":"00000000"}, cookies={"PHPSESSID": "7fedf3d7028d9fba6394096c1fc8fb75"})

    data=json.loads(data.content)
    global idList

    # tabele ze skrótami
    for table in data['r']['tables']:
        
        if not 'data_rows' in table: continue
        idList[table['id']]={}
        
        #zapisywanie skrótu i ID do idList
        for row in table['data_rows']:
            if (not 'short' in row) or (not 'id' in row): continue
            idList[table['id']][row['id']]=row['short']

loadIdList()

def getClassTable(classId):
    s = requests.session()
    response = s.post(
        "https://tebwroclaw.edupage.org/timetable/server/currenttt.js",
        params={"__func": "curentttGetData"},
        json={"__args":['null',{"year":2023,"datefrom":"2023-10-09","dateto":"2023-10-15","table":"classes","id":classId}],"__gsh":"00000000"})
    
    return json.loads(response.content)['r']['ttitems']

cards=getClassTable('-7')

for c in cards:
    print(f"przedmiot: {idList['subjects'][c['subjectid']]}")
    print(f"lekcja {c['uniperiod']}. {c['starttime']} - {c['endtime']}")
    print(f"nauczyciel: {idList['teachers'][c['teacherids'][0]]}")
    print(f"sala: {idList['classrooms'][c['classroomids'][0]]}")
    print(f"grupy: {c['groupnames']}\n\n")

# -43 1Lep
# -44 1Lgm
# -45 1Lk
# -35 1Te
# -36 1Tf
# -37 1Ti
# -38 1Tp
# -39 1Tr
# -40 1Tsa
# -41 1Tsb
# -42 1Tw
# -20 2Tei
# -23 2Ter
# -21 2Tf
# -22 2Tp
# -24 2Ts
# -1 3Tea
# -2 3Teb
# -3 3Tfr
# -4 3Tiw
# -5 3Tp
# -7 4Teip
# -25 4Tew
# -8 4Tf
# -27 5Te/5
# -28 5Tew/5
# -29 5Tfi/5