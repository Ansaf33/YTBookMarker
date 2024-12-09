

// IF UPDATED TABS, SEND A MESSAGE TO CONTENT SCRIPT
chrome.tabs.onUpdated.addListener((tabID,tab)=>{
  // CHECK IF URL IS A VIDEO
  if( tab.url && tab.url.includes("youtube.com/watch") ){
    const queryParameters = tab.url.split("?")[1];
    const urlParameters = new URLSearchParams(queryParameters);
    console.log(urlParameters);

    // SEND MESSAGE TO CS

    chrome.tabs.sendMessage(tabID,{
      type:"NEW",
      videoID:urlParameters.get("v")
    });

    

  }



});