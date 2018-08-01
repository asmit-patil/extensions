let extensionField;
let loader;
let unorderedList;
let msg
$(document).ready(function () {
    msg = $('.msg')
    loader = $('.loader')
    unorderedList = $('.list_section ul');
    // Step:1 Intializing extension - In this step we try to connect to host window using postMessage API and get intial data.
    ContentstackUIExtension.init().then(function (extension) {
        extensionField = extension;

        console.log(extensionField.config)
        let request = new Request(extension.config);
        let initialList; // store initial data to save extra rest call when search field is empty

        request.ooyalaVideos().then((response) => {
            console.log(response, "res-------")
            initialList = response;

            // Step 2:  Render - Render the data fetched from external service
            render(response)
        });
        extensionField.window.enableAutoResizing();
    })
});


 // render function for creating DOM structure
function render(videos) {
    console.log(videos, "-----------------------------")
    videos.forEach(function (video, index) {

        $('.list_section ul').append('<li style="height: 310px;" id="blt' + video.embed_code + '">' +
            '<a href="#"><img src="' + video.preview_image_url + '" alt="image-6"></a>' +
            ' <span class="title">' + video.name + '</span>' +
            '<p>' + video.description + '</p></li>');


    });
    var initialValue = (extensionField && extensionField.field && extensionField.field.getData()) ? extensionField.field.getData() : null;

    if (initialValue) {
        var currentElement = document.getElementById(initialValue);
        var box = $(currentElement)[0].outerHTML;
        $('.discription_box ul').html(box);
        $('.discription_box ul li a').click(function (e) {
            e.preventDefault();
        });

    }

    extensionField.window.enableAutoResizing();
    // on keypress event handler
    $(".searchInpput").on("keyup", function () {
        var value = $(this).val().toLowerCase();
        msg.hide()
        $(".list_section ul li").filter(function () {
            $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1)
        });
    });
    // on click function choose video button
    $('.choose_video').click(function (e) {
        $('.list_section').show();
    });
    extensionField.setReady();
    domEvents();
}

//eventlistner function
function domEvents() {
    extensionField.window.enableAutoResizing();

    $('.list_section ul li a').click(function (e) {
        e.preventDefault();
        $('.list_section ul li').removeClass('selected');
        $(this).parent().addClass('selected');
    });

    $('.list_section ul li').click(function () {
        var box = $(this)[0].outerHTML;
        extensionField.field.setData($(this).attr('id')).then(function () {
            $('.discription_box ul').html(box);
            $('.list_section').hide();
        }).catch(function (error) {
            console.log('error in setting data', error)
        })
    });
}

// function for sending XHR request and getting data
function getData(data) {
    console.log(data, "data parameter")
    return new Promise(function (resolve, reject) {
        extensionField.window.enableAutoResizing();
        var req = new XMLHttpRequest();
        req.open(data.method, data.url);
        loader.show();

        for (var key in data.headers) {
            if (data.headers.hasOwnProperty(key)) {
                req.setRequestHeader(key, data.headers[key]);
            }
        }

        req.onload = function (e) {

            if (req.status == 200) {

                loader.hide();
                var data = JSON.parse(req.response);
                resolve(data);
            }
            else {
                reject(Error(req.statusText));
            }
        };

        req.onerror = function () {
            reject(Error("Network Error"));
        };

        if (data.data) {
            req.send(data.data);
        } else {
            req.send();
        }

    });
}

// class request 
class Request {

    //function for retrieving videos from ooyala
    ooyalaVideos() {

        var headers = {
            "Content-Type": "application/json",
            "api_key": extensionField.config.api_key,
            "secret": extensionField.config.secret
        }
        var url = extensionField.config.url

        return new Promise((resolve, reject) => {
            getData({ url: url, headers: headers, method: 'GET' })
                .then(function (data) {
                    console.log("data ooyala", data.items)
                    resolve(data.items);
                }, function (error) {
                    console.error("Failed!", error)
                })
        })
    }
}