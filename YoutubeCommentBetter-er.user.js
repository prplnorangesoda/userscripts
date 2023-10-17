// ==UserScript==
// @name         Youtube comment better-er
// @namespace    dev.rafplayz
// @version      0.1
// @description  Various improvements to the YouTube comment display -- NOTE: BETA
// @author       You
// @website      https://rafplayz.dev/userscripts
// @match        https://www.youtube.com/watch*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=youtube.com
// @require      
// @grant        GM_registerMenuCommand
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_addStyle
// ==/UserScript==

// from https://www.w3schools.com/howto/howto_js_draggable.asp
function dragElement(elmnt) {
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

(function() {
  'use strict';
  console.log("New userscript ran");
  console.log(GM_getValue("enable", true))
  let config_style_added = false;

  let config = [
    {
      type: "bool",
      id: "enable_displayname",
      name: "Enable displayname showing",
      value: GM_getValue("enable_displayname", true)
    }
  ]

  GM_registerMenuCommand('Configure', () => {
    console.log("Registered");

    if(!config_style_added) {
      GM_addStyle(
        ".YCB-box {"+
        "position: fixed; display: flex; flex-direction: column;align-items:center;color: black; background-color: white;"+
        "z-index: 20000;border-radius:5px;border: 1px solid black;min-width: 200px;min-height: 200px;"+
        "font-size: 1.6em"+
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
    box.innerText = "Drag me!";
    box_container.appendChild(box);
    dragElement(box);

    let close_button = document.createElement("button");
    close_button.classList.add(".YCB-boxclose");
    close_button.innerText = "Close"
    close_button.onclick = (_ev) => {
      box.remove();
    }
    box.appendChild(close_button);

    let config_buttons_container = document.createElement("div");
    config_buttons_container.classList.add(".YCB-configcontainer");
    box.appendChild(config_buttons_container);

    let index = 0;
    config.forEach(config_value => {
      if(config_value.type != "bool") throw new Error("Type not supported")
      let button_label = document.createElement("label");
      button_label.innerText = config_value.name;
      button_label.htmlFor = `YCB-button${index}`;
      button_label.id = `YCB-label${index}`;
      button_label.classList.add("YCB-label");

      config_buttons_container.appendChild(button_label);

      console.log("index:",index)
      let toggle_button = document.createElement("input");
      toggle_button.type = "checkbox";
      toggle_button.id = `YCB-button${index}`;
      toggle_button.checked = config_value.value;
      toggle_button.dataset.index = index;
      toggle_button.onclick = (_ev) => {
        console.log(_ev.target.dataset.index);
        GM_setValue(config[_ev.target.dataset.index].id, toggle_button.checked);
        config[_ev.target.dataset.index].value = toggle_button.checked;
      }

      config_buttons_container.appendChild(toggle_button);

      index++;
    })

    document.body.appendChild(box_container);
  })

  function sleep(time) {
    return new Promise((res) => {
      setTimeout(res,time)
    })
  }
  // main event loop
  (async () => {
    while (true) {
      await sleep(1000);
      let comments = document.querySelectorAll("div#body.ytd-comment-renderer");
      let unaffected_comments = Array.from(comments).filter((val) => {
        if(val.classList.contains("ycb-affected")) {
          console.log("affected");
          return false;
        }
        return true;
      })

      if(unaffected_comments.length === 0) continue;

      let ids = ""
      unaffected_comments.forEach(async comment => {
        let author_text = (comment
          .children[1] // div#main
          .children[0] // div#header
          .children[1] // div#header-author
          .children[0] // h3
          .children[0] // a#author-text
          .children[0] // span
          .innerText
        )
        let author_id = (comment
          .children[1] // div#main
          .children[0] // div#header
          .children[1] // div#header-author
          .children[0] // h3
          .children[0]
          .href // a#author-text
        ).replace("https://www.youtube.com/channel/","")
        
        
        console.log(author_text)
        console.log(author_id)
        ids += author_id + ","
        comment.classList.add("ycb-affected")
      })
      ids = ids.slice(0, ids.length-1)
      console.log(ids)

      let subscriberCounts = await fetch(`https://www.googleapis.com/youtube/v3/channels?`+
      `id=${ids}&key=${token}&part=statistics`)


      console.log(unaffected_comments);
      console.log(subscriberCounts);
      console.log(await subscriberCounts.json());
    }
  })()
})();