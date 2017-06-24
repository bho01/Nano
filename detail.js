var url = window.location.hash.substring(1);
var blocklist = [];
console.log(url);
var moreurl = "*://"+url+"/*";
console.log(moreurl);

function setButton(text){
    $( document ).ready(function() {
        $("#sub").text(text);
        if(text == "BLACKLIST"){
            $("#sub").click(saveUrls);
        }else{
            $("#sub").click(deleteUrls);
        }
    });
}






Number.prototype.padLeft = function(base,chr){
 var  len = (String(base || 10).length - String(this).length)+1;
 return len > 0? new Array(len).join(chr || '0')+this : this;
}

var current = 0;
var port = chrome.extension.connect({
  name: "Detailed Data"
});
var dataArr = [];

port.postMessage(url)
port.onMessage.addListener(function (message){
	console.log(message);
    if(message[0]){
        setButton("UNBLACKLIST");
    }else{
        setButton("BLACKLIST");
    }
    var msg = message[1];
    totalSessions = msg;
    $("#data").text("Detailed Tab Usage : " + msg["title"])
    var img = $('<img style = "padding-left:10px;">'); //Equivalent: $(document.createElement('img'))
    img.attr('src', msg["image"]);
    img.appendTo('#data');
    for(se in msg["array"]){
      var obj = msg["array"][se]
		var d = new Date(obj["date"])//.format("yyyy-MM-dd HH:mm:ss")
		//06/23/2017 18:13:22
        var object = {};
        object["date"] = d;
        object["value"] = obj["time"]
        dataArr.push(object);
    }

 var chart = AmCharts.makeChart("chartdiv", {
    "type": "serial",
    "theme": "light",
    "marginRight": 40,
    "marginLeft": 40,
    "autoMarginOffset": 20,
    "mouseWheelZoomEnabled":true,
    "valueAxes": [{
        "id": "v1",
        "axisAlpha": 0,
        "position": "left",
        "ignoreAxisWidth":true
    }],
    "balloon": {
        "borderThickness": 1,
        "shadowAlpha": 0
    },
    "graphs": [{
        "id": "g1",
        "balloon":{
          "drop":true,
          "adjustBorderColor":false,
          "color":"#ffffff"
      },
      "bullet": "round",
      "bulletBorderAlpha": 1,
      "bulletColor": "#FFFFFF",
      "bulletSize": 5,
      "hideBulletsCount": 50,
      "lineThickness": 2,
      "title": "red line",
      "useLineColorForBulletBorder": true,
      "valueField": "value",
      "balloonText": "<span style='font-size:18px;'>[[value]]</span>"
  }],
  "chartScrollbar": {
    "graph": "g1",
    "oppositeAxis":false,
    "offset":30,
    "scrollbarHeight": 80,
    "backgroundAlpha": 0,
    "selectedBackgroundAlpha": 0.1,
    "selectedBackgroundColor": "#888888",
    "graphFillAlpha": 0,
    "graphLineAlpha": 0.5,
    "selectedGraphFillAlpha": 0,
    "selectedGraphLineAlpha": 1,
    "autoGridCount":true,
    "color":"#AAAAAA"
},
"chartCursor": {
    "pan": true,
    "valueLineEnabled": true,
    "valueLineBalloonEnabled": true,
    "cursorAlpha":1,
    "cursorColor":"#258cbb",
    "limitToGraph":"g1",
    "valueLineAlpha":0.2,
    "valueZoomable":true
},
"valueScrollbar":{
  "oppositeAxis":false,
  "offset":50,
  "scrollbarHeight":10
},
"categoryField": "date",
"categoryAxis": {
    "parseDates": true,
    "minPeriod" : "mm",
    "dashLength": 1,
    "minorGridEnabled": true
},
"export": {
    "enabled": true,
    "dateFormat": "YYYY-MM-DD HH:NN:SS"
},
"dataProvider": dataArr
});

chart.addListener("rendered", zoomChart);

zoomChart(chart);

$("#avgSn").text(convertToTime(averageSessions()));
$("#total").text(convertToTime(sumSessions()));
});
function saveUrls() {
    console.log('executed')
    chrome.storage.sync.get('blacklist', function(items){
        console.log(items);
        blocklist = blocklist.concat(items["blacklist"]);
        console.log(blocklist)
        blocklist.push(url);
        chrome.storage.sync.set({'blacklist': blocklist}, function() {
          // Notify that we saved.
          console.log('Settings saved');
          console.log(blocklist)
          port.postMessage("blacklist");

        });
    })
}
function deleteUrls(){
    console.log('deleting');
    chrome.storage.sync.get('blacklist', function(items){
        console.log(items);
        blocklist = blocklist.concat(items["blacklist"])
        console.log(blocklist)
        var index = blocklist.indexOf(url)
        if(index > -1){
            blocklist.splice(index, 1)
        }
        if(blocklist.length == 0){
            blocklist = ["blacklist"]
        }
        chrome.storage.sync.set({'blacklist' : blocklist}, function(){
            console.log("successfully removed");
            port.postMessage('blacklist');
        })
    });
    //remove element
    
}
function averageSessions(){
    var array = totalSessions["array"]
    var divisor = array.length
    var sum = sumSessions();
    var average = sum / divisor * 100
    return Math.floor(average) / 100.0;
}
function sumSessions(){
    var array = totalSessions["array"]
    var sum = 0.0;
    for(obj in array){
        var session = array[obj];
        sum += session.time;
    }
    return sum;
}
function zoomChart(chart) {
    chart.zoomToIndexes(chart.dataProvider.length - 40, chart.dataProvider.length - 1);
}
function convertToTime(milli){
  var milliseconds = parseInt((milli%1000)/100)
            , seconds = parseInt((milli/1000)%60)
            , minutes = parseInt((milli/(1000*60))%60)
            , hours = parseInt((milli/(1000*60*60))%24);

        hours = (hours < 10) ? "0" + hours : hours;
        minutes = (minutes < 10) ? "0" + minutes : minutes;
        seconds = (seconds < 10) ? "0" + seconds : seconds;

        var str = "";
        if(hours != "00"){
            str += hours + "h "
        } 
        if(minutes != "00"){
            str += minutes + "m "
        }
        if(seconds != "00"){
            str += seconds + "s"
        } 
        if(milliseconds != "00"){
            str += " : " + milliseconds
        }
        return str
}

