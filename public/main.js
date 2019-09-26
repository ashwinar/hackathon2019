'use strict';

// Wrap everything in an anonymous function to avoid polluting the global namespace
(function () {

  let visibilityObject = {};
  let extensionName = ["Secure-FaceID"];

  $(document).ready(function () {
    tableau.extensions.initializeAsync().then(function () {


      // 2. Hide all the worksheets from the dashboard
      hideAllWorksheets();

      // 3. Wait until user enters their face input

      // 4. Show Authorize Button
      showAuthorizeButton();

    }, function (err) {
      // Something went wrong in initialization.
      console.log('Error while Initializing: ' + err.toString());
    });
  });

  function hideAllWorksheets() {
    tableau.extensions.dashboardContent.dashboard.objects.forEach(function(object){
      if(!extensionName.includes(object.name)){
        visibilityObject[object.id] = tableau.ZoneVisibilityType.Hide;
      }
    });

    tableau.extensions.dashboardContent.dashboard.setZoneVisibilityAsync(visibilityObject).then(() => {
      console.log("All hidden");
    });
  }

  function showAllWorksheets() {
    let showVisibilityObject = {};
    Object.keys(visibilityObject).forEach(function(key) {
      showVisibilityObject[key] = tableau.ZoneVisibilityType.Show;
  });

    tableau.extensions.dashboardContent.dashboard.setZoneVisibilityAsync(showVisibilityObject).then(() => {
      console.log("All shown");
    });
  }

  function showAuthorizeButton () {
    // Clear the table first.
    $('#auth_table > tbody tr').remove();
    const authTable = $('#auth_table > tbody')[0];

    let newRow = authTable.insertRow(authTable.rows.length);
    let authCell = newRow.insertCell(0);
    let authButton = document.createElement('button');
    authButton.innerHTML = ('Authorize');
    authButton.type = 'button';
    authButton.className = 'btn btn-primary';
    authButton.addEventListener('click', function () { authorizeWithKairos(); });
    authCell.appendChild(authButton);
  }

    // Call kairos API 
    function authorizeWithKairos() {
        // On successful authorize, show all worksheets in the dashboard
        const dashboard = tableau.extensions.dashboardContent.dashboard;
        $('#testVal').text(document.getElementById('cam_input').value);
        $('#testVal2').text(dashboard.name);

        // Successfully authorized, show all sheets
        showAllWorksheets();
    }

})();
