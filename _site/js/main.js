$("#inputClass").change(function(){
  $('#maxGrailed').prop('disabled', true);
  $('#maxGrailed').prop('checked', false);
  $('#maxFou').prop('checked', false);
  $('#inputNPLevel').val(1);
  $('#hasNPupgrade').hide();
  $('#inputServant').empty().append($('<option></option>').val('Select Servant').html('Select Servant'));
  var matchClass = $("#inputClass option:selected").text();
  servantList.filter(function(serv){
    if(serv.class == matchClass){
      $("#inputServant").append($('<option></option').val(serv.id).html(`${serv.id}: ${serv.name}`));
    }
  });
});
