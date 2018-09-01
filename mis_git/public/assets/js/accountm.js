$(document).ready(function () {

    var dataTable;

    if ($('#am-table').length > 0) {
        var currencyTable = $('#ccy-total').DataTable({
            "columns": [
                { "data": "currency" },
                { "data": "totalAmmount" }
            ],
            bLengthChange: false,
            bFilter: false,
            paging: false,
            info: false
        });
        var dataTable = $('#am-table').DataTable({
           // "lengthMenu": [[10, 25, 50, 100, 500, -1], [10, 25, 50, 100, 500, "All"]],
           // "pageLength": 100,
           "bPaginate": false,
            "lengthChange": false,
            "ajax": {
                "dataType": 'json',
                "contentType": "application/json; charset=utf-8",
                "type": "POST",
                "url": '/invoice/getAmData'
            },
            "columns": [
                { "data": "client_name" },
                { "data": "pm_name", "class": "limited" },
                { "data": "am_name", "class": "limited" },
                { "data": "ao_name", "class": "limited" },
                { "data": {invoice_item:"invoice_item", is_custom:"is_custom"},
                    render: function(data){
                        if(data.is_custom == '1'){
                            return data.invoice_item+' (Custom)';
                        }else{
                            return data.invoice_item;
                        }
                    }
                },
                { "data":"last_month_volume",
                    render : function(data){
                        if(data){
                            return parseFloat(data).toFixed(2);
                        }else{
                            return '';
                        }
                    }
                },
                { "data": "volume" ,
                    render : function(data){
                        if(data){
                            return parseFloat(data).toFixed(2);
                        }else{
                            return '';
                        }
                    }
                },
                { "data":"third_last_volume",
                render : function(data){
                    if(data){
                        return parseFloat(data).toFixed(2);
                    }else{
                        return '';
                    }
                }},
                { "data":"second_last_volume",
                render : function(data){
                    if(data){
                        return parseFloat(data).toFixed(2);
                    }else{
                        return '';
                    }
                }},
                { "data":"last_volume",
                render : function(data){
                    if(data){
                        return parseFloat(data).toFixed(2);
                    }else{
                        return '';
                    }
                }},
                { "data": "currency" },
                { "data": "price_unit" },
                { "data": {price_per_unit:"price_per_unit",price_type:"price_type",id:"id" },render: function (data) {
                    if (data.price_type == 'F') {
                        return data.price_per_unit ;
                    }else{
                        return '<a href="javascript:void(0);" title="click to View" class="view-slab" data-id="'+data.id+'">Slab Price</a>';
                    }
                }},

                {
                    "data": { price_per_unit: "price_per_unit", volume: "volume", price_type: "price_type",slab_price:"slab_price" }, render: function (data) {
                        if (data.price_type == 'F') {
                            return parseFloat(data.price_per_unit * data.volume).toFixed(2);
                        }else{
                            return getSlabAmount(data.slab_price,data.volume);
                        }
                    }
                }

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
            rowGroup: {
                startRender: null,
                endRender: function ( rows, group ) { 
                                   
                        var totalamt = 0;
                        rows.every( function ( rowIdx, tableLoop, rowLoop ) {
                            var amt = 0;
                             data = this.data();
                             if (data.price_type == 'F') {
                                amt = parseFloat(data.price_per_unit * data.volume).toFixed(2);
                            }else{
                                amt = getSlabAmount(data.slab_price,data.volume);
                            }
                            totalamt = parseFloat(totalamt)+parseFloat(amt);
                            
                        } );
                    
                    var ccy = rows
                        .data()
                        .pluck('currency').reduce( function (a, b) {
                           
                            return  b;
                        }) ;
     
                    return $('<tr>')
                        .append( '<td colspan="8">Total for '+group+'</td>' )
                        .append( '<td>'+ccy+'</td>' )
                        .append( '<td colspan="3" align="right">'+totalamt.toFixed(2)+'</td>></tr>' );
                },
                dataSrc: 'client_name'
            },
            order: [[0, 'asc']],
            sDom: '<"top"if>rt<"bottom"lp><"clear">',
            drawCallback: function (settings) {
                var fromDate = $('#from-date').val();
                frmArr = fromDate.split("-");
                fromDate = new Date(frmArr[1]+'-'+frmArr[0]+'-'+1);
               // alert(fromDate);
                var prevMonth ='';
                if (fromDate.getMonth() == 1) {
                    prevMonth = new Date(fromDate.getFullYear() - 1, 0, 1);
                } else {
                    prevMonth = new Date(fromDate.getFullYear(), fromDate.getMonth() - 1, 1);
                }
                   
            lastMonth =  moment(prevMonth).format('MMM-YYYY');
            //alert(lastMonth);
            $('#past-month').html(lastMonth);
            },
            fnFooterCallback: function (nRow, aaData, iStart, iEnd, aiDisplay) {
                /*
                 * Calculate the total market share for all browsers in this table (ie inc. outside
                 * the pagination)
                 */
                // aaData = dataTable.rows( {order:'index', search:'applied'} ).nodes();
                var api = this.api(), aaData;
                currencyDataAll = api
                    .column(10, { search: 'applied' }) // currency
                    .data();
                amountDataAll = api
                    .column(13, { search: 'applied' }) // ammount
                    .data();
               // console.log(amountDataAll);
                var rowdata = [];
                var iTotal = priceHeadAmount = 0;
                var currency = [];
                // console.log(amountDataAll[7]);
                // console.log(aaData);
                //aaData.forEach (function(row){//} 
                for (var i = 0; i < currencyDataAll.length; i++) {
                    // alert(row.currency);
                    currency.push(currencyDataAll[i]);
                }
                // });
                // alert(currency);
                var uniqueCurrency = currency.filter(onlyUnique);
               // console.log(uniqueCurrency);
                for (var j = 0; j < uniqueCurrency.length; j++) {
                    var iTotal = 0;
                    /* aaData.forEach (function(row){
                     
                        if(uniqueCurrency[j]==row.currency){
                          iTotal += row.volume* row.price_per_unit;
                        }
                     });*/

                    for (var i = 0; i < amountDataAll.length; i++) {
                        priceHeadAmount = 0;
                        // console.log('hhh');
                        if (uniqueCurrency[j].trim() == amountDataAll[i].currency.trim() && amountDataAll[i].volume) {
                            if(amountDataAll[i].price_type=='F'){
                                priceHeadAmount = parseFloat(amountDataAll[i].volume * amountDataAll[i].price_per_unit).toFixed(2);
                                iTotal = parseFloat(iTotal) + parseFloat(priceHeadAmount);
                            }else{
                                iTotal = parseFloat(iTotal) + parseFloat(getSlabAmount(amountDataAll[i].slab_price,amountDataAll[i].volume));
                            }
                        }
                    }
                    iTotal = parseFloat(iTotal).toFixed(2); 
                    if (uniqueCurrency[j] != '') {
                        rowdata.push({ currency: uniqueCurrency[j], totalAmmount: iTotal });
                        iTotal = 0;
                    }
                }
                // console.log(rowdata);
                currencyTable.clear().draw();
                currencyTable.rows.add(rowdata); // Add new data
                currencyTable.columns.adjust().draw();
                // currencyTable.data(rowdata).draw();



            },
            initComplete: function () {
                dataTable.buttons().container().appendTo('#dataTableButtons');
                dataTableFilterVal(this);
            }
        });
        dataTable.columns([2, 3]).visible(false, false);
        var fromToDate;
       

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
            dataTable.ajax.url('/invoice/getAmData/?from='+fromDate).load();
            
            
            //dataTableFilterVal(dataTable); 
            });
                //dataTable.columns( [  9,10,11,12, 14,15,16 ] ).visible( false, false );
        


    }

    


    $(".alert-close").click(function () {
        $(".alert").addClass('hidden');
    });

});
function dataTableFilterVal(dataTable) {
    dataTable.api().columns().every(function (i) {
        var column = this;
        var colId = '';

        if (i == 0) {
            colId = 'filterByClient';
        } else if (i == 1) {
            colId = 'filterByPM';
        } else if (i == 2) {
            colId = 'filterByAM';
        } else if (i == 3) {
            colId = 'filterByAO';
        } else if (i == 11) {
            colId = 'price-unit-div';
        } else if (i == 4) {
            colId = 'price-item-div';
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
                    if(i == 4){
                        val = d.invoice_item;
                        if(d.is_custom == 1){
                            val = val+' (Custom)';
                        }
                        select.append('<option value="' + val + '">' + val + '</option>')
                    }else{
                        select.append('<option value="' + d + '">' + d + '</option>')
                    }
                }
            });
        }
    });
}

function dataTableCurrencyVal(dataTable) {
    dataTable.api().columns().every(function (i) {
        var column = this;
        var colId = '';

        if (i == 0) {
            colId = 'filterByClient';
        } else if (i == 1) {
            colId = 'filterByPM';
        } else if (i == 5) {
            colId = 'price-unit-div';
        } else if (i == 2) {
            colId = 'price-item-div';
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
                select.append('<option value="' + d + '">' + d + '</option>')
            });
        }
    });
}




