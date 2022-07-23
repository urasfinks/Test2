function main(state, rc, content) {
    //content.addData({title: "RC:" + rc.toString()}, "Text");

    content.setSeparated(false);
    content.setParentUI("WrapPage15");
    content.addAppBarAction({
        onPressedData: {url: rc.url + "/add?uid_data=" + rc.getParam.uid_data, title: "Добавить задачу"},
        icon: "playlist_add"
    }, "AppBarActionAdd");
    content.addAppBarAction({
        onPressedData: {
            url: "/project/" + rc.projectName + "/edit?uid_data=" + rc.getParam.uid_data,
            title: "Изменить параметры"
        },
        icon: "more_vert"
    }, "AppBarActionAdd");
    content.addSyncSocketDataUID(rc.getParam.uid_data);

    var list = getList(rc);
    var state = getState(rc);
    content.setWidgetData("title", state["name"]);
    //content.addData({title: "STATE:" + JSON.stringify(state)}, "Text");

    if (list.length > 0) {
        if(state["autoGroup"] == true){
            var listActive = [];
            var listNotActive = [];
            for (var i = 0; i < list.length; i++) {
                if (state[list[i]["uid_data"]] == true) {
                    listNotActive.push(list[i]);
                } else {
                    listActive.push(list[i]);
                }
            }
            ins(listActive, "Активные", content, rc, state);
            ins(listNotActive, "Завершённые", content, rc, state);
        }else{
            ins(list, "Все задачи", content, rc, state);
        }
    } else {
        content.addData({title: "Добавь новую задачу, нажав на кнопку в правом верхнем углу"}, "EmptyList55");
        content.addData({height: 20, width: 10}, "SizedBox");
        content.addData({title: "Что это такое?"}, "H1");
        content.addData({marker: "1", title: "Можно создать задачи разных типов и предназначений"}, "TextDescription");
        content.addData({marker: "2", title: "Есть возможность помечать выполненные задачи"}, "TextDescription");
        content.addData({marker: "3", title: "Вести историю выполнения задач"}, "TextDescription");
    }

}

function ins(list, title, content, rc, state) {
    if (list.length > 0) {
        for (var i = 0; i < list.length; i++) {
            list[i]["parseStateData"] = JSON.parse(list[i]["state_data"]);
        }
        if(state["sortTime"] == false){ //Надо по дате изменения фильтровать
            list = list.sort(function(a,b){
                if(state["time_"+a["uid_data"]] > state["time_"+b["uid_data"]]){
                    return -1;
                }
                return 0;
            });
        }
        content.addData({title: title, extra: list.length}, "H1RightBlock");
        content.addData({}, "GroupTop");
        for (var i = 0; i < list.length; i++) {

            if (i != 0) {
                content.addData({}, "Divider");
            }
            var color = "white";
            var extra = "";
            if(list[i]["parseStateData"]["deadLine"] != undefined){
                var dl = toTimestamp(list[i]["parseStateData"]["deadLine"]);
                var all =  dl - list[i]["timestamp"];
                var cur = new Date().getTime()/1000 - list[i]["timestamp"];
                var now = parseInt(cur * 255 / all);
                if(now < 0){
                    now = 0;
                }
                if(now > 255){
                    now = 255;
                }
                now = 255-now;
                color = "rgba:255,"+now+","+now+",1";
            }
            content.addData({
                title: list[i]["parseStateData"]["name"] + " " + extra,
                color: color,
                nameChecked: list[i]["uid_data"],
                getAppStoreDataChecked: {key: list[i]["uid_data"], defaultValue: false},
                getAppStoreDataTime: {
                    key: "time_" + list[i]["uid_data"],
                    defaultValue: "",
                    format: "dd.MM.yyyy HH:mm:ss"
                },
                onPressedData: {
                    url: rc.url + "/edit?uid_data=" + list[i]["uid_data"] + "&parent_uid_data=" + rc.getParam.uid_data,
                    title: "Изменить параметры"
                },
            }, "RowCheck");
        }
        content.addData({}, "GroupBottom");
    }
}

function toTimestamp(strDate){
    //var datum = new Date(Date.parse(strDate));
    return parseDate(strDate).getTime() /1000;
}

function parseDate(str) {
    var dateParts = str.split(".");
    var year = dateParts[2];
    var month = dateParts[1];
    var day = dateParts[0];
    return new Date(year, (month - 1), day);
}

function getList(rc) {
    var list = [];
    try {
        var obj = {
            sql: "select d1.*, extract(epoch from time_add_data::TIMESTAMP WITH TIME ZONE)::bigint as timestamp from \"data\" d1 join tag t1 on t1.id_data = d1.id_data where d1.id_prj = ${id_prj} and d1.id_person = ${id_person} and t1.key_tag = ${key_tag} order by d1.id_data desc",
            args: [
                {
                    field: 'uid_data',
                    type: 'VARCHAR',
                    direction: 'COLUMN'
                },
                {
                    field: 'state_data',
                    type: 'VARCHAR',
                    direction: 'COLUMN'
                },
                {
                    field: 'timestamp',
                    type: 'VARCHAR',
                    direction: 'COLUMN'
                },
                {
                    field: 'id_prj',
                    type: 'NUMBER',
                    direction: 'IN',
                    value: rc.idProject.toString()
                },
                {
                    field: 'id_person',
                    type: 'NUMBER',
                    direction: 'IN',
                    value: rc.idPerson.toString()
                },
                {
                    field: 'key_tag',
                    type: 'VARCHAR',
                    direction: 'IN',
                    value: rc.getParam.uid_data
                }
            ]
        };
        list = JSON.parse(Java.type('ru.jamsys.JS').sql(JSON.stringify(obj)));
    } catch (e) {
    }
    return list;
}

function getState(rc) {
    var state = {};
    try {
        var obj = {
            sql: "select d1.* from \"data\" d1 where d1.uid_data = ${uid_data}",
            args: [
                {
                    field: 'state_data',
                    type: 'VARCHAR',
                    direction: 'COLUMN'
                },
                {
                    field: 'uid_data',
                    type: 'VARCHAR',
                    direction: 'IN',
                    value: rc.getParam.uid_data.toString()
                }
            ]
        };
        list = JSON.parse(Java.type('ru.jamsys.JS').sql(JSON.stringify(obj)));
        state = JSON.parse(list[0]["state_data"]);
    } catch (e) {
    }
    return state;
}