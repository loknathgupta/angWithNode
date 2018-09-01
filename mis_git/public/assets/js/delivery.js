var currentDate = new Date();
currentDate.setDate(currentDate.getDate() - 1);
$(function () {
    $('#delivery_for')
        .datepicker({
            format: 'dd-mm-yyyy',
            autoclose: true,
            endDate: currentDate,

        }).on('changeDate', function (e) {
            $(this).closest('form').submit();
        });
    $('.filter select').not('.asso_project_manager_id').change(function () {
        if($('#manager_id').val() != ''){
            $(this).closest('form').submit();
        }
    });

    $(document).on('change', '.asso_project_manager_id', function(){
        var selectedPM = $(this).val().trim();
        $('.pm_name').each(function(){
            $(this).parent('tr').removeClass('hidden');
            if($(this).text().trim() != selectedPM && selectedPM!= 'All'){
                $(this).parent('tr').addClass('hidden');
            }
        });
    });

    $(document).on('click', '#saveDeliverables', function () {
        if ($('#add-deliverables').validationEngine('validate')) {
            $.ajax({
                url: '/delivery/add',
                type: 'post',
                data: $('#add-deliverables').serialize(),
                success: function (data) {
                    if (data.errors) {
                        $('.buttons').append('<div class="alert-danger pull-left">*Volume should be a valid number.</div>')
                    } else {
                        $('#also_used_for_update').submit();
                    }
                }
            });
        }
    })

    $(document).on('click', '.edit-delivery', function () {
        //$(this).parents('tr').siblings().removeClass('selected');
        //$(this).parents('tr').addClass('selected');
        $(this).parents('tr').find('td.volume, td.description').find('div.older').addClass('hidden');
        $(this).parents('tr').find('td.volume, td.description').find('.prevent_submit').removeClass('hidden').removeAttr('disabled');
        $(this).parents('tr').find('td.description').find('.prevent_submit').addClass('validate[required]');
        $(this).addClass('hidden');
        $(this).parents('tr').find('td.action .add_custom').addClass('hidden');
        $(this).siblings('.update-buttons').removeClass('hidden');
    });

    $(document).on('click', '.cancel-update-delivery', function () {
        //$(this).parents('tr').removeClass('selected');
        $(this).parents('tr').find('td.volume, td.description').find('div.older').removeClass('hidden');
        $(this).parents('tr').find('td.volume, td.description').find('.prevent_submit').addClass('hidden').prop('disabled', true);
        $(this).parents('.update-buttons').addClass('hidden');
        $(this).parents('.update-buttons').siblings('.edit-delivery').removeClass('hidden');
        $(this).parents('tr').find('td.action .add_custom').removeClass('hidden');
    });

    $(document).on('click', '.update-delivery', function () {
        var $volumeField = $(this).parents('tr').find('td.volume').find('input');
        var $descriptionField = $(this).parents('tr').find('td.description').find('textarea');
        if ($volumeField.validationEngine('validate') && $descriptionField.validationEngine('validate')) {
            var $obj = $(this);
            var new_volume = $volumeField.val();
            var old_volume = $volumeField.attr('old-value');
            if(parseFloat(new_volume) == parseFloat(old_volume)){
                alert('old volume and new volume both are same.');
                return false;
            }
            var new_description = $descriptionField.val();
            delivery_id = $(this).parents('tr').find('td.action').find('input.deliverable_id').val();
            price_master_id = $(this).parents('tr').find('td.action').find('input.deliverable_id').val();
            $.ajax({
                url: '/delivery/request_change',
                type: 'post',
                //async : false,
                data: { volume: new_volume, description: new_description, old_volume: old_volume, deliverable_id: delivery_id },
                success: function (data) {
                    if (data.errors) {
                        $volumeField.validationEngine('validate');
                    } else if (data.insertId > 0) {
                        // $obj.parents('tr').removeClass('selected');
                        $obj.parents('tr').find('td.volume, td.description').find('div.older').removeClass('hidden');
                        $obj.parents('tr').find('td.volume, td.description').find('div.older').find('.current-data').removeClass('underline').addClass('strike');
                        $obj.parents('tr').find('td.volume').find('div.older').append('<div class="changed-data">' + parseFloat(new_volume).toFixed(2) + '</div>')
                        $obj.parents('tr').find('td.description').find('div.older').append('<div class="changed-data">' + new_description + '</div>')
                        $obj.parents('tr').find('td.volume, td.description').find('.prevent_submit').addClass('hidden').prop('disabled', true);
                        $obj.parents('tr').find('td.action .add_custom').removeClass('hidden');
                        $obj.parents('tr').find('td.action').find('button').not('.add_custom').remove();

                    } else {
                        $obj.parents('tr').find('td.description').find('div.older').html('<div class="changed-data">' + new_description + '</div>')
                        $obj.parents('tr').find('td.volume, td.description').find('div.older').removeClass('hidden');
                        $obj.parents('tr').find('td.volume, td.description').find('.prevent_submit').addClass('hidden').prop('disabled', true);
                        $obj.parents('tr').find('td.action .add_custom, td.action .edit-delivery').removeClass('hidden');
                        $obj.parents('tr').find('td.action .update-buttons').addClass('hidden');
                    }
                }
            });
        }


    });

    $("#add-deliverables").validationEngine({ promptPosition: "topLeft", scroll: false });


    $(document).on('click', '.update-projected-volumes', function (e) {
        e.preventDefault();
        //$(this).parents('tr').siblings().removeClass('selected');
        priceMasterId = $(this).parents('.projected-volume').attr('for-price-item'); //variable declared in script.js
        requestedFor = $(this).parents('.projected-volume').attr('for-role'); //variable declared in script.js
        // requestedFor = $('#loggedInUserType').val(); //variable declared in script.js
        // if(requestedFor != 'AM'){
        //     requestedFor = 'PM';
        // }
        // alert(requestedFor);
        //alert(priceMasterId);
        $.ajax({
            url: '/delivery/projected_volumes/' + priceMasterId + '?requested_for=' + requestedFor,
            type: 'get',
            success: function (data) {
                $('#popupModel').find('#addCutom').html(data);
                $('#addCutom').closest('form').validationEngine({ promptPosition: "topLeft", scroll: false });
                $('#popupModel').modal('show');
            }
        });
    });

    $(document).on('click', '#updateNow', function () {
        add_monthly_volume('updateNow', null);
    });

    //add_custom
    var priceMasterIdForCustom;
    var projectManageId;
    $(document).on('click', '.add_custom', function () {
        //$(this).parents('tr').siblings().removeClass('selected');
        //$(this).parents('tr').addClass('selected');
        priceMasterIdForCustom = $(this).attr('add-custom-to');
        projectManageId = $('#manager_id').val();
        $.ajax({
            url: '/delivery/add_custom_price/' + priceMasterIdForCustom + '/' + projectManageId,
            type: 'get',
            success: function (data) {
                $('#popupModel').find('#addCutom').html(data);
                $('#popupModel').modal('show');
                $('#addCutom').closest('form').validationEngine({ promptPosition: "topLeft", scroll: false });
            }
        })
    });

    $(document).on('click', '#addCustomPrice', function () {
        if ($(this).closest('form').validationEngine('validate')) {
            //alert(priceMasterId);
            $.ajax({
                url: '/delivery/add_custom_price/' + priceMasterIdForCustom + '/' + projectManageId, //priceMasterId is being initialize in method above
                type: 'post',
                data: $(this).closest('form').serialize(),
                success: function (data) {
                    if (data.errors) {
                        $('#addCutom').closest('form').validationEngine('validate');
                    } else if (data.affectedRows > 0) {
                        $('#also_used_for_update').submit();
                    } else {
                        alert('Unexpected error has occured.')
                    }
                }
            })
        }
    });
    $('.underline, .tooltips').tooltip();

    if ($('#dailyDeliverables').length > 0) {
        $('#dailyDeliverables').tableDnD({
            onDragClass: 'draging',
            onDrop: function (table, row) {
                //console.log($(row).next().attr('id'));
                priceHeadsWithSortOrder = [];
                $('.price_row').each(function () {
                    console.log($(this).attr('price-master-id'));
                    priceHeadsWithSortOrder.push($(this).attr('price-master-id'));
                });
                console.log(priceHeadsWithSortOrder);
                $.ajax({
                    url: '/delivery/update_sort_order',
                    data: { priceHeadsWithSortOrder: priceHeadsWithSortOrder.join() },
                    type: 'post',
                    success: function (data) {
                        console.log(data);
                    }
                })

            }
        });
    }
    
    $(document).on('click', '.mtd-popup', function(e){
        e.preventDefault();
        $('#popupModelMTDVol').modal('show');
        $('#priceMasterId').val($(this).attr('data-priceMasteid'));
        $('#isCustomPrice').val($(this).attr('data-is-custom'));
    });
    $(document).on('click', '#closeUpload', function(){
        $('#mtdOriginalFile').val('');
    });

    $(".dropzone").dropzone({
        url: '/delivery/upload_file',
        // maxFileSize: '5MB',
        margin: 0,
        width: 330,
        height: 20,
        border: '0px dashed #ccc',
        filesName: 'files',
        //removeComplete:false, //delete complete progress bars when adding new files
        text: '<span class="glyphicon glyphicon-cloud-upload text-primary " aria-hidden="true" style="font-size:20px;"></span> Drop File to upload, or Browse',
        params: {
            'action': 'save'
        },
        success: function (res, index) {
            var response = JSON.parse(res.response);
            if (!response.error) {
                var originalFileName = response.originalname;
                var namePart = originalFileName.split('.');
                // console.log(originalFileName);
                var ext = namePart[namePart.length - 1];
                // $('#added_files').html("<div class='removeIt' data-file-name='"+originalFileName+"' > "+originalFileName+"<!-- <span class='glyphicon glyphicon-remove' aria-hidden='true'></span> --></div>");
                $('#mtdOriginalFile').val(originalFileName);
                $('#mtdFile').val(response.filename);
                $('#fileExtension').val(ext)
                $('.extra-progress-wrapper').hide();
                // console.log($('#mtdFile').val());
            }
        }
    });

    $(document).on('click', '#saveMTDVolFile', function(){
        if($('#mtdOriginalFile').validationEngine('validate')){
            // alert('gggg');
            $.ajax({
                url : '/delivery/save_mtd_file',
                type : 'POST',
                data : $('#mtdFileDetails').serialize(),
                success : function(data){
                    if(data.insertId){
                        $('#also_used_for_update').submit();
                    }else{
                        $('#closeUpload').trigger('click');
                        alert('There was some error in upload. Please try again.')
                    }
                }
            });
        }

    });

    $(document).on('click', '.delete-mtd-file', function(e){
        e.preventDefault();
        if(confirm('Are you sure? You want to delete the uploaded file.')){
            var price_master_id = $(this).attr('data-pricemasterid');
            var month = $(this).attr('data-month');
            var year = $(this).attr('data-year');
            var isCustomPrice = $(this).attr('data-is-custom');
            $.ajax({
                url:'/delivery/delete_mtd_file',
                type : 'POST',
                data : {price_master_id:price_master_id, month:month, year:year, isCustomPrice:isCustomPrice},
                success: function(data){
                    if(data.status ==1 ){
                        $('#also_used_for_update').submit();
                        alert(data.message);
                    }
                }
            })

        }
    });

    $(document).on('click', '.btn-suspend', function(){
        if(confirm('Do you really want to suspend price head '+$(this).attr('name-to-suspend')+'?')){
            var priceHeadId = $(this).attr('id-to-suspend');
            $.ajax(
                {
                    url:'/delivery/suspend_price_head',
                    type:'POST',
                    data : {priceHeadId: priceHeadId},
                    success : function(data){
                        alert(data.message);
                        $('#also_used_for_update').submit();
                    }
                }
            );
        }
    });

})




