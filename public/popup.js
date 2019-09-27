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
            tableau.extensions.ui.closeDialog("testPayload");
        });

        $('#save').click(() => {
            var settingKey = $('#input1').val();
            var settingValue = $('#worksheet-sel').find(":selected").val();
            tableau.extensions.settings.set(settingKey, settingValue);
            tableau.extensions.settings.saveAsync();

            clearInputAndDisplaySettings();
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
        });
    });
});

function clearInputAndDisplaySettings() {
    clearInput();
    var settings = tableau.extensions.settings.getAll();
    var settingKeys = Object.keys(settings);
    $('#settingsTable > tbody tr').remove();
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
    clearInput();
    $('#settingsTable > tbody tr').remove();
    $('#settingsTable').removeClass('show').addClass('hidden');
}

function clearInput() {
    // clear input fields
    $('#input1').val('');
    $('#input2').val('');
    $('#photo_input').val('');
}