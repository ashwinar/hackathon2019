var GALLERY_NAME = 'Hackathon2019';
var APP_ID = 'e013ad8d';
var APP_KEY = 'da171293bacd6514367f9d9371fed857';

var getReducedBase64Data = function (fileInputElement) {
    var options = {
        maxSizeMB: 1,
        maxWidthOrHeight: 1920,
        useWebWorker: true
    }

    let imageFile = fileInputElement.files[0];

    return new Promise((resolve, reject) => {
        imageCompression(imageFile, options)
            .then(function (compressedFile) {
                console.log('compressedFile instanceof Blob', compressedFile instanceof Blob); // true
                console.log(`compressedFile size ${compressedFile.size / 1024 / 1024} MB`); // smaller than maxSizeMB

                imageCompression.getDataUrlFromFile(compressedFile).then((base64Data) => {
                    let encoded = base64Data.replace(/^data:(.*,)?/, '');
                    resolve(encoded);
                });
            })
            .catch(function (error) {
                console.log(error.message);
                reject(error.message);
            });
    });
};

var getBase64Data = function (fileInputElement) {
    let imageFile = fileInputElement.files[0];
    return new Promise((resolve, reject) => {
        imageCompression.getDataUrlFromFile(imageFile)
            .then((base64Data) => {
                let encoded = base64Data.replace(/^data:(.*,)?/, '');
                resolve(encoded);
            })
            .catch(function (error) {
                console.log(error.message);
                reject(error.message);
            });
    });
}

var enrollAPI = function (base64ImgStr, subjectId, respCallbackFn) {
    authorizeWithKairos(base64ImgStr, respCallbackFn, 'https://api.kairos.com/enroll', subjectId);
};

var recognizeAPI = function (base64ImgStr, respCallbackFn) {
    authorizeWithKairos(base64ImgStr, respCallbackFn, 'https://api.kairos.com/recognize');
};

function authorizeWithKairos(base64ImgStr, respCallbackFn, apiEndPoint, subjectId) {
    // put your keys in the header
    let headers = {
        "Content-type": "application/json",
        "app_id": APP_ID,
        "app_key": APP_KEY
    };
    let payload = {
        "image": base64ImgStr,
        "gallery_name": GALLERY_NAME
    };

    if (typeof subjectId != "undefined" && subjectId.length > 0) {
        payload['subject_id'] = subjectId;
    }

    // make request 
    $.ajax(apiEndPoint, {
        headers: headers,
        type: "POST",
        data: JSON.stringify(payload),
        dataType: "text"
    }).done(respCallbackFn);
}