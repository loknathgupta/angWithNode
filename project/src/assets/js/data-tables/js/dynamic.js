function fnFormatDetails ( oTable, nTr )
{
    var aData = oTable.fnGetData( nTr );
    var sOut = '<table cellpadding="5" cellspacing="0" border="0" style="padding-left:50px;">';
    sOut += '<tr><td>Rendering engine:</td><td>'+aData[1]+' '+aData[4]+'</td></tr>';
    sOut += '<tr><td>Link to source:</td><td>Could provide a link here</td></tr>';
    sOut += '<tr><td>Extra info:</td><td>And any further details here (images etc)</td></tr>';
    sOut += '</table>';

    return sOut;
}

 function addRow(dataTable, rowNo) {
           // var dataTable =  $('#'+tableId).dataTable()  ;     
            var jqInputs = $('input', rowNo);
             //alert(rowNo);
             
            dataTable.fnUpdate(jqInputs[0].value, rowNo, 0, false);
            dataTable.fnUpdate(jqInputs[1].value, rowNo, 1, false);
            dataTable.fnUpdate(jqInputs[2].value, rowNo, 2, false);
            dataTable.fnUpdate(jqInputs[3].value, rowNo, 3, false);
            dataTable.fnUpdate('<a  class="newEdit" href="javascript:void(0);">Edit</a>', rowNo, 4, false);
            dataTable.fnUpdate('<a   href="javascript:void(0);">Delete</a>', rowNo, 5, false);
            dataTable.fnDraw();
            $('.newEdit').parent().addClass('edit');
            $('.newEdit').removeClass('newEdit');
        }

  function cancel(dataTable, rowId){
      if(confirm('Are you sure?')){ 
       // var dataTable =  $('#'+tableId).dataTable()  ;
        dataTable.fnDeleteRow(rowId);
        dataTable.fnDraw();
      }
  }
  
  function editTableRow(dataTable, rowNo) {
      alert('ggg');
           // var dataTable =  $('#'+tableId).dataTable()  ;
            var aData = dataTable.fnGetData(rowNo);
            var jqTds = $('>td', rowNo);
            jqTds[0].innerHTML = '<input type="text" class="form-control small" value="' + aData[0] + '">';
            jqTds[1].innerHTML = '<input type="text" class="form-control small" value="' + aData[1] + '">';
            jqTds[2].innerHTML = '<input type="text" class="form-control small" value="' + aData[2] + '">';
            jqTds[3].innerHTML = '<select class="form-control"> <option>On Hold</option> <option>Pending</option> <option>Done</option> <option selected>In Program</option></select>';
            jqTds[4].innerHTML = '<a class="save" href="javascript:void(0);">Save</a>';
            jqTds[5].innerHTML = aData[5]; 
            $('.save').parent().removeClass('edit');
  }