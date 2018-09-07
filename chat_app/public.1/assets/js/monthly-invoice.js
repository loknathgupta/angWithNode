    
var dataTable, dtbl;
$(document).ready(function(){
    $(document).on('click', '.getEmailInfo', function(){
        // alert($(this).attr('data-invoice-to'));
        $('#mailingInfo #invoiceTo').html($(this).attr('data-invoice-to'));
        $('#mailingInfo #invoiceCC').html($(this).attr('data-invoice-cc'));
        $('#mailingInfo').modal('show');
    });

if ($('#im-table').length > 0) { 
var InvoiceType = {'1':'Invoice','2':'Proforma', '3': 'Details'};
var dataTable = $('#im-table').DataTable({
    "pageLength": 25,
    "ajax":  {
        "dataType": 'json',
        "contentType": "application/json; charset=utf-8",
        "type": "POST",
        "url":'/invoice/getImData'},
    "columns": [  
        { "data": {id:"id",i_clientid:"i_clientid",month:"month",year:"year",is_custom:"is_custom" }, orderable: false, render:function(data){
            return ' <input type="checkbox" name="price_id"  value="'+data.id+'_'+data.i_clientid+'_'+data.month+'_'+data.year+'_'+data.is_custom+'" data-id="'+data.id+'_'+data.i_clientid+'_'+data.month+'_'+data.year+'_'+data.is_custom+'">'        } },// id is cobmination of price_master_id, client id, month, year
        { "data": {client_name: "client_name", invoice_to: "invoice_to", invoice_cc: "invoice_cc"},
            render : function(data){
                return data.client_name + ' <a href="#"  class="getEmailInfo" data-invoice-to="'+(data.invoice_to?data.invoice_to:'')+'" data-invoice-cc="'+(data.invoice_cc?data.invoice_cc:'')+'"><span class="glyphicon glyphicon-info-sign"></span></a>';
            }
        },
        { "data": "pm_name" ,"class":"limited"},
        { "data": "am_name" ,"class":"limited"},
        { "data": "ao_name" ,"class":"limited"},
        { "data": {invoice_item:"invoice_item",is_custom:"is_custom"},
            render : function(data){
                //return data.is_custom;
                if(parseInt(data.is_custom) == 1){
                    return data.invoice_item+' (Custom)';
                }else{
                    return data.invoice_item;
                }
            }
        },
        
        { "data": null ,
            render: function(data, type, full, meta){
                if(full.monthly_volume_sheet){
                    var textToReturn = parseFloat(full.volume).toFixed(2);
                    if(!full.is_custom){
                        textToReturn = textToReturn +' <a href="/delivery/download_mtd_file/'+full.monthly_volume_sheet+'" id="downloadMTDFile" title="Download" ><span class="glyphicon glyphicon-download" style="font-size: 14px;"></span></a>';
                    }
                    return textToReturn;                
                }else{
                    return parseFloat(full.volume).toFixed(2);
                }
            }

        },
        { "data": "currency" }, 
        { "data": "price_unit" },
        { "data": {price_per_unit:"price_per_unit",price_type:"price_type",id:"id" },render: function (data) {
            if (data.price_type == 'F') {
                return parseFloat(data.price_per_unit);
            }else{
                return '<a href="javascript:void(0);" title="click to View" class="view-slab" data-id="'+data.id+'">Slab Price</a>';
            }
        }},
        
        {
            "data": { price_per_unit: "price_per_unit", volume: "volume", price_type: "price_type",slab_price:"slab_price" }, 
            render: function (data) {
                if (data.price_type == 'F') {
                    return parseFloat(data.price_per_unit * data.volume).toFixed(2);
                }else{
                    return getSlabAmount(data.slab_price,data.volume);
                }
            },
            "class":'priceHeadAmt'
        },
        { "data": "month" },
        { "data": "year" },
        { "data": "invoice_type", 
            render : function(data){
                if(data)
                return InvoiceType[data];
                else
                return '';
            }
         },
        /*{ "data": {id:"id",invoice_number:"invoice_number"} , render:function(data){
            return '<input type="text" value="'+(typeof data.invoice_number !=='undefined' && data.invoice_number !=null?data.invoice_number:'')+'" class="form-control short-input-box" name="invoice_number_'+data.id+'" id="invoice-number-'+data.id+'" >';
        }},*/
        {"data":"invoice_number","visible":false},
        {"data":"invoice_number",render:function(data){
            if(data!==null){
            return data.replace(/,/g,"<br/>");
            }else{
                return '';
            }
        }},
       /* { "data": {id:"id",invoice_date:"invoice_date"},render:function(data){
            return '<input type="text" value="'+(typeof data.invoice_date !=='undefined' && data.invoice_date !='0000-00-00' && data.invoice_date !=null?moment(data.invoice_date).format('DD-MM-YYYY'):'')+'" readonly class="form-control short-input-box invoice-date" name="invoice_date_'+data.id+'" id="invoice-date-'+data.id+'" > <input type="checkbox" class="copy-data" value="'+data.id+'" data-id="'+data.id+'"> Copy to Next';
        } },*/
        {"data":"invoice_date",  render:function(d){
            var dt ='';
            if(typeof d !=='undefined' && d !='0000-00-00' && d !=null){ 
                var dtArr = d.split(",");
                for(var i=0;i<dtArr.length;i++){
                    if(dt!=''){
                        dt +="<br />";
                    }
             dt+= moment(dtArr[i]).format("DD-MM-YYYY");
                }
            }
            return dt;
        }},
        {"data":"full_partial","visible":false},
        {"data":"full_partial",render:function(data){
            if(data!==null){
            return data.replace(/,/g,"<br/>");
            }else{
                return '';
            }
        }}
        
    ],
    
    "buttons": [
        {
            extend: 'colvis',
            text: 'Columns',
            className: 'btn btn-default',
            columns: ':not(.hidden)'
        },
        {
            extend: 'pdf',
            text: 'PDF',
            className: 'btn btn-default',
            extend : 'pdfHtml5',             
            orientation : 'landscape',
            pageSize : 'LEGAL',   
            exportOptions:{
                columns: 'th:not(.not-export)'
            }

            
        },
        {
            extend: 'excel',
            text: 'Excel',
            className: 'btn btn-default',
            exportOptions:{
                columns: 'th:not(.not-export)'
            }
            
        }

    ],
    aaSorting: [[1, 'asc']],
    sDom: '<"top"ip>rt<"bottom"fl><"clear">',
   // bLengthChange: false,
    //bFilter: false,
   // paging:   false,
    //info: false,
    drawCallback: function( settings ) {
       //dataTableFilterVal(this);
    },
 
    initComplete: function () { 
        dtbl = this;
    dataTable.buttons().container().appendTo('#dataTableButtons');
    dataTableFilterVal();
    $('.invoice-date').datepicker({
        format: 'dd-mm-yyyy',
        autoclose: true
       
        // `e` here contains the extra attributes
    });
   /* $('.copy-data').each(function(){
        var id = $(this).data('id');
        alert(id);
        var idnext = $(this).closest('tr').next('tr').find('input[type=checkbox]').val();
        alert(idnext);
    })*/
    }
});
dataTable.columns( [ 3,4] ).visible( false, false );
$(document).on('click', '.copy-data',function(){
    var idnext = $(this).closest('tr').next('tr').find('input[type=checkbox]').val();
   if($(this).is(":checked")){
       chkVal = $(this).val();
        invNumber = $('#invoice-number-'+chkVal).val();
        invDate = $('#invoice-date-'+chkVal).val();
       
        $('#invoice-number-'+idnext).val(invNumber);
        $('#invoice-date-'+idnext).val(invDate);
   }else{
    $('#invoice-number-'+idnext).val('');
    $('#invoice-date-'+idnext).val('');
   }


});
$(document).on('click', '#save-invoice',function(){


});
/* add invoice number */
var totalAmount= 0;
$("#add-invoice-number").click(function(){ 
    totalAmount= 0;
    var chk = false;
    var client = '';
    var sameclient = true;
    var prevClient ='';
    var fullInvoice = false;
    var idVal;
    $('input[type="checkbox"][name="price_id"]').each(function(){
           // If checkbox is checked
           if(this.checked){               
            totalAmount = parseFloat(totalAmount) + parseFloat($(this).parent('td').siblings('.priceHeadAmt').text()); 
            //console.log(totalValume);   

            var val = $(this).val();
            idVal = val;
            var valArr = val.split('_');
            client =  valArr[1];
           // alert("client: "+ client + " prev client:"+ prevClient);
              chk = true;
              if(prevClient!='' && client!=prevClient){
                sameclient = false;  
              }
              fullVal = $(this).parent().siblings('td:last').html();
              if(fullVal.search(/Full/i)>-1){
                fullInvoice = true; 
              }
              prevClient = client;
           }      
     });
     if(chk){
       if(sameclient){
           if(!fullInvoice){
            var fromDate = $('#from-date').val();
            $('#action-type').val('add');
            $('#from-date-hide').val(fromDate);
            $('#invoice-number-add').load('/invoice/invoiceNumber/1/?id='+idVal,function(){
                $('#invoice-add').modal({show:true});
                $(document).find('#tAmt').html(totalAmount);
            });
        }else{
            alert("Full invoice already generated for selected invoice number.")
        }
        }else{
           alert("Please select same client or single client.")
        }      
     }else{
         alert("Please select atleast one row.");
     }   
});
/* edit invoice number */
$("#edit-invoice-number").click(function(){  
    var chk = false;
    var cnt = ''; 
    var idVal ='';
    var fullInvoice = false;
    $('input[type="checkbox"][name="price_id"]').each(function(){
            // If checkbox is checked
           if(this.checked){           
              chk = true;
              idVal = $(this).val();
              fullVal = $(this).parent().siblings('td:last').html();
              if(fullVal.search(/Full/i)>-1){
                fullInvoice = true; 
              }
              if(fullVal.search(/Partial/i)>-1){
                fullInvoice = true; 
              }
              cnt++;
           }       
     });
     if(chk){
       if(cnt==1){
           if(fullInvoice){
                var fromDate = $('#from-date').val();
                $('#action-type').val('edit');
                $('#from-date-hide').val(fromDate);
                $('#invoice-number-add').load('/invoice/invoiceNumber/0/?id='+idVal,function(){
                // alert("hi");
                    $('#invoice-add').modal({show:true});
                });
            }else{
                alert("Invoice has not been generated for selected item so you can't edit it.");
            }
        }else{
           alert("Please select only one row at a time to edit.")
        }      
     }else{
         alert("Please select atleast one row.");
     }   
});
$(document).on('click', '#save-invoice-number',function(){
 //alert("hi");
 if($('#action-type').val()!='edit'){
 $('#invoice-number-hide').val($('#invoice-number').val());
 $('#invoice-date-hide').val($('#invoice-date-value').val());
 $('#invoice-full-hide').val($('#invoice-full-partial').val());
 }
 //alert($('#invoice-date-hide').val());
    $("#add_number").validationEngine({ promptPosition: "topLeft", scroll: false });
    //alert($('#action-type').val());
    if($("#add_number").validationEngine('validate')){ 
        var url = "/invoice/saveInvoiceReport";
        var data = $('#lst-frm').serialize();
        
        if($('#action-type').val()=='edit'){
            url = "/invoice/updateInvoiceReport";
            data = $('#add_number').serialize();
           // alert(data);
        }
    $.ajax({
        url: url, 
        type:"post", 
        data:data, 
        success: function(result){ //alert(result.success);
             if(result.success==true){
                $('#invoice-add').modal('toggle');
                showsucMsg(result.msg);
               dataTable.ajax.reload();
            }else{
                showErrMsg(result.msg); 
            }
        }
    });
}
});

var fromToDate ;
$('#from-datepicker').datepicker({
    format: 'mm-yyyy',
    viewMode: 'months',
    minViewMode:'months',
    autoclose: true
   
    // `e` here contains the extra attributes
}).change()
    .on('changeDate', function(){
        var fromDate = $('#from-date').val();
        //var toDate = $('#to-date').val();
        var invoiceStatus = $('#invoive-filter').val();
        dataTable.ajax.url('/invoice/getImData/?from='+fromDate+"&not_invoice="+invoiceStatus).load(function(){
        dataTableFilterVal();
    });
    });
    ;

   /* $(document).on('submit','#lst-frm',function(e){
       // e.preventDefault();
       // alert('hi');
        var fromDate = $('#from-date').val();
        $('#from-date-hide').val(fromDate);
       // alert($('#from-date-hide').val());
        return true;
       // $('#lst-frm').submit();
      //  return false; 
     });*/

//dataTable.columns( [  9,10,11,12, 14,15,16 ] ).visible( false, false );
$(document).on('change', '#invoive-filter',function(){
    //var fromDate = moment(new Date()).format('MM-YYYY');
    var fromDate = $('#from-date').val();
    if($('#from-date').val() != fromDate && parseInt($(this).val()) == 2){        
        $('#from-date').val(fromDate);
        $('#from-datepicker').datepicker('update');
    }else{
        fromDate = $('#from-date').val();
        dataTable.ajax.url('/invoice/getImData/?from='+fromDate+'&not_invoice='+$(this).val()).load();  
        dataTableFilterVal();
    }
});

}




$(".alert-close").click(function(){
    $(".alert").addClass('hidden');
});

   });
   function dataTableFilterVal(){
    dtbl.api().columns().search('').draw();;
       var invoiceTypes = [];
       var invoiceNumbers = [];
       var clients =  [];
       var varaibleToMatch;
    dtbl.api().columns().every( function (i) {
        var column = this;
        var colId = '';

        if(i==1){
            colId = 'filterByClient';
        }else if(i==2){
            colId = 'filterByPM';
        }else if(i==3){
            colId = 'filterByAM';
        }else if(i==4){
            colId = 'filterByAO';
        }else if(i==5){
            colId = 'price-item-div';
        }else if(i==6){
            colId = 'filterByVolume';
        }else if(i==8){
            colId = 'price-unit-div';
        }else if(i==15){
            colId = 'filterByInvoiceNumber';
        }else if(i==18){
            colId = 'filterByFullParrtial';
        }else{
            colId = ''; 
        }
        if(colId!=''){
        var select = $('<select class="form-control"><option value="">All</option></select>')
            .appendTo( $("#"+colId).empty() )
            .on( 'change', function () {
                var val = $.fn.dataTable.util.escapeRegex(
                    $(this).val()
                );
                if(i == 1 || i == 18 || i == 15){
                    column
                    .search( val ? val  : '', true, false )
                    .draw();
                }else if(i==6){
                    column
                    .search( val ? '^'+val  : '', true, false )
                    .draw();
                }else{
                column
                    .search( val ? '^'+val+'$' : '', true, false )
                    .draw();
                }
            } );

        column.data().unique().sort().each( function ( d, j ) {
            if (d !== null) {                
                var val = '';
                if(i == 1){
                    val = d.client_name.trim();
                    if(clients.indexOf(val) != -1){
                        val = '';
                    }else{
                        clients.push(val);
                    }
                }else if(i == 5){
                    if(d.is_custom){
                        val = d.invoice_item+' (Custom)';
                    }else{
                        val = d.invoice_item;
                    }
                }else if(i == 6){
                    val = parseFloat(d.volume).toFixed(2);
                }else if(i == 18 || i == 15){
                    varaibleToMatch = invoiceTypes;
                    if(i == 15){
                        varaibleToMatch = invoiceNumbers;
                    }
                    if(d.indexOf(',') != -1){
                        valueArray = d.split(',');
                        valueArray.forEach(function(value){
                            value = value.trim();
                            if(varaibleToMatch.indexOf(value) == -1){
                                varaibleToMatch.push(value);
                                select.append( '<option value="'+value+'">'+value+'</option>' );
                            }
                        });

                    }else{
                        d = d.trim();
                        if(varaibleToMatch.indexOf(d) == -1){
                            val = d;
                        }
                    }
                }else{
                    val = d;
                }
                if(val != ''){
                    select.append( '<option value="'+val+'">'+val+'</option>' );
                }
            }
        } );
    }
    } );
   }

   


   
   