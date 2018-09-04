

$(document).ready(function () {

    var dataTable;

    if ($('#revenue-summary-table-days').length > 0) {
        var currencyTable = $('#ccy-total').DataTable({
            
            bLengthChange: false,
            bFilter: false,
            paging: false,
            info: false,
            drawCallback:function (settings) {
                $('.dataTables_wrapper').css('overflow','auto');
            },
        });
        var dataTable = $('#revenue-summary-table-days').DataTable({
           
           "bPaginate": false,
           "lengthChange": false,
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
                    extend: 'pdfHtml5',
                    orientation: 'landscape',
                    pageSize: 'LEGAL',

                },
                {
                    extend: 'excel',
                    text: 'Excel',
                    className: 'btn btn-default',

                }

            ],
            
            drawCallback:function (settings) {
                $('.dataTables_wrapper').css('overflow','auto');
            },
            order: [[0, 'asc']],
            sDom: '<"top"if>rt<"bottom"lp><"clear">',
            initComplete: function () {
                
                $('#revenue-summary-table-days').DataTable().buttons().container().appendTo('#dataTableButtons');
                dataTableFilterVal(this);
            }
         
         
           
        });
       
        var fromToDate;
       

        from = $('#from-date').datepicker({
            format: 'dd-mm-yyyy',
           
            autoclose: true
           
            // `e` here contains the extra attributes
        }).change()
            .on('changeDate', function(){
                var formdate = $('#from-date').val();
                
               $('#to-date').datepicker('setStartDate', formdate);
              
            });
                //dataTable.columns( [  9,10,11,12, 14,15,16 ] ).visible( false, false );
        
                 $('#to-date').datepicker({
                    format: 'dd-mm-yyyy',
                   
                    autoclose: true
                   
                    // `e` here contains the extra attributes
                });

    }

    

    $(".alert-close").click(function () {
        $(".alert").addClass('hidden');
    });

});
function dataTableFilterVal(dataTable) {
   // alert("hi");
    dataTable.api().columns().every(function (i) {
        var column = this;
        var colId = '';

        if (i == 0) {
            colId = 'filterByClient';
        } else {
            colId = '';
        }
        if (colId != '') {
            var select = $('<select class="form-control"><option value="">All</option></select>')
                .appendTo($("#" + colId).empty())
                .on('change', function () {
                    var val = $.fn.dataTable.util.escapeRegex(
                        $(this).val()
                    );

                    column
                        .search(val ? '^' + val + '$' : '', true, false)
                        .draw();
                });

            column.data().unique().sort().each(function (d, j) {
                
                if(d){
                    
                        select.append('<option value="' + d + '">' + d + '</option>')
                    
                }
            });
        }
    });
}




