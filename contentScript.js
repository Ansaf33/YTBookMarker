(()=>{
  let currentVideo = "";
  let ytlc,ytp;
  let currentVideoBookmarks = []

  // GETTIME FUNCTION
  const getTime = t =>{
    var date = new Date(0);
    date.setSeconds(t);
    return date.toISOString().substring(11,19);
  }

  // FETCH BOOKMARKS
  const fetchbookMarks = () => {
    return new Promise((resolve)=>{
      chrome.storage.sync.get([currentVideo],(obj) =>{
        resolve( obj[currentVideo] ? JSON.parse(obj[currentVideo]) : [] );
      });
    });
  };

  // ON CLICKING BOOKMARK
  const bookmarkClickEventHandler = async () =>{
    // time is in seconds
    const currentTime = ytp.currentTime;
    const newBookmark = {
      time:currentTime,
      description:"Bookmark at " + getTime(currentTime)
    };
    console.log(newBookmark);

    // store bookmark
    currentVideoBookmarks = await fetchbookMarks();

    chrome.storage.sync.set({
      [currentVideo]:JSON.stringify([...currentVideoBookmarks,newBookmark].sort((a,b)=>a.time-b.time))
    });
    


  }


  // FUNCTION NEW VIDEO LOADED
    
  const newVideoLoaded = async () => {
    // check if bookmark exists
    const bookmarkbtnExists = document.getElementsByClassName("bookmark-btn");
    currentVideoBookmarks = await fetchbookMarks();
    // if don't exist, then create a new html element and add it
    if( bookmarkbtnExists.length == 0 ){
      const bookmarkBtn = document.createElement("img");
      bookmarkBtn.src = chrome.runtime.getURL("assets/bookmark.png");
      bookmarkBtn.className = "ytp-button " + "bookmark-btn";
      bookmarkBtn.title = "Click to bookmark current timestamp."

      ytlc = document.getElementsByClassName("ytp-left-controls")[0];
      ytp = document.getElementsByClassName("video-stream")[0];

      ytlc.appendChild(bookmarkBtn);

      // event handler after we click the button
      bookmarkBtn.addEventListener("click",bookmarkClickEventHandler);

    }
  
    
  }

  // ON RECEIVING MESSAGE FUNCTION

  chrome.runtime.onMessage.addListener((obj,sender,response)=>{

    const { type , value , videoID } = obj;
    // if it is a youtube video
    if( type == "NEW" ){
      console.log("Type is NEW");
      currentVideo = videoID;
      newVideoLoaded();
    }
    else if( type == "PLAY" ){
      console.log("Type is PLAY");
      ytp.currentTime = value;
    }
    else if( type == "DELETE" ){
      console.log("TYPE IS DELETE")
      currentVideoBookmarks = currentVideoBookmarks.filter((bm)=>bm.time!=value);
      console.log(currentVideoBookmarks);
      chrome.storage.sync.get({
        [currentVideo]: JSON.stringify(currentVideoBookmarks)

      });
      response(currentVideoBookmarks);

    }


  });

  newVideoLoaded();

})();