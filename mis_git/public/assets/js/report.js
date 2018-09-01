$(document).ready(function(){
    
var dataTable;

if ($('#monthly-table').length > 0) { 
var dataTable = $('#am-table').DataTable({
    "pageLength": 25,
    "ajax":  {
        "dataType": 'json',
        "contentType": "application/json; charset=utf-8",
        "type": "POST",
        "url":'/report/getmonthlyData'},
    "columns": [  
        { "data": "client_name" },
        { "data": "pm_name" },
        { "data": "invoice_item" },
        
        { "data": "volume" },
        { "data": "currency" }, 
        { "data": "price_unit" },
        { "data": "price_per_unit" },
        
        {"data":null}
        
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
            
        },
        {
            extend: 'excel',
            text: 'Excel',
            className: 'btn btn-default',
            
        }

    ],
    initComplete: function () { 
    dataTable.buttons().container().appendTo('#dataTableButtons');
    this.api().columns().every( function (i) {
        var column = this;
        var colId = '';

        if(i==0){
            colId = 'filterByClient';
        }else if(i==1){
            colId = 'filterByPM';
        }else if(i==5){
            colId = 'price-unit-div';
        }else if(i==2){
            colId = 'price-item-div';
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

                column
                    .search( val ? '^'+val+'$' : '', true, false )
                    .draw();
            } );

        column.data().unique().sort().each( function ( d, j ) {
            select.append( '<option value="'+d+'">'+d+'</option>' )
        } );
    }
    } );
    }
});
var fromToDate ;
$('.input-daterange input').each(function() {
   fromtoDate=  $(this).datepicker({
        format: 'yyyy-mm-dd',
        autoclose: true
       
        // `e` here contains the extra attributes
    }).change()
    .on('changeDate', function(){
        let fromDate = $('#from-date').val();
    let toDate = $('#to-date').val();
    dataTable.ajax.url('/price/getAmData/?from='+fromDate+"&to="+toDate).load(); 
    });
    ;
});
$('#to-date').datepicker('setEndDate', moment(new Date()).format( 'YYYY-MM-DD'));

//dataTable.columns( [  9,10,11,12, 14,15,16 ] ).visible( false, false );
$("#datepicker_from").datepicker({
    showOn: "button",
    format: 'dd M yyyy',
    buttonImage: "images/calendar.gif",
    buttonImageOnly: false,
    "onSelect": function(date) { alert(date);
      minDateFilter = new Date(date).getTime();
      alert(minDateFilter + "1");
     // dataTable.fnDraw();
    }
  }).keyup(function() {
    minDateFilter = new Date(this.value).getTime();
    //dataTable.fnDraw();
    alert(minDateFilter + "2");
  });
  $("#datepicker_to").datepicker({
    showOn: "button",
    format: 'dd M yyyy',
    buttonImage: "images/calendar.gif",
    buttonImageOnly: false,
    "onSelect": function(date) {  alert("hi");
      maxDateFilter = new Date(date).getTime();
      //dataTable.fnDraw();
    }
  }).keyup(function() { alert("hi");
    maxDateFilter = new Date(this.value).getTime();
    //dataTable.fnDraw();
  });

}




$(".alert-close").click(function(){
    $(".alert").addClass('hidden');
});

   });

  



   
   