'use strict';

// Wrap everything in an anonymous function to avoid polluting the global namespace
(function () {

  var popupUrl = './configure.html';
  let extensionName = ["Secure-FaceID"];
  let authorizationMap = {
    "Ashwin": "Ashwin's Sheet",
    "Johnny": "Johnny's Sheet"
  };

  $(document).ready(function () {
    tableau.extensions.initializeAsync({ 'configure': configure, 'configure': configure }).then(function () {
      tableau.extensions.settings.addEventListener(tableau.TableauEventType.SettingsChanged, (settingsEvent) => {
        console.log("settings have been updated: " + JSON.stringify(settingsEvent.newSettings));
      });

      // Hide all the worksheets from the dashboard
      hideAllWorksheets();

      // Show Authorize Button
      showAuthorizeButton();

    }, function (err) {
      // Something went wrong in initialization.
      console.log('Error while Initializing: ' + err.toString());
    });
  });

  function configure() {
    tableau.extensions.ui.displayDialogAsync(popupUrl, 'openPayload', { height: 500, width: 500 }).then((payload) => {
      console.log("Dialog closed with payload: ");
      console.log(payload);
    }).catch((error) => {
      // This will be hit if the user manually closes the dialog
      switch (error.errorCode) {
        case tableau.ErrorCodes.DialogClosedByUser:
          console.log("Dialog was closed by user");
          break;
        default:
          console.error(error.message);
      }
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
    authButton.addEventListener('click', function () { authButtonHandler(); });
    authCell.appendChild(authButton);
  }

  var respCallbackFn = function (response) {
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
  };

  function authButtonHandler() {
    // handle cases where you were already authorized
    hideAllWorksheets();

    // clear all existing messages
    clearAllMessages();

    let file_input = document.getElementById('cam_input');
    if (typeof file_input == "undefined" || file_input.value.length <= 0) {
      $('#errorMsg').text("Please provide an input path..");
      return;
    }

    $('#auth_btn').prop('disabled', true);
    getReducedImgB64Data('cam_input', 'errorMsg', 1).then((reducedImageB64data) => {
      recognizeAPI(reducedImageB64data, respCallbackFn);
    });
  }


  function hideAllWorksheets() {
    if (tableau.extensions.environment.mode == tableau.ExtensionMode.Authoring) {
      return; // make it easy to select layouts during authoring
    }

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
    var settings = tableau.extensions.settings.getAll();
    tableau.extensions.dashboardContent.dashboard.objects.forEach(function (object) {
      if (settings[subjectId] == object.name) {
        showVisibilityObject[object.id] = tableau.ZoneVisibilityType.Show;
      }
    });

    tableau.extensions.dashboardContent.dashboard.setZoneVisibilityAsync(showVisibilityObject).then(() => {
      console.log("Shown for visibility object: " + JSON.stringify(showVisibilityObject));
    });
  }

  function clearAllMessages() {
    $('#entryMsg').text('');
    $('#errorMsg').text('');
  }

})();
