$(document).ready(function(){
    loadData();
    closeNav();
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
    reopulateCart();
}
function openNav() {
    $("#mySidenav").show();
  }
  
function closeNav() {
   $("#mySidenav").hide();
}
function addToCart(id){
    let list = get_cookie("cartList");
    if(list[id] === undefined){
        list[id] = 1;
    }
    else{
        list[id]++;
    }
    set_cookie("cartList", list);
}
function populateStore(apiURL){
    let storeProducts = "";
    
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
function reopulateCart(){
    let cartList = get_cookie("cartList");
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
    if(cartList.length > 0 && cartList !== undefined){
        cartList.forEach((data, index) => {
            try{
                let total = 0;
                fetch(`https://fakestoreapi.com/products/${index}`)
                .then(resp=>resp.json())
                    .then(json=>{
                        console.log(json['title']);
                        $('#cartContainer').append(`<div class="row">
                        <div class="col-lg-2 ">
                        </div>
                        <div class="col-lg-3 ">
                        ${json['title']}
                        </div>
                        <div class="col-lg-2 ">
                        ${data}
                        </div>
                        <div class="col-lg-2 ">
                        ${json['price']}
                        </div>
                        <div class="col-lg-3 ">
                        ${json['price'] * data}
                        </div>
                        <hr>
                    </div>`);
                    total += json['price'];
                    console.log(total);
                    });
                
            }
            catch (err){
         //       console.log('error', err);
            }
            
        });
    }
}