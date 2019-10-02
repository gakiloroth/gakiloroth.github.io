var servantName = "";
var savedServants = JSON.parse(localStorage.getItem("savedServants") || "[]");
var party = JSON.parse(localStorage.getItem("party") || "[]");
var startup = true;

// actions to do when the page is loaded
$(document).ready(function() {
  ceList.forEach(function(ce) {
    $("#inputCE").append($('<option></option').val(ce.id).html(`${ce.id}: ${ce.name}`));
  });
  updateSavedServantsDisplay();
  updatePartyToggles();
  startup = false;
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
  $('#form').boostrapValidator('resetForm', true);
};

// reset form
document.getElementById('deleteAllPartyMembers').onclick = function(){
  party = [];
  localStorage.setItem("party", JSON.stringify(party));
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
  let valid = true;
  'use strict';
  var forms = document.getElementsByClassName('needs-validation');
  var validation = Array.prototype.filter.call(forms, function(form) {
    if (form.checkValidity() === false) {
      valid = false;
      event.preventDefault();
      event.stopPropagation();
    }
    form.classList.add('was-validated');
  });

  if(valid && saveServant()){
    $('#inputServant').empty().append($('<option></option>').val('Select Servant').html('Select Servant'));
    updateSavedServantsDisplay();
    //updatePartyToggles();
    reset();
    location.reload();
  }
};

// update saved servant display
function updateSavedServantsDisplay(){
  let parsed = "";
  /*parsed = JSON.stringify(savedServants);
  $('#testSavedServants').html(parsed);*/
  $('#savedServants1').empty();
  $('#savedServants2').empty();
  for(let i = 0; i < savedServants.length; i++){
    $('#savedServants1').append($('<li class="list-group-item"><b>' + savedServants[i].name + '</b> | CE: ' +
     savedServants[i].craftessence + ' | NP Charge: ' + savedServants[i].npstartcharge + '%<br>' + 'NP Level: ' +
     savedServants[i].nplevel + ' | Attack: ' + savedServants[i].attack + ' | NP Buff: ' + savedServants[i].npdamageup + '%' +
     ' | Attr. : ' + savedServants[i].attribute + '<br> Buster Up: ' + savedServants[i].busterup + ' | Arts Up: ' + savedServants[i].artsup +
     ' | Quick Up: ' + savedServants[i].quickup + '<span class="float-right"><button type="button" id=' + "useServant" + i +
     ' class="btn btn-outline-success btn-sm" data-toggle="button" aria-pressed="false" autocomplete="false">In Party</button> <button type="button" id=' + "deleteServant" + i +
     ' class="btn btn-outline-danger btn-sm">Delete</button></span>' + '</li>'));

     $('#savedServants2').append($('<li class="list-group-item"><b>' + savedServants[i].name + '</b> | CE: ' +
      savedServants[i].craftessence + ' | NP Charge: ' + savedServants[i].npstartcharge + '%<br>' + 'NP Level: ' +
      savedServants[i].nplevel + ' | Attack: ' + savedServants[i].attack + ' | NP Buff: ' + savedServants[i].npdamageup + '%' +
      ' | Attr. : ' + savedServants[i].attribute + '<br> Buster Up: ' + savedServants[i].busterup + ' | Arts Up: ' + savedServants[i].artsup +
      ' | Quick Up: ' + savedServants[i].quickup + '</li>'));

    // link up delete button
    document.getElementById("deleteServant" + i).addEventListener("click", function(){
      if(party.length !== 0){
        alert("You cannot delete servants while you still have party members! Please empty the party first.");
        return;
      }
      savedServants.splice(i,1);
      localStorage.setItem("savedServants", JSON.stringify(savedServants));
      updateSavedServantsDisplay();
      updatePartyDelete(i);
    });

    // link up in party button
    document.getElementById("useServant" + i).addEventListener("click", function(){
      if(party.includes(i)){
        let index = party.indexOf(i);
        party.splice(index,1);
      }
      else{
        if(party.length === 4){
          alert("You can only have 4 servants in a party!");
          event.preventDefault();
          event.stopPropagation();
          return;
        }
        party.push(i);
      }
      localStorage.setItem("party", JSON.stringify(party));
      parsed = JSON.stringify(party);

      // see party updates instantly for debug
      //ocation.reload();
    });
  }
  parsed = JSON.stringify(party);
  $('#test').empty().append(parsed);
}

// make sure party buttons are toggled correctly
function updatePartyToggles(){
  for(let i = 0; i < party.length; i++){
    //alert("pepega" + i);
    $('#useServant' + party[i]).click();
  };
}

// save servant data into party
function saveServant(){
  if(savedServants.length > 600){
    return false;
  }

  savedServants.push({"name": servantName,"class": $('#inputClass').val(),"attack": $('#attack').val(),"nplevel": $('#inputNPLevel').val(),
    "npdamagepercent": $('#NPDamagePercent').val(),"busterup": $('#BusterUpPercentage').val(),"artsup": $('#ArtsUpPercentage').val(),
    "quickup": $('#QuickUpPercentage').val(),"attackup": $('#AttackUpPercentage').val(),"flatattackup": $('#FlatAttackUp').val(),
    "npdamageup": $('#NPDamageUp').val(),"npstartcharge": $('#NPStartCharge').val(),"attribute": $('#inputAttribute').val(),"craftessence": $('#inputCE').val()});
  localStorage.setItem("savedServants", JSON.stringify(savedServants));
  return true;
}

// delete servants and save
function deleteAllServants(){
  savedServants = [];
  localStorage.setItem("savedServants", JSON.stringify(savedServants));
  updateSavedServantsDisplay();
}

// rest form
function reset() {
  $('#hasNPupgrade').hide();
  $('#maxGrailed').prop('disabled', true);
  $('#maxGrailed').prop('checked', false);
  $('#maxFou').prop('checked', false);
  $('#maxGoldFou').prop('checked', false);
  $('#maxGoldFou').prop('disabled', true);
  $('#inputNPLevel').val(1);
  $('#NPDamagePercent').val(0);
  $('#attack').val(0);
  $('#NPDamageUp').val(0);
  $('#NPStartCharge').val(0);
  $('#BusterUpPercentage').val(0);
  $('#ArtsUpPercentage').val(0);
  $('#QuickUpPercentage').val(0);
  $('#AttackUpPercentage').val(0);
  $('#FlatAttackUp').val(0);
  $('#addServant').attr('disabled', true);
  $('#inputClass').val(0);
  $('#inputCE').val("");
}
