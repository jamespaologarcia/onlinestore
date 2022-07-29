$(document).ready(function(){
    loadData();
    closeNav();
    populateCart();
   openNav(); 
});


$('.grid').masonry({
    // options
    itemSelector: '.grid-item',
    columnWidth: 200
  });
function loadData(){
    $("#demo").empty();
    let apiURL = "https://fakestoreapi.com/products";
    let storeProducts = populateStore(apiURL);
    $('.grid').append(storeProducts);
}
function openNav() {
    $("#mySidenav").show();
  }
  
function closeNav() {
   $("#mySidenav").hide();
}
function addToCart(id){
    let list = get_cookie("cartList");
    let itemFound = 0;
    var indexFound;
    if(list.length > 0){
        for(let i = 0; i < list.length; i++){
            if(list[i][0] == id){
                list[i][1] ++;
                itemFound++;
                indexFound = i;
            }
        }
    }
    
    if(itemFound == 0){
        list.push([id, 1]);
    }
    if(indexFound === undefined){
        indexFound =list.length - 1;
    }
    set_cookie("cartList", list);
  populateCart();

}
function removeFromCart(id){
    let list = get_cookie("cartList");
    list.splice(id, 1);
    set_cookie("cartList", list);
    populateCart();
}
function populateStore(apiURL){
    let storeProducts = "";
    cartHeaders();
    fetch(apiURL).
    then(response => response.json()).
        then((json) => {
            json.forEach((data, index) => {
                $(".grid").append(`                    
                    <div class="grid-item">
                        <div class="card">
                        <img src="${data.image}" height="auto" width="200px"></img>
                            <div class="card-body">
                                <h5 class="card-title">${data.title}</h5>
                                <p class="card-text">${data.description}</p>
                                <button class="btn btn-success add-to-cart-button" onclick="addToCart(${data.id}); openNav();">
                                Add to Cart</button>
                            </div>
                        </div>
                </div>`);
            });
        }); 
    return storeProducts;
}
function emptyCart(){
    set_cookie("cartList", []);
    populateCart();
}

async function populateCart(currency){
    let promisedCurrency = getCurrency();
    if(currency === undefined){
        promisedCurrency.then(function(xa) {
            populateCart(xa);
         });
    }
    else {
        $("#cartContainer").empty();
        $("#totalAmount").empty();
        let cartList = get_cookie("cartList");
        cartHeaders();
        if(cartList.length > 0 && cartList !== undefined){
            var totalPrice = 0;
            for(let i = 0; i< cartList.length; i++){
                let response = await fetch(`https://fakestoreapi.com/products/${cartList[i][0]}`);
                let cartItem = await response.json();
                let sum = (cartItem['price'] * cartList[i][1]) * currency;
                let itemPrice = (cartItem['price'] * currency).toFixed(2);
                $('#cartContainer').append(`<div class="row" id="row${cartList[i][0]}">
                <div class="col-lg-2 shopping-list">
                    <button type="button" class="btn btn-danger" onclick="removeFromCart(${i})"><span class="material-symbols-outlined">
                    close
                    </span></button>
                    
                </div>
                <div class="col-lg-3  shopping-list">
                    ${cartItem['title']}
                </div>
                <div class="col-lg-2  shopping-list">
                    ${cartList[i][1]}
                </div>
                <div class="col-lg-2  shopping-list">
                    ${itemPrice}
                </div>
                <div class="col-lg-3  shopping-list">
                    ${sum.toFixed(2)}
                </div>
                <hr class ="shopping-list">
                </div>`);  
                totalPrice += sum;     
                if(i == cartList.length - 1){
                    get_total(totalPrice.toFixed(2))
                    addDivFooter();
                    
                }                   
            }
        }
        else{
            $('#cartContainer').append(`<div class="row"> 
                <div class="col-lg-12  shopping-list">
                  <center> No items in cart </center>
                </div>
            </div>`);
        }
    }
    
}
function addDivFooter(){
    $('#totalAmount').append(`<div class="row shopping-list">
    <div class="col-lg-2 shopping-list ">
    </div>
    <div class="col-lg-4 shopping-list ">
    <button type="button" class="btn btn-warning" onclick="emptyCart()">Empty Cart</button>
    </div>
    <div class="col-lg-1 shopping-list ">
    </div>
    <div class="col-lg-1 shopping-list ">
    </div>
    <div class="col-lg-4 shopping-list" id="totalPrice">
    <button type="button" class="btn btn-success">Checkout</button>
    </div>
    <hr class = "shopping-list">
    </div>`);
}
function get_total(totalPrice){
    $('#totalAmount').append(`<div class="row shopping-list">
    <div class="col-lg-2 shopping-list ">
    </div>
    <div class="col-lg-3 shopping-list ">
    Subtotal
    </div>
    <div class="col-lg-2 shopping-list ">
    </div>
    <div class="col-lg-2 shopping-list ">
    </div>
    <div class="col-lg-3 shopping-list" id="totalPrice">
    <label id="totalPrice">${totalPrice}
    </div>
    <hr class = "shopping-list">
    </div>`);
}
function cartHeaders(){
    $('#cartContainer').append(`<div class="row">
    <div class="col-lg-2 ">
    </div>
    <div class="col-lg-3 ">
    Item    
    </div>
    <div class="col-lg-2 ">
    Qty
    </div>
    <div class="col-lg-2 ">
    Price
    </div>
    <div class="col-lg-3 ">
    Total
    </div>
    <hr>
    </div>`);   
}

$().change({
   
});


$("#selectCurrency").on('change', async function (e) {
    populateCart();
});
function getCurrency(){
    let selectValue = $("#selectCurrency :selected").val(); 
    let data = fetch("https://cdn.jsdelivr.net/gh/fawazahmed0/currency-api@1/latest/currencies/cad.json").
    then(response => response.json()).
        then((json) => { 
            return json["cad"][selectValue];
        });
    return data;
}

class currencyEngine {
    constructor(){
        this._currency = 1;
    }
     get currentCurrency(){
        return this._currency;
    }    
    set currentCurrency(currency){
        this._currency = currency;
    }
}