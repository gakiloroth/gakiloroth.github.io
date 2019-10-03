var servantName = "";
var savedServants = JSON.parse(localStorage.getItem("savedServants") || "[]");
var savedQuests = JSON.parse(localStorage.getItem("savedQuests") || "[]");
var party = JSON.parse(localStorage.getItem("party") || "[]");
var quest = JSON.parse(localStorage.getItem("quest") || "");
var startup = true;

// actions to do when the page is loaded
$(document).ready(function() {
  // save which tab was active
  $('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
    localStorage.setItem('activeTab', $(e.target).attr('href'));
  });
  var activeTab = localStorage.getItem('activeTab');
  if(activeTab){
      $('.nav-tabs a[href="' + activeTab + '"]').tab('show');
  }

  updateSavedServantsDisplay();
  updateSavedQuestsDisplay();
  updatePartyToggles();
  updateQuestToggles();
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

// reset servant form
document.getElementById('resetServantForm').onclick = function(){
  resetServant();
  $('#inputServant').empty().append($('<option></option>').val('Select Servant').html('Select Servant'));
  $('#form').boostrapValidator('resetForm', true);
};

// reset quest form
document.getElementById('resetQuestForm').onclick = function(){
  resetQuest();
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

// delete all quests
document.getElementById('deleteAllQuests').onclick = function(){
  if(savedQuests.length == 0){
   return;
  }
  if(confirm('Do you want to delete ALL quests?')){
    deleteAllQuests();
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
    resetServant();
    location.reload();
  }
};

// add quest data into array
document.getElementById('addQuest').onclick = function(){
  let valid = true;
  'use strict';
  var forms = document.getElementsByClassName('needs-validation-quest');
  var validation = Array.prototype.filter.call(forms, function(form) {
    if (form.checkValidity() === false) {
      valid = false;
      event.preventDefault();
      event.stopPropagation();
    }
    form.classList.add('was-validated');
  });

  if(valid && saveQuest()){
    updateSavedQuestsDisplay();
    resetQuestForm();
    location.reload();
  }
};

// update saved servant display
function updateSavedServantsDisplay(){
  //let parsed = "";
  /*parsed = JSON.stringify(savedServants);
  $('#testSavedServants').html(parsed);*/
  $('#savedServants1').empty();
  $('#savedServants2').empty();
  for(let i = 0; i < savedServants.length; i++){
    let curr = savedServants[i];
    $('#savedServants1').append($('<li class="list-group-item"><b>' + curr.name + '</b> | CE: ' +
     curr.craftessence + ' | NP Charge: ' + curr.npstartcharge + '%<br>' + 'NP Level: ' +
     curr.nplevel + ' | Attack: ' + curr.attack + ' | NP Buff: ' + curr.npdamageup + '%' +
     ' | Attr. : ' + curr.attribute + '<br> Buster Up: ' + curr.busterup + ' | Arts Up: ' + curr.artsup +
     ' | Quick Up: ' + curr.quickup + '<span class="float-right"><button type="button" id=' + "useServant" + i +
     ' class="btn btn-outline-success btn-sm" data-toggle="button" aria-pressed="false" autocomplete="false">In Party</button> <button type="button" id=' + "deleteServant" + i +
     ' class="btn btn-outline-danger btn-sm">Delete</button></span>' + '</li>'));

     $('#savedServants2').append($('<li class="list-group-item"><b>' + curr.name + '</b> | CE: ' +
      curr.craftessence + ' | NP Charge: ' + curr.npstartcharge + '%<br>' + 'NP Level: ' +
      curr.nplevel + ' | Attack: ' + curr.attack + ' | NP Buff: ' + curr.npdamageup + '%' +
      ' | Attr. : ' + curr.attribute + '<br> Buster Up: ' + curr.busterup + ' | Arts Up: ' + curr.artsup +
      ' | Quick Up: ' + curr.quickup + '</li>'));

    // link up delete button
    document.getElementById("deleteServant" + i).addEventListener("click", function(){
      if(party.length !== 0){
        alert("You cannot delete servants while you still have party members! Please empty the party first.");
        return;
      }
      savedServants.splice(i,1);
      localStorage.setItem("savedServants", JSON.stringify(savedServants));
      updateSavedServantsDisplay();
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
    });
  }
}

// update quest updateSavedQuestsDisplay
function updateSavedQuestsDisplay(){
  //let parsed = "";
  $('#savedQuests1').empty();
  $('#savedQuests2').empty();
  for(let i = 0; i < savedQuests.length; i++){
    let curr = savedQuests[i];
    $('#savedQuests1').append($('<li class="list-group-item"><b>' + curr.name + '</b>' +
    '<br> E1: ' + curr.enemy1hp + ' ' + curr.enemy1class +
    ' E2: ' + curr.enemy2hp + ' ' + curr.enemy2class +
    ' E3: ' + curr.enemy3hp + ' ' + curr.enemy3class +
    '<br> E4: ' + curr.enemy4hp + ' ' + curr.enemy4class +
    ' E5: ' + curr.enemy5hp + ' ' + curr.enemy5class +
    ' E6: ' + curr.enemy6hp + ' ' + curr.enemy6class +
    '<br> E7: ' + curr.enemy7hp + ' ' + curr.enemy7class +
    ' E8: ' + curr.enemy8hp + ' ' + curr.enemy8class +
    ' E9: ' + curr.enemy9hp + ' ' + curr.enemy9class +
    '</li>'));

    $('#savedQuests2').append($('<li class="list-group-item"><b>' + curr.name + '</b>' +
    '<br> E1: ' + curr.enemy1hp + ' ' + curr.enemy1class +
    ' E2: ' + curr.enemy2hp + ' ' + curr.enemy2class +
    ' E3: ' + curr.enemy3hp + ' ' + curr.enemy3class +
    '<br> E4: ' + curr.enemy4hp + ' ' + curr.enemy4class +
    ' E5: ' + curr.enemy5hp + ' ' + curr.enemy5class +
    ' E6: ' + curr.enemy6hp + ' ' + curr.enemy6class +
    '<br> E7: ' + curr.enemy7hp + ' ' + curr.enemy7class +
    ' E8: ' + curr.enemy8hp + ' ' + curr.enemy8class +
    ' E9: ' + curr.enemy9hp + ' ' + curr.enemy9class +
    '<span class="float-right"> <button type="button" id=' + "useQuest" + i +
    ' class="btn btn-outline-success btn-sm" data-toggle="button" aria-pressed="false" autocomplete="false">Select</button> ' +
    '<button type="button" id=' + "deleteQuest" + i + ' class="btn btn-outline-danger btn-sm">Delete</button></span>' + '</li>'));

    // link up delete button
    document.getElementById("deleteQuest" + i).addEventListener("click", function(){
      if(quest !== ""){
        alert("Please have no quest selected when deleting!");
        return;
      }
      savedQuests.splice(i,1);
      localStorage.setItem("savedQuests", JSON.stringify(savedQuests));
      updateSavedQuestsDisplay();
    });
    // link up use button
    document.getElementById("useQuest" + i).addEventListener("click", function(){
      if(quest === i){
        quest = "";
        updateQuestToggles();
        localStorage.setItem("quest", JSON.stringify(quest))
      }
      else{
        if(quest = ""){
          alert("You can only have 1 quest selected!");
          event.preventDefault();
          event.stopPropagation();
          return;
        }
        quest = i;
        localStorage.setItem("quest", JSON.stringify(i))
      }
    });
  }
  parsed = JSON.stringify(quest);
  $('#test').empty().append(parsed);
}

// make sure party buttons are toggled correctly
function updatePartyToggles(){
  for(let i = 0; i < party.length; i++){
    $('#useServant' + party[i]).click();
  };
}

// amke sure quest buttons are toggled correctly
function updateQuestToggles(){
  $('#useQuest' + quest).click();
}

// save servant data into array
function saveServant(){
  if(savedServants.length > 600){
    return false;
  }

  savedServants.unshift({"name": servantName,"class": $('#inputClass').val(),"attack": $('#attack').val(),"nplevel": $('#inputNPLevel').val(),
    "npdamagepercent": $('#NPDamagePercent').val(),"busterup": $('#BusterUpPercentage').val(),"artsup": $('#ArtsUpPercentage').val(),
    "quickup": $('#QuickUpPercentage').val(),"attackup": $('#AttackUpPercentage').val(),"flatattackup": $('#FlatAttackUp').val(),
    "npdamageup": $('#NPDamageUp').val(),"npstartcharge": $('#NPStartCharge').val(),"attribute": $('#inputAttribute').val(),"craftessence": $('#inputCE').val()});
  localStorage.setItem("savedServants", JSON.stringify(savedServants));
  return true;
}

// save quest data into array
function saveQuest(){
  if(savedQuests.length > 600){
    return false;
  }

  savedQuests.unshift({"name": $('#QuestName').val(),
"enemy1hp": $('#enemy1HP').val(),"enemy1class": $('#enemy1Class').val(),"enemy1attribute": $('#enemy1Attribute').val(),
"enemy2hp": $('#enemy2HP').val(),"enemy2class": $('#enemy2Class').val(),"enemy2attribute": $('#enemy2Attribute').val(),
"enemy3hp": $('#enemy3HP').val(),"enemy3class": $('#enemy3Class').val(),"enemy3attribute": $('#enemy3Attribute').val(),
"enemy4hp": $('#enemy4HP').val(),"enemy4class": $('#enemy4Class').val(),"enemy4attribute": $('#enemy4Attribute').val(),
"enemy5hp": $('#enemy5HP').val(),"enemy5class": $('#enemy5Class').val(),"enemy5attribute": $('#enemy5Attribute').val(),
"enemy6hp": $('#enemy6HP').val(),"enemy6class": $('#enemy6Class').val(),"enemy6attribute": $('#enemy6Attribute').val(),
"enemy7hp": $('#enemy7HP').val(),"enemy7class": $('#enemy7Class').val(),"enemy7attribute": $('#enemy7Attribute').val(),
"enemy8hp": $('#enemy8HP').val(),"enemy8class": $('#enemy8Class').val(),"enemy8attribute": $('#enemy8Attribute').val(),
"enemy9hp": $('#enemy9HP').val(),"enemy9class": $('#enemy9Class').val(),"enemy9attribute": $('#enemy9Attribute').val()});
  localStorage.setItem("savedQuests", JSON.stringify(savedQuests));
  return true;
}

// delete servants and save
function deleteAllServants(){
  savedServants = [];
  localStorage.setItem("savedServants", JSON.stringify(savedServants));
  updateSavedServantsDisplay();
}

// delete quests and save
function deleteAllQuests(){
  savedQuests = [];
  localStorage.setItem("savedQuests", JSON.stringify(savedQuests));
  updateSavedQuestsDisplay();
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

// reset quest form
function resetQuest() {
  $('#enemy1HP').val(0);
  $('#enemy1Class').val("Saber");
  $('#enemy1Attribute').val("Man");
  $('#enemy2HP').val(0);
  $('#enemy2Class').val("Saber");
  $('#enemy2Attribute').val("Man");
  $('#enemy3HP').val(0);
  $('#enemy3Class').val("Saber");
  $('#enemy3Attribute').val("Man");
  $('#enemy4HP').val(0);
  $('#enemy4Class').val("Saber");
  $('#enemy4Attribute').val("Man");
  $('#enemy5HP').val(0);
  $('#enemy5Class').val("Saber");
  $('#enemy5Attribute').val("Man");
  $('#enemy6HP').val(0);
  $('#enemy6Class').val("Saber");
  $('#enemy6Attribute').val("Man");
  $('#enemy7HP').val(0);
  $('#enemy7Class').val("Saber");
  $('#enemy7Attribute').val("Man");
  $('#enemy8HP').val(0);
  $('#enemy8Class').val("Saber");
  $('#enemy8Attribute').val("Man");
  $('#enemy9HP').val(0);
  $('#enemy9Class').val("Saber");
  $('#enemy9Attribute').val("Man");
  $('#QuestName').val("Quest Name");
}

function classDmg(input){
  var classVal = 1;
  if (input === ''){
    classVal = 0;
    return classVal;
  }
  if ('archer'.indexOf(input.toLowerCase()) > -1){
    classVal = 0.95;
  }
  else if ('lancer'.indexOf(input.toLowerCase()) > -1){
    classVal = 1.05;
  }
  else if ('caster'.indexOf(input.toLowerCase()) > -1 || 'assassin'.indexOf(input.toLowerCase()) > -1){
    classVal = 0.9;
  }
  else if ('berserker'.indexOf(input.toLowerCase()) > -1 ||
  'ruler'.indexOf(input.toLowerCase()) > -1 || 'avenger'.indexOf(input.toLowerCase()) > -1 ){
    classVal = 1.1;
  }
  return classVal;
}

function cardDmg(input){
  var cardVal = 0;
  if (input === undefined){
    return cardVal;
  }
  if ('buster'.indexOf(input.toLowerCase()) > -1){
    cardVal = 1.5;
  }
  else if ('arts'.indexOf(input.toLowerCase()) > -1){
    cardVal = 1.0;
  }
  else if ('quick'.indexOf(input.toLowerCase()) > -1){
    cardVal = 0.8;
  }
  return cardVal;
}
