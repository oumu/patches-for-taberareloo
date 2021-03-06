// ==Taberareloo==
// {
//   "name"        : "View Tumblr Dashboard"
// , "description" : "View Tumblr Dashboard page with the post"
// , "include"     : ["background"]
// , "version"     : "0.2.1"
// , "downloadURL" : "https://raw.github.com/YungSang/patches-for-taberareloo/master/others/menu.tumblr.view.dashboard.tbrl.js"
// }
// ==/Taberareloo==

// https://github.com/polygonplanet/tombloo/blob/master/tombloo.model.tumblr.view.dashboard.by.permalink.js
// http://let.hatelabo.jp/taizooo/let/gYC-xpPJiqHJGQ

(function() {
  var tumblrSinglePageUrl = [
    '*://*.tumblr.com/post/*'
  ];
  Menus._register({
    type     : 'separator',
    contexts : ['all'],
    documentUrlPatterns : tumblrSinglePageUrl
  });
  Menus._register({
    title    : 'View Tumblr Dashboard',
    contexts : ['page'],
    documentUrlPatterns : tumblrSinglePageUrl,
    onclick  : function(info, tab) {
      var post_id = info.pageUrl.extract(/tumblr\.com\/post\/([0-9]+)/);
      chrome.tabs.create({
        url : 'http://www.tumblr.com/dashboard/999/?offset=' + (parseInt(post_id, 10) + 1)
      });
    }
  });
  Menus.create();
})();
