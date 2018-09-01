var logsDataTable;
var moduleNames = {
    'price': 'Price ',
    'delivery': 'Delivery',
    'user': 'User',
    'change_approval' : 'Request Approval',
    'access' : 'Access Control',
    'invoice' : 'Invoice Number'
}
$(document).ready(function () {
    if ($('#activityLogs').length > 0) {
        logsDataTable = $('#activityLogs').DataTable({
            "lengthMenu": [[10, 25, 50, 100, 500, -1], [10, 25, 50, 100, 500, "All"]],
            "pageLength": 25,
            "ajax": {
                "dataType": 'json',
                "contentType": "application/json; charset=utf-8",
                "type": "get",
                "url": '/activity_log/get_activity_log'
            },
            "columns": [                
                {
                    data: "created",
                    render: function (d) {
                        return "<span class='hidden'>"+moment(d).format("YYYYMMDDHHmmss")+"</span>"+moment(d).format("DD-MM-YYYY h:mm:ss a");
                    }
                },
                {
                    data: "done_by",
                    render: function (user) {
                        return user.trim();
                    }
                },{
                    // data: "page_url",
                    // render: function (u) {
                    //     var explodedUrl = u.split('/');
                    //     return moduleNames[explodedUrl['1']];
                    // }
                    data : null,
                    "render": function(data, type, full, meta){
                        var explodedUrl = full.page_url.split('/');
                        return moduleNames[explodedUrl['1']]+' '+ full.action;
                    }
                },
                { data: "message" }
            ],
            'select': {
                'style': 'multi'
            },
            initComplete: function () {
                createDropdown(this);
            },
            sDom: '<"top"ip>rt<"bottom"fl><"clear">',
            order: [[ 0, "desc" ]]
        });
    }
});

function createDropdown(dataTable) {
    var userList = moduleNamesToAdd = [];
    dataTable.api().columns().every(function (i) {
        var column = this;
        var colId = '';
        if (i == 2) {
            colId = 'moduleName';
        }
        if (i == 1) {
            colId = 'actionBy';
        }
        if (colId != '') {
            var select = $('<select class="" id="' + colId + '-id"><option value="">All</option></select>')
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
                console.log(d);
                var sel = '';
                if(colId == 'moduleName'){
                    var explodedUrl = d.page_url.split('/');
                    var v = moduleNames[explodedUrl[1]]+' '+ d.action;
                    //console.log(moduleNamesToAdd);
                    if(moduleNamesToAdd.indexOf(v) == -1){
                        moduleNamesToAdd.push(v);
                        select.append('<option value="' + v + '" ' + sel + ' >' + v + '</option>')
                    }
                }else{
                    select.append('<option value="' + d + '" ' + sel + ' >' + d + '</option>')
                }
                
            });
        }
    });
    // 
}
