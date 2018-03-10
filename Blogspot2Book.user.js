// ==UserScript==
// @name         Blogspot2Book
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Show every entry of your blog in one page without css styling to be easily printable as din a4.
// @author       daniel
// @match        https://*.blogspot.de/*
// @match        https://*.blogspot.com/*
// @grant        GM_addStyle
// ==/UserScript==

// toggle all toggable links (except those, which are already toggled)
var toggles = [].slice.call(document.getElementsByClassName('toggle'));
toggles.forEach(function(toggle) {
    if(toggle.getElementsByClassName('toggle-open').length == 0) {
        toggle.click();
    }
});

// get links after timeout in which links are loaded
var linkArray = [];
setTimeout(function(){
    var ulHierarchy = document.getElementsByClassName('hierarchy')[0];
    var links = [].slice.call(ulHierarchy.getElementsByTagName('a'));
    links.forEach(function(link) {
        if(link.href.indexOf('.html', link.href.length - 5) !== -1) {
            linkArray.push(link.href);
        }
    });

    // sort links from oldest to newest
    linkArray = linkArray.reverse();
    console.log(linkArray);

    //!! TESTING !!
    //linkArray = linkArray.slice(0,2);
    //!! TESTING !!

    // call each link
    var contentDivs = [];
    linkArray.forEach(function(href) {
        console.log('Creating Request for ' + href);
        httpRequest = new XMLHttpRequest();
        if(!httpRequest) {
            console.log('Cannot create an XMLHTTP instance');
        }
        httpRequest.open('GET', href, false);
        httpRequest.onreadystatechange = function() {
            if(httpRequest.readyState === XMLHttpRequest.DONE && httpRequest.status === 200) {
                // get content of subpage
                var tempDiv = document.createElement('div');
                tempDiv.innerHTML = httpRequest.responseText; // Set its contents to the HTML string

                // delete comment section
                var comments = tempDiv.querySelector('#comments');
                comments.parentNode.removeChild(comments);

                // delete footer
                var footer = tempDiv.querySelector('.post-footer');
                footer.parentNode.removeChild(footer);

                // get main section
                contentDivs.push(tempDiv.querySelector('.date-outer'));
            }
        };
        httpRequest.send();
    });

    // delete styling
    document.head.innerHTML = "";

    // replace body
    document.body.innerHTML = "";
    // and append sections
    for(var i=0; i<contentDivs.length; ++i) {
        document.body.appendChild(contentDivs[i]);
    }

    GM_addStyle("@page { size: A4; }");
    GM_addStyle("div.date-outer { page-break-after: always; }");

}, 3000);