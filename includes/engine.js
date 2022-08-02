
$(document).ready(function(){
    loadData();
    closeNav();
    populateCart();
    openNav(); 
    set_cookie("cartList", {});   
    event_listeners(); 
    renderStates();
   
});
function renderStates(){
    let country1 = $("#country :selected").val(); 
    let country2 = $("#s_country :selected").val(); 
    let provStates = {};

    
    if(country1 == "canada"){
        provStates = canadianProvinces();
    }
    else if(country1 == "usa"){
        provStates = usStates();
    }
    if(country2 == "canada"){
        provStates2 = canadianProvinces();
    }
    else if(country2 == "usa"){
        provStates2 = usStates();
    }
    $("#state").append($("<option />").val("").text(""));
    $("#s_state").append($("<option />").val("").text(""));
    Object.keys(provStates).forEach(key => {
        $("#state").append($("<option />").val(key).text(provStates[key]));
    });   
    Object.keys(provStates2).forEach(key => {
        $("#s_state").append($("<option />").val(key).text(provStates2[key]));
    });   

}
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
    id = id.toString();
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
        promisedCurrency.then(function(currencyValue) {
            populateCart(currencyValue);
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
                return totalPrice;
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
        <button type="button" class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#checkoutModal" id="checkoutButton">
        Checkout
    </button>
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
        <p id="symbol"> ${this._currencySymbol}</p> <p id="totalPrice"> ${totalPrice} </p>
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



//listeners
function event_listeners(){
    $("#shipping").hide();
    let checkOutForm = new formValidation();
    $('#sameShipping').click(function() {
        $("#shipping").toggle(this.notchecked);
        if(document.getElementById('sameShipping').checked && validateBillingTab() == 1) {
            $("#pMethod3").remove("");
            $("#nav3").append("<label id='pMethod3'>✅</label>");
        }
        else if(!document.getElementById('sameShipping').checked){
            validateShippingTab();
        }
        
    });
    $("#selectCurrency").on('change', function (e) {
        $("#cartContainer").empty();
        $("#totalAmount").empty();
        populateCart();
        loadData();
    });
    $("#country").on('change', function (e) {
        $("#state").empty();
        renderStates();
    });
    $("#s_country").on('change', function (e) {
        $("#s_state").empty();
        renderStates();
    });
    $("#confirmOrder").click(function() {

        let currentNav = $("#currentNav").val();
        console.log(currentNav);
        if(currentNav == 1) {
            validatePaymentTab();
        }
        else if(currentNav == 2){
            validateBillingTab();
        }
        else if(currentNav == 3){
            validateShippingTab();
        }
        if(currentNav < 4){
            currentNav = parseInt(currentNav) + 1;
        }
        $("#currentNav").val(currentNav);
        if(currentNav == 4){
            $("#confirmOrder").html("Complete Order Now");
        }
        var sel = document.querySelector(`#nav${currentNav}`);
      
        bootstrap.Tab.getOrCreateInstance(sel).show(); 
        
      });
      $(".nav-link").click(function() {
        let currentNav = $(this).val();
        $("#currentNav").val(currentNav);
        if(currentNav == 4){
            $("#confirmOrder").html("Complete Order Now");
        }
        else{
            $("#confirmOrder").html("Continue");
        }        
      });
     $('.checkout-fields').on('blur',function (event) {
        let elemID = event.target.id;
        let result;
        if(elemID == "formCardNumber"){
            result = checkOutForm.validateCard($(`#${elemID}`).val());
        }
        else if(elemID == "expiryMonth"){
            result = checkOutForm.validateMonth($(`#${elemID}`).val());
        }
        else if(elemID == "expiryYear"){
            result = checkOutForm.validateYear($(`#${elemID}`).val());
        }
        else if(elemID == "formCVV"){
            result = checkOutForm.validateCVV($(`#${elemID}`).val());
        }
        else if(elemID == "firstName" || 
            elemID == "lastName" ||
            elemID == "s_firstName" ||
            elemID == "s_lastName"){
            result = checkOutForm.validateName($(`#${elemID}`).val());
        }
        else if(elemID == "email"){
            result = checkOutForm.validateEmail($(`#${elemID}`).val());
        }
        else if(elemID == "phone"){
            result = checkOutForm.validatePhone($(`#${elemID}`).val());
        }
        else if(elemID == "address" || elemID == "s_address" || elemID == "city" || elemID == "s_city"){
            result = checkOutForm.validateBlank($(`#${elemID}`).val());
        }
        else if(elemID == "state" || elemID == "s_state"){
             
            result = checkOutForm.validateBlank($(`#${elemID} :selected`).val());
        }
        else if(elemID == "s_zip" || elemID == "zip"){
            result = checkOutForm.validateZip(     
                $(`#${elemID}`).val(),
                $("#country :selected").val()
            );
        }
        if(result !== undefined){
            checkOutForm.validationReport(elemID, result);
        }
       
        console.log(checkOutForm.checkSumValidity());
    });

    function validatePaymentTab(){
        let IDs = [];
        $("#paymentInfo").find("input").each(function(){ IDs.push(this.id); });
        let count = 0;
        let sumValidity = checkOutForm.checkSumValidity();
        for(let i=0; i<IDs.length; i++){
            if(sumValidity[IDs[i]]==1){
                count++;
            }
        }
        if(count == IDs.length){
            $("#pMethod1").remove("");
            $("#nav1").append("<label id='pMethod1'>✅</label>");
        }
        else{
            $("#pMethod1").remove("");
            $("#nav1").append("<label id='pMethod1'>❌</label>");
        }
    }
    function validateBillingTab(){
        let IDs = [];
        $("#billingInfo").find("input").each(function(){ IDs.push(this.id); });
        let count = 0;
        let sumValidity = checkOutForm.checkSumValidity();
        for(let i=0; i<IDs.length; i++){
            if(sumValidity[IDs[i]]==1){
                count++;
            }
        }
        result = 0;
        if(count == 7){
            $("#pMethod2").remove("");
            $("#nav2").append("<label id='pMethod2'>✅</label>");
            result = 1;
        }
        else{
            $("#pMethod2").remove("");
            $("#nav2").append("<label id='pMethod2'>❌</label>");
        }
        return result;
    }
    function validateShippingTab(){
        if(document.getElementById('sameShipping').checked && validateBillingTab() == 1) {
            $("#pMethod3").remove("");
            $("#nav3").append("<label id='pMethod3'>✅</label>");
        }
        else if(!document.getElementById('sameShipping').checked){
            let IDs = [];
            $("#shippingInfo").find("input").each(function(){ IDs.push(this.id); });
            let count = 0;
            let sumValidity = checkOutForm.checkSumValidity();
            for(let i=0; i<IDs.length; i++){
                if(sumValidity[IDs[i]]==1){
                    count++;
                }
            }
            console.log(count);
            if(count == 5){
                $("#pMethod3").remove("");
                $("#nav3").append("<label id='pMethod3'>✅</label>");
                result = 1;
            }
            else{
                $("#pMethod3").remove("");
                $("#nav3").append("<label id='pMethod3'>❌</label>");
            }
        }
    }
    function validateAllTabs(){

    }
}
class formValidation{
    constructor(){
        this._validity = {};
    }
    validateCard(data){
        if(!/^3[47][0-9]{13}$/.test(data) && 
        !/^4[0-9]{12}(?:[0-9]{3})?$/.test(data) && 
        !/^(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14})$/.test(data) && 
        !/^(5[1-5][0-9]{14}|2(22[1-9][0-9]{12}|2[3-9][0-9]{13}|[3-6][0-9]{14}|7[0-1][0-9]{13}|720[0-9]{12}))$/.test(data)){
            return 0;
        }
        else{
            return 1;
        }
    }
    validateMonth(data){
        if(!/^(0?[1-9]|1[012])$/.test(data)){
            return 0
        }
        else{
            return 1;
        }
    }
    validateYear(data){
        if(!/\b(20[2-4][0-9]|50)\b/.test(data)){
            return 0
        }
        else{
            return 1;
        }
    }
    validateCVV(data){
        if(!/[0-9]\d\d/g.test(data)){
            return 0
        }
        else{
            return 1;
        }
    }
    validateName(data){
        if(!/^[a-zA-Z ]{2,30}$/.test(data)){
            return 0;
        }
        else{
            return 1;
        }
    }
    validateEmail(data){
        if(!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(data)){
            return 0;
        }else{
            return 1;
        }
    }
    validatePhone(data){
        if(!/^\(?([0-9]{3})\)?[- ]?([0-9]{3})[- ]?([0-9]{4})$/.test(data)){
            return 0;
        }else{ 
            return 1;
        }
    }
    validateBlank(data){
        if(data == "" || data === undefined){
            return 0;
        }else{
            return 1;
        }
    }
    validateZip(data, country){
        let result = 1;
        if(country == "canada"){
            if(!/^[ABCEGHJ-NPRSTVXY]\d[ABCEGHJ-NPRSTV-Z][ -]?\d[ABCEGHJ-NPRSTV-Z]\d$/i.test(data)){
                result = 0;
            }
        }else if(country == "usa"){
            if(!/^[0-9]{5}(?:-[0-9]{4})?$/.test(data)){
                result = 0;
            }
        }
       return result;
    }
    validationReport(elemID, result){
        if(result == 1){
            $(`#${elemID}`).addClass("is-valid");
            $(`#${elemID}`).removeClass("is-invalid");
            this._validity[elemID] = 1;
        }else{
            $(`#${elemID}`).addClass("is-invalid");
            $(`#${elemID}`).removeClass("is-valid");
            this._validity[elemID] = 0;
        }
    }
    checkSumValidity(){
        return this._validity;
    }
   
}
function usStates(){
    states = {"AL":"Alabama","AK":"Alaska","AZ":"Arizona","AR":"Arkansas","CA":"California","CO":"Colorado","CT":"Connecticut","DE":"Delaware","FL":"Florida","GA":"Georgia","HI":"Hawaii","ID":"Idaho","IL":"Illinois","IN":"Indiana","IA":"Iowa","KS":"Kansas","KY":"Kentucky","LA":"Louisiana","ME":"Maine","MD":"Maryland","MA":"Massachusetts","MI":"Michigan","MN":"Minnesota","MS":"Mississippi","MO":"Missouri","MT":"Montana","NE":"Nebraska","NV":"Nevada","NH":"New Hampshire","NJ":"New Jersey","NM":"New Mexico","NY":"New York","NC":"North Carolina","ND":"North Dakota","OH":"Ohio","OK":"Oklahoma","OR":"Oregon","PA":"Pennsylvania","RI":"Rhode Island","SC":"South Carolina","SD":"South Dakota","TN":"Tennessee","TX":"Texas","UT":"Utah","VT":"Vermont","VA":"Virginia","WA":"Washington","WV":"West Virginia","WI":"Wisconsin","WY":"Wyoming"};
    return states;
}
function canadianProvinces(){
    provinces = {'AB' : 'Alberta',
    'BC' : 'British Columbia',
    'MB' : 'Manitoba',
    'NB' : 'New Brunswick',
    'NL' : 'Newfoundland and Labrador',
    'NS' : 'Nova Scotia',
    'ON' : 'Ontario',
    'PE' : 'Prince Edward Island',
    'QC' : 'Quebec',
    'SK' : 'Saskatchewan',
    'NT' : 'Northwest Territories',
    'NU' : 'Nunavut',
    'YT' : 'Yukon'};
    return provinces;
}
