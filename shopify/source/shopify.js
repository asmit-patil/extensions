let extensionField;
let shopifyClient;
let unorderedList;

$(document).ready(function () {

  unorderedList = $('.list_section ul');

  // Step:1 Intializing extension - In this step we try to connect to host window using postMessage API and get intial data.

  ContentstackUIExtension.init().then(extension => { // current extension object
    extensionField = extension;

    let request = new Request(extension.config);
    let initialList; // store initial data to save extra rest call when search field is empty

    request.get().then((response) => {

      initialList = response;

      // Step 2:  Render - Render the data fetched from external service
      render(response);
    });

    $(".searchInpput").on("keypress", function (event) { // prevent form submit
      let value = $(this).val().toLowerCase();
      if(event.keyCode === 13){
        event.preventDefault();
        if(!value)
            return render(initialList);
        request.search(value).then((response) => {
          if(response.length === 0){
             unorderedList.empty();
            return unorderedList.append('<li><span class="title">No Products Found</span></li>');
          }
          render(response);
        });
      }
    });

    $(".searchInpput").on("keyup", function (event) { // reset if search input is empty
      let value = $(this).val().toLowerCase();
      if(!value)
            return render(initialList);
    });

    extensionField.window.enableAutoResizing();

  });

})

class Request {

  constructor({domain, storefrontAccessToken}) {
    this.shopifyClient = ShopifyBuy.buildClient({
      domain: domain,
      storefrontAccessToken: storefrontAccessToken
    })
  }

  get(limit = 6) {
    let _request = this
    return new Promise((resolve, reject) => {
      _request.shopifyClient.product.fetchAll(limit).then((response) => {
        resolve(response);
      }).catch((e) => {
        reject(err);
      });
    });
  }

  search(keyword, limit = 6) {
    let _request = this
    return new Promise((resolve, reject) => {
      _request.shopifyClient.product.fetchQuery({
        first: limit,
        query: `${keyword}`
      }).then((response) => {
        resolve(response);
      }).catch((e) => {
        reject(err);
      });
    });
  }
}

function render(response) {
  // empty unorder list and add render new list items
  unorderedList.empty();

  response.forEach(function (product, index) {
    unorderedList.append('<li style="height:330px;" id="blt' + product.id + '">' +
      '<a><img src="' + product.images[0].src + '" alt="image-6"></a>' +
      ' <span class="title">' + product.title + '</span>' +
      ' <span class="title">Price: ' + product.variants[0].price + ' $</span>' +
      '<p>' + product.description + '</p></li>');
  });

  let initialValue = (extensionField && extensionField.field && extensionField.field.getData()) ? extensionField.field.getData() : null;

  if (initialValue) {
    let currentElement = document.getElementById(initialValue);
    let box = $(currentElement)[0].outerHTML;
    $('.discription_box ul').html(box);
  }

  $('.choose_video').click(function (e) {
    $('.list_section').show();
  });


  // Step 3:  Dom Change Listener - Start dom change listener to set data for the field on user input
  domChangeListner();
}

function domChangeListner() {
  let anchor = $('.list_section ul li');
  $('.list_section ul li a').click(function (e) {
    anchor.removeClass('selected');
    $(this).parent().addClass('selected');
  });

  anchor.click(function () {
    let box = $(this)[0].outerHTML;
    extensionField.field.setData($(this).attr('id')).then(function () {
      $('.discription_box ul').html(box);
      $('.list_section').hide();
    }).catch(function (error) {
      console.log('error in setting data', error)
    })
  });

}
