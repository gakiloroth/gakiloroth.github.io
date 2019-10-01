var servantName = "";
var savedServants = JSON.parse(localStorage.getItem("savedServants") || "[]");

// actions to do when the page is loaded
$(document).ready(function() {
  ceList.forEach(function(ce) {
    $("#inputCE").append($('<option></option').val(ce.id).html(`${ce.id}: ${ce.name}`));
  });
  updateSavedServantsDisplay();
});

// filter out a list of servants based on class
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

// add or remove 1k attack based on Fou's
$('#maxFou').on('change', function(){
  if($(this).is(':checked')){
    $('#attack').val(Number($('#attack').val()) + 1000);
    $('#maxGoldFou').prop('disabled', false);
  }
  else{
    $('#attack').val(Number($('#attack').val()) - 1000);
    $('#maxGoldFou').prop('disabled', true);
    if($('#maxGoldFou').is(':checked')){
      $('#maxGoldFou').prop('checked', false);
      $('#maxGoldFou').prop('disabled', true);
      $('#attack').val(Number($('#attack').val())-1000);
    }
  }
});

// add or remove 1k attack based on gold fou's
$('#maxGoldFou').on('change', function(){
  if($(this).is(':checked')){
    $('#attack').val(Number($('#attack').val())+1000);
  }
  else
    $('#attack').val(Number($('#attack').val())-1000);
});

// selecting a servant
$('#inputServant').on('change', function(){
  $('#maxGrailed').prop('disabled', false);
  $('#maxGoldFou').prop('checked', false);
  $('#maxGoldFou').prop('disabled', true);
  $('#maxFou').prop('checked', false);
  $('#maxFou').prop('disabled', false);
  $('#hasNPupgrade').hide();
  $('#NPDamagePercent').val(0);
  $('#addServant').attr('disabled', false);

  // find servant in list
  for(let i = 0; i < servantList.length; i++){
    if($('#inputServant').val() == servantList[i].id){
      servantName = servantList[i].name;
      let npcard = ``;
      switch(servantList[i].deck[6]){
        case "Q":
          npcard = "quick";
          break;
        case "A":
          npcard = "arts";
          break;
        case "B":
          npcard = "buster";
          break;
      }

      let attk = servantList[i].attack.split(',');

      // set np related stats
      let npmulti = [0,0,0,0,0];
      if (servantList[i].npmultiplier){
        npmulti = servantList[i].npmultiplier.split(',');
      }

      $('#NPDamagePercent').val( Math.round(Number( npmulti[$('#inputNPLevel').val()-1])));

      let oc = [0,0,0,0,0];
      oc = servantList[i].overcharge.split(',');

      let npcharge = 0;

      // update display with servant stats
      if (servantList[i].npupgrade == 1) {
          $('#hasNPupgrade').show();
        }

        if ($('#maxGrailed').is(':checked')){
          $('#attack').val( Number( attk[2]) );
        }
        else
          $('#attack').val( Number( attk[1]) );

        $('#maxGrailed').on('change', function(){
          if ($(this).is(':checked')) {
            $('#maxGoldFou').prop('checked', false);
            $('#maxGoldFou').prop('disabled', true);
            $('#maxFou').prop('checked', false);
            $('#attack').val( Number(attk[2]) );
          }
          else {
            $('#maxGoldFou').prop('checked', false);
            $('#maxGoldFou').prop('disabled', true);
            $('#maxFou').prop('checked', false);
            $('#attack').val( Number(attk[1]) );
          }
        });

        $('#inputNPLevel').on('change', function(){
          $('#NPDamagePercent').val( Math.round(Number( npmulti[$('#inputNPLevel').val()-1])));
        });
    }
  }
});

// reset form
document.getElementById('reset').onclick = function(){
  reset();
  $('#inputServant').empty().append($('<option></option>').val('Select Servant').html('Select Servant'));
};

// delete all saved servants
document.getElementById('deleteAllServants').onclick = function(){
  if(savedServants.length == 0){
   return;
  }
  if(confirm('Do you want to delete ALL saved servants?')){
    deleteAllServants();
  }
};


// save servant data into array
document.getElementById('addServant').onclick = function(){
  if(saveServant()){
    reset();
    $('#inputServant').empty().append($('<option></option>').val('Select Servant').html('Select Servant'));
    $('#inputClass').val(0);

    // display saved servants
    updateSavedServantsDisplay();
  }
};

// update saved servant display
function updateSavedServantsDisplay(){
  let parsed = "";
  for(let i = 0; i < savedServants.length; i++){
    parsed += savedServants[i].name + "<br>";
  }
  $('#testSavedServants').html(parsed);
}

// save servant data into party
function saveServant(){
  if(savedServants.length > 200){
    return false;
  }
  savedServants.push({"name": servantName});
  localStorage.setItem("savedServants", JSON.stringify(savedServants));
  return true;
}

// delete servants and save
function deleteAllServants(){
  savedServants = [];
  localStorage.setItem("savedServants", JSON.stringify(savedServants));
  updateSavedServantsDisplay();
}

function reset() {
  $('#hasNPupgrade').hide();
  $('#maxGrailed').prop('disabled', true);
  $('#maxGrailed').prop('checked', false);
  $('#maxFou').prop('checked', false);
  $('#maxGoldFou').prop('checked', false);
  $('#maxGoldFou').prop('disabled', true);
  $('#inputNPLevel').val(1);;
  $('#NPDamagePercent').val(0);
  $('#attack').val(0);
  $('#NPDamageUp').val(0);
  $('#BusterUpPercentage').val(0);
  $('#ArtsUpPercentage').val(0);
  $('#QuickUpPercentage').val(0);
  $('#AttackUpPercent').val(0);
  $('#FlatAttackUp').val(0);
  $('#addServant').attr('disabled', true);
}
