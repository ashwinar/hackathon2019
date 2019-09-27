'use strict';

// Wrap everything in an anonymous function to avoid polluting the global namespace
(function () {

  let extensionName = ["Secure-FaceID"];
  let authorizationMap = {
    "Ashwin": "Ashwin's Sheet",
    "Johnny": "Johnny's Sheet"
  };

  $(document).ready(function () {
    tableau.extensions.initializeAsync().then(function () {
      // 1. Hide all the worksheets from the dashboard
      hideAllWorksheets();

      // 4. Show Authorize Button
      showAuthorizeButton();

    }, function (err) {
      // Something went wrong in initialization.
      console.log('Error while Initializing: ' + err.toString());
    });
  });

  function hideAllWorksheets() {
    let visibilityObject = {};
    tableau.extensions.dashboardContent.dashboard.objects.forEach(function (object) {
      if (!extensionName.includes(object.name)) {
        visibilityObject[object.id] = tableau.ZoneVisibilityType.Hide;
      }
    });

    tableau.extensions.dashboardContent.dashboard.setZoneVisibilityAsync(visibilityObject).then(() => {
      console.log("All hidden");
    });
  }

  function showWorksheetsForSubject(subjectId) {
    let showVisibilityObject = {};
    tableau.extensions.dashboardContent.dashboard.objects.forEach(function (object) {
      if (authorizationMap[subjectId] == object.name) {
        showVisibilityObject[object.id] = tableau.ZoneVisibilityType.Show;
      }
    });

    tableau.extensions.dashboardContent.dashboard.setZoneVisibilityAsync(showVisibilityObject).then(() => {
      console.log("Shown for visibility object: " + JSON.stringify(showVisibilityObject));
    });
  }

  function showAuthorizeButton() {
    // Clear the table first.
    $('#auth_table > tbody tr').remove();
    const authTable = $('#auth_table > tbody')[0];

    let newRow = authTable.insertRow(authTable.rows.length);
    let authCell = newRow.insertCell(0);
    let authButton = document.createElement('button');
    authButton.innerHTML = ('Authorize');
    authButton.type = 'button';
    authButton.className = 'btn btn-primary';
    authButton.id = 'auth_btn';
    authButton.addEventListener('click', function () { authorizeWithKairos(); });
    authCell.appendChild(authButton);
  }

  // Call kairos API 
  function authorizeWithKairos() {
    // handle cases where you were already authorized
    hideAllWorksheets();

    // clear all existing messages
    clearAllMessages();

    if (document.getElementById('cam_input').value.length <= 0) {
      let errMsg = 'Please provide a path...';
      $('#errorMsg').text(errMsg);
      console.error(errMsg);
      return;
    }

    $('#auth_btn').prop('disabled', true);
    var file = document.querySelector('#cam_input').files[0];
    getBase64(file).then((base64Str) => {
      // put your keys in the header
      var headers = {
        "Content-type": "application/json",
        "app_id": "e013ad8d",
        "app_key": "da171293bacd6514367f9d9371fed857"
      };
      var payload = {
        "image": base64Str,
        "gallery_name": "Hackathon2019"
      };
      var url = "https://api.kairos.com/recognize";
      // make request 
      $.ajax(url, {
        headers: headers,
        type: "POST",
        data: JSON.stringify(payload),
        dataType: "text"
      }).done(function (response) {
        // console.log(response);
        let resp = JSON.parse(response);

        // check for any error, if any display it
        if (resp.hasOwnProperty("Errors") && resp.Errors.length > 0) {
          $('#errorMsg').text(resp.Errors[0].Message);
          $('#auth_btn').prop('disabled', false);
          return;
        }

        // valid response then .. 
        let entryMsg = '';
        let images = resp.images[0];
        if (images.hasOwnProperty("candidates") && images.candidates.length > 0) {  // we've found a match
          let subjectId = images.candidates[0].subject_id;
          entryMsg = `Welcome ${subjectId}!`;
          // Successfully authorized, show the respective worksheet in the dashboard
          showWorksheetsForSubject(subjectId);
        }
        else {
          entryMsg = 'Sorry, snoopy snooperson!';
        }
        $('#entryMsg').text(entryMsg);
        $('#auth_btn').prop('disabled', false);
      });
    });

  }

  function getBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        let encoded = reader.result.toString().replace(/^data:(.*,)?/, '');
        if ((encoded.length % 4) > 0) {
          encoded += '='.repeat(4 - (encoded.length % 4));
        }
        resolve(encoded);
      };
      reader.onerror = error => reject(error);
    });
  }

  function clearAllMessages() {
    $('#entryMsg').text('');
    $('#errorMsg').text('');
  }

})();
