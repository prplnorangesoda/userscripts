// ==UserScript==
// @name         Youtube comment better-er
// @namespace    dev.rafplayz
// @version      0.2
// @description  Various improvements to the YouTube comment display -- NOTE: BETA
// @author       You
// @website      https://rafplayz.dev/userscripts/YCB
// @match        https://www.youtube.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=youtube.com
// @require      
// @grant        GM_registerMenuCommand
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_addStyle
// ==/UserScript==

function sleep(time) {
  return new Promise((res) => {
    setTimeout(res, time)
  })
}
const DEBUG = true;
function debug_log(...args) {
  if (DEBUG) console.log("%c[YCB]%c",'color: lime','color: gray', ...args)
}
// from https://www.w3schools.com/howto/howto_js_draggable.asp
function drag_element(elmnt) {
  var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
  if (document.getElementById(elmnt.id + "header")) {
    // if present, the header is where you move the DIV from:
    document.getElementById(elmnt.id + "header").onmousedown = dragMouseDown;
  } else {
    // otherwise, move the DIV from anywhere inside the DIV:
    elmnt.onmousedown = dragMouseDown;
  }

  function dragMouseDown(e) {
    e = e || window.event;
    e.preventDefault();
    // get the mouse cursor position at startup:
    pos3 = e.clientX;
    pos4 = e.clientY;
    document.onmouseup = closeDragElement;
    // call a function whenever the cursor moves:
    document.onmousemove = elementDrag;
  }

  function elementDrag(e) {
    e = e || window.event;
    e.preventDefault();
    // calculate the new cursor position:
    pos1 = pos3 - e.clientX;
    pos2 = pos4 - e.clientY;
    pos3 = e.clientX;
    pos4 = e.clientY;
    // set the element's new position:
    elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
    elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
  }

  function closeDragElement() {
    // stop moving when mouse button is released:
    document.onmouseup = null;
    document.onmousemove = null;
  }
}

async function add_config_button_to_navbar() {
  let config_button = document.createElement("div");
  config_button.className = "YCB-configbutton";
  config_button.style = "margin-right: 8px;cursor: pointer";
  config_button.id = "YCB-configbutton";
  config_button.onclick = open_config_menu;

  let config_button_icon = document.createElement("img");
  config_button_icon.src = "https://rafplayz.dev/userscripts/YCB/ycb-logo.png";
  config_button_icon.height = 40;
  config_button_icon.width = 40;
  config_button.appendChild(config_button_icon);

  // add config button to navbar
  (async () => {
    while (true) {
      await sleep(1000);
      debug_log("searching for navbar");
      let navbar = document.querySelector("div#buttons.ytd-masthead");
      if (!navbar || !navbar.children.length) {
        console.warn("no navbar found");
        continue;
      }
      debug_log("navbar found");
      navbar.prepend(config_button);
      break;
    }
  })();
}

let config_style_added = false;
let comment_style_added = false;

let config = [
  {
    type: "bool",
    id: "enable_subcount",
    name: "Show subscriber count in comments",
    value: GM_getValue("enable_subcount", true)
  },
  {
    type: "bool",
    id: "subcount_below_name",
    name: "Show subcount below name instead of next to",
    value: GM_getValue("subcount_below_name", true)
  }
]


const open_config_menu = async () => {
  console.log("Registered");

  if (!config_style_added) {
    debug_log("Config style not added. Adding")
    GM_addStyle(
      ".YCB-box {" +
      "position: fixed; display: flex; flex-direction: column;align-items:center;color: black; background-color: white;" +
      "z-index: 20000;border-radius:5px;border: 1px solid black;min-width: 200px;min-height: 200px;" +
      "font-size: 1.6em;cursor: default;" +
      "}" +
      "div.YCB-configcontainer {" +
      "display: flex;flex-direction: column;" +
      "}"
    );
    console.log("Style added")
    config_style_added = true;
  }
  if (document.getElementById("YCB-box")) return;

  let box_container = document.createDocumentFragment();

  let box = document.createElement("div");
  box.classList.add("YCB-box");
  box.id = "YCB-box"
  box_container.appendChild(box);
  drag_element(box);

  let title = document.createElement("h3");
  title.innerText = "YCB config menu";
  box.appendChild(title);

  let subtitle = document.createElement("h4");
  subtitle.innerText = "Drag me! (refresh to update settings)";
  box.appendChild(subtitle);

  let close_button = document.createElement("button");
  close_button.classList.add("YCB-boxclose");
  close_button.innerText = "Close"
  close_button.onclick = (_ev) => {
    box.remove();
  }
  box.appendChild(close_button);

  let config_buttons_container = document.createElement("div");
  config_buttons_container.classList.add("YCB-configcontainer");
  box.appendChild(config_buttons_container);

  let index = 0;
  config.forEach(config_value => {
    let config_setting_parent = document.createElement("div");
    config_setting_parent.id = `YCB-configparent${index}`;
    config_setting_parent.classList.add("YCB-configparent");

    if (config_value.type != "bool") throw new Error("Type not supported")
    let button_label = document.createElement("label");
    button_label.innerText = config_value.name;
    button_label.htmlFor = `YCB-button${index}`;
    button_label.id = `YCB-label${index}`;
    button_label.classList.add("YCB-label");

    config_setting_parent.appendChild(button_label);

    console.log("index:", index)
    let toggle_button = document.createElement("input");
    toggle_button.type = "checkbox";
    toggle_button.id = `YCB-button${index}`;
    toggle_button.checked = config_value.value;
    toggle_button.dataset.index = index;
    toggle_button.onclick = (ev) => {
      console.log(ev.target.dataset.index);
      GM_setValue(config[ev.target.dataset.index].id, toggle_button.checked);
      config[ev.target.dataset.index].value = toggle_button.checked;
    }

    config_setting_parent.appendChild(toggle_button);

    config_buttons_container.appendChild(config_setting_parent);

    index++;
  })

  document.body.appendChild(box_container);
  debug_log("box created:",box)
}

(function () {
  'use strict';
  debug_log("YCB RUNNING");
  debug_log("enabled:",GM_getValue("enable", true));
  debug_log("config:", config);
  let isCurrentlyNavigating = false;
  
  // main execution
  (() => {
    debug_log("main execution async function running");
    // sub count checker
    // if enabled, run this asynchronous task
    if (GM_getValue("enable_subcount", true) || !isCurrentlyNavigating) {
    (async () => {
      
      debug_log("enable_subcount is true, continuing")
      // event loop
      while (true) {
        debug_log("subcount loop begin")
        // wait for comments to load
        await sleep(1000);
        let comments = document.querySelectorAll("div#body.ytd-comment-renderer");
        debug_log("all comments found",comments)

        if(comments.length === 0) continue;
        let rejects = []
        // if comment already affected, remove from array
        let unaffected_comments = Array.from(comments).filter((val) => {
          if (val.classList.contains("ycb-affected")) {
            rejects.push(val)
            return false;
          }
          return true;
        })
        debug_log("rejects:", rejects)
        
        // wait for another second for comments to arrive if no comments
        if (unaffected_comments.length === 0) continue;

        let ids = "";
        /**
         * @type {CommentInfo[]}
         */
        let elements_to_change = [];
        unaffected_comments.forEach(comment => {
          let author_element = (comment
            .children[1] // div#main
            .children[0] // div#header
            .children[1] // div#header-author
            .children[0] // h3
            .children[0] // a#author-text
          );
          let author_text = (author_element
            .children[0] // span
            .innerText
          );
          let author_id = (author_element.href).replace("https://www.youtube.com/channel/", "");
          console.log(author_text)
          console.log(author_id)
          ids += author_id + ","
          comment.classList.add("ycb-affected")
          elements_to_change.push({
            comment_element: comment,
            author_element: author_element,
            author_username: author_text,
            author_id: author_id
          })
        })
        // remove ending comma
        ids = ids.slice(0, ids.length - 1)
        console.log(ids)

        if(!token) alert("You cannot enable subscriber count in comments without providing an API key! Read https://rafplayz.dev/userscripts/YCB/README.md !")
        // fetch subscriber data from google API
        // token is defined in local userscript
        let subscriber_counts = await fetch(`https://www.googleapis.com/youtube/v3/channels?` +
          `id=${ids}&key=${token}&part=statistics`)

        /**
         * @type {GoogleApiReturnedInfo}
         */
        let returned_info = await subscriber_counts.json();
        
        // add subscriber count with data from API
        elements_to_change.forEach(async comment => {
          let foundStats = returned_info.items.find(value => {
            if (value.id == comment.author_id) return true
          })
          console.log(foundStats);

          if (foundStats.statistics.hiddenSubscriberCount) return;
          if (!foundStats) return;

          let sub_count_container = document.createElement("div");
          sub_count_container.className = "YCB-subbox";

          let sub_count = document.createElement("span");
          sub_count.className = "YCB-subcount";
          sub_count.innerText = (foundStats.statistics.hiddenSubscriberCount
            ? "Hidden"
            : ((foundStats.statistics.subscriberCount)-0).toLocaleString()); // FIXME: remove ugly one-liner

          sub_count_container.appendChild(sub_count);

          let sub_count_descriptor = document.createElement("span");
          sub_count_descriptor.className = "YCB-subcountdescriptor";
          sub_count_descriptor.innerText = " subscribers";

          sub_count_container.appendChild(sub_count_descriptor);

          if (!comment_style_added) {
            GM_addStyle(
              "div.YCB-subbox {" +
              "display:inline;color: #aaa;background-color: black;border-radius:5px;border: 1px solid black;padding-left: 2px;"+
              "padding-right: 2px;font-size: 11.7px; font-weight: 700" +
              "}" +
              "span.YCB-subcount {" +
              "color:orange;" +
              "}"
            )
            // if to the right of name, add padding
            if(!GM_getValue("subcount_below_name")) GM_addStyle("div.YCB-subbox { margin-left: 5px; }")
            comment_style_added = true;
          }
          if (GM_getValue("subcount_below_name")) {
            comment.author_element.parentElement.appendChild(sub_count_container);
          }
          else {
            comment.author_element.parentElement.parentElement.appendChild(sub_count_container);
          }


        })

        console.log(elements_to_change);
        console.log(unaffected_comments);
        console.log(returned_info);
      }
    })();
    }

  // end of main execution
  })();

  GM_registerMenuCommand('Configure', open_config_menu)

  // clean up subscriber counts when videos are clicked off of
  unsafeWindow.addEventListener("yt-navigate-start", async (ev) => {
    console.log("yt-navigate-start popped", ev)
    isCurrentlyNavigating = true;
    document.querySelectorAll("div.YCB-subbox")
    .forEach(element => element.remove())
    document
    .querySelectorAll(".ycb-affected")
    .forEach(element => element.classList.remove("ycb-affected"))
  })
  unsafeWindow.addEventListener("yt-navigate-finish", async (ev) => {
    console.log("yt-navigate-finish popped", ev)
    isCurrentlyNavigating = false;
    document.querySelectorAll("div.YCB-subbox")
    .forEach(element => element.remove());
    document
    .querySelectorAll(".ycb-affected")
    .forEach(element => element.classList.remove("ycb-affected"));
    add_config_button_to_navbar();
  })

  debug_log("event listeners added")

// end of executed script
})();


