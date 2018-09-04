Date.prototype.getDateInLastMonth = function () {
    var dateToReturn = new Date(this.valueOf());
    dateToReturn.setMonth(dateToReturn.getMonth() - 1);
    dateToReturn.setHours(00,00,01);
    return  dateToReturn;
}

$(document).ready(function () {

    var dataTable;

    if ($('#revenue-summary-table').length > 0) {
        var currencyTable = $('#ccy-total').DataTable({
            "columns": [
                { "data": "currency" },
                { "data": "totalAmmountFifthLast","class": "text-align-right" },
                { "data": "totalAmmountFourthLast","class": "text-align-right" },
                { "data": "totalAmmountThirdLast","class": "text-align-right" },
                { "data": "totalAmmountSecLast","class": "text-align-right" },
                { "data": "totalAmmountLast" ,"class": "text-align-right"},
                { "data": "totalAmmount","class": "text-align-right" }
            ],
            bLengthChange: false,
            bFilter: false,
            paging: false,
            info: false
        });
        var dataTable = $('#revenue-summary-table').DataTable({
           
           "bPaginate": false,
            "lengthChange": false,
            "ajax": {
                "dataType": 'json',
                "contentType": "application/json; charset=utf-8",
                "type": "POST",
                "url": '/invoice/revenueByClientData'
            },
            "columns": [
                { "data": "client_name" },
                { "data": "currency"  },
                { "data": "fifth_last_month_ammount" ,"class": "text-align-right" },
                { "data": "fourth_last_month_ammount" ,"class": "text-align-right" },
                { "data": "third_last_month_ammount" ,"class": "text-align-right" },
                { "data": "second_last_month_ammount" ,"class": "text-align-right" },
                { "data": "last_month_ammount","class": "text-align-right"  },
                { "data": {ammount:"ammount",currency:"currency"},"class": "text-align-right" ,render : function(data){
                    
                        return data.ammount;
                    
                } }
                
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
           
            order: [[0, 'asc']],
            sDom: '<"top"if>rt<"bottom"lp><"clear">',
            drawCallback: function (settings) {
                var fromDate = $('#from-date').val();
                frmArr = fromDate.split("-");
                fromDate = new Date(frmArr[1]+'-'+frmArr[0]+'-'+1);
               // alert(fromDate);
                var prevMonth = fromDate.getDateInLastMonth();
                var secondPrevMonth = prevMonth.getDateInLastMonth();
                var thirdPrevMonth = secondPrevMonth.getDateInLastMonth();
                var fourthPrevMonth = thirdPrevMonth.getDateInLastMonth();
                var fifthPrevMonth = fourthPrevMonth.getDateInLastMonth();
                // if (fromDate.getMonth() == 1) {
                //     prevMonth = new Date(fromDate.getFullYear() - 1, 0, 1);
                //     secondPrevMonth = new Date(fromDate.getFullYear() - 2, 0, 1);
                // } else {
                //     prevMonth = new Date(fromDate.getFullYear(), fromDate.getMonth() - 1, 1);
                //     secondPrevMonth = new Date(fromDate.getFullYear(), fromDate.getMonth() - 2, 1);
                // }
                currentMonth =  moment(fromDate).format('MMM-YYYY');      
                lastMonth =  moment(prevMonth).format('MMM-YYYY');
                secondLastMonth =  moment(secondPrevMonth).format('MMM-YYYY');
                thirdLastMonth =  moment(thirdPrevMonth).format('MMM-YYYY');
                fourthLastMonth =  moment(fourthPrevMonth).format('MMM-YYYY');
                fifthLastMonth =  moment(fifthPrevMonth).format('MMM-YYYY');
                //alert(lastMonth);
                $('.current-month').html(currentMonth);
                $('.last-month').html(lastMonth);
                $('.second-last-month').html(secondLastMonth);
                $('.third-last-month').html(thirdLastMonth);
                $('.fourth-last-month').html(fourthLastMonth);
                $('.fifth-last-month').html(fifthLastMonth);
            
            },
            fnFooterCallback: function (nRow, aaData, iStart, iEnd, aiDisplay) {
                
                var api = this.api(), aaData;
                currencyDataAll = api
                    .column(1, { search: 'applied' }) // currency
                    .data();
                amountDataAll = api
                    .column(7, { search: 'applied' }) // ammount
                    .data();
                   // console.log(amountDataAll);
                var rowdata = [];
                var iTotal = priceHeadAmount = 0;
                var currency = [];
               
                for (var i = 0; i < currencyDataAll.length; i++) {
                    currency.push(currencyDataAll[i]);
                }
                
                var uniqueCurrency = currency.filter(onlyUnique);
                for (var j = 0; j < uniqueCurrency.length; j++) {
                    var iTotal = 0;
                    var iTotalLast = 0;
                    var iTotalSecLast = iTotalThirdLast = iTotalFourthLast = iTotalFifthLast = 0; 
                    for (var i = 0; i < amountDataAll.length; i++) {
                        priceHeadAmount = 0;
                        // console.log('hhh');
                        if (uniqueCurrency[j].trim() == amountDataAll[i].currency.trim() ) {
                            
                                iTotal = (parseFloat(iTotal) + parseFloat(amountDataAll[i].ammount)).toFixed(2);
                                iTotalLast = (parseFloat(iTotalLast) + parseFloat(amountDataAll[i].last_month_ammount)).toFixed(2);
                                iTotalSecLast = (parseFloat(iTotalSecLast) + parseFloat(amountDataAll[i].second_last_month_ammount)).toFixed(2);
                                iTotalThirdLast = (parseFloat(iTotalThirdLast) + parseFloat(amountDataAll[i].third_last_month_ammount)).toFixed(2);
                                iTotalFourthLast = (parseFloat(iTotalFourthLast) + parseFloat(amountDataAll[i].fourth_last_month_ammount)).toFixed(2);
                                iTotalFifthLast = (parseFloat(iTotalFifthLast) + parseFloat(amountDataAll[i].fifth_last_month_ammount)).toFixed(2);
                            
                        }
                    }
                    iTotal = parseFloat(iTotal).toFixed(2); 
                    if (uniqueCurrency[j] != '') {
                        rowdata.push({ currency: uniqueCurrency[j], totalAmmountFifthLast:iTotalFifthLast, totalAmmountFourthLast:iTotalFourthLast, totalAmmountThirdLast:iTotalThirdLast, totalAmmountSecLast:iTotalSecLast, totalAmmountLast:iTotalLast, totalAmmount: iTotal  });
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
                fromDtArr = fromDate.split("-");
              //  alert(fromDtArr[0]);
                if(fromDtArr[0]-1 !=new Date().getMonth()){
                    $("#radio_mtd").prop('disabled',true);
                    $("#radio_monthly").prop('checked',true);
                }else{
                    $("#radio_mtd").prop('disabled',false);
                    $("#radio_mtd").prop('checked',true);
                }
              var reporttype= $("input:radio[name=reporttype]:checked").val();
             // alert(reporttype);
            //var toDate = $('#to-date').val();
            dataTable.ajax.url('/invoice/revenueByClientData/?from='+fromDate+"&reporttype="+reporttype).load();
            
            
            //dataTableFilterVal(dataTable); 
            });
                //dataTable.columns( [  9,10,11,12, 14,15,16 ] ).visible( false, false );
        


    }

    $("input:radio[name=reporttype]").click(function() {
        if($(this).prop("checked")){
            var fromDate = $('#from-date').val();
          //  alert(fromDate);
            dataTable.ajax.url('/invoice/revenueByClientData/?from='+fromDate+"&reporttype="+$(this).val()).load(); 
        }
    });


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




