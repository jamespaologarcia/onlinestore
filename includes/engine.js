const renderer = new shopBuilder();
const checkOutForm = new formValidation();
$(document).ready(function(){
    loadData();
    closeNav();
    populateCart();
    
    event_listeners(); 
    renderStates();



});


renderer.productList = "https://fakestoreapi.com/products/";
function renderStates(){
    //Changes the states on the select list based on the selected country
    let country1 = $("#country :selected").val(); 
    let country2 = $("#s_country :selected").val(); 
    let provStates = {};
    if(country1 == "CA"){
        //loads canadian provinces for billing
        provStates = canadianProvinces();
    }
    else if(country1 == "US"){
        //loads US States for billing
        provStates = usStates();
    }
    if(country2 == "CA"){
        //loads US States for shipping
        provStates2 = canadianProvinces();
    }
    else if(country2 == "US"){
          //loads US States for shipping
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
    itemSelector: '.grid-item',
    columnWidth: 200
});
function loadData(){
    $("#demo").empty();
    let apiURL = "https://fakestoreapi.com/products";
    let storeProducts = populateStore(apiURL);
    $('#grid').append(storeProducts);
 
}
function openNav() {
    $("#mySidenav").show();
}
function closeNav() {
   $("#mySidenav").hide();
}
function addToCart(id){
    //adds items to the cart
    id = id.toString();
    //disables the button upon clicking to prevent click spamming which can mess up the UI of the cart
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
    itemID = list[id];
    //updates item amounts in cart to the button on the store list. 
    $(`.add-to-cart-button#${id}`).html(` ➕ Add to Cart [${itemID}]`);
    set_cookie("cartList", list);
    //calls the function to re-render the cart to update the cart items
    populateCart();
}
function removeFromCart(id){
    let list = get_cookie("cartList");
    delete list[id];
    set_cookie("cartList", list);
    itemID = list[id];
    itemID = `[${itemID}]`;
    if(itemID === undefined){
        itemID = "";
    }
    //updates item amounts in cart to the button on the store list.     
    $(`.add-to-cart-button#${id}`).html(` ➕ Add to Cart`);
    set_cookie("cartList", list);
      //calls the function to re-render the cart to update the cart items
    populateCart();
}
function populateStore(apiURL, currency){
    $("#grid").empty();
    let storeProducts = "";
    let promisedCurrency = renderer.getCurrency();
    let cartList = get_cookie("cartList");
    //recursion to supply the currency argument
    if(currency === undefined){
        promisedCurrency.then(function(xa) {
            populateStore(apiURL, xa)
         });
    }
    else {
        renderer.productList.
            then((json) => {
                json.forEach((data) => {
                    let price = data.price * currency;
                    //renders the shop item entry with the price calculated with the selected currency and the cartList
                    //cartList is needed to render the buttons to match the current items in cart even when reloaded.
                    let itemEntry = renderer.renderShopItemEntry(data, price, cartList);
                    $(".grid-container").append(itemEntry);
                });
            }).catch((error) => {
                $(".grid-container").append(error);
            }); 
        return storeProducts;
    }
    
}
function emptyCart(){
    set_cookie("cartList", {});
    populateCart();
}
function populateCart(currency){
    $("#cartContainer").empty();
    $("#totalAmount").empty();
    let promisedCurrency = renderer.getCurrency();
        //recursion to supply the currency argument
    if(currency === undefined){
        promisedCurrency.then(function(currencyValue) {
            populateCart(currencyValue);
         });
    }
    else {        
        let cartList = get_cookie("cartList");
        let rowDom = ''; //DOM BUILDER
        let totalPrice = 0;
        cartHeaders();
        if(Object.keys(cartList).length > 0 && cartList !== undefined){            
            renderer.productList.
            then((json) => {
                json.forEach((data) => {
                   if(cartList[data['id']] !== undefined){
                         rowDom += renderer.buildCart(data, cartList, currency);
                          totalPrice += data['price'] * cartList[data['id']] * currency;   
                    } 
                });
                $('#cartContainer').append(rowDom);
                 //renders the subtotal
                 renderer.get_total(totalPrice.toFixed(2));
                 renderer.addDivFooter();
                 //re-enables the add to cart button once the shopping cart is done rendering
                 $(".add-to-cart-button").prop('disabled', false);

            }).catch((error) => {
                $(".grid-container").append(error);
            }); 
        }
        else{
            //default display when the cart is empty
            renderer.renderEmptyCart();
        }
    }
}


function renderOrderSummary(currency){
    $('#summaryBody').empty();
    $("#confirmOrder").prop('disabled', false);
    var sel = document.querySelector(`#nav1`);
    bootstrap.Tab.getOrCreateInstance(sel).show(); 
    let promisedCurrency = renderer.getCurrency();
    //recursion to supply the currency argument
    if(currency === undefined){
        promisedCurrency.then(function(currencyValue) {
            renderOrderSummary(currencyValue);
         });
    }
    else {        
        let cartList = get_cookie("cartList");
        let rowDom = '';
        let totalPrice = 0;

        renderer.productList.
        then((json) => {
            json.forEach((data) => {
               if(cartList[data['id']] !== undefined){
                    rowDom += renderer.buildSummary(data, cartList, currency);
                    totalPrice += data['price'] * cartList[data['id']] * currency;   
                } 
            });
            $('#summaryBody').append(rowDom);
            let tax = renderer.getTax();
            renderer.summaryGrandTotal(totalPrice.toFixed(2), currency, tax);

        }).catch((error) => {
            $(".grid-container").append(error);
        });
    }
}
function cartHeaders(){
    $('#cartContainer').append(`<div class="row cart-header">
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

function submitOrder(){
    jsonData = { 
            card_number: $("#formCardNumber").val(),
            expiry_month: $("#expiryMonth").val(),
            expiry_year: $("#expiryYear").val(),
            security_code: $("#formCVV").val(),
            amount: parseFloat($("#total").text()) ,
            taxes: parseFloat($("#taxRate").text()),
            shipping_amount: parseFloat($("#shippingFee").text()),
            currency: 'cad',
            items: get_cookie("cartList"),
            billing: {
                first_name: $("#firstName").val(),
                last_name: $("#lastName").val(),
                address_1: $("#address").val(),
                address_2: $("#address2").val(),
                city: $("#city").val(),
                province: $("#state").val(),
                country: $("#country").val(),
                postal: $("#zip").val(),
                phone: $("#phone").val(),
                email: $("#email").val()
            },
            shipping: {
                first_name: $("#s_firstName").val(),
                last_name: $("#s_lastName").val(),
                address_1: $("#s_address").val(),
                address_2: $("#s_address2").val(),
                city: $("#s_city").val(),
                province: $("#s_state").val(),
                country: $("#s_country").val(),
                postal: $("#s_zip").val(),
            }
        };
        let form_data = new FormData();
        form_data.append('submission', JSON.stringify(jsonData));  
        fetch('https://deepblue.camosun.bc.ca/~c0180354/ics128/final/', 
        { method: "POST", 
            cache: 'no-cache', 
            body: form_data
        }).then(response => response.json()).
        then((json) => {
           if(json['status'] == "SUCCESS"){
            $("#currentNav").val("1");
            swal("Order Confirmed", "Thank you for shopping with us", "success");
            set_cookie("cartList", {}); 
            loadData();
            populateCart();
           }
           else{
            swal("Order Not Completed", json['status'], "error");
           }
        });
    
    
}

//listeners
function event_listeners(){
    $("#shipping").hide();

    $('#sameShipping').click(function() {
        $("#shipping").toggle(this.notchecked);
        let billing = validateBillingTab();
        checkOutForm.checkShipping(billing);
        validateShippingTab();
        
    });
    $('#checkoutModal').on('hidden.bs.modal', function () {
        $("#currentNav").val("1");
        $("#confirmOrder").html("Continue");
        $("#confirmOrder").removeAttr("onClick");
         $("#confirmOrder").removeAttr("data-bs-dismiss");
        $("#nav1").empty();
        $("#nav1").append(`<i class="bi bi-credit-card-2-back"></i>Payment Method</button>`);
        $("#nav2").empty();
        $("#nav2").append(`<i class="bi bi-house-door"></i>Billing Details</button>`);
        $("#nav3").empty();
        $("#nav3").append(`<i class="bi bi-patch-check"></i> Order Confirmation</button>`);
  
    });
    $("#selectCurrency").on('change', function (e) {
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
        if(currentNav == 1) {
            $(`#nav1`).prop('aria-selected', true);
            $(`#nav2`).prop('aria-selected', false);
            $(`#nav3`).prop('aria-selected', false);
            $(`#nav4`).prop('aria-selected', false);
            validatePaymentTab();
        }
        else if(currentNav == 2){
            $(`#nav1`).prop('aria-selected', false);
            $(`#nav2`).prop('aria-selected', true);
            $(`#nav3`).prop('aria-selected', false);
            $(`#nav4`).prop('aria-selected', false);
            validateBillingTab();
        }
        else if(currentNav == 3){
            $(`#nav1`).prop('aria-selected', false);
            $(`#nav2`).prop('aria-selected', false);
            $(`#nav3`).prop('aria-selected', true);
            $(`#nav4`).prop('aria-selected', false);
            let billing = validateBillingTab();
            checkOutForm.checkShipping(billing);
            validateShippingTab();
        }
        else if(currentNav == 4){
            $(`#nav1`).prop('aria-selected', false);
            $(`#nav2`).prop('aria-selected', false);
            $(`#nav3`).prop('aria-selected', false);
            $(`#nav4`).prop('aria-selected', true);
        }
        if(currentNav < 4){
            
            currentNav = parseInt(currentNav) + 1;
        }
        $("#currentNav").val(currentNav);
        console.log(currentNav);
        if(currentNav == 4){
        //ALWAYS ENABLE CHECKOUT
            $("#confirmOrder").prop('disabled', true);
            validateAllTabs();
            $("#confirmOrder").html("Complete Order Now");
            $("#confirmOrder").attr({
                'onClick' : 'submitOrder();',
                'data-bs-dismiss' : 'modal'

            });
      
        }
        var sel = document.querySelector(`#nav${currentNav}`);
        bootstrap.Tab.getOrCreateInstance(sel).show(); 
    });

    //event listener when the cursor is moved from the current input/form element 
     $('.checkout-fields').on('blur', async function (event) {
        let elemID = event.target.id;
        let result;
        //gets the validity by passing the value for testing on the appropriate class method method and then putting the result on result variable
        if(elemID == "formCardNumber"){
            result = await checkOutForm.validateCard($(`#${elemID}`).val());
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
            elemID == "lastName"){
            result = checkOutForm.validateName($(`#${elemID}`).val());
        }
        else if(elemID == "s_firstName" ||
        elemID == "s_lastName"){
            result = checkOutForm.validateName($(`#${elemID}`).val());
        }
        else if(elemID == "email"){
            result = checkOutForm.validateEmail($(`#${elemID}`).val());
        }
        else if(elemID == "phone"){
            result = checkOutForm.validatePhone($(`#${elemID}`).val());
        }
        else if(elemID == "address" || elemID == "s_address" ){
            result = checkOutForm.validateAddress($(`#${elemID}`).val());
        }
        else if( elemID == "s_state"  || elemID == "state" ){
            result = checkOutForm.validateBlank($(`#${elemID}`).val());
        }
        else if( elemID == "city" || elemID == "s_city"){
            result = checkOutForm.validateCity($(`#${elemID}`).val());
        }
        else if(elemID == "s_zip"){
            result = checkOutForm.validateZip(     
                $(`#${elemID}`).val(),
                $("#country :selected").val()
            );
        }
        else if(elemID == "zip"){
            result = checkOutForm.validateZip(     
                $(`#${elemID}`).val(),
                $("#country :selected").val()
            );
            
            validateBillingTab();
        }
        if(result !== undefined){
            //passes the validation reports for consolidation
            checkOutForm.validationReport(elemID, result);
        }
    });

    function validatePaymentTab(){
        //validates the whole payment tab/ Updates the tab icon once everything is valid
        let IDs = [];
        $("#paymentInfo").find("input").each(function(){ IDs.push(this.id); });
        let count = 0;
        let sumValidity = checkOutForm.checkSumValidity();
        let result = 0;
        for(let i=0; i<IDs.length; i++){
            if(sumValidity[IDs[i]]==1){
                count++;
            }
        }
        if(count == IDs.length){
            $("#pMethod1").remove("");
            $("#nav1").append("<label id='pMethod1'>✅</label>");
            result = 1
        }
        else{
            $("#pMethod1").remove("");
            $("#nav1").append("<label id='pMethod1'>❌</label>");
        }
        return result;
    }
    function validateBillingTab(){
          //validates the whole billing tab. Updates the tab icon once everything is valid
        let IDs = [];
        $("#billingInfo").find("input").each(function(){ IDs.push(this.id); });
        let count = 0;
        let sumValidity = checkOutForm.checkSumValidity();
        for(let i=0; i<IDs.length; i++){
            if(sumValidity[IDs[i]]==1){
                count++;
            }
        }
        let result = 0;
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
        let result = 0;
        //updates tab icons depending on the validity of entered information
        if(document.getElementById('sameShipping').checked && validateBillingTab() == 1) {
            $("#pMethod3").remove("");
            $("#nav3").append("<label id='pMethod3'>✅</label>");
            result = 1;
        }
        else if(document.getElementById('sameShipping').checked && validateBillingTab() == 0){
            $("#pMethod3").remove("");
            $("#nav3").append("<label id='pMethod3'>❌</label>");
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
        return result;
    }
    //enables the confirm order button once all fields are valid
    function validateAllTabs(){
        let result = 0;
        if(validateShippingTab() == 1 && validateBillingTab() == 1 && validatePaymentTab() == 1){
            result = 1;
            $("#confirmOrder").prop('disabled', false);
        }
        else{
            $("#confirmOrder").prop('disabled', true);
        }
        return result;

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
