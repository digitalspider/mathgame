/**
 * Make a JQuery post, call the makeHtmlCB callback with the json data,
 * and place the result into the eleSelector element.
 * @param {string} url the api url to call
 * @param {string} postData the data to post to the url
 * @param {string} eleSelector the element selector where the result is placed
 * @param {Function} makeHtmlCB the callback to convert json to html
 * @param {string} reloadPage if true reload the current page
 * @param {string} dataType options = xml, json, script, text, html
 */
function ajaxPost(url, postData, eleSelector, makeHtmlCB, reloadPage = false, dataType='json') {
  // alert(url);
  jQuery.post( url, postData, function( data ) {
    // alert('res='+JSON.stringify(data));
    if (eleSelector) {
      if (makeHtmlCB) {
        $(eleSelector).html(makeHtmlCB(data));
      } else {
        $(eleSelector).html(data);
      }
    }
    if (reloadPage) location.reload();
  }, dataType);
}

function createGame(id) {
  ajaxPost('/api/game', null, null, null, true);
}

function startGame(id) {
  ajaxPost('/api/game/'+id+'/start', null, null, null, true);
}

function stopGame(id) {
  ajaxPost('/api/game/'+id+'/stop', null, null, null, true);
}