var i = 1; 
//Define User Status Object
const userStatus = {"A":"Active", "I":"InActive", "L": "On Leave", "R": "Resigned", "S": "Suspended"};
var statusOptions = '';
$.each( userStatus, function( key, value ) {
    statusOptions+= '<option value="' + key + '">' + value + '</option>';
});
//get UserRole Data
var role = '';  
var roleData = {};  
$.ajax({
    url: "/user/roles",
    type: "GET",
    async:false,
    contentType: "application/json"
})
.done( function(data) {
    $.each(data, function (index, value) {
        roleData[value.id] = value.name;
        role+= '<option value="' + value.id + '">' + value.name + '</option>';
    });
    $('#row'+i+' #role').append(role);  
});

//At Edit Row, To get ReportManager Dropdown
reportManager = {'':'Select'};
$(function(){
    $(document).on('click', '.tabledit-edit-button', function(){
        var rowId = $(this).closest('tr').attr('id');//tr
        $("tr#"+rowId+ " select[name=user_role_id]").attr('multiple','multiple').append(role);
        $("tr#"+rowId+ " select[name=user_role_id]").val($("tr#"+rowId+ " td.user_role").attr('role-id').split(','));
        $("tr#"+rowId+ " select[name=status]").append(statusOptions);
        $("tr#"+rowId+ " select[name=status]").val($("tr#"+rowId+ " td.user_status").attr('status'));
        getReportingManager(rowId);
        $('.tabledit-edit-button').removeClass('active');
        $(this).addClass('active');
    });
});

//Edit Row Plugin Use
$('#user-table').Tabledit({
    debug: true,
    url: '/user/add',
    onSuccess: function(data, textStatus, jqXHR)
    {
        $('#user-table').preloader('remove');
        displayAlertMessage(data.msg, data.status);
    },
    onAjax: function(action, serialize){
        var rowId = $('.tabledit-edit-button.active').closest('tr').attr('id');//tr
        hasNoValidationErrors = checkFieldValidation(rowId); //call field validation method        
        if(hasNoValidationErrors){
            $('#user-table').preloader();
        }else{
           return false;
        }
    },
    onFail: function(jqXHR, textStatus, errorThrown){
        console.log(errorThrown)
    },
    hideIdentifier: true, 
    deleteButton: false,
    inputClass: 'relative validate[required] form-control small',
    columns: {
        identifier: [0, 'id'],                       
        editable: [[2, 'first_name'],  [3, 'last_name'], [4, 'email'],[5, 'employee_code'], [6, 'user_role_id', JSON.stringify({})], [7, 'manager_id', JSON.stringify(reportManager)], [8, 'status', JSON.stringify({'':'Select'})]]
    }
});


//Modify Output during export
var buttonCommon = {
    exportOptions: {
        columns: [2,3,4,5,6,7,8,9],
        format: {
            body: function ( data, row, column, node ) {
                var element = $(node);
                var newString = element.find("span").html();
                return newString;
            }
        }
    },
};

//Load Datatable
var table = $('#user-table').DataTable({
    "pageLength": 25,   
    sDom: '<"top"ip>rt<"bottom"fl><"clear">',
    buttons: [
        // $.extend( true, {}, buttonCommon, {
        //     extend: 'copy',
        //     text: 'Copy',
        // }),
        // $.extend( true, {}, buttonCommon, {
        //     extend: 'print',
        //     text: 'Print',
        // }),
        $.extend( true, {}, buttonCommon, {
            extend: 'pdfHtml5',
            title: 'Export-Users',
            text: 'PDF',
            messageTop: 'The information in this excel is status of current Users.'
        }),
        $.extend( true, {}, buttonCommon, {
            extend: 'excelHtml5',
            title: 'Export-Users',
            text: 'Excel',
            messageTop: 'The information in this excel is status of current Users.'
        })
    ],
    order: [[ 1, "asc" ]],
    oSearch : {"bSmart": false},
    columnDefs: [
        { "searchable": false, "targets": 0 }
    ],
    initComplete: function () {
        createDropdown(this);
    }
});

table.buttons().container().appendTo('#dataTableButtons');
$(function(){
    //set status array
    statusOption = '';
    $.each(userStatus, function (index, value) {  
        statusOption+= '<option value="' + index + '">' + value + '</option>';
        });
        $('#row'+i+' #status').append(statusOption);  

   
   // add new row   
$('#add-user-row').click(function(){
    $('#user-table').preloader();
    $(this).prop("disabled", true);//disable add new button
    table.search( '' ).columns().search( '' ).draw();
    var rowNode = table.row.add( [
        '',        
        '<input type="text" id="first_name" class="relative validate[required] form-control small" value="" name="first_name">',
        '<input type="text" id="last_name" class="relative validate[required] form-control small" value="" name="last_name">',
        '<input type="text" id="email" class="relative validate[required, custom[email]] form-control small" value="" name="email">',
        '<input type="text" id="employee_code" class="relative validate[required] form-control small" value="" name="employee_code">',
        '<select multiple id="user_role_id" class="relative validate[required] form-control role" id="role" name="user_role_id">'+role+'</select>',
        '<select id="manager_id" class="relative validate[required] form-control manager_id" name="manager_id"> <option value="">Select</option></select>',
        '<select id="status" class="relative validate[required] form-control" name="status" id="status"><option value="">Select</option>'+statusOption+'</select>',
        '<div class="action_btn"><button onclick="saveUserData(this)" class="tabledit-delete-button btn btn-xs btn-default"><span class="glyphicon glyphicon-ok"></span></button>|<button id="remove" class="tabledit-delete-button btn btn-xs btn-default"><span class="glyphicon glyphicon-trash"></span></button></div>',
        '',
                 
        ]).draw(true).node();
        $(rowNode).find('td:last').remove();
        $(rowNode).attr('id', 'row'+i);
        $('body').preloader('remove');
    });

    //remove row
    $('#user-table tbody').on( 'click', '#remove', function () {
        if(confirm('Your data will destroy from row, Are you sure want to remove?')){
            table.row($(this).parents('tr')).remove().draw();
            $('#add-user-row').prop('disabled',false);
        }
    });

    //load reporting manager on change of role
    $(document).on('change','select[name=user_role_id]', function(){
        var obj = $(this);
        var roleId = $(this).val();  
        // console.log(roleId);
        var rowId = obj.parents(':eq(1)').prop('id');
        getReportingManager(rowId); //get manager list
        $('#'+rowId+' select[name=manager_id]').find("option:not(:first)").remove();
    });
});

 //add User Data
 function saveUserData(obj){
    //$('#user-table').preloader(); 
    var rowId = $(obj).closest('tr').attr('id');//tr
    
    flag = checkFieldValidation(rowId); //field validation
    var f_name = $('#'+rowId+" input[name=first_name]").val();
    // var m_name = $('#'+rowId+" input[name=middle_name]").val();
    var l_name = $('#'+rowId+" input[name=last_name]").val();
    var email = $('#'+rowId+" input[name=email]").val();  
    var employee_code = $('#'+rowId+" input[name=employee_code]").val();  
    var role = $('#'+rowId+' select[name=user_role_id]').val();    
    var reporting_manager = $('#'+rowId+' select[name=manager_id]').val(); 
    var status = $('#'+rowId+' #status').val();
    var reptManagerLength = $('#'+rowId+' select[name=manager_id]').find('option').length; //check if dropdown have any option

    console.log(role);
    //To Save Data
    if(flag){ //If there is no error

        var dataBody = {
            i_empid : 0,
            first_name: f_name,
            middle_name: '',
            last_name: l_name,
            email: email,
            employee_code: employee_code,
            manager_id: reporting_manager,
            reptManagerLength: reptManagerLength,
            status: status
        };
        if(Array.isArray(role)){
            role = role.toString();
        }
        dataBody.user_role_id = role;

        $.ajax({
            url: '/user/add',
            method:'POST',
            data: dataBody,
            type:'json',
            beforeSend:function(){
                $('#user-table').preloader(); 
            },
            success:function(response){  
                $('#user-table').preloader('remove');        
                if(response.errors){
                    var errors = response.errors;
                    errors.forEach(function(data){ 
                        $(".formError").remove();
                        $('#'+data.param).validationEngine('validate');
                    })
                }else{
                    displayAlertMessage(response.msg, response.status);
                } 
            }
        }) 
    }
}

/* fields validation function
    return bool
*/
function checkFieldValidation(rowId){    
    fNameCell = $('#'+rowId+' input[name=first_name]');
    // mNameCell = $('#'+rowId+" input[name=middle_name]");
    lNameCell = $('#'+rowId+" input[name=last_name]");
    emailCell = $('#'+rowId+" input[name=email]");
    employeeCell = $('#'+rowId+" input[name=employee_code]");
    roleCell = $('#'+rowId+' select[name=user_role_id]');    
    reportingMangCell = $('#'+rowId+' select[name=manager_id]');
    statusCell = $('#'+rowId+' #status');

    var role = roleCell.val();
    var reptManagerLength = $('#'+rowId+' select[name=manager_id]').find('option').length; //check if dropdown have any option

    // Fields Validation
    var validateFlag = false;
    if(fNameCell.validationEngine('validate') && lNameCell.validationEngine('validate') && 
        emailCell.validationEngine('validate') && employeeCell.validationEngine('validate') && roleCell.validationEngine('validate') &&
        statusCell.validationEngine('validate'))
        {
            validateFlag = true;
        }
    
    if(reptManagerLength > 1 && role != 1 && validateFlag){ // If Role => DI PM User and Reporting Manager Have data 
        if(reportingMangCell.validationEngine('validate')){ 
            validateFlag = true; 
        }else{ 
            validateFlag = false; 
        }
    }
    return validateFlag;
}
//get L2 reporting manager list if Selected Role id 1 => DI PM User
function getReportingManager(rowId){
    var roleId = $('tr#'+rowId+' select[name=user_role_id]').val();
    selectedOptionId =  $('tr#'+rowId+ ' .reportingManager').prop('id');
    var userBeingEdit = $('tr#'+rowId+' input[name=id]').val();
    //alert(userBeingEdit);
    if(roleId != 1){   // If Role is DI PM User
        $.ajax({
            url: "/user/report_manager/"+roleId+"?userId="+userBeingEdit,
            type: "GET",
            contentType: "application/json"

        })
        .done( function(data) { 
            if(data.length > 0){ 
                $.each(data, function(index,value){  
                    selected = '';
                    if(value.id == selectedOptionId) { selected = "selected=true"; }
                    $("tr#"+rowId+ " select[name=manager_id]").append("<option "+selected+" value='"+value.id+"' >"+value.reporting_manager+"</option>");                     
                });
            
            }           
        });
    } 
}

function createDropdown(dataTable) {
    var uniqueRoles = [];
    dataTable.api().columns().every(function (i) {
        var column = this;
        var colId = '';
        if (i == 6) {
            colId = 'byRole';
        }else if (i == 8) {
            colId = 'byStatus';
        }
        if (colId != '') {
            var select = $('<select class="" id="' + colId + '-id"><option value="">All</option></select>')
                .appendTo($("#" + colId).empty())
                .on('change', function () {
                    var val = $.fn.dataTable.util.escapeRegex(
                        $(this).val()
                    );
                    if (i == 6) {
                        column.search(val ?  val  : '', true, false).draw();
                    }else{
                        column.search(val ? '^' + val  : '', true, false).draw();
                    }
                });

            column.data().unique().sort().each(function (d, j) {
                var sel = '';
                if (i == 6) {
                    var userRole = $(d).html().trim();
                    // console.log(userRole);
                    if(uniqueRoles.indexOf(userRole) == -1){
                        if(userRole.indexOf(',') != -1 ){
                            var roles = userRole.split(',');
                            roles.forEach(function(role){
                                role = role.trim();
                                if(uniqueRoles.indexOf(role) == -1){
                                    uniqueRoles.push(role);
                                    select.append('<option value="' + role + '" ' + sel + ' >' + role + '</option>');
                                }
                            });
                        }else{
                            uniqueRoles.push($(d).html().trim());
                            select.append('<option value="' + $(d).html() + '" ' + sel + ' >' + $(d).html() + '</option>');
                        }
                    }
                }else{
                    select.append('<option value="' + $(d).html() + '" ' + sel + ' >' + $(d).html() + '</option>');
                }
            });
        }
    });
    // 
}
