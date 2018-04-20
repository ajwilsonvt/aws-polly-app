var API_ENDPOINT = 'https://arnesqy3u5.execute-api.us-east-1.amazonaws.com/dev';

$(function() {

  init();

  document.getElementById('sayButton').onclick = function() {
    document.getElementById('postIDreturned').textContent = '';
    var formattedText = $('#postText')
      .val()
      // .replace(/(?<=[^-\s])\n/g, '. ')
      .replace(/\n/g, ' ')
      .replace(/\.{2,}/g, '. ')
      .replace(/\-{2,}/g, '')
      .replace(/\—{2,}/g, '')
      .replace(/\</g, '')
      .replace(/\>/g, '')
      .replace(/\"/g, '')
      .replace(/\'/g, '')
      .replace(/\“/g, '')
      .replace(/\”/g, '')
      .replace(/\&/g, 'and');

    var inputData = {
      'voice': 'Joanna',
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
        var element = document.getElementById('postIDreturned');
        element.className = 'success';
        element.textContent = 'Success';
        $('#postText').val('');
        document.getElementById('charCounter').textContent = 'Characters: 0';
        init();
      },
      error: function() {
        var element = document.getElementById('postIDreturned');
        element.className = 'error';
        element.textContent = 'Error';
      },
    });
  }

  document.getElementById('postText').onkeyup = function() {
    var length = $(postText).val().length;
    document.getElementById('charCounter').textContent = 'Characters: '
      + length;
  }

  function init() {
    $('#notes').empty();
    $.ajax({
      url: API_ENDPOINT + '?postId=*',
      type: 'GET',
      success: function(response) {
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

          jQuery.each(response, function(i, data) {
            var player = "<audio controls><source src='" + data['url']
              + "' type='audio/mpeg'></audio>"
            if (typeof data['url'] === "undefined") {
              var player = ""
            }
            $('#posts').append(`<div class="card space-bottom voicenote">
                <div class="card-body">
                  <div class="container-fluid">
                    <div class="row text-center align-items-center">
                      <div class="col-lg-3">
                        <span class="small timestamp">${data['timestamp']}</span>
                        <strong>${data['text'].length > 20 ? 
                          `${data['text'].slice(0, 20)}...` : data['text']}
                        </strong>
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
          });

          var element = document.getElementById('postIDreturned');
          element.className = 'success';
          element.textContent = 'Success';

          $('.btn-danger').click(function() {
            document.getElementById('postIDreturned').textContent = '';
            var $deleteButton = $(this);
            $.ajax({
              url: API_ENDPOINT,
              type: 'DELETE',
              data:  JSON.stringify({ 'id': $(this).val() }),
              contentType: 'application/json; charset=utf-8',
              success: function(response) {
                var element = document.getElementById('postIDreturned');
                element.className = 'success';
                element.textContent = 'Success';

                // remove this card
                $deleteButton.parents('.card:eq(0)').remove();

                if (!$('#notes .voicenote').length) {
                  $('#notes').empty();
                }
              },
              error: function() {
                var element = document.getElementById('postIDreturned');
                element.className = 'error';
                element.textContent = 'Error';
              },
            });
          });
        } else {
          console.log('No voice notes found');
        }
      },
      error: function() {
        var element = document.getElementById('postIDreturned');
        element.className = 'error';
        element.textContent = 'Error';
      },
    });
  }

});
