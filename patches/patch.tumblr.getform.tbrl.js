// ==Taberareloo==
// {
//   "name"        : "Send to Twitter/Facebook from Tumblr"
// , "namespace"   : "https://github.com/YungSang/patches-for-taberareloo"
// , "description" : "Set 'Send to Twitter/Facebook' automatically"
// , "include"     : ["background", "content"]
// , "match"       : ["http://www.tumblr.com/dashboard*"]
// , "version"     : "1.7.1"
// , "downloadURL" : "https://raw.github.com/YungSang/patches-for-taberareloo/master/patches/patch.tumblr.getform.tbrl.js"
// }
// ==/Taberareloo==

(function() {
  if (inContext('background')) {
    function getShareOption(channel_id) {
      return request('http://www.tumblr.com/dashboard').addCallback(function(res) {
        var html = res.responseText.replace(/\s+/g, ' ');
        var selectbox = html.extract(/<% \} else \{ %>(<div id="tumblelog_choices".*<\/ul><\/div><\/div><\/div>)<% \} %><\/div>/);
        var doc = createHTML(selectbox);
        var div;
        if (channel_id) {
          div = $X('//li/div[@data-option-value="' + channel_id + '"]', doc)[0];
        }
        else {
          div = $X('//li/div', doc)[0];
        }

        var twitter     = div.getAttribute('data-twitter')     === 'true';
        var twitter_on  = div.getAttribute('data-twitter-on')  === 'true';
        var facebook    = div.getAttribute('data-facebook')    === 'true';
        var facebook_on = div.getAttribute('data-facebook-on') === 'true';

        return {
          id       : div.getAttribute('data-option-value'),
          twitter  : twitter && twitter_on,
          facebook : facebook && facebook_on
        };
      });
    }

    addAround(Models['Tumblr'], 'getForm', function(proceed, args, target, methodName) {
      return proceed(args).addCallback(function(form) {
        var dmy_form = {};
        target.appendTags(dmy_form, {});
        return getShareOption(dmy_form.channel_id).addCallback(function(option) {
          form = update(form, {
            channel_id      : option.id,
            send_to_twitter : option.twitter  ? 'on' : '',
            send_to_fbog    : option.facebook ? 'on' : ''
          });
          return form;
        });
      });
    });
    addAround(Models['Tumblr'], 'favor', function(proceed, args, target, methodName) {
      var dmy_form = {};
      target.appendTags(dmy_form, {});
      return getShareOption(dmy_form.channel_id).addCallback(function(option) {
        args[0].favorite.form = update(args[0].favorite.form, {
          channel_id      : option.id,
          send_to_twitter : option.twitter  ? 'on' : '',
          send_to_fbog    : option.facebook ? 'on' : ''
        });
        return proceed(args);
      });
    });
    return;
  }

  update(Extractors['ReBlog - Dashboard'], {
    extract : function(ctx) {
      var post = $X('./ancestor-or-self::*[starts-with(@id,"post_")]', ctx.target)[0];

      ctx.title      = $X('.//a[@class="post_avatar_link"]/@title', post)[0];
      ctx.href       = $X('.//a[@class="post_permalink"]/@href', post)[0];
      ctx.form_key   = $X('.//input[@name="form_key"]/@value', post)[0];
      ctx.reblog_id  = post.getAttribute('data-post-id');
      ctx.reblog_key = post.getAttribute('data-reblog-key');
      ctx.post_type  = post.getAttribute('data-type');

      var that = Extractors['ReBlog'];
      return that.getFormKeyAndChannelId(ctx).addCallback(function() {
        return that.extractByEndpoint(ctx, that.TUMBLR_URL + 'reblog/' + ctx.reblog_id + '/' + ctx.reblog_key);
      });
    }
  });
})();
