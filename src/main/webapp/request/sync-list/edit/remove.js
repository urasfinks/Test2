function main(state, rc, content) {
    //content.addData({title: "RC:" + rc.toString()}, "Text");
    if (rc.getParam.uid_data != undefined) {
        Java.type('ru.jamsys.JS').removeData(rc, rc.getParam.uid_data);
    }
    content.addData({title: "Opacha"}, "DialogOk");
    content.addAction("closeWindow", {data: {delay: 1000, count: 3}});
    content.addAction("reloadPageByUrl", {
        "list": [
            "/project/" + rc.projectName
        ]
    });
}