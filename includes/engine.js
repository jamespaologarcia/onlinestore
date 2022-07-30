
$(document).ready(function(){
    loadData();
    closeNav();
    populateCart();
    openNav(); 
    set_cookie("cartList", {});
    
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
    $(".grid").empty();
    $('.grid').append(storeProducts);
}
function openNav() {
    $("#mySidenav").show();
}
function closeNav() {
   $("#mySidenav").hide();
}
function addToCart(id){
    $("#cartContainer").empty();
    $("#totalAmount").empty();
    $("#"+id).prop('disabled', true);
    let list = get_cookie("cartList");
    if (list === null) {
        list = {};
    }
    if (list[id] === undefined) {
        list[id] = 1;
    }
    else{
    list[id]++;
    }
    set_cookie("cartList", list);
    populateCart();
}
function removeFromCart(id){
    $("#cartContainer").empty();
    $("#totalAmount").empty();
    let list = get_cookie("cartList");
    delete list[id];
    set_cookie("cartList", list);
    populateCart();
}
function populateStore(apiURL, currency){
    let storeProducts = "";
    let renderer = new shopBuilder();
    let promisedCurrency = renderer.getCurrency();
    if(currency === undefined){
        promisedCurrency.then(function(xa) {
            populateStore(apiURL, xa)
         });
    }
    else {
        fetch(apiURL).
        then(response => response.json()).
            then((json) => {
                json.forEach((data) => {
                    let price = data.price * currency;
                    let itemEntry = renderer.renderShopItemEntry(data,price);
                    $(".grid").append(itemEntry);
                });
            }); 
        return storeProducts;
    }
    
}
function emptyCart(){
    set_cookie("cartList", {});
    populateCart();
}

function populateCart(currency){
    let renderer = new shopBuilder();
    let promisedCurrency = renderer.getCurrency();
    if(currency === undefined){
        promisedCurrency.then(function(xa) {
            populateCart(xa);
         });
    }
    else {        
        let cartList = get_cookie("cartList");
        let promiseList = []
        let rowDom = '';
        let totalPrice = 0;
        cartHeaders();
        if(Object.keys(cartList).length > 0 && cartList !== undefined){
            let count = 0;
            Object.keys(cartList).forEach(key => {
                cartItemTest = fetch(`https://fakestoreapi.com/products/${key}`)
                    .then(res=>res.json())
                        .then(json=>{
                            return json});
                            promiseList.push(cartItemTest);    
            });               
            Promise.all(promiseList).then((values) => {
                count++;
                values.forEach(function(item) {
                    rowDom += renderer.buildCart(item, cartList, currency);
                    totalPrice += item['price'] * cartList[item['id']] * currency;    
                });
                $('#cartContainer').append(rowDom);
                renderer.get_total(totalPrice.toFixed(2));
                renderer.addDivFooter();
                $(".add-to-cart-button").prop('disabled', false);
            });        
        }
        else{
            renderer.renderEmptyCart();
        }
    }
    
}
function cartHeaders(){
    $('#cartContainer').append(`<div class="row">
    <div class="col-lg-2 ">
    </div>
    <div class="col-lg-3 ">
    Item    
    </div>
    <div class="col-lg-1 ">
    Qty
    </div>
    <div class="col-lg-3 ">
    Price
    </div>
    <div class="col-lg-3 ">
    Total
    </div>
    <hr>
    </div>`);   
}
$("#selectCurrency").on('change', function (e) {
    $("#cartContainer").empty();
    $("#totalAmount").empty();
    populateCart();
    loadData();
});
class shopBuilder{
    constructor(){
        this._selectCurrency = $("#selectCurrency :selected").val(); 
        this._currency = {"cad": "$", "usd": "US$", "gbp": "£"};
        this._currencySymbol = this._currency[this._selectCurrency];
    }
    buildCart(item, cartList, currency){
        
        let sum = cartList[item['id']] * item['price'] * currency;
        let itemPrice = item['price'] * currency;
        let cartRow = `<div class="row" id="row${item['id']}">
        <div class="col-lg-2 shopping-list">
            <button type="button" class="btn btn-danger" onclick="removeFromCart(${item["id"]})"><span class="material-symbols-outlined">
            close
            </span></button>
        </div>
        <div class="col-lg-3  shopping-list">
            ${item['title']}
        </div>
        <div class="col-lg-1  shopping-list">
            ${cartList[item['id']]}
        </div>
        <div class="col-lg-3  shopping-list">
        ${this._currencySymbol} ${itemPrice.toFixed(2)}
        </div>
        <div class="col-lg-3  shopping-list">
           ${this._currencySymbol} ${sum.toFixed(2)}
        </div>
        <hr class ="shopping-list">
        </div>`; 
        return cartRow;
    }
    renderShopItemEntry(data,price){
        console.log(this._currencySymbol);
        let itemEntry = `<div class="grid-item">
            <div class="card">
            <img src="${data.image}" height="auto" width="200px"></img>
                <div class="card-body">
                    <h5 class="card-title">${data.title}</h5>
                    <p class="card-text">${data.description}</p>
                    <p class="card-text">${this._currencySymbol}  ${price.toFixed(2)}</p>
                    <button class="btn btn-success add-to-cart-button" id="${data.id}" onclick="addToCart(${data.id}); openNav();">
                    Add to Cart</button>
                </div>
            </div>
        </div>`;
        return itemEntry;
    }
    getCurrency(){
        let selectValue = $("#selectCurrency :selected").val(); 
        let data = fetch("https://cdn.jsdelivr.net/gh/fawazahmed0/currency-api@1/latest/currencies/cad.json").
        then(response => response.json()).
            then((json) => { 
                this._testCurrency = json["cad"][selectValue];
                return json["cad"][selectValue];
            });
        return data;
    }
    addDivFooter(){
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
    get_total(totalPrice){
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
        <label id="totalPrice"> ${this._currencySymbol} ${totalPrice}
        </div>
        <hr class = "shopping-list">
        </div>`);
    }
    renderEmptyCart(){
        $('#cartContainer').append(`<div class="row"> 
                <div class="col-lg-12  shopping-list">
                  <center> No items in cart </center>
                </div>
            </div>`);
    }
}