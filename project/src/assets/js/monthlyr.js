$(document).ready(function(){
    
var dataTable;

if ($('#monthly-table').length > 0) { 
    var sessUserType = $('#sess-type').val(); 

    
var dataTable = $('#monthly-table').DataTable({
    "pageLength": 25,
    "ajax":  {
        "dataType": 'json',
        "contentType": "application/json; charset=utf-8",
        "type": "POST",
        "url":'/report/getMonthlyData'},
    "columns": columnObj,
    
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
            
        },
        {
            extend: 'excel',
            text: 'Excel',
            className: 'btn btn-default',
            
        }

    ],
    sDom: '<"top"ip>rt<"bottom"fl><"clear">',
    drawCallback: function( settings ) {
       // createDropdown(this);
      // $('#filterByAM-id').val("sumna Baul").change();
      
     
         
     //  drawSelected();
    },
    initComplete: function () { 
    dataTable.buttons().container().appendTo('#dataTableButtons');
      createDropdown(this);
      //drawSelected();
    }
});
dataTable.columns( [ 3] ).visible( false, false );
var fromToDate ;
/*$('.input-daterange input').each(function() {
   fromtoDate=  $(this).datepicker({
        format: 'dd-mm-yyyy',
        autoclose: true
       
        // `e` here contains the extra attributes
    }).change()
    .on('changeDate', function(){
        let fromDate = $('#from-date').val();
        
    let toDate = $('#to-date').val();
    
    dataTable.ajax.url('/report/getmonthlyData/?from='+fromDate+"&to="+toDate).load(); 
    $('.date-range').html(fromDate+' to '+ toDate);
    });
    ;
});*/
$('#from-datepicker').datepicker({
    format: 'mm-yyyy',
    viewMode: 'months',
    minViewMode:'months',
    autoclose: true
   
    // `e` here contains the extra attributes
}).change()
.on('changeDate', function(){
    var fromDate = $('#from-date').val();
    dataTable.ajax.url('/report/getMonthlyData/?from='+fromDate).load(); 

});





}

});
function createDropdown(dataTable){
    dataTable.api().columns().every( function (i) {
        var column = this;
        var colId = '';
        if(unitM != 5){
            unitM = 6
        }
        if(i==0){
            colId = 'filterByClient';
        }else if(i==1){
            colId = 'filterByPM';
        }else if(i==2){
            colId = 'filterByAM';
        }else if(i==3){
            colId = 'filterByAO';
        }else if(i==unitM){
            colId = 'price-unit-div';
        }else{
            colId = ''; 
        }
        if(colId!=''){
        var select = $('<select class="form-control" id="'+colId+'-id"><option value="">All</option></select>')
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
            if (d !== null) {
            select.append( '<option value="'+d+'">'+d+'</option>' );
            }
        } );
    }
    } );
}

  



   
   