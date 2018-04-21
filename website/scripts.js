var API_ENDPOINT = 'https://arnesqy3u5.execute-api.us-east-1.amazonaws.com/dev';
var DISPLAY_TEXT = 23;
var lastResponse = null;

$(function() {

  init();

  document.getElementById('sayButton').onclick = function() {
    document.getElementById('postIDreturned').textContent = '';
    var formattedText = format($('#postText').val());
    var inputData = {
      'voice': 'Joanna',
      'rawText': $('#postText').val(),
      'text' : formattedText,
      'speed': 'slow',    // x-slow, slow, medium, fast, x-fast
      'timestamp': (new Date()).toLocaleString(),
    };

    $.ajax({
      url: API_ENDPOINT,
      type: 'POST',
      data:  JSON.stringify(inputData),
      contentType: 'application/json; charset=utf-8',
      success: function(response) {
        flash('Success');
        $('#postText').val('');
        document.getElementById('charCounter').textContent = 'Characters: 0';
        init();
      },
      error: function() {
        flash('Error');
      },
    });
  }

  document.getElementById('postText').onkeyup = function() {
    var len = $(postText).val().length;
    document.getElementById('charCounter').textContent = 'Characters: '
      + len;
  }

  function init() {
    $('#notes').empty();
    $.ajax({
      url: API_ENDPOINT + '?postId=*',
      type: 'GET',
      success: function(response) {
        lastResponse = response;
        console.log('response', response);
        if (response.length > 0) {
          $('#notes').append(`
            <div class="card space-bottom">
              <div class="card-body">
                <h2 class="text-center">Voice Notes</h2>
                <div class="text-center">
                  <button id="searchButton" class="btn btn-primary btn-sm">
                    Refresh List
                  </button>
                </div>
                <br>
                <div id="posts"></div>
              </div>
            </div>
          `);

          document.getElementById('searchButton').onclick = function() {
            document.getElementById('postIDreturned').textContent = '';
            init();
          }

          // loop
          jQuery.each(response, function(i, data) {
            var player = "<audio controls><source src='" + data['url']
              + "' type='audio/mpeg'></audio>";

            if (typeof data['url'] === "undefined") {
              var player = '';
            }

            $('#posts').append(`
              <div class="card space-bottom voice-note">
                <div class="card-body">
                  <div class="container-fluid">
                    <div class="row text-center align-items-center">
                      <div id="note-${i}" class="col-lg-3">
                        <span class="small timestamp">
                          ${data['timestamp']}
                        </span>
                        <strong>${data['text'].length > DISPLAY_TEXT ? 
                          `${data['text'].slice(0, DISPLAY_TEXT - 3)}...`
                          : data['text']}</strong>
                      </div>
                      <div class="col-lg-6">
                        ${data['status'] === "PROCESSING" ?
                          "<strong>Processing</strong>" : player}
                      </div>
                      <div class="col-lg-3">
                        <button value="${data['id']}" class="btn btn-danger">
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            `);

            $(`#note-${i}`).click(function() {
              if (lastResponse[i].text.length <= DISPLAY_TEXT) return;

              var $text = $(this).find('strong');
              if ($text.text().length < lastResponse[i].text.length) {
                // display full text
                $text.text(lastResponse[i].text);
              } else {
                // display truncated text
                $text.text(`${lastResponse[i].text.slice(0,
                  DISPLAY_TEXT - 3)}...`);
              }
            })
          });

          flash('Success');

          $('.btn-danger').click(function() {
            document.getElementById('postIDreturned').textContent = '';
            var $deleteButton = $(this);
            $.ajax({
              url: API_ENDPOINT,
              type: 'DELETE',
              data:  JSON.stringify({ 'id': $(this).val() }),
              contentType: 'application/json; charset=utf-8',
              success: function(response) {
                flash('Success');

                // remove the card containing this button
                $deleteButton.parents('.card:eq(0)').remove();

                // delete the #notes section if the last note was deleted
                if (!$('#notes .voice-note').length) {
                  $('#notes').empty();
                }
              },
              error: function() {
                flash('Error');
              },
            });
          });
        } else {
          console.log('No voice notes found');
        }
      },
      error: function() {
        flash('Error');
      },
    });
  }

  function format(str) {
    var lineArr = str.split('\n');
    var periodEndArr = lineArr.map(function(el) {
      if (el.match(/[a-zA-Z]/)) {
        if (el.charAt(el.length - 1).match(/[\;\.\,\?\!]/)) {
            return el;
        } else {
            return el + '.';
        }
      } else {
          return '';
      }
    });
    var nonEmptyArr = periodEndArr.filter(function(el) {
      return el.length;
    });
    var joinedStr = nonEmptyArr.join(' ');

    // regex /g flag means match all occurrences, needed on replace() or else
    // only first occurrence is replaced
    var finalStr = joinedStr
      // .replace(/(?<=[^-\s])\n/g, '. ')
      // .replace(/\.{2,}/g, '. ')
      .replace(/[\-\—]{2,}/g, '')
      .replace(/[\<\>\"\'\“\”]/g, '')
      .replace(/\&/g, 'and');
    return finalStr;
  }

  function flash(message) {
    var el = document.getElementById('postIDreturned');
    el.className = message.toLowerCase();
    el.textContent = message;

    setTimeout(function() {
      el.textContent = '';
    }, 2000);
  }

});
