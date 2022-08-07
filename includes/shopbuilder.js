class shopBuilder{
    constructor(){
        this._selectCurrency = $("#selectCurrency :selected").val(); 
        this._currency = {"cad": "$", "usd": "US$", "gbp": "£"};
        this._currencySymbol = this._currency[this._selectCurrency];
        this._products;
    }
    set productList(URL){
        this._products = fetch(URL)
        .then(res=>res.json())
        .then(json=>{
            return json;
        });

    }
    get productList(){
        return this._products;
    }
    //tax rates depending on the canadian state, default value is 10%. US states not taken into consideration for the taxation
    getTax(){
        let state = $("#state").val();
        let tax;
        if(state == "AB"){
            tax =5;
        }else if(state == "BC"){
            tax =12;
        }else if(state == "MB"){
            tax =12;
        }
        else if(state == "NB"){
            tax =15;
        }
        else if(state == "NL"){
            tax =15;
        }
        else if(state == "NS"){
            tax =15;
        }
        else if(state == "ON"){
            tax =13;
        }
        else if(state == "PE"){
            tax =15;
        }
        else if(state == "QC"){
            tax =14.975;
        }
        else if(state == "SK"){
            tax =11;
        }
        else if(state == "NT"){
            tax =5;
        }
        else if(state == "NU"){
            tax =5;
        }
        else if(state == "YT"){
            tax =5;
        }else{
            tax =10;
        }
        return tax;
    }
    buildCart(item, cartList, currency){
        //renders the html elements for the cart
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
    buildSummary(item, cartList, currency){
        //renders the order summary on checkout
        let sum = cartList[item['id']] * item['price'] * currency;
        let itemPrice = item['price'] * currency;
        let cartRow = `<div class="row">
            <div class="col-lg-5">
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
        </div><hr>`;
        return cartRow;

    }
    renderShopItemEntry(data, price, cartList){
        //renders shop item list
        let itemCount = "";
        if(cartList[data.id] !== undefined){
            itemCount = `[${cartList[data.id]}]`;
        }
        let itemEntry = `<div class="grid-item">
            <img src="${data.image}" height="auto" width="200px"></img>
                    <h5 class="card-title">${data.title}</h5>
                    <p class="card-text">${data.description}</p>
                    <p class="card-text">${this._currencySymbol}  ${price.toFixed(2)}</p>
                    <button class="btn btn-success add-to-cart-button" id="${data.id}" onclick="addToCart(${data.id}); openNav();">
                    ➕ Add to Cart ${itemCount}</button>
            </div>`;
        return itemEntry;
    }
    getCurrency(){
        //gets the current CAD exchange rate for the selected foreign currency.
        //returned as a promise so it still needs to be processed when used -- ergo the recursion.
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
        <button type="button" class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#checkoutModal" onclick="renderOrderSummary()"id="checkoutButton">
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
        <p id="symbol"> ${this._currencySymbol} ${totalPrice} </p>
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
    renderEmptySummary(){
        $('#summaryBody').empty();
        $('#summaryBody').append(`<div class="row"> 
        <div class="col-lg-12 ">
          <center> No items in added </center>
        </div>
    </div>`);
    }
    summaryHeader(){
        $('#summaryBody').append(`<div class="row cart-header">
            <div class="col-lg-5 cart-header">
            Item    
            </div>
            <div class="col-lg-1 cart-header">
            Qty
            </div>
            <div class="col-lg-3 cart-header">
            Price
            </div>
            <div class="col-lg-3 cart-header">
            Total
            </div>
        </div> <hr class="class-1" >`);   
    }
    summaryGrandTotal(total, currency, taxRate){
        let shippingFee = 15 * currency;
        let tax = total * (taxRate/100);
        let grandTotal = parseFloat(tax.toFixed(2)) + parseFloat(shippingFee.toFixed(2)) + parseFloat(total);
        $('#summaryBody').append(`
        <div class="row summation">
            <div class="col-lg-5 ">
            Subtotal 
            </div>
            <div class="col-lg-1 ">
           
            </div>
            <div class="col-lg-3 ">
          
            </div>
            <div class="col-lg-3 ">
            <p id="symbol"> ${this._currencySymbol} <label id="total">${total}</label></p>
            </div>
        </div> <hr>
        <div class="row summation">
            <div class="col-lg-5 ">
            Shipping 
            </div>
            <div class="col-lg-1 ">
           
            </div>
            <div class="col-lg-3 ">
          
            </div>
            <div class="col-lg-3 ">
          <p id="symbol"> ${this._currencySymbol} <label id="shippingFee"> ${shippingFee.toFixed(2)}</label></p>
            </div>
        </div> <hr>
        <div class="row summation">
            <div class="col-lg-5 ">
            <p id="taxRate"> Tax ${taxRate}%</p>
            </div>
            <div class="col-lg-1 ">
           
            </div>
            <div class="col-lg-3 ">
          
            </div>
            <div class="col-lg-3 ">
            
            <p id="tax"><p id="symbol"> ${this._currencySymbol}  ${tax.toFixed(2)}</p></p>
            </div>
        </div> <hr>
        <div class="row summation">
            <div class="col-lg-5 ">
            Order Total 
            </div>
            <div class="col-lg-1 ">
           
            </div>
            <div class="col-lg-3 ">
          
            </div>
            <div class="col-lg-3 ">
            <p id="grandTotal"><p id="symbol"> ${this._currencySymbol} ${grandTotal.toFixed(2)}</p></p>
            </div>
        </div> <hr>`);   
    }

}