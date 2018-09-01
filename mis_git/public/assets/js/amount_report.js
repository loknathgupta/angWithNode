var reportDataTable;

$(document).ready(function () {
    if ($('#amount_report tbody tr').length > 0) {
        var currencyTable = $('#ccy-total').DataTable({
            "columns": [
                { "data": "currency" },
                { "data": "lastMonthTotalAmount","class": "text-align-right" },
                { "data": "projectedTotalAmount","class": "text-align-right" },
                { "data": "actualTotalAmount","class": "text-align-right" }
            ],
            bLengthChange: false,
            bFilter: false,
            paging: false,
            info: false
        });

        reportDataTable = $('#amount_report').DataTable({
            "lengthMenu": [[10, 25, 50, 100, 500, -1], [10, 25, 50, 100, 500, "All"]],
            "pageLength": -1,
            'select': {
                'style': 'multi'
            },
            initComplete: function () {
                createDropdown(this);
            },
            sDom: '<"top"ip>rt<"bottom"fl><"clear">',
            order: [[0, "asc"]],
            fnFooterCallback: function (nRow, aaData, iStart, iEnd, aiDisplay) {
                var api = this.api(), aaData;
                currencyDataAll = api
                    .column(1, { search: 'applied' }) // currency
                    .data();
                projectedAmountDataAll = api
                    .column(3, { search: 'applied' }) // ammount
                    .data();

                actualAmountDataAll = api
                .column(4, { search: 'applied' }) // ammount
                .data();

                lasMonthActualAmountDataAll = api
                .column(2, { search: 'applied' }) // ammount
                .data();


                // console.log(amountDataAll);
                var rowdata = [];
                var iTotal = priceHeadAmount = 0;
                var currency = [];
                var projectedTotalData = {}; 
                var actualTotalData = {}; 
                var lastMonthTotalData = {};
                for (var i = 0; i < currencyDataAll.length; i++) {

                    if(projectedTotalData[currencyDataAll[i]])
                    projectedTotalData[currencyDataAll[i]] = (parseFloat(projectedTotalData[currencyDataAll[i]]) + parseFloat(projectedAmountDataAll[i])).toFixed(2);
                    else
                    projectedTotalData[currencyDataAll[i]] = parseFloat(projectedAmountDataAll[i]).toFixed(2);

                    if(actualTotalData[currencyDataAll[i]])
                    actualTotalData[currencyDataAll[i]] = (parseFloat(actualTotalData[currencyDataAll[i]]) + parseFloat(actualAmountDataAll[i])).toFixed(2);
                    else
                    actualTotalData[currencyDataAll[i]] = parseFloat(actualAmountDataAll[i]).toFixed(2);

                    if(lastMonthTotalData[currencyDataAll[i]])
                    lastMonthTotalData[currencyDataAll[i]] = (parseFloat(lastMonthTotalData[currencyDataAll[i]]) + parseFloat(lasMonthActualAmountDataAll[i])).toFixed(2);
                    else
                    lastMonthTotalData[currencyDataAll[i]] = parseFloat(lasMonthActualAmountDataAll[i]).toFixed(2);

                    currency.push(currencyDataAll[i]);
                }

                // console.log(projectedTotalData);
                // console.log(actualTotalData);

                var uniqueCurrency = currency.filter(onlyUnique);

                for (var j = 0; j < uniqueCurrency.length; j++) {
                    rowdata.push({ currency: uniqueCurrency[j], lastMonthTotalAmount:lastMonthTotalData[uniqueCurrency[j]], projectedTotalAmount: projectedTotalData[uniqueCurrency[j]], actualTotalAmount: actualTotalData[uniqueCurrency[j]] });
                }
                // console.log(rowdata);
                currencyTable.clear().draw();
                currencyTable.rows.add(rowdata); // Add new data
                currencyTable.columns.adjust().draw();
                currencyTable.data(rowdata).draw();
            },
        });
    }
    $('#from-datepicker').datepicker({
        format: 'mm-yyyy',
        viewMode: 'months',
        minViewMode: 'months',
        autoclose: true,
        endDate: new Date()

        // `e` here contains the extra attributes
    }).change()
        .on('changeDate', function () {
            $('#monthFilter').submit();
        });
});

function createDropdown(dataTable) {
    dataTable.api().columns().every(function (i) {
        var column = this;
        var colId = '';
        if (i == 0) {
            colId = 'filterByClient';
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

                if (d) {

                    select.append('<option value="' + d + '">' + d + '</option>')

                }
            });
        }
    });
}
