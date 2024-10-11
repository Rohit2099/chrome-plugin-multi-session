chrome.runtime.onInstalled.addListener(function(obj) {
});
chrome.tabs.onCreated.addListener(addTabToSession);
chrome.webRequest.onHeadersReceived.addListener(storeCookies, {urls: ["<all_urls>"]},["responseHeaders","extraHeaders","blocking"]);
chrome.webRequest.onBeforeSendHeaders.addListener(setCookies, {urls: ["<all_urls>"]},["requestHeaders","extraHeaders","blocking"]);
chrome.webRequest.onBeforeRequest.addListener(removeIco, {urls: ["<all_urls>"]}, ["blocking"]);
chrome.tabs.onUpdated.addListener(sendMsgUpdtd);

// chrome.storage.local.set({"tabIds":[], "shortcutSessions":{}, "deletedSessions":[], "sessionInfo":{}, "totalSession":0, "gcpCookies":[]}, function(){});
/**
 * Name: contextMenus.create
 * Function: Creates the extension feature options in the chrome context menu
 */
chrome.contextMenus.create({
    "title" : "New Session (Blank)",
    "id": "newSession"
});
chrome.contextMenus.create({
    "title" : "New Duplicate Session",
    "id": "duplicateSession"
});
chrome.contextMenus.create({
    "type" : "separator",
    "title" : "separator1",
    "id": "separator1"
});    
chrome.contextMenus.create({
    "title" : "Open with Default Session",
    "id": "globalSession"
});
chrome.contextMenus.create({
    "type" : "separator",
    "title" : "separator2",
    "id": "separator2"
});    
chrome.contextMenus.create({
    "title" : "Clear Cookies",
    "id": "clearCookies"
}); 
chrome.contextMenus.create({
    "title" : "Clear GCP Cookies",
    "id": "clearGCP"       
});
chrome.storage.local.set({"tabIds":[]}, function(){});


shortcutSessions = {};
requestIds = [];
deletedSessions = [];
sessionInfo = {};           //Stores the session no. associated with each tab
totalSession = 0;           //Stores the count of the no. of sessions
tabIds = [];                //Stores the tab id of all the session tabs
gcpCookies = ["*.cloud.sap", 
    "*.hana.ondemand.com",               
    "*.ariba.com" ,
    "*.successfactors.*", 
    "*.internal.sde.cloud.sap",     
    "*.concursolutions.com" ,
    "*.fgvms.com" ,
    "*.s4hana.ondemand.com",
    ]

chrome.storage.local.set({"gcpCookies":gcpCookies}, function(){});


/**
 * Function name: createNewSession
 * Invoked : Called by the duplicateSession function
 * Function creates a new session by creating a new tab with the same URL of the parent tab.
 * The new tab is added to the list 'tabIds' containing all the session tab ids
 * The total number of sessions is incremented by 1.
 * The session no. of the new session is stored in the variable 'sessionInfo'
*/
function min(input) {
    if (toString.call(input) !== "[object Array]")  
        return false;
    return Math.min.apply(null, input);
}

function createNewSession(urlNew){
    return new Promise(function(resolve, reject){
        try{
            chrome.tabs.create({'url': urlNew}, function(duplicatedTab){
                console.log("URL of Tab is " + urlNew);
                // chrome.storage.local.get(['tabIds','sessionInfo','totalSession','deletedSessions'], function(result) {
                //     tabIds = result.tabIds;
                //     sessionInfo = result.sessionInfo;
                //     totalSession = result.totalSession;
                //     deletedSessions = result.deletedSessions;
                tabIds.push(duplicatedTab.id);
                chrome.storage.local.set({"tabIds":tabIds}, function(){});
                if(deletedSessions.length){
                    let lowestRemoved = min(deletedSessions);
                    if(lowestRemoved < totalSession + 1){
                        deletedSessions.splice(deletedSessions.indexOf(lowestRemoved), 1);
                        sessionInfo[duplicatedTab.id] = lowestRemoved;
                    }
                    else{
                        totalSession += 1;
                        sessionInfo[duplicatedTab.id] = totalSession;
                    }
                }
                else{
                    totalSession += 1;
                    sessionInfo[duplicatedTab.id] = totalSession;
                }
                // chrome.storage.local.set({"tabIds":tabIds, "sessionInfo":sessionInfo, "totalSession":totalSession,"deletedSessions":deletedSessions}, function(){
                    resolve(duplicatedTab.id);
                // });
                // });
                
            });
        }
        catch(err){
            reject(err);
        }
    });
}

/**
 * Funtion name : duplicatesession
 * Invoked: by the contextMenus.onClicked listener when user clicks the context menu option "Duplicate session"
 * Funtion: calls the createNewSession function
 */
async function duplicateSession(tab){
    await chrome.tabs.onCreated.removeListener(addTabToSession);
    await clearCache();
    await createNewSession(tab.url);
    await chrome.tabs.onCreated.addListener(addTabToSession);
}


async function newSession(){
    await chrome.tabs.onCreated.removeListener(addTabToSession);
    await clearCache();
    await createNewSession("http://www.google.com");
    await chrome.tabs.onCreated.addListener(addTabToSession);
}


function createGlobalTab(){
    return new Promise(function(resolve, reject){
        try{
            chrome.tabs.create({'url': "http://www.google.com"}, function(duplicatedTab){
                resolve(duplicatedTab.id);
            });
        }
        catch(err){
            reject(err);
        }
    });
}

async function newGlobalTab(){
    await chrome.tabs.onCreated.removeListener(addTabToSession);
    await clearCache();
    await createGlobalTab();
    await chrome.tabs.onCreated.addListener(addTabToSession);
}

function isIncluded(domain){    
    // chrome.storage.local.get(['gcpCookies'], function(result) {
        // gcpCookies = result.gcpCookies;
        for(var i = 0;i<gcpCookies.length;i++){
            var temp = gcpCookies[i].split('.').join("\\.");
            var fin = temp.split('*').join(".*");
            var res = new RegExp(fin);
            if(res.test(domain)){
                return true;
            }
        }
        return false;
    // });
}

function clearGCPDomainCookies(){
    chrome.cookies.getAll({}, function(tempCookies){
        for(var i =0;i<tempCookies.length;i++){
            if(isIncluded(tempCookies[i].domain)){
                chrome.cookies.remove({"url": "http"+ (tempCookies[i].secure?"s" : "") + "://"  + tempCookies[i].domain + tempCookies[i].path, "name": tempCookies[i].name}, function(removeCookie){
                });
            }
        }
    });
}

function clearCache(){
    return new Promise(function(resolve, reject){
        try{
            chrome.browsingData.removeCache({},function(){
                resolve('f');
            });
        }
        catch(err){
            reject(err);
        }
    });
}


// handles only 9 shortcut sessions
async function newShortcutSession(url){
    await chrome.tabs.onCreated.removeListener(addTabToSession);
    await clearCache();
    await createNewSession(url);
    await chrome.tabs.onCreated.addListener(addTabToSession);
}


/**
 * Listener name : contextMenus.onClicked
 * Invoked: when user clicks the context menu option "Duplicate session"
 * Function: Calls the duplicateSession to create a new duplicate session
 */
chrome.contextMenus.onClicked.addListener(function (clickedItem){
    if (clickedItem.menuItemId === "newSession"){
        newSession();
    }
    else if (clickedItem.menuItemId === "duplicateSession"){
        chrome.tabs.query({active: true, currentWindow: true}, function(selectedTabs) {
            // chrome.storage.local.get(['tabIds','sessionInfo','totalSession','deletedSessions'], function(result) {
            //     tabIds = result.tabIds;
            //     sessionInfo = result.sessionInfo;
            //     totalSession = result.totalSession;
            //     deletedSessions = result.deletedSessions;
                duplicateSession(selectedTabs[0]);
            // });
        });
    }
    else if (clickedItem.menuItemId === "globalSession"){
        newGlobalTab();
    }
    else if (clickedItem.menuItemId === "clearCookies"){
        chrome.browsingData.removeCookies({}, function(){
        });
    }
    else if (clickedItem.menuItemId === "clearGCP"){
        clearGCPDomainCookies();
    }
    else if(clickedItem.menuItemId.includes('shortcutsession')){
        // chrome.storage.local.get(['shortcutSessions'], function(result) {
            var temp = clickedItem.menuItemId;
            // shortcutSessions = result.shortcutSessions;
            let sessionNum = temp[temp.length - 1];
            newShortcutSession(shortcutSessions[sessionNum][1]);
        // });
    }
});

/**
 * Function name: addTabToSession
 * Invoked: by listener tabs.onCreated when a new tab is created
 * Function: checks whether the newly opened tab was opened from a session tab.
 *          If yes, then it sets its session no. the same as that of the opener tab.
 *          Finally, it adds the new tab to the 'tabIds' list containing all the session tabs.  
 */
function addTabToSession(tab){
    chrome.browsingData.removeCache({},function(){
        // chrome.storage.local.get(['tabIds','sessionInfo'], function(result) {
        //     sessionInfo = result.sessionInfo;
        //     tabIds = result.tabIds;
            if(tabIds.includes(tab.openerTabId)){
                sessionInfo[tab.id] = sessionInfo[tab.openerTabId];
                tabIds.push(tab.id);
                chrome.storage.local.set({"tabIds":tabIds, "sessionInfo":sessionInfo}, function(){});
            }
        // });
    });
};


/**
 * Function name: storeCookies
 * Invoked: by listener webRequest.onHeadersReceived when a header is recieved 
 * Function: Checks if the http response is recieved by a session tab.
 *          If yes, then it gets all the response cookies from the header and modifies the cookie name
 *          It appends a unique identifier 'str' before the cookie name to match the cookie to its respective session 
 */
function storeCookies(details){
    // chrome.storage.local.get(['tabIds','sessionInfo'], function(result) {
    //     sessionInfo = result.sessionInfo;
    //     tabIds = result.tabIds;
        if(tabIds.includes(details.tabId) && details.tabId !== -1){
            // console.log('Inside store cookies');
            if(requestIds.includes(details.requestId)){
                chrome.tabs.sendMessage(details.tabId, {
                    sNo : String(sessionInfo[details.tabId]),
                    tabID: String(details.tabId)
                });
                requestIds.splice(requestIds.indexOf(details.requestId), 1);
                return {"cancel": true};
            }
            let str = "##&&-" + String(sessionInfo[details.tabId]);   
            for(var i = 0;i< details.responseHeaders.length;i++){ 
                if(details.responseHeaders[i]['name'].toLowerCase() === 'set-cookie'){
                    console.log("INSIDE STORE COOKIES " + details.responseHeaders[i]['value']);
                    details.responseHeaders[i]['value'] = str.concat(details.responseHeaders[i]['value']);
                }
            }
            return {responseHeaders: details.responseHeaders}; 
        }
    // });
}

/**
 * Function name: setCookies
 * Invoked: by listener webRequest.onBeforeSendHeaders activated just before when a header is sent 
 * Funtion: Checks if the http request is made by a session tab.
 *          If yes, then it gets all the request cookies from the header and it checks for the cookies which have
 *          the session uniques identifier 'str' in the cookie name and adds these cookies to the list 'result'.
 *          It the removes 'str' from the cookie name and then only sends these cookies in the request header. 
 */
function setCookies(details){
    console.log('Not inside set cookies');
    console.log("Tab ID" + details.tabId);
    // chrome.storage.local.get(['tabIds','sessionInfo'], function(result) {
    //     sessionInfo = result.sessionInfo;
    //     tabIds = result.tabIds;
        if(tabIds.includes(details.tabId) && details.tabId !== -1){
            // chrome.tabs.sendMessage(details.tabId, {
            //     sNo : String(sessionInfo[details.tabId]),
            //     tabID: String(details.tabId)
            // });
            console.log(tabIds);
            let str = "##&&-" + String(sessionInfo[details.tabId]);   
            console.log('Inside set cookies');
            for(var i = 0;i< details.requestHeaders.length;i++){ 
                if(details.requestHeaders[i]['name'].toLowerCase() === 'cookie'){
                    console.log("INSIDE SET COOKIES " + details.requestHeaders[i]['value']);
                    let indiCookie = details.requestHeaders[i]['value'].split('; ');
                    let result = [];
                    for(var j = 0;j<indiCookie.length;j++){
                        if(indiCookie[j].includes(str,0)){
                            result.push(indiCookie[j].slice(str.length));
                        }
                        if(indiCookie[j].includes("_anchor")){
                            result.push(indiCookie[j]);
                        }
                    } 
                    details.requestHeaders[i]['value'] = result.join('; ');
                }
            }
            return {requestHeaders: details.requestHeaders}; 
        }
    // });
}


function removeIco(details){
    // chrome.storage.local.get(['tabIds','sessionInfo'], function(result) {
    //     sessionInfo = result.sessionInfo;
    //     tabIds = result.tabIds;
        if(tabIds.includes(details.tabId) && details.tabId !== -1){
            if((details.url.includes('.ico') || details.url.includes('favicon')) && details.type === "image"){
                requestIds.push(details.requestId);
                console.log('ID if favicon ' + details.url);
                    chrome.tabs.sendMessage(details.tabId, {
                        sNo : String(sessionInfo[details.tabId]),
                        tabID: String(details.tabId)
                    });
                    return {cancel: true};
            }
        }
    // });
}


function createShortcutSession(name, url, numString){
    // chrome.storage.local.get(['shortcutSessions'], function(result) {
    //     shortcutSessions = result.shortcutSessions;
        var num = numString[numString.length - 1];
        if(!shortcutSessions[num]){
            shortcutSessions[num] = [];
            shortcutSessions[num].push(name);
            shortcutSessions[num].push(url);
            var temp = "shortcutsession" + num;
            chrome.contextMenus.create({
                "title" : name,
                "id": temp
            });
        }
        else{
            if(shortcutSessions[num][0] !== name){
                var temp = "shortcutsession" + num;
                chrome.contextMenus.remove(temp, function(){
                    shortcutSessions[num][0] = name;
                    shortcutSessions[num][1] = url;
                    chrome.contextMenus.create({
                        "title" : name,
                        "id": temp
                    });
                });
            }
            else if(shortcutSessions[num][1] !== url){
                shortcutSessions[num][1] = url;
            }
        }
    //     chrome.storage.local.set({"shortcutSessions":shortcutSessions}, function(){});
    // });
}


/**
 * Listener name : tabs.onRemoved
 * Invoked: when a tab closes
 * Function: Checks if the removed tab is a session tab. If yes, it removes it from the list containig all the
 *           session tabs 'tabIds'. It then checks whether the removed tab is the last tab of its respective
 *           session. If yes, then it deletes all the cookies of that session (ie, all the cookies with the
 *           unique identifier of that session).  
 *              
 */
chrome.tabs.onRemoved.addListener(function(tabId, details) {
    // chrome.storage.local.get(['tabIds','sessionInfo', 'deletedSessions','totalSession'], function(result) {
    //     sessionInfo = result.sessionInfo;
    //     totalSession = result.totalSession;
    //     tabIds = result.tabIds;
    //     deletedSessions = result.deletedSessions;
        if (tabIds.includes(tabId)){
            let temp = sessionInfo[tabId];
            tabIds.splice(tabIds.indexOf(tabId), 1);
            let present = false;
            delete sessionInfo[tabId];
            for(var i = 0;i<tabIds.length;i++){
                if(temp === sessionInfo[tabIds[i]]){
                    present = true;
                    break;
                }
            }
            if(!present){
                deletedSessions.push(temp);
                str = "##&&-" + String(temp);
                chrome.cookies.getAll({}, function(allCookies){
                    for(var i = 0;i < allCookies.length; i++){
                        if(allCookies[i].name.includes(str,0)){
                            chrome.cookies.remove({"url": "http"+ (allCookies[i].secure?"s" : "") + "://"  + allCookies[i].domain + allCookies[i].path, "name": allCookies[i].name})
                        }
                    }
                });
            }
            if(tabIds.length === 0){
                totalSession = 0;
                deletedSessions.length = 0;
                requestIds.length = 0;
            }
            // chrome.storage.local.set({"tabIds":tabIds,"deletedSessions":deletedSessions,"sessionInfo":sessionInfo,"totalSession":totalSession}, function(){});
        }
    // });
});


chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.type == "button clicked") {
        newSession();
    }
    if (request.type == "duplicate session") {
        chrome.tabs.query({active: true, currentWindow: true}, function(selectedTabs) {
            duplicateSession(selectedTabs[0]);
            console.log('ID of old tab ' + selectedTabs[0].id);
        });
    }
    if (request.type == "default session") {
        newGlobalTab();
    }
    if (request.type == "allCookies") {
        chrome.browsingData.removeCookies({}, function(){
            console.log("All Cookies cleared")
        });
    }
    if (request.type == "gcpCookies") {
        clearGCPDomainCookies();
    }
    if (request.type == "got gcp domain") {
        gcpCookies.push(request.url);
    }
    if (request.type == "option button clicked") {
        chrome.tabs.create({'url': "options.html"});
        return true;
    }
    if (request.type == "handshake") {
        chrome.runtime.sendMessage({type:"handshake return", gcpURL:gcpCookies},function(response){
        });
    }
    if (request.type == "delete gcp domain") {
        for(var i=0; i<request.url.length;i++){
            if(gcpCookies.includes(request.url[i])){
                var index = gcpCookies.indexOf(request.url[i]);
                gcpCookies.splice(index, 1);
            }
        }
       
    }
    if(request.type.includes("domain")){
        createShortcutSession(request.name, request.domain, request.type);
    }
    return Promise.resolve('gg');
    return true;
});

function sendMsgUpdtd(tabId, details){
    // chrome.storage.local.get(['tabIds','sessionInfo'], function(result) {
    //     sessionInfo = result.sessionInfo;
    //     tabIds = result.tabIds;
        if(tabIds.includes(tabId) && details.status === 'complete'){
                chrome.tabs.sendMessage(tabId, {
                    sNo : String(sessionInfo[tabId]),
                    tabID: String(tabId)
                });
        }
    // });
}

