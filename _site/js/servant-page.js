// make sure party buttons are toggled correctly
function updateServantToggles(){
  for(let i = 0; i < party.length; i++){
    $('#useServant' + party[i]).addClass('active');
    $('#useServant' + party[i]).attr('aria-pressed', true);
  }
}

function addServant(){
  if(debug){
    alert("addservant");
  }

  let valid = true;
  'use strict';
  var forms = document.getElementsByClassName('needs-validation-servant');
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
    updateServantToggles();
    resetServant();

    // reset form validation display
    Array.prototype.filter.call(forms, function(form) {
      form.classList.remove('was-validated');
    });
  }
}

// save servant data into array
function saveServant(){
  if(savedServants.length > 600){
    return false;
  }

  // increment party indexes
  for(let j = 0; j < party.length; j++){
    party[j]++;
  }
  //alert(servant);
  // party indexes incremented, match with servant
  if(typeof servant === "undefined" || servant.length == 0){
    //alert("undefined");
    //don't increment if first servant
  }
  else{
    servant++;
  }
  //alert(servant);
  localStorage.setItem("party", JSON.stringify(party));
  localStorage.setItem("servant", JSON.stringify(servant));

  savedServants.unshift({"name": servantName,"class": $('#inputClass').val(),"attack": $('#attack').val(),"nplevel": $('#inputNPLevel').val(),
    "npdamagepercent": $('#NPDamagePercent').val(),"busterup": $('#BusterUpPercentage').val(),"artsup": $('#ArtsUpPercentage').val(),
    "quickup": $('#QuickUpPercentage').val(),"attackup": $('#AttackUpPercentage').val(),"flatattackup": $('#FlatAttackUp').val(),
    "npdamageup": $('#NPDamageUp').val(),"npgain": servantNPGain,"nptype": $('input[name=cardoptions]:checked').val(),"npgainup": $('#NpGainUpPercentage').val(),
    "nphits": servantNPHits,"powermod": $('#PowerMod').val(),"attribute": $('#inputAttribute').val(),"craftessence": $('#inputCE').val()});

  console.log(servantName + " " + $('input[name=cardoptions]:checked').val());
  localStorage.setItem("savedServants", JSON.stringify(savedServants));
  return true;
}


// save servant data into array
function saveEditedServant(index){
  if(debug){
    console.log("Saving edited servant: " + index);
  }

  let valid = true;
  'use strict';
  var forms = document.getElementsByClassName('needs-validation-servant');
  var validation = Array.prototype.filter.call(forms, function(form) {
    if (form.checkValidity() === false) {
      valid = false;
      event.preventDefault();
      event.stopPropagation();
    }
    form.classList.add('was-validated');
  });

  if(valid){
    savedServants[index]=({"name": servantName,"class": $('#inputClass').val(),"attack": $('#attack').val(),"nplevel": $('#inputNPLevel').val(),
      "npdamagepercent": $('#NPDamagePercent').val(),"busterup": $('#BusterUpPercentage').val(),"artsup": $('#ArtsUpPercentage').val(),
      "quickup": $('#QuickUpPercentage').val(),"attackup": $('#AttackUpPercentage').val(),"flatattackup": $('#FlatAttackUp').val(),
      "npdamageup": $('#NPDamageUp').val(),"npgain": servantNPGain,"nptype": $('input[name=cardoptions]:checked').val(),"npgainup": $('#NpGainUpPercentage').val(),
      "nphits": servantNPHits,"powermod": $('#PowerMod').val(),"attribute": $('#inputAttribute').val(),"craftessence": $('#inputCE').val()});

    // reset form validation display
    Array.prototype.filter.call(forms, function(form) {
      form.classList.remove('was-validated');
    });

    localStorage.setItem("savedServants", JSON.stringify(savedServants));

    updateSavedServantsDisplay();
    updateServantToggles();
    resetServant();
  }
  return;
}

// reset servant form
function resetServant() {
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

// delete servants and save
function deleteAllServants(){
  servant = "";
  savedServants = [];
  localStorage.setItem("servant", JSON.stringify(servant));
  localStorage.setItem("savedServants", JSON.stringify(savedServants));
}
