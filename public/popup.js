$(document).ready(() => {
    tableau.extensions.initializeDialogAsync().then((initialPayload) => {
        clearInputAndDisplaySettings();

        // populate drop-down with worksheet names
        let dashboard = tableau.extensions.dashboardContent.dashboard;
        dashboard.worksheets.forEach(function (worksheet) {
            let optionText = worksheet.name;
            let optionValue = worksheet.name;
            $('#worksheet-sel').append(`<option value="${optionValue}">${optionText}</option>`);
        });

        $('#close').click(() => {
            clearInputAndResults();
            tableau.extensions.ui.closeDialog("testPayload");
        });

        $('#save').click(() => {
            var userName = $('#input1').val();
            if (userName.length <= 0) {
                $('#popupErrorMsg').text('Please enter a username..');
                return;
            }

            var worksheetAuthorized = $('#worksheet-sel').find(":selected").val();
            tableau.extensions.settings.set(userName, worksheetAuthorized);
            tableau.extensions.settings.saveAsync();
            let file_input = document.getElementById('photo_input');

            if (typeof file_input == "undefined" || file_input.value.length <= 0) {
                $('#popupErrorMsg').text("Please provide an input path..");
                return;
            }

            $('#save').prop('disabled', true);
            getReducedBase64Data(file_input).then((base64Data) => {
                enrollAPI(base64Data, userName, saveCallbackFn);
            });
        });

        $('#eraseall').click(() => {
            var settings = tableau.extensions.settings.getAll();
            var settingKeys = Object.keys(settings);
            settingKeys.forEach(element => {
                tableau.extensions.settings.erase(element);
            });
            tableau.extensions.settings.saveAsync();

            clearInputAndResults();
        });

        $("#upfile").click(function () {
            $("#photo_input").trigger('click');
            $("#photo_input").show();
        });
    });
});

var saveCallbackFn = function (response) {
    console.log(response);
    let resp = JSON.parse(response);

    // check for any error, if any display it
    if (resp.hasOwnProperty("Errors") && resp.Errors.length > 0) {
        $('#popupErrorMsg').text(resp.Errors[0].Message);
        $('#save').prop('disabled', false);
        return;
    }

    // valid response then ..
    clearInputAndDisplaySettings();
    $('#save').prop('disabled', false);
};

function clearInputAndDisplaySettings() {
    clearInputAndResults();
    var settings = tableau.extensions.settings.getAll();
    var settingKeys = Object.keys(settings);
    const settingsTable = $('#settingsTable > tbody')[0];
    settingKeys.forEach(element => {
        let newRow = settingsTable.insertRow(settingsTable.rows.length);
        let userNameCell = newRow.insertCell(0);
        let worksheetNameCell = newRow.insertCell(1);
        userNameCell.innerHTML = element;
        worksheetNameCell.innerHTML = settings[element];
    });

    if (settingKeys.length > 0) {
        $('#settingsTable').removeClass('hidden').addClass('show');
    }
}

function clearInputAndResults() {
    resetFields();
    $('#settingsTable > tbody tr').remove();
    $('#settingsTable').removeClass('show').addClass('hidden');
}

function resetFields() {
    // clear input fields
    $('#input1').val('');
    $('#input2').val('');
    $('#photo_input').val('');
    $('#popupErrorMsg').text('');
    $("#photo_input").hide();
}