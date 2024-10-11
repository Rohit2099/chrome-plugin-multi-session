
var gcpSubmit = document.getElementById("gcpSubmit");
document.body.style.backgroundImage = "url(b2.jpg)";

gcpSubmit.onclick = function(){
    var gcpDomain = document.getElementById("exampleInputEmail1").value  
    chrome.runtime.sendMessage({type: "got gcp domain", url: gcpDomain},function(response) {

    });  
}

var gcpDelete = document.getElementById("gcpDelete");

gcpDelete.onclick = function(){
    var deleteDomain = document.getElementsByClassName("chk") 
    var x = [];
    for(var i=0; i<deleteDomain.length; i++){
        if(deleteDomain[i].checked){
            console.log(deleteDomain[i].value + " wants to be deleted")
            x.push(deleteDomain[i].value)
        }
    }
    chrome.runtime.sendMessage({type: "delete gcp domain", url: x},function(response) {

    });  
}

var d1b = document.getElementById("d1Submit");
d1b.onclick = function(){
    var d1 = document.getElementById("d1").value;
    var n1 = document.getElementById("n1").value;
    if(d1!=="" && n1!==""){
        chrome.runtime.sendMessage({type: "domain1", domain: d1, name: n1},function(response) {
        });
    }
}

var d2b = document.getElementById("d2Submit");
d2b.onclick = function(){
    var d2 = document.getElementById("d2").value;
    var n2 = document.getElementById("n2").value;
    if(d2!="" && n2!=""){
        chrome.runtime.sendMessage({type: "domain2", domain: d2, name: n2},function(response) {
        });
    }
}
var d3b = document.getElementById("d3Submit");
d3b.onclick = function(){
    var d3 = document.getElementById("d3").value;
    var n3 = document.getElementById("n3").value;
    if(d3!="" && n3!=""){
        chrome.runtime.sendMessage({type: "domain3", domain: d3, name: n3},function(response) {
        });
    }
}
var d4b = document.getElementById("d4Submit");
d4b.onclick = function(){
    var d4 = document.getElementById("d4").value;
    var n4 = document.getElementById("n4").value;
    if(d4!="" && n4!=""){
        chrome.runtime.sendMessage({type: "domain4", domain: d4, name: n4},function(response) {
        });
    }
}
var d5b = document.getElementById("d5Submit");
d5b.onclick = function(){
    var d5 = document.getElementById("d5").value;
    var n5 = document.getElementById("n5").value;
    if(d5!="" && n5!=""){
        chrome.runtime.sendMessage({type: "domain5", domain: d5, name: n5},function(response) {
        });
    }
}
function makeList(listData) {
    // Make a container element for the list
    // listContainer = document.createElement('div'),
    // listContainer.id = "domainDiv"

   // listContainer = document.getElementById("domainDiv");
   listContainer = document.getElementById("banner")

    // Make the list
    listElement = document.createElement('ul'),
    listElement.id = "listDomain";
    // Set up a loop that goes through the items in listItems one at a time
    numberOfListItems = listData.length;

    // Add it to the page
    document.getElementsByTagName('body')[0].appendChild(listContainer);
    listContainer.appendChild(listElement);

    for (i = 0; i < numberOfListItems; ++i) {
        // create an item for each one
        listItem = document.createElement('li');
        listItem.id = "li"
        labelItem = document.createElement("label")
        labelItem.id = "lbl"
        labelItem.innerHTML = listData[i]
        var x = document.createElement("INPUT");
        x.setAttribute("type", "checkbox");
        x.value = listData[i];
        x.id = listData[i];
        x.className = "chk"
        x.style.marginLeft = "5px";
        x.style.width = '50px';
        x.style.height = '20px';
        x.style.verticalAlign="middle";
        labelItem.htmlFor = listData[i]
        labelItem.appendChild(x);
        listItem.appendChild(labelItem);
        // listElement.appendChild(listItem);
        // listItem.appendChild(x);
       // x.appendChild(labelItem);

        // Add listItem to the listElement
        listElement.appendChild(listItem);
    }
    document.getElementById("domainDiv").style.overflow = "hidden";
    document.getElementById("domainDiv").style.background = 'white';
    document.getElementById("domainDiv").style.width = "1350px";
    document.getElementById("listDomain").style.color = "#6F6F6F";
    document.getElementById("listDomain").style.fontSize = "1.0em";
    document.getElementById("listDomain").style.textAlign = "center";
    document.getElementById("listDomain").style.color = "#000000";
    document.getElementById("listDomain").style.fontStyle = "italic 20px arial,serif";
    document.getElementById("lbl").style.color = "black";
    //document.getElementById("listDomain").style.border = "150px";
    //document.getElementById("listDomain").style.border = "thick solid #000000";


};





var seeDomain = document.getElementById("domainButton");

window.onload = function(){
    chrome.runtime.sendMessage({type: "handshake"},function(response) {
    });  
    chrome.runtime.onMessage.addListener(function(message,sender,sendResponse){
        if(message.type === "handshake return"){
            var listData = message.gcpURL;
            makeList(listData);
        }
        return Promise.resolve('gg');
        return true;
    });   
}

// seeDomain.onclick = function(){
//     chrome.runtime.sendMessage({type: "handshake"},function(response) {
//     });  
//     chrome.runtime.onMessage.addListener(function(message,sender,sendResponse){
//         if(message.type === "handshake return"){
//             var listData = message.gcpURL;
//             makeList(listData);

//         }
//     });

    
// }
