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

        console.log(extensionField.config, "apconfig")
        let request = new Request(extension.config);
        let initialList; // store initial data to save extra rest call when search field is empty

        request.getBrightcoveVideos().then((response) => {

            initialList = response;

            // Step 2:  Render - Render the data fetched from external service
            render(response)
        });

        $(".searchInpput").on("keypress", function (event) { // prevent form submit
            let value = $(this).val().toLowerCase();
            if (event.keyCode == 13) {
                console.log("enter")
                event.preventDefault();
                if (!value) {
                    return render(initialList);
                }
                request.search(value).then((response) => {

                    if (response.length === 0) {
                        loader.hide();
                        unorderedList.empty();
                        msg.show();
                        return
                    }

                    render(response);
                });
            }
        });

        $(".searchInpput").on("keyup", function (event) { // reset if search input is empty
            let value = $(this).val().toLowerCase();
            if (!value) {
                msg.hide()
                return render(initialList);
            }
            $(".list_section ul li").filter(function () {
                $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1)
            });


        });

        extensionField.window.enableAutoResizing();



    })

});

// render function for creating DOM structure
function render(videos) {
    unorderedList.empty();
    msg.hide();
    videos.forEach(function (video, index) {

        if (video.state === 'ACTIVE') {
            unorderedList.append('<li id="blt' + video.id + '">' +
                '<section>' + '<img src="' + video.images.thumbnail.src + '" alt="image-6">' + '</section>' +
                ' <span class="title">' + video.name + '</span>' +
                '<p>' + video.description + '</p></li>');
        }



    });

    var initialValue = (extensionField && extensionField.field && extensionField.field.getData()) ? extensionField.field.getData() : null;

    if (initialValue) {
        let currentElement = document.getElementById(initialValue);
        let box = $(currentElement)[0].outerHTML;
        $('.discription_box ul').html(box);
        $('.discription_box ul li a').click(function (e) {
            e.preventDefault();
        });

    }

    //extensionField.window.enableAutoResizing();

    // on click function choose video button
    $('.choose_video').click(function (e) {
        $('.list_section').show();
    });
    extensionField.setReady();
    domChangeListner();
}
//eventlistner function
function domChangeListner() {
    console.log("in domChangeListner")
    extensionField.window.enableAutoResizing();

    $('.list_section ul li section').click(function (e) {

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

    //function for searching videos 
    search(keyword) {


        var headers = {
            "Content-Type": "application/x-www-form-urlencoded"
        }
        var data = "client_id=" + extensionField.config.client_id + "&client_secret=" + extensionField.config.client_secret + "&grant_type=client_credentials";
        console.log(data, "++++++++++++++++++++++++++++++++")
        var url = extensionField.config.oauthUrl
        return new Promise((resolve, reject) => {
            getData({ url: url, headers: headers, method: 'POST', data: data })
                .then(function (data) {
                    return data;
                })
                .then(function (data) {
                    var headers = {
                        "Authorization": 'Bearer ' + data.access_token
                    }
                    var url = extensionField.config.searchUrl + keyword

                    getData({ url: url, headers: headers, method: 'GET' })
                        .then(function (data) {
                            console.log(data, "search res")
                            resolve(data);

                        }).catch(function (error) {
                            loader.hide();
                            msg.show();

                        })

                })
                .catch((err) => {
                    reject(err);
                });
        });
    }
    //function for retrieving videos from brightcoove
    getBrightcoveVideos() {
        var headers = {
            "Content-Type": "application/x-www-form-urlencoded"
        }
        var data = "client_id=" + extensionField.config.client_id + "&client_secret=" + extensionField.config.client_secret + "&grant_type=client_credentials";
        var url = extensionField.config.oauthUrl

        return new Promise((resolve, reject) => {
            getData({ url: url, headers: headers, method: 'POST', data: data })
                .then(function (data) {
                    console.log("ap-data", data);
                    return data;
                })
                .then(function (data) {
                    console.log("result ap data", data)
                    var headers = {
                        "Authorization": 'Bearer ' + data.access_token
                    }
                    var url = extensionField.config.brightcoveUrl
                    getData({ url: url, headers: headers, method: 'GET' }).then(function (data) {
                        console.log("data ap getVideos", data);
                        resolve(data);
                    })
                        .catch(function (err) {
                            throw err
                        })



                })

        })


    }






}



