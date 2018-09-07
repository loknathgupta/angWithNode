var changeRequestDataTable, customPriceDataTable;
$(document).ready(function () {
    
    if ($('#ChangeRequested').length > 0) {
        changeRequestDataTable = $('#ChangeRequested').DataTable({
            "pageLength": 25,
            "ajax": {
                "dataType": 'json',
                "contentType": "application/json; charset=utf-8",
                "type": "get",
                "url": '/change_approval/get_requests'
            },
            "columns": [
                { "data": "client_name" },
                { "data": "invoice_item" },
                { "data": "price_unit" },
                { "data": "currency" },
                {
                    data: "delivery_date",
                    render: function (d) {
                        return moment(d).format("DD-MM-YYYY");
                    }
                },
                { "data": null,
                    "render": function(data, type, full, meta){
                    return "<div class='strike'>"+parseFloat(full["current_volume"]).toFixed(2) + "</div> <div>" + parseFloat(full["requested_volume"]).toFixed(2) +"</div>";
                    } 
                },
                { "data": null,
                    "render": function(data, type, full, meta){
                    //return full["current_volume"] + ", " + full["requested_volume"];
                    return "<div class='strike'>"+full["current_description"] + "</div> <div>" + full["requested_description"]+"</div>";
                    } 
                 },
                 { "data": "requested_by" },
                {
                    data: "requested_on",
                    render: function (d) {
                        return moment(d).format("DD-MM-YYYY");
                    }
                },
                {
                    "data": null, 
                    'render': function (data, type, full, meta) {
                            return '<button type="button" class="btn btn-success approve" aria-label="Left Align" request-id="'+full["request_id"]+'" title="Approve" >Approve</button>'+
                            '<button type="button" class="btn btn-danger reject" aria-label="Left Align" request-id="'+full["request_id"]+'"  title="Reject">Reject</button>';
                    }
                }

            ],

            'select': {
                'style': 'multi'
            },
            initComplete: function () {
                //changeRequestDataTable.buttons().container().appendTo('#dataTableButtons');
               
            },
            sDom: '<"top"ip>rt<"bottom"fl><"clear">',
        });
    }

    if ($('#CustomPriceRequested').length > 0) {
        customPriceDataTable = $('#CustomPriceRequested').DataTable({
            "pageLength": 25,
            "ajax": {
                "dataType": 'json',
                "contentType": "application/json; charset=utf-8",
                "type": "get",
                "url": '/change_approval/get_pending_custom_prices'
            },
            "columns": [
                { "data": "client_name" },
                { "data": "invoice_item" },
                { "data": "price_unit" },
                { "data": "currency" },                
                { "data": "price_per_unit" },                
                { "data": "requested_volume",
                    render : function(data){
                    return parseFloat(data).toFixed(2);
                    }
                },
                { "data": "requested_description" },
                { "data": "requested_by" },
                {
                    data: "requested_on",
                    render: function (d) {
                        return moment(d).format("DD-MM-YYYY");
                    }
                },
                {
                    "data": null, 
                    'render': function (data, type, full, meta) {
                            return '<button type="button" class="btn btn-success approve-price" aria-label="Left Align" request-id="'+full["request_id"]+'" title="Approve">Review</button>';
                    }
                }

            ],

            'select': {
                'style': 'multi'
            },
            initComplete: function () {
                //changeRequestDataTable.buttons().container().appendTo('#dataTableButtons');
               
            },
            sDom: '<"top"ip>rt<"bottom"fl><"clear">',
        });
    }
    var updateStatus, requestId, comment;

    $(document).on('click', '.approve, .reject', function(){
        $('#updateComment').trigger('reset');
        $('#updateStatus').removeClass('hidden');
        $('#approvePrice').addClass('hidden');
        $("#updateComment").validationEngine({ promptPosition: "topLeft", scroll: false });
        $('#popupModel').modal('show');
        updateStatus = 0;
        requestId = $(this).attr('request-id');
        if($(this).hasClass('approve')){
            updateStatus = 1;
        }
    });

    $(document).on('click', '#updateStatus', function(){  
        if( $("#updateComment").validationEngine('validate')){            
            comment = $(this).closest('form').find('#comment').val();
            if(comment == null || comment.trim() == ''){
                alert('Please enter a comment for status update.')
            }else{
                $.ajax({
                    url : '/change_approval/update_status',
                    data: {requestId:requestId, updateStatus:updateStatus, comment:comment},
                    type : 'post',
                    success : function(data){
                        changeRequestDataTable.ajax.reload();
                        if(data.success == true){
                            $('#popupModel').modal('hide');
                            showsucMsg(data.message)
                        }else{
                            showErrMsg(data.message);
                        }
                    }
                });
            }        
        }
    });

    $(document).on('click', '.approve-price, .reject-price', function(){
        // $('#updateComment').trigger('reset');
        // $('#approvePrice').removeClass('hidden');
        // $('#updateStatus').addClass('hidden');
        // $("#updateComment").validationEngine({ promptPosition: "topLeft", scroll: false });
        // $('#popupModel').modal('show');
        // updateStatus = 0;
        // requestId = $(this).attr('request-id');
        // if($(this).hasClass('approve-price')){
        //     updateStatus = 1;
        // }
        var requestId = $(this).attr('request-id');        
        $('#popupModelForCustomprice').load('/change_approval/get_custom_price/'+requestId).modal('show');
    });

    $(document).on('click', '#approvePrice', function(){  
        if( $("#updateComment").validationEngine('validate')){            
            comment = $(this).closest('form').find('#comment').val();
            if(comment == null || comment.trim() == ''){
                alert('Please enter a comment for status update.')
            }else{
                $.ajax({
                    url : '/change_approval/update_custom_price_status',
                    data: {requestId:requestId, updateStatus:updateStatus, comment:comment},
                    type : 'post',
                    success : function(data){
                        customPriceDataTable.ajax.reload();
                        if(data.success == true){
                            $('#popupModel').modal('hide');
                            showsucMsg(data.message)
                        }else{
                            showErrMsg(data.message);
                        }
                    }
                });
            }        
        }
    });

    $(document).on('click', '#approve, #reject', function () {
        $(this).closest('form').find('#updateStatus').val($(this).attr('data-status-id'));
        if( $("#updateCustomPrice").validationEngine('validate')){ 
            if(confirm("Are you sure?")){            
                $.ajax({
                    url : '/change_approval/update_custom_price_status',
                    data: $(this).closest('form').serialize(),
                    type : 'post',
                    success : function(data){
                        customPriceDataTable.ajax.reload();
                        if(data.success == true){
                            $('#popupModelForCustomprice').modal('hide');
                            showsucMsg(data.message)
                        }else{
                            showErrMsg(data.message);
                        }
                    }
                });
        }
        }
    });

    $(document).on('click', '#showSuspended', function(){
        $('#popupModelForSuspended')
        .load('/change_approval/suspended_price_head')
        .modal('show');
    });

    $(document).on('click', '#activateNow', function(){
        if($('#suspendedFrom input[type="checkbox"]:checked').length<1){
            return alert('Please select at least one price head.')
        }
        if(confirm('Are you sure?')){            
            $.ajax({
                url : '/change_approval/activate_suspended_heads',
                type : 'POST',
                data : $('#suspendedFrom').serialize(),
                success : function(data){
                    // console.log(data);
                    alert(data.message);
                    $('#popupModelForSuspended').modal('hide');
                }
            });        
        }
    });
});
function reloadGrids(){
    customPriceDataTable.ajax.reload();
    changeRequestDataTable.ajax.reload();
    customPriceDataTable.columns.adjust().draw();
    changeRequestDataTable.columns.adjust().draw();

}


