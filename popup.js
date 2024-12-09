import { getActiveTabURL } from "./utils.js"

// adding a new bookmark row to the popup
const addNewBookmark = (bookmarkEl,bookmark) => {
  const newbookmarkEl = document.createElement("div");
  const bookmarkTitle = document.createElement("div");
  const controlEl = document.createElement("div");

  // control element
  controlEl.className = "bookmark-controls";
  setBookmarkAttributes("play",onPlay,controlEl);
  setBookmarkAttributes("delete",onDelete,controlEl);

  // title
  
  bookmarkTitle.className = "bookmark-title";
  bookmarkTitle.textContent = bookmark.description;

  // bookmark element
  newbookmarkEl.id = "bookmark-"+bookmark.time;
  newbookmarkEl.className = "bookmark";
  newbookmarkEl.setAttribute("timestamp",bookmark.time);

  newbookmarkEl.appendChild(bookmarkTitle);
  newbookmarkEl.appendChild(controlEl);
  bookmarkEl.appendChild(newbookmarkEl);


};

const viewBookmarks = (currentVideoBookmarks=[]) => {
  const bookmarkEl = document.getElementById("bookmarks");
  bookmarkEl.innerHTML = "";

  if( currentVideoBookmarks.length > 0 ){
    for(let i=0;i<currentVideoBookmarks.length;i++){
      const thisbookmark = currentVideoBookmarks[i];
      addNewBookmark(bookmarkEl,thisbookmark)
    }

  }
  else{
    bookmarkEl.innerHTML = '<i class="row">No bookmarks for this video</i>';
  }

  return;

};

const onPlay = async e => {
  console.log("Playing.")
  const bmTime = e.target.parentNode.parentNode.getAttribute("timestamp");
  const activeTab = await getActiveTabURL();

  chrome.tabs.sendMessage(activeTab.id,{
    type:"PLAY",
    value:bmTime
  });

};

const onDelete = async e => {
  console.log("Deleting.");

  const bmTime = e.target.parentNode.parentNode.getAttribute("timestamp");
  const activeTab = await getActiveTabURL();
  const elementToDelete = document.getElementById("bookmark-"+bmTime);
  elementToDelete.parentNode.removeChild(elementToDelete);
  

  chrome.tabs.sendMessage(activeTab.id,{
    type:"DELETE",
    value:bmTime
  },viewBookmarks);


};

const setBookmarkAttributes =  (src,eventListener,controller) => {
  const element = document.createElement("img");
  element.src = "assets/" + src + ".png";
  element.title = src;
  element.addEventListener("click",eventListener);
  controller.appendChild(element);
};

document.addEventListener("DOMContentLoaded", async () => {
  const activeTab = await getActiveTabURL();
  const queryParameters = activeTab.url.split("?")[1];
  const urlParameters = new URLSearchParams(queryParameters);
  
  const currentVideo = urlParameters.get("v");

  // if it is youtube
  if( currentVideo && activeTab.url.includes("youtube.com/watch") ){
    chrome.storage.sync.get([currentVideo], 
      (obj) => {
        const currentVideoBookmarks = obj[currentVideo]?JSON.parse(obj[currentVideo]):[];
        viewBookmarks(currentVideoBookmarks);

      }
    );
  }
  else{
    const c = document.getElementsByClassName("container")[0];
    c.innerHTML = '<div class="container"><p>This is not a youtube video.</p></div>'

  }





});
