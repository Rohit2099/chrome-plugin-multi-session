
var x = document.getElementById("sessionButton");
x.addEventListener("click",function(){

    chrome.runtime.sendMessage({type: "button clicked"},function(response) {
    });

});

var z = document.getElementById("duplicateSession");
z.addEventListener("click",function(){

    chrome.runtime.sendMessage({type: "duplicate session"},function(response) {

    });

});

var c = document.getElementById("cookies");
c.addEventListener("click",function(){

    chrome.runtime.sendMessage({type: "allCookies"},function(response) {

    });

});

var g = document.getElementById("gcpCookies");
g.addEventListener("click",function(){

    chrome.runtime.sendMessage({type: "gcpCookies"},function(response) {

    });

});

var d = document.getElementById("defaultSession");
d.addEventListener("click",function(){

    chrome.runtime.sendMessage({type: "default session"},function(response) {

    });

});

var y = document.getElementById("optionButton");
y.addEventListener("click",function(){

    chrome.runtime.sendMessage({type: "option button clicked"},function(response) {

    });

});