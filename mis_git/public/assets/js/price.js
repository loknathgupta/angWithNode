var hasPriceChange = false;

$(document).ready(function () {
    var fromVolumentValueToUse = 1;
    var dataTable;
    var callDrawCallBack = false;

    if ($('#price-table').length > 0) {
        var dataTable = $('#price-table').DataTable({
            "pageLength": 25,
            "ajax": {
                "dataType": 'json',
                "contentType": "application/json; charset=utf-8",
                "type": "POST",
                "url": '/price/getData'
            },
            "columns": [
                /* {"data":"id",'targets': 0, 'checkboxes': {  'selectRow': true },'render': function (data, type, full, meta){
                     return '<input class="dt-checkboxes" type="checkbox" name="id" value="' + $('<div/>').text(data).html() + '">';
                 }},*/
                { "data": "client_name" },
                { "data": "pm_name", "class": "limited" },
                { "data": "am_name", "class": "limited" },
                { "data": "invoice_item" },
                { "data": "price_unit" },
                { "data": "currency" },
                {
                    "data": { price_per_unit: "price_per_unit", price_type: "price_type", id: "id" }, render: function (data) {
                        if (data.price_type == 'F') {
                            return data.price_per_unit;
                        } else {
                            return '<a href="javascript:void(0);" title="click to View" class="view-slab" data-id="' + data.id + '">Slab Price</a>';
                        }
                    }
                },
                { "data": "effort_per_unit" },
                {
                    data: "start_date", render: function (d) {
                        return '<span class="hidden">' + d + '</span>' + moment(d).format("DD-MM-YYYY");
                    }
                },
                {
                    data: "start_date", render: function (data, type, full, meta) {
                        return moment(data).format("DD-MM-YYYY");
                    }, "class": "hidden"
                },
                {
                    "data": "end_date",
                    render: function (d) {
                        return '<span class="hidden">' + d + '</span>' + moment(d).format("DD-MM-YYYY");
                    }
                },
                {
                    data: "end_date", render: function (data, type, full, meta) {
                        return moment(data).format("DD-MM-YYYY");
                    }, "class": "hidden"
                },

                { "data": "billing_cycle" },
                { "data": "credit_period" },
                { "data": "description" },
                {
                    "data": { id: "id", monthly_volume: "monthly_volume" }, render: function (data, type, full, meta) {
                        if (data.monthly_volume != null) {
                            return '<a href="javascript:void(0);" data-price-master-id="' + data.id + '" class="update-projected-volumes" >' + $('<div/>').text(data.monthly_volume).html() + '</a>';
                        } else {
                            return '<button type="button" data-price-master-id="' + data.id + '" class="btn btn-sm btn-success update-projected-volumes" >Add</button>';
                        }
                    }
                },
                { "data": "custom" },
                { "data": "status" },
                {
                    "data": "created",
                    render: function (data, type, full, meta) {
                        return '<span class="hidden">' + data + '</span>' + moment(data).format("DD-MM-YYYY");
                    }
                },
                {
                    "data": "created",
                    render: function (data, type, full, meta) {
                        return moment(data).format("DD-MM-YYYY");
                    }, "class": "hidden"
                },
                {
                    "data": "modified",
                    render: function (data, type, full, meta) {
                        return '<span class="hidden">' + data + '</span>' + moment(data).format("DD-MM-YYYY");
                    }
                },
                {
                    "data": "modified", render: function (data, type, full, meta) {
                        return moment(data).format("DD-MM-YYYY");
                    }, "class": "hidden"
                },
                { "data": "created_user" },
                { "data": "ao_name" },
                {
                    "data": "client_status", render: function (data) { //alert(data)
                        obj = JSON.parse(ClientStatus);
                        //console.log(ClientStatus);
                        if (data !== null && data > 0) {

                            return obj[data];
                        } else {
                            return 'Active';
                        }
                    }
                },
                {
                    "data": "approval_status", render: function (data) { //alert(data)
                        objApprovalStatus = JSON.parse(ApprovalStatus);
                        // console.log(objApprovalStatus);
                        if (data !== null) {
                            return objApprovalStatus[data];
                        } else {
                            return 'No';
                        }
                    }
                },
                {
                    "data": { id: "id", child_exists: "child_exists", custom:"custom" }, 
                    'render': function (data, type, full, meta) {

                        if (data.child_exists == 0 && data.custom != 'Yes') {
                            return '<button type="button" class="btn btn-default edit-price" aria-label="Left Align" to-edit="16" data-value="' + $('<div/>').text(data.id).html() + '" title="Edit"><span class="glyphicon glyphicon-pencil" aria-hidden="true"></span></button>';
                        } else {
                            return '';
                        }
                    }, "orderable": false
                },


            ],

            'select': {
                'style': 'multi'
            },
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
                    exportOptions: {
                        columns: 'th:not(.not-export)',


                    }

                },
                {
                    extend: 'excel',
                    text: 'Excel',
                    className: 'btn btn-default',
                    exportOptions: {
                        columns: 'th:not(.not-export)'
                    }
                }
                /*,
                {
                    extend: 'copy',
                    text: 'Copy',
                    className: 'btn btn-default',
                    
                },*/

            ],
            // sDom: '<"top"flp>rt<"bottom"i><"clear">',
            sDom: '<"top"ip>rt<"bottom"fl><"clear">',
            // bLengthChange: false,
            // bFilter: false,
            aaSorting: [[20, 'desc']],
            drawCallback: function (settings) {
                // if(callDrawCallBack){
                //  createDropdown(this);
                //  callDrawCallBack = false;
                // }

            },
            initComplete: function () {
                dataTable.buttons().container().appendTo('#dataTableButtons');
                createDropdown(this);
                $('#status-div-id').trigger("change");
                $('#custom-div-id').trigger("change");

            }
        });

        dataTable.columns([10, 14, 16, 17, 18, 19, 20, 21, 22, 23, 24]).visible(false, false);
        //dataTable.columns( [ 1, 2,3 ,8,10, 13,15,16,17,18,19,20,21,22,23,24] ).visible( false, false );
        /*$(document).on('change', '#filterByClient', function () {
            dataTable.columns(1).search($(this).val(), true).draw();
        });
        $(document).on('change', '#filterByPM', function () {
            dataTable.columns(2).search($(this).val(), true).draw();
        });
        $(document).on('change', '#filterByAM', function () {
            dataTable.columns(3).search($(this).val(), true).draw();
        }); */
        //dataTable.buttons().container().appendTo('#dataTableButtons');
        $(document).on('click', '.edit-price', function () {
            //dataTable.row('.selected').remove().draw( false );
            $(this).parents('tr').siblings().removeClass('selected');
            $(this).parents('tr').addClass('selected');
            // $( this ).parent().parent('tr').addClass('selected') 
            id = $(this).data('value');

            $('#add-model').load('/price/?id=' + id, function () {
                $('#addprice').modal({ show: true });
            });
        });
        $(document).on("hide.bs.modal", '#addprice', function () {
            $(this).parent().removeClass('selected');
            $(this).parent().siblings().removeClass('selected')
        });
        $(document).on('click', '#add-price-open', function () {

            $('#add-model').load('/price/?add=1', function () {
                $('#addprice').modal({ show: true });
            });
        });

        $(document).on('click', '.update-projected-volumes', function () {
            var price_master_id = $(this).data('price-master-id');
            priceMasterId = price_master_id;
            $('#addCutom').load('/delivery/projected_volumes/' + price_master_id + "?requested_for=SA", function () {
                $('#projected-volume').modal({ show: true });
            });
        });
        $(document).on('click', '#updateNow', function () {
            add_monthly_volume('updateNow', dataTable);
        });

        /*$("#btn-go").click(function(){
            if($("#batch-action-id").val()!=''){
            if(confirm('Are you sure?')){
            var chk = false;
            $('input[type="checkbox"][name="id"]').each(function(){
                
               
                   // If checkbox is checked
                   if(this.checked){
                     
                      chk = true;
                   }
                
             });
             if(chk){
                 
                $.ajax({
                    url: "/price/changeStatus", 
                    type:"post", 
                    data:$('#lst-frm').serialize(), 
                    success: function(result){ //alert(result.success);
                         if(result.success==true){
                            showsucMsg(result.msg);
                           dataTable.ajax.reload();
                        }else{
                            showErrMsg(result.msg); 
                        }
                    }
                });
             }else{
                 alert("Please select atleast one row.");
             }
            }
        }else{
            alert("Please select an action");
        }
        });*/
    }

    $(document).on('click', '#btn-add-price', function () {
        $('.combobox').combobox();
        $("#add_price").validationEngine({ promptPosition: "topLeft", scroll: false });
        // alert($('#price-per-unit').data('price-per-unit'));
        if (hasPriceChange || ($('#price-per-unit').data('price-per-unit') != $('#price-per-unit').val()) || ($('#old-currency').val() != $('#select-currency').val())) {
            $('#new-start-date').addClass('validate[required]');
            if ($("#edit-id").length > 0) {
                $('#desc-text').addClass('validate[required]');
            }
        } else {
            $('#new-start-date').removeClass('validate[required]');
            $('#desc-text').removeClass('validate[required]');
        }
        var url = '/price/add';

        if ($("#edit-id").length > 0 && $("#edit-id").val() != '') {
            url = '/price/edit/' + $("#edit-id").val();
            var new_am_val = $("#account-manager-id option:selected").text();
            var new_pm_val = $("#pm-id option:selected").text();
            var new_ao_val = $("#ao-id option:selected").text();
            $("#new-am").val($.trim(new_am_val));
            $("#new-pm").val($.trim(new_pm_val));
            $("#new-ao").val($.trim(new_ao_val));
            if ($("#new-start-date").val() != '') {
                //alert($("input[type=text][name=end_date]").val());
                //alert($("#new-start-date").val());
                var rs = dateCompare($("input[type=text][name=end_date]").val(), $("#new-start-date").val());
                if (!rs) {
                    alert("New start date cannot greater than end date.");
                    return false;
                }
            }
        }
        var toEmail = $("input[type=text][name=invoice_to]").val();
        if (toEmail != '') {
            invalidEmails = emailCheck(toEmail);
            if (invalidEmails.length > 0) {
                alert("Invalid Emails: " + invalidEmails);
                return false;
            }
        }
        var ccEmail = $("input[type=text][name=invoice_cc]").val();
        if (ccEmail != '') {
            invalidEmails = emailCheck($("input[type=text][name=invoice_cc]").val());
            if (invalidEmails.length > 0) {
                alert("Invalid Emails: " + invalidEmails);
                return false;
            }
        }
        if ($("#add_price").validationEngine('validate')) {
            $('#add_price').preloader();
            $.ajax({
                url: url,
                type: "post",
                data: $('#add_price').serialize(),
                success: function (result) {
                    hasPriceChange = false;
                    if (result.success == true) {
                        $('#addprice').modal('toggle');
                        showsucMsg(result.msg);
                        $('#add_price').trigger("reset");
                        var callDrawCallBack = true;
                        dataTable.ajax.reload();
                        //createDropdown(dataTable);   
                    } else {
                        alert(result.msg);
                        // showErrMsg(result.msg);
                    }
                    $('#add_price').preloader('remove');
                }
            });
        }
    });
    /*$(document).on("datepicker",function ()
    {
        $('#start_date, #end_date').datepicker({
            format: 'dd M yyyy',
            autoclose: true
            
    
        });
    });
    $(document).trigger("datepicker"); */
    $(".alert-close").click(function () {
        $(".alert").addClass('hidden');
    });
    $(document).on('change', '#billing-cycle-id', function () {
        var val = $(this).val();
        if (val == '6') {
            $("#custom-day-div").removeClass('hidden');
            $('#billing-day').addClass('validate[required]');
        } else {
            $("#custom-day-div").addClass('hidden');
            $('#billing-day').removeClass('validate[required]');
        }
    });

    //Added for price salebs********************************************************.
    $(document).on('change', '#priceType', function () {
        if ($('#priceTypeOld') != $(this).val() && $(this).val() != '') {
            hasPriceChange = true;
        }

        $(this).parents('.form-group').addClass('priceType');
        $('.showSlabs').addClass('hide');
        if ($(this).val() == 'F') {
            $(this).parents('.form-group').addClass('priceType');
            $(this).parents('.form-group').siblings('.fixed-rate').removeClass('hide');
            if ($('#price-per-unit').val() == 0) {
                $('#price-per-unit').val('');
            }
        } else if ($(this).val() == 'S') {
            $('#slabModal').modal('show');
            $(this).parents('.form-group').siblings('.fixed-rate').addClass('hide');
            $('.showSlabs').removeClass('hide');
            $('#p_currency').html('Price (' + $('#select-currency').val() + ')');
        } else {
            $(this).parents('.form-group').siblings('.fixed-rate').addClass('hide');
            $('#price-per-unit').val('0');
            $(this).parents('.form-group').removeClass('priceType');
        }
    });
    $(document).on('click', '#showSlabs', function (e) {
        e.preventDefault();
        $('#p_currency').html('Price (' + $('#select-currency').val() + ')');
        $('#slabModal').modal('show');
    });
    $(document).on('click', '#closeSlabModel', function () {
        // if(!checkSlabError()){
        if ($('#slabPrice_1').val() == '') {
            $('#priceType option:first').attr('selected', 'selected');
            $('.showSlabs').addClass('hide');
            $('#slabModal').modal('hide');
        } else {
            checkSlabError();
        }
        // }
    });

    $(document).on('click', '#saveSlabs', function () {
        var errorMessage = '';
        checkSlabError();
    });
    var nextSlab = 6;
    $(document).on('click', '#addMoreSlab', function () {
        var lastToVolume = parseInt($('input.VolumeTo:last').val()) + 1;
        var classToAdd = '';
        if (isNaN(lastToVolume)) {
            lastToVolume = '';
        } else {
            classToAdd = 'validate[required,custom[number]]';
        }
        $('#slabs').append('<li class="slab-data" id="slab_' + nextSlab + '"><div><input type="text" name="vfrom" value="' + lastToVolume + '" class="VolumeFrom" readonly></div><div><input type="text" name="vto" value="" class="VolumeTo validate[custom[integer]]"></div><div><input type="text" name="vprice" value="" class="slabPrice ' + classToAdd + '"></div></li>');
        nextSlab++;
    });
    $(document).on('keyup', '.VolumeTo', function () {
        var currentSlabData = $(this).parents('.slab-data').attr('id').split('_');
        var currentSlab = currentSlabData[1] * 1;
        var nextSlabNo = currentSlab + 1;
        var lastSlab = currentSlab - 1;
        if ($('#slab_' + lastSlab + ' .VolumeTo').val() == '') {
            alert("Provide value for 'Volume To' for the last slab first.");
            $('#slab_' + lastSlab + ' .VolumeTo').focus();
            $(this).val('');
            return false;
        }
        if ($(this).validationEngine('validate')) {
        } else {
            $(this).val('');
        }
        // if(parseInt($('#slab_'+currentSlab+' .VolumeFrom').val()) >= parseInt($(this).val())){
        //     alert("'Volume To' must be greater than 'Volume From' for each slab."); 
        //     if($(this).attr('old-data') != ''){
        //         $(this).val($(this).attr('old-data'));
        //     }else{
        //         $(this).focus();
        //         return false;
        //     } 
        // } 
        if (!isNaN(parseInt($(this).val())) && $(this).val() != '') {
            var fromValue = parseInt($(this).parents('.slab-data').find('.VolumeFrom').val());
            fromVolumentValueToUse = parseInt($(this).val()) + 1;
            $('#slab_' + nextSlabNo + ' .VolumeFrom').val(fromVolumentValueToUse);
            $('#slab_' + nextSlabNo + ' .slabPrice').addClass('validate[required,custom[number]]');
        } else {
            if ($(this).val() != '') {
                alert('Only interger values are allowed.')
                $(this).val('');
            }
            $('#slab_' + nextSlabNo + ' .VolumeFrom').val('');
            $('#slab_' + nextSlabNo + ' .slabPrice').val('').removeClass('validate[required,custom[number]]');

        }
    });

    $(document).on('keyup', '.slabPrice', function () {
        var currentSlabData = $(this).parents('.slab-data').attr('id').split('_');
        var currentSlab = currentSlabData[1] * 1;
        if ($('#slab_' + currentSlab + ' .VolumeFrom').val() == '') {
            alert("Price can not be added without 'Volume From'.");
            //$('#slab_'+currentSlab+' .VolumeFrom').focus();
            $(this).val('');
        }
    });

    $(document).on('blur', '.VolumeTo, .slabPrice', function () {
        if ($(document).find('#edit-id').length > 0) {
            if ($(this).attr('old-data') != $(this).val()) {
                hasPriceChange = true;
            } else {
                hasPriceChange = false;
            }
        }
    });
    //Ended here ******************************************************************.
    
    $(document).on('change', '#client-id', function () {
        var hasFieldsPopulated = false;
        if($('#client-id').val() != ''){
            var clientId = $('#client-id').val();
            $.ajax({
                url : '/price/all_price_heads/'+clientId,
                type:'GET',
                success : function(data){
                    if($('#logListing').parent().find('h6.caption').length < 1)
                    $('#logListing').parent().prepend('<h6 class="caption">Existing Price Heads of Selected Client:</h6>')
                    if(Array.isArray(data) && data.length > 0){
                        $('#logListing').html('');
                        $('#logListing').append('<li class="bold"><div class="name">Price Head</div><div class="pm">PM</div><div class="status">Status</div><div class="um">UM</div><div class="ptype">Price Type</div></li>');
                        data.forEach(function(priceHead){
                            if(hasFieldsPopulated == false){
                                if(priceHead.invoice_to){
                                    $('input[name="invoice_to"]').val(priceHead.invoice_to);
                                }
                                if(priceHead.invoice_cc){
                                    $('input[name="invoice_cc"]').val(priceHead.invoice_cc);
                                } 
                                if(priceHead.i_empid){
                                    $('#pm-id').val(priceHead.i_empid);
                                }
                                if(priceHead.account_manager_id){
                                    $('#account-manager-id').val(priceHead.account_manager_id);
                                }
                                if(priceHead.ao_id){
                                    $('#ao-id').val(priceHead.ao_id);
                                }
                                if(priceHead.currency){
                                    $('#select-currency').val(priceHead.currency);
                                }
                                if(priceHead.billing_cycle){
                                    $('#billing-cycle-id').val(priceHead.billing_cycle);
                                }
                                if(priceHead.credit_period){
                                    $('select[name="credit_period"]').val(priceHead.credit_period);
                                }
                                if(priceHead.invoice_type){
                                    $('select[name="invoice_type"]').val(priceHead.credit_period);
                                }
                                hasFieldsPopulated = true;
                            }
                            $('#logListing').append('<li><div class="name">'+priceHead.invoice_item+'</div><div class="pm">'+priceHead.pm_name+'</div><div class="status '+priceHead.price_status+'" data-price-id="'+priceHead.id+'">'+priceHead.price_status+'</div><div class="um">'+priceHead.price_unit+'</div><div class="ptype">'+(priceHead.price_type=='F'?'Fixed ('+priceHead.price_per_unit+')':'<a href="javascript:void(0);" title="click to View" class="view-slab" data-id="' + priceHead.id + '">Slab Price</a>')+'</div></li>');
                        });
                    }else{
                        $('#logListing').html('<li class="bold"><div class="name">No Price Head found.</div></li>');
                    }
                    
                    $('.status.Suspended').attr('title', 'Click to activate').tooltip();
                }
            });
        }
    });

    $(document).on('click', '.status.Suspended', function(e){
        if(confirm('Are you sure?')){
            $.ajax({
                url : '/change_approval/activate_suspended_heads',
                type : 'POST',
                data : {price_master:$(this).attr('data-price-id')},
                success : function(data){
                    if(data.status == 'success'){
                        alert('Price head has been activated.');
                        $('#client-id').trigger('change');
                    }
                }
            })
        }
    });

});

function checkSlabError() {
    var hasError = false;
    $('.slab-data').each(function () {
        if ($(this).find('.VolumeTo').val() != '') {
            if (parseInt($(this).find('.VolumeFrom').val()) >= parseInt($(this).find('.VolumeTo').val())) {
                hasError = true;
                $(this).find('.VolumeTo').focus();
                return false;
            } else {
                hasError = false;
            }
        }
    });

    if (hasError) {
        alert("'Volume To' must be greater than 'Volume From' for each slab.");
        return false;
    }

    $('.slabPrice, .VolumeTo').each(function () {
        if ($(this).validationEngine('validate')) {

        } else {
            hasError = true;
        }
        if (hasError) {
            return false;
        }
    });
    if (hasError) {
        return false;
    } else {
        $('#slabModal').modal('hide');
    }
}

function createDropdown(dataTable) {
    dataTable.api().columns().every(function (i) {
        var column = this;
        var colId = '';
        if (i == 4) {
            colId = 'price-unit-div';
        } else if (i == 0) {
            colId = 'filterByClient';
        } else if (i == 1) {
            colId = 'filterByPM';
        } else if (i == 2) {
            colId = 'filterByAM';
        } else if (i == 17) {
            colId = 'status-div';
        } else if (i == 16) {
            colId = 'custom-div';
        } else if (i == 23) {
            colId = 'filterByAO';
        } else if (i == 24) {
            colId = 'filterByClientStatus';
        }else if (i == 25) {
            colId = 'approved-div';
        }
        if (colId != '') {
            var select = $('<select class="form-control" id="' + colId + '-id"><option value="">All</option></select>')
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
                var sel = '';
                if (i == 17 && d == 'Active') {
                    sel = 'selected';

                }
                if (i == 16 && d == 'No') {
                    sel = 'selected';

                }
                if (d !== null) {
                    if (i == 24) {
                        obj = JSON.parse(ClientStatus);
                        //console.log(ClientStatus);
                        if (d !== null) {

                            d = obj[d];
                        } else {
                            d = 'Active';
                        }
                    }

                    if (i == 25) {
                        var objApprovalStatus = JSON.parse(ApprovalStatus);
                        //console.log(ClientStatus);
                        if (d !== null) {
                            d = objApprovalStatus[d];
                        } else {
                            d = 'No';
                        }
                    }
                    select.append('<option value="' + d + '" ' + sel + ' >' + d + '</option>');
                }
            });
        }
    });
    // 
}

function dateCompare(dt1, dt2) {
    var newDt = dt1.split('-');
    var newDt2 = dt2.split('-');
    var d1 = new Date(newDt[2] + '-' + newDt[1] + '-' + newDt[0]);
    var d2 = new Date(newDt2[2] + '-' + newDt2[1] + '-' + newDt2[0]);
    // alert(d1);
    // alert(d2);
    if (d1.getTime() < d2.getTime()) {
        return false;
    } else {
        return true;
    }


}
function validateEmail(email) {
    var re = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,20}(?:\.[a-z]{2})?)$/i;
    return re.test(email);
}
function emailCheck(emails) {
    var str = emails

    var emails = str.split(',');

    var invalidEmails = [];

    for (i = 0; i < emails.length; i++) {
        if (!validateEmail(emails[i].trim())) {
            invalidEmails.push(emails[i].trim())
        }
    }

    return (invalidEmails);
}




