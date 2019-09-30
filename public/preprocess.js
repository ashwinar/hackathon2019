// Constants
var MAX_WIDTH = 620;
var MAX_HEIGHT = 620;

// this is the export function
var getReducedImgB64Data = function (fileInputId, errorMsgElementId, imageQuality) {
    let errorMsgElement = document.getElementById(errorMsgElementId);
    let fileinput = document.getElementById(fileInputId);

    // return an empty promise here
    if (!(window.File && window.FileReader && window.FileList && window.Blob)) {
        errorMsgElement.text = 'The File APIs are not fully supported in this browser.';
        return '';
    }

    if (typeof imageQuality == "undefined" || imageQuality.length <= 0) {
        imageQuality = 1;
    }

    return readfile(fileinput.files[0], imageQuality);
};

function readfile(file, imageQuality) {
    return processfile(file, imageQuality);
    // TODO remove the previous hidden inputs if user selects other files
}

function processfile(file, imageQuality) {

    return new Promise((resolve, reject) => {
        console.log('processing files...');
        // read the files
        var reader = new FileReader();
        reader.readAsArrayBuffer(file);

        reader.onload = function (event) {
            // blob stuff
            var blob = new Blob([event.target.result]); // create blob...
            window.URL = window.URL || window.webkitURL;
            var blobURL = window.URL.createObjectURL(blob); // and get it's URL

            // helper Image object
            var image = new Image();
            image.src = blobURL;
            image.onload = function () {
                // have to wait till it's loaded
                var resized = resizeMe(image, imageQuality); // send it to canvas
                let encoded = resized.replace(/^data:(.*,)?/, '');
                if ((encoded.length % 4) > 0) {
                    encoded += '='.repeat(4 - (encoded.length % 4));
                }
                resolve(encoded); // put result from canvas into new hidden input
            }
        };

        reader.onerror = error => reject(error);
    });

}

// === RESIZE ====

function resizeMe(img, imageQuality) {

    var canvas = document.createElement('canvas');

    var width = img.width;
    var height = img.height;

    // calculate the width and height, constraining the proportions
    if (width > height) {
        if (width > MAX_WIDTH) {
            //height *= max_width / width;
            height = Math.round(height *= MAX_WIDTH / width);
            width = MAX_WIDTH;
        }
    } else {
        if (height > MAX_HEIGHT) {
            //width *= max_height / height;
            width = Math.round(width *= MAX_HEIGHT / height);
            height = MAX_HEIGHT;
        }
    }

    // resize the canvas and draw the image data into it
    canvas.width = width;
    canvas.height = height;
    var ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0, width, height);

    return canvas.toDataURL("image/jpeg", imageQuality); // get the data from canvas as 70% JPG (can be also PNG, etc.)
}