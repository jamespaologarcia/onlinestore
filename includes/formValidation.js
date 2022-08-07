class formValidation{
    constructor(){
        this._validity = {};
    }
    checkShipping(billing){

        if(document.getElementById('sameShipping').checked && billing == 1) {
            $("#pMethod3").remove("");
            $("#nav3").append("<label id='pMethod3'>✅</label>");
            $("#s_firstName").val( $("#firstName").val());
            $("#s_lastName").val( $("#lastName").val());
            $("#s_address").val( $("#address").val());
            $("#s_address2").val( $("#address2").val());
            $("#s_city").val( $("#city").val());
            $("#s_state").val( $("#state").val());
            $("#s_country").val( $("#country").val());
            $("#s_zip").val( $("#zip").val());
        }
        else if(!document.getElementById('sameShipping').checked){
            $("#s_firstName").val("");
            $("#s_lastName").val("");
            $("#s_address").val("");
            $("#s_address2").val("");
            $("#s_city").val("");
            $("#s_state").val("");
            $("#s_country").val("");
            $("#s_zip").val("");

        }
    }
    async validateCard(data){
        if(!/^3[47][0-9]{12}[1-9]$/.test(data) && //AMEX
        !/^(?:4[0-9]{12}(?:[1-9]{3})?|5[1-5][0-9]{14})$/.test(data)){

            return 0;

        }
        else{
            let jsonData = { card_number: data };
            let form_data = new FormData();
            form_data.append('submission', JSON.stringify(jsonData));  
            const result = await fetch('https://deepblue.camosun.bc.ca/~c0180354/ics128/final/', 
            { method: "POST", 
                cache: 'no-cache', 
                body: form_data
            });
            let response = await result.json();
            if(response['error']['card_number'] == undefined){
                return 1;
            }
            else{
                return 0;
            }
          
        }
        
    }
    validateMonth(data){
        if(!/^(0?[1-9]|1[012])$/.test(data)){
            return 0
        }
        else{
            return 1;
        }
    }x
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
    validateCity(data){
        if(!/^[a-zA-Z ]{3,30}$/.test(data)){
            return 0;
        }
        else{
            return 1;
        }
    }
    validateAddress(data){
        if(!/^[a-zA-Z ]{5,30}$/.test(data)){
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
        //takes a 2nd argument to determine which regex to use for validating zip codes based on the country
        if(country == "CA"){
            if(!/^[ABCEGHJ-NPRSTVXY]\d[ABCEGHJ-NPRSTV-Z][ -]?\d[ABCEGHJ-NPRSTV-Z]\d$/i.test(data)){
                result = 0;
            }
        }else if(country == "US"){
            if(!/^[0-9]{5}(?:-[0-9]{4})?$/.test(data)){
                result = 0;
            }
        }
       return result;
    }//adds error notification for valid and invalid entries

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