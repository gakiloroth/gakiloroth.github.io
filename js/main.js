var servantName = "";
var servantNPType = "";
var servantNPGain = "";
var servantNPHits = "";
var savedServants = JSON.parse(localStorage.getItem("savedServants") || "[]");
var savedQuests = JSON.parse(localStorage.getItem("savedQuests") || "[]");
var servant = JSON.parse(localStorage.getItem("servant") || "[]");
var quest = JSON.parse(localStorage.getItem("quest") || "[]");
var questEnemyHP = [];
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
  updateServantToggles();
  updateQuestToggles();
  updateBattleSim();
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
      servantNPGain = servantList[i].npchargeatk;
      servantNPHits = servantList[i].nphitcount;
      $('#inputAttribute').val(servantList[i].attribute);
      switch(servantList[i].deck[6]){
        case "Q":
          console.log(servantList[i].deck[6]);
          servantNPType = "Quick";
          break;
        case 'A':
          console.log(servantList[i].deck[6]);
          servantNPType = "Arts";
          break;
        case "B":
          console.log(servantList[i].deck[6]);
          servantNPType = "Buster";
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
    if(servant !== ""){
      servant++;
    }
    $('#inputServant').empty().append($('<option></option>').val('Select Servant').html('Select Servant'));
    localStorage.setItem("servant", JSON.stringify(servant));
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
    if(servant !== ""){
      quest++;
    }
    localStorage.setItem("quest", JSON.stringify(quest));
    updateSavedQuestsDisplay();
    location.reload();
  }
};

// calculate NP Damage for Wave 1
document.getElementById('submitBattleForm1').onclick = function(){
  /*let valid = true;
  'use strict';
  var forms = document.getElementsByClassName('needs-validation-battle');
  var validation = Array.prototype.filter.call(forms, function(form) {
    if (form.checkValidity() === false) {
      valid = false;
      event.preventDefault();
      event.stopPropagation();
    }
    form.classList.add('was-validated');
  });

  if(valid) {
    updateBattleSim();
    resetBattleForm();
  }*/
  var curr = savedQuests[quest];
  let result = calculateDamage(1);
  $('#questEnemy1NPDamage').empty().html('NP Damage: ' + result[0] + ' / ' + result[1] + ' / ' + result[2]);
  $('#questEnemy2NPDamage').empty().html('NP Damage: ' + result[3] + ' / ' + result[4] + ' / ' + result[5]);
  $('#questEnemy3NPDamage').empty().html('NP Damage: ' + result[6] + ' / ' + result[7] + ' / ' + result[8]);

  $('#questEnemy1HPLeft').empty().html('HP Left: ' + (questEnemyHP[0] - result[0]) + ' / '
    + (questEnemyHP[1] - result[1]) + ' / ' + (questEnemyHP[2] - result[2]));
  $('#questEnemy2HPLeft').empty().html('HP Left: ' + (questEnemyHP[3] - result[3]) + ' / '
    + (questEnemyHP[4] - result[4]) + ' / ' + (questEnemyHP[5] - result[5]));
  $('#questEnemy3HPLeft').empty().html('HP Left: ' + (questEnemyHP[6] - result[6]) + ' / '
    + (questEnemyHP[7] - result[7]) + ' / ' + (questEnemyHP[7] - result[8]));

  // calculate np refund
  let refunded = calculateNPRefund(questEnemyHP[0], questEnemyHP[3], questEnemyHP[6], result[0], result[3], result[6]);
  $('#npRefundDisplay').empty().html('<b>Min. NP Refunded: ' + refunded.toFixed(2) + '% </b>');

  // update enemy hp in Array
  questEnemyHP[0] -= result[0];
  questEnemyHP[1] -= result[1];
  questEnemyHP[2] -= result[2];
  questEnemyHP[3] -= result[3];
  questEnemyHP[4] -= result[4];
  questEnemyHP[5] -= result[5];
  questEnemyHP[6] -= result[6];
  questEnemyHP[7] -= result[7];
  questEnemyHP[8] -= result[8];
};

// reset battle sim hp
document.getElementById('resetHP1').onclick = function(){
  for(let i = 0; i < questEnemyHP.length; i++){
    questEnemyHP[i] = 0;
  }
  $('#npRefundDisplay').empty().html('<b>Min. NP Refunded: </b>');
  updateBattleSim();
}

// calculate NP Damage for Wave 2
document.getElementById('submitBattleForm2').onclick = function(){
  /*let valid = true;
  'use strict';
  var forms = document.getElementsByClassName('needs-validation-battle');
  var validation = Array.prototype.filter.call(forms, function(form) {
    if (form.checkValidity() === false) {
      valid = false;
      event.preventDefault();
      event.stopPropagation();
    }
    form.classList.add('was-validated');
  });

  if(valid) {
    updateBattleSim();
    resetBattleForm();
  }*/
  var curr = savedQuests[quest];
  let result = calculateDamage(2);
  $('#questEnemy4NPDamage').empty().html('NP Damage: ' + result[0] + ' / ' + result[1] + ' / ' + result[2]);
  $('#questEnemy5NPDamage').empty().html('NP Damage: ' + result[3] + ' / ' + result[4] + ' / ' + result[5]);
  $('#questEnemy6NPDamage').empty().html('NP Damage: ' + result[6] + ' / ' + result[7] + ' / ' + result[8]);
  //($('#questEnemy1HP').val() - result[0])
  $('#questEnemy4HPLeft').empty().html('HP Left: ' + (curr.enemy4hp - result[0]) + ' / '
    + (curr.enemy4hp - result[1]) + ' / ' + (curr.enemy4hp - result[2]));
  $('#questEnemy5HPLeft').empty().html('HP Left: ' + (curr.enemy5hp - result[3]) + ' / '
    + (curr.enemy5hp - result[4]) + ' / ' + (curr.enemy5hp - result[5]));
  $('#questEnemy6HPLeft').empty().html('HP Left: ' + (curr.enemy6hp - result[6]) + ' / '
    + (curr.enemy6hp - result[7]) + ' / ' + (curr.enemy6hp - result[8]));
};

// calculate NP Damage for Wave 1
document.getElementById('submitBattleForm3').onclick = function(){
  /*let valid = true;
  'use strict';
  var forms = document.getElementsByClassName('needs-validation-battle');
  var validation = Array.prototype.filter.call(forms, function(form) {
    if (form.checkValidity() === false) {
      valid = false;
      event.preventDefault();
      event.stopPropagation();
    }
    form.classList.add('was-validated');
  });

  if(valid) {
    updateBattleSim();
    resetBattleForm();
  }*/
  var curr = savedQuests[quest];
  let result = calculateDamage(3);
  $('#questEnemy7NPDamage').empty().html('NP Damage: ' + result[0] + ' / ' + result[1] + ' / ' + result[2]);
  $('#questEnemy8NPDamage').empty().html('NP Damage: ' + result[3] + ' / ' + result[4] + ' / ' + result[5]);
  $('#questEnemy9NPDamage').empty().html('NP Damage: ' + result[6] + ' / ' + result[7] + ' / ' + result[8]);

  $('#questEnemy7HPLeft').empty().html('HP Left: ' + (curr.enemy7hp - result[0]) + ' / '
    + (curr.enemy7hp - result[1]) + ' / ' + (curr.enemy7hp - result[2]));
  $('#questEnemy8HPLeft').empty().html('HP Left: ' + (curr.enemy8hp - result[3]) + ' / '
    + (curr.enemy8hp - result[4]) + ' / ' + (curr.enemy8hp - result[5]));
  $('#questEnemy9HPLeft').empty().html('HP Left: ' + (curr.enemy9hp - result[6]) + ' / '
    + (curr.enemy9hp - result[7]) + ' / ' + (curr.enemy9hp - result[8]));
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
     curr.craftessence + ' | Power Mod: ' + curr.powermod + '%<br>' + 'NP Level: ' +
     curr.nplevel + ' | Attack: ' + curr.attack + ' | NP Buff: ' + curr.npdamageup + '%' +
     ' | Attr. : ' + curr.attribute + '<br> Buster Up: ' + curr.busterup + ' | Arts Up: ' + curr.artsup +
     ' | Quick Up: ' + curr.quickup + '<span class="float-right"><button type="button" id=' + "useServant" + i +
     ' class="btn btn-outline-success btn-sm" data-toggle="button" aria-pressed="false" autocomplete="false">Select</button> <button type="button" id=' + "deleteServant" + i +
     ' class="btn btn-outline-danger btn-sm">Delete</button></span>' + '</li>'));

     $('#savedServants2').append($('<li class="list-group-item"><b>' + curr.name + '</b> | CE: ' +
      curr.craftessence + ' | Power Mod: ' + curr.powermod + '%<br>' + 'NP Level: ' +
      curr.nplevel + ' | Attack: ' + curr.attack + ' | NP Buff: ' + curr.npdamageup + '%' +
      ' | Attr. : ' + curr.attribute + '<br> Buster Up: ' + curr.busterup + ' | Arts Up: ' + curr.artsup +
      ' | Quick Up: ' + curr.quickup + '</li>'));

    // link up delete button
    document.getElementById("deleteServant" + i).addEventListener("click", function(){
      if(servant !== ""){
        alert("Please have no servants selected when deleting.");
        return;
      }
      savedServants.splice(i,1);
      localStorage.setItem("savedServants", JSON.stringify(savedServants));
      //updateSavedServantsDisplay();
      location.reload();
    });

    // link up servant select button
    document.getElementById("useServant" + i).addEventListener("click", function(){
      if(servant === i){
        servant = "";
        servantNPType = "";
        localStorage.setItem("servant", JSON.stringify(servant));
        location.reload();
      }
      else{
        servant = i;
        servantNPType = savedServants[i].nptype;
        localStorage.setItem("servant", JSON.stringify(servant));
        location.reload();
      }
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
    '<br> E1: ' + curr.enemy1hp + ' ' + curr.enemy1class + ' (' + curr.enemy1attribute + ') ' +
    ' E2: ' + curr.enemy2hp + ' ' + curr.enemy2class + ' (' + curr.enemy2attribute + ') ' +
    ' E3: ' + curr.enemy3hp + ' ' + curr.enemy3class + ' (' + curr.enemy3attribute + ') ' +
    '<br> E4: ' + curr.enemy4hp + ' ' + curr.enemy4class + ' (' + curr.enemy4attribute + ') ' +
    ' E5: ' + curr.enemy5hp + ' ' + curr.enemy5class + ' (' + curr.enemy5attribute + ') ' +
    ' E6: ' + curr.enemy6hp + ' ' + curr.enemy6class + ' (' + curr.enemy6attribute + ') ' +
    '<br> E7: ' + curr.enemy7hp + ' ' + curr.enemy7class + ' (' + curr.enemy7attribute + ') ' +
    ' E8: ' + curr.enemy8hp + ' ' + curr.enemy8class + ' (' + curr.enemy8attribute + ') ' +
    ' E9: ' + curr.enemy9hp + ' ' + curr.enemy9class + ' (' + curr.enemy9attribute + ') ' +
    '</li>'));

    $('#savedQuests2').append($('<li class="list-group-item"><b>' + curr.name + '</b>' +
    '<br> E1: ' + curr.enemy1hp + ' ' + curr.enemy1class + ' (' + curr.enemy1attribute + ') ' +
    ' E2: ' + curr.enemy2hp + ' ' + curr.enemy2class + ' (' + curr.enemy2attribute + ') ' +
    ' E3: ' + curr.enemy3hp + ' ' + curr.enemy3class + ' (' + curr.enemy3attribute + ') ' +
    '<br> E4: ' + curr.enemy4hp + ' ' + curr.enemy4class + ' (' + curr.enemy4attribute + ') ' +
    ' E5: ' + curr.enemy5hp + ' ' + curr.enemy5class + ' (' + curr.enemy5attribute + ') ' +
    ' E6: ' + curr.enemy6hp + ' ' + curr.enemy6class + ' (' + curr.enemy6attribute + ') ' +
    '<br> E7: ' + curr.enemy7hp + ' ' + curr.enemy7class + ' (' + curr.enemy7attribute + ') ' +
    ' E8: ' + curr.enemy8hp + ' ' + curr.enemy8class + ' (' + curr.enemy8attribute + ') ' +
    ' E9: ' + curr.enemy9hp + ' ' + curr.enemy9class + ' (' + curr.enemy9attribute + ') ' +
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
      //updateSavedQuestsDisplay();
      location.reload();
    });
    // link up use button
    document.getElementById("useQuest" + i).addEventListener("click", function(){
      if(quest === i){
        quest = "";
        updateQuestToggles();
        localStorage.setItem("quest", JSON.stringify(quest));
        location.reload();
      }
      else{
        quest = i;
        localStorage.setItem("quest", JSON.stringify(quest));
        location.reload();
      }
    });
  }
  //parsed = JSON.stringify(quest);
  //$('#test').empty().append(parsed);
}

// make sure party buttons are toggled correctly
function updateServantToggles(){
  $('#useServant' + servant).click();
}

// make sure quest buttons are toggled correctly
function updateQuestToggles(){
  $('#useQuest' + quest).click();
}

// make sure battle simulator data is displayed correctly
function updateBattleSim(){
  if(savedQuests.length === 0 || savedServants.length === 0 || servant === "" || quest === ""){
    //alert("Please have a quest selected and servants in your party.");
    return;
  }
  //alert(servant + " " + quest);
  let currQuest = savedQuests[quest];
  let currServant = savedServants[servant];
  //alert(curr.enemy1class); Saber
  $('#questNameDisplay').empty().html('<b>Current Quest: </b>' + currQuest.name);
  $('#servantNameDisplay').empty().html('<b>Current Servant: </b>' + currServant.name + ' NP ' + currServant.nplevel);

  document.getElementById('questEnemy1Class').src = "images/" + currQuest.enemy1class.toLowerCase().replace(/\s/g, '') + ".png";
  document.getElementById('questEnemy2Class').src = "images/" + currQuest.enemy2class.toLowerCase().replace(/\s/g, '') + ".png";
  document.getElementById('questEnemy3Class').src = "images/" + currQuest.enemy3class.toLowerCase().replace(/\s/g, '') + ".png";
  document.getElementById('questEnemy4Class').src = "images/" + currQuest.enemy4class.toLowerCase().replace(/\s/g, '') + ".png";
  document.getElementById('questEnemy5Class').src = "images/" + currQuest.enemy5class.toLowerCase().replace(/\s/g, '') + ".png";
  document.getElementById('questEnemy6Class').src = "images/" + currQuest.enemy6class.toLowerCase().replace(/\s/g, '') + ".png";
  document.getElementById('questEnemy7Class').src = "images/" + currQuest.enemy7class.toLowerCase().replace(/\s/g, '') + ".png";
  document.getElementById('questEnemy8Class').src = "images/" + currQuest.enemy8class.toLowerCase().replace(/\s/g, '') + ".png";
  document.getElementById('questEnemy9Class').src = "images/" + currQuest.enemy9class.toLowerCase().replace(/\s/g, '') + ".png";

  $('#questEnemy1HP').empty().html('HP: ' + currQuest.enemy1hp);
  $('#questEnemy2HP').empty().html('HP: ' + currQuest.enemy2hp);
  $('#questEnemy3HP').empty().html('HP: ' + currQuest.enemy3hp);
  $('#questEnemy4HP').empty().html('HP: ' + currQuest.enemy4hp);
  $('#questEnemy5HP').empty().html('HP: ' + currQuest.enemy5hp);
  $('#questEnemy6HP').empty().html('HP: ' + currQuest.enemy6hp);
  $('#questEnemy7HP').empty().html('HP: ' + currQuest.enemy7hp);
  $('#questEnemy8HP').empty().html('HP: ' + currQuest.enemy8hp);
  $('#questEnemy9HP').empty().html('HP: ' + currQuest.enemy9hp);

  $('#questEnemy1NPDamage').empty().html('NP Damage: 0 / 0 / 0');
  $('#questEnemy2NPDamage').empty().html('NP Damage: 0 / 0 / 0');
  $('#questEnemy3NPDamage').empty().html('NP Damage: 0 / 0 / 0');
  $('#questEnemy4NPDamage').empty().html('NP Damage: 0 / 0 / 0');
  $('#questEnemy5NPDamage').empty().html('NP Damage: 0 / 0 / 0');
  $('#questEnemy6NPDamage').empty().html('NP Damage: 0 / 0 / 0');
  $('#questEnemy7NPDamage').empty().html('NP Damage: 0 / 0 / 0');
  $('#questEnemy8NPDamage').empty().html('NP Damage: 0 / 0 / 0');
  $('#questEnemy9NPDamage').empty().html('NP Damage: 0 / 0 / 0');

  $('#questEnemy1HPLeft').empty().html('HP Left: ' + currQuest.enemy1hp + " / " + currQuest.enemy1hp + " / " + currQuest.enemy1hp);
  $('#questEnemy2HPLeft').empty().html('HP Left: ' + currQuest.enemy2hp + " / " + currQuest.enemy2hp + " / " + currQuest.enemy2hp);
  $('#questEnemy3HPLeft').empty().html('HP Left: ' + currQuest.enemy3hp + " / " + currQuest.enemy3hp + " / " + currQuest.enemy3hp);
  $('#questEnemy4HPLeft').empty().html('HP Left: ' + currQuest.enemy4hp + " / " + currQuest.enemy4hp + " / " + currQuest.enemy4hp);
  $('#questEnemy5HPLeft').empty().html('HP Left: ' + currQuest.enemy5hp + " / " + currQuest.enemy5hp + " / " + currQuest.enemy5hp);
  $('#questEnemy6HPLeft').empty().html('HP Left: ' + currQuest.enemy6hp + " / " + currQuest.enemy6hp + " / " + currQuest.enemy6hp);
  $('#questEnemy7HPLeft').empty().html('HP Left: ' + currQuest.enemy7hp + " / " + currQuest.enemy7hp + " / " + currQuest.enemy7hp);
  $('#questEnemy8HPLeft').empty().html('HP Left: ' + currQuest.enemy8hp + " / " + currQuest.enemy8hp + " / " + currQuest.enemy8hp);
  $('#questEnemy9HPLeft').empty().html('HP Left: ' + currQuest.enemy9hp + " / " + currQuest.enemy9hp + " / " + currQuest.enemy9hp);

  // fill in array to store enemy hp remaining values
  for(let i = 0; i < 27; i++){
    if(i >= 0 && i <= 2){
      questEnemyHP[i] = currQuest.enemy1hp;
    }
    else if(i >= 3 && i <= 5){
      questEnemyHP[i] = currQuest.enemy2hp;
    }
    else if(i >= 6 && i <= 8){
      questEnemyHP[i] = currQuest.enemy3hp;
    }
    else if(i >= 9 && i <= 11){
      questEnemyHP[i] = currQuest.enemy4hp;
    }
    else if(i >= 12 && i <= 14){
      questEnemyHP[i] = currQuest.enemy5hp;
    }
    else if(i >= 15 && i <= 17){
      questEnemyHP[i] = currQuest.enemy6hp;
    }
    else if(i >= 18 && i <= 20){
      questEnemyHP[i] = currQuest.enemy7hp;
    }
    else if(i >= 21 && i <= 23){
      questEnemyHP[i] = currQuest.enemy8hp;
    }
    else if(i >= 24 && i <= 26){
      questEnemyHP[i] = currQuest.enemy9hp;
    }
  }
}

// save servant data into array
function saveServant(){
  if(savedServants.length > 600){
    return false;
  }

  savedServants.unshift({"name": servantName,"class": $('#inputClass').val(),"attack": $('#attack').val(),"nplevel": $('#inputNPLevel').val(),
    "npdamagepercent": $('#NPDamagePercent').val(),"busterup": $('#BusterUpPercentage').val(),"artsup": $('#ArtsUpPercentage').val(),
    "quickup": $('#QuickUpPercentage').val(),"attackup": $('#AttackUpPercentage').val(),"flatattackup": $('#FlatAttackUp').val(),
    "npdamageup": $('#NPDamageUp').val(),"npgain": servantNPGain,"nptype": servantNPType,"nphits": servantNPHits,
    "powermod": $('#PowerMod').val(),"attribute": $('#inputAttribute').val(),"craftessence": $('#inputCE').val()});
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

function calculateDamage(waveNumber){
  var currServant = savedServants[servant];
  var currQuest = savedQuests[quest];
  var questClass1 = "";
  var questClass2 = "";
  var questClass3 = "";
  var questAttr1 = "";
  var questAttr2 = "";
  var questAttr3 = "";
  var cardBuffs = "";

  // servant value calculations
  var servantClass = getClassValue(currServant.class);
  var servantAttr = getAttrValue(currServant.attribute);
  var atk = parseFloat(currServant.attack) || 0;
  var np = parseFloat(currServant.npdamagepercent)/100 || 0;
  var npCardType = cardDmg(currServant.nptype) || 0;
  var servantClassMultiplier = classMultiplier(currServant.class) || 0;
  var busterUp = parseFloat(currServant.busterup)/100 || 0;
  var artsUp = parseFloat(currServant.artsup)/100 || 0;
  var quickUp = parseFloat(currServant.quickup)/100 || 0;
  var attackUp = parseFloat(currServant.attackup)/100 || 0;
  var npBuffs = parseFloat(currServant.npdamageup)/100 || 0;
  var flatAttack = parseFloat(currServant.flatattackup) || 0;
  var defenseDebuffs = 0;
  var cardDebuffs = 0;
  var npSpBuffs = 0;
  var powerBuff = parseFloat(currServant.powermod) || 0;

  if(currServant.nptype.localeCompare("Buster") == 0){
    cardBuffs = busterUp;
  }
  else if(currServant.nptype.localeCompare("Arts") == 0){
    cardBuffs = artsUp;
  }
  else if(currServant.nptype.localeCompare("Quick") == 0){
    cardBuffs = quickUp;
  }

  // enemy value calculations
  if(waveNumber === 1){
    questClass1 = getClassValue(currQuest.enemy1class);
    questClass2 = getClassValue(currQuest.enemy2class);
    questClass3 = getClassValue(currQuest.enemy3class);
    questAttr1 = getAttrValue(currQuest.enemy1attribute);
    questAttr2 = getAttrValue(currQuest.enemy2attribute);
    questAttr3 = getAttrValue(currQuest.enemy3attribute);
  }
  else if(waveNumber === 2){
    questClass1 = getClassValue(currQuest.enemy4class);
    questClass2 = getClassValue(currQuest.enemy5class);
    questClass3 = getClassValue(currQuest.enemy6class);
    questAttr1 = getAttrValue(currQuest.enemy4attribute);
    questAttr2 = getAttrValue(currQuest.enemy5attribute);
    questAttr3 = getAttrValue(currQuest.enemy6attribute);
  }
  else if(waveNumber === 3){
    questClass1 = getClassValue(currQuest.enemy7class);
    questClass2 = getClassValue(currQuest.enemy8class);
    questClass3 = getClassValue(currQuest.enemy9class);
    questAttr1 = getAttrValue(currQuest.enemy7attribute);
    questAttr2 = getAttrValue(currQuest.enemy8attribute);
    questAttr3 = getAttrValue(currQuest.enemy9attribute);
  }

  // interactive calculations
  var classAdvantage1 = ClassAdv[servantClass][questClass1];
  var classAdvantage2 = ClassAdv[servantClass][questClass2];
  var classAdvantage3 = ClassAdv[servantClass][questClass3];
  var attrAdvantage1 = AttrAdv[servantAttr][questAttr1];
  var attrAdvantage2 = AttrAdv[servantAttr][questAttr2];
  var attrAdvantage3 = AttrAdv[servantAttr][questAttr3];

  console.log("multiplier class 1: " + classAdvantage1);
  console.log("multiplier attr 1: " + attrAdvantage1);

  //var defenseDebuffs = parseFloat()/100 || 0;
  //var cardDebuffs = parseFloat($('#cardDebuffs').val())/100 || 0;
  //var spBuffs = parseFloat($('#SPBuffs').val())/100 || 0;
  //var npspBuffs = parseFloat($('#NPSPBuffs').val())/100 || 0;

  var damageDealt1 = atk * np * npCardType * classAdvantage1 * servantClassMultiplier * 0.23 *
              (1 + attackUp + defenseDebuffs) * (1 + cardBuffs + cardDebuffs) * (1 + npBuffs + powerBuff) *
              (1 + npSpBuffs) * attrAdvantage1 + flatAttack;
  var damageDealt2 = atk * np * npCardType * classAdvantage2 * servantClassMultiplier * 0.23 *
              (1 + attackUp + defenseDebuffs) * (1 + cardBuffs + cardDebuffs) * (1 + npBuffs + powerBuff) *
              (1 + npSpBuffs) * attrAdvantage2 + flatAttack;
  var damageDealt3 = atk * np * npCardType * classAdvantage3 * servantClassMultiplier * 0.23 *
              (1 + attackUp + defenseDebuffs) * (1 + cardBuffs + cardDebuffs) * (1 + npBuffs + powerBuff) *
              (1 + npSpBuffs) *  attrAdvantage3 + flatAttack;

  //alert(atk + " " +  np + " " + npCardType + " " +  classAdvantage1 + " " + servantClassMultiplier +
  //   + attackUp + " " + cardBuffs + " " + npBuffs + " " + flatAttack + " result: " + damageDealt1);

  // return average low and high damage dealt
  return [Math.round(0.9 * damageDealt1), Math.round(damageDealt1), Math.round(1.1 * damageDealt1),
    Math.round(0.9 * damageDealt2), Math.round(damageDealt2), Math.round(1.1 * damageDealt2),
    Math.round(0.9 * damageDealt3), Math.round(damageDealt3), Math.round(1.1 * damageDealt3)];
}

// np refund calcluation
// rider +10%, caster +20%, assassin -10%, berserker -20%
function calculateNPRefund(hp1, hp2, hp3, damage1, damage2, damage3){
  var enemyServerMod = 1;
  var firstCardBonus = 0; // 0 because NP card
  var cardNpValue = 0; // buster quick arts card modifier
  var cardMod = 0; // % buster,quick,arts up etc
  var npChargeRateMod = 0; // changes to np charge rate
  var npChargeOff = savedServants[servant].npgain; // np gain offensive
  var critMod = 1; // no NP Crit
  var npRefund = 0;
  var npHits = savedServants[servant].nphits // how many hits this np has
  var overkillModifier = 1;

  // set np card type and card buffs
  if(savedServants[servant].nptype.localeCompare("Buster") == 0){
    cardNpValue = 0;
    cardMod = savedServants[servant].busterup;
  }
  else if(savedServants[servant].nptype.localeCompare("Arts") == 0){
    cardNpValue = 3;
    cardMod = savedServants[servant].artsup;
  }
  else if(savedServants[servant].nptype.localeCompare("Quick") == 0){
    cardNpValue = 1;
    cardMod = savedServants[servant].quickup;
  }

  let damage = 0;
  for(let i = 0; i < npHits; i++){
    console.log("np refund calc loop: " + i + "enemy1 hp: " + hp1 + "nphits: " + npHits);
    damage = damage1 * NPHitDist[npHits - 1][i];
    console.log("damage1: " + damage);
    if(hp1 - damage <= 0){
      overkillModifier = 1.5;
    }
    else{
      overkillModifier = 1;
    }
    hp1 -= damage;
    npRefund += ((npChargeOff * (firstCardBonus + (cardNpValue * (1 + cardMod/100)))*
      enemyServerMod * (1 + npChargeRateMod/100) * critMod) * overkillModifier);
    console.log(npRefund);

    damage = damage2 * NPHitDist[npHits - 1][i];
    if(hp2 - damage <= 0){
      overkillModifier = 1.5;
    }
    else{
      overkillModifier = 1;
    }
    hp2 -= damage;
    npRefund += ((npChargeOff * (firstCardBonus + (cardNpValue * (1 + cardMod/100)))*
      enemyServerMod * (1 + npChargeRateMod/100) * critMod) * overkillModifier);
    console.log(npRefund);

    damage = damage3 * NPHitDist[npHits - 1][i];
    if(hp3 - damage <= 0){
      overkillModifier = 1.5;
    }
    else{
      overkillModifier = 1;
    }
    hp3 -= damage;
    npRefund += ((npChargeOff * (firstCardBonus + (cardNpValue * (1 + cardMod/100)))*
      enemyServerMod * (1 + npChargeRateMod/100) * critMod) * overkillModifier);
    console.log(npRefund);
  }

  return npRefund;
}


// Saber = 0, Archer = 1, Lancer = 2, Rider = 3, Caster = 4, Assassin = 5, Berserker = 6,
// Ruler = 7, Avenger = 8, Moon Cancer = 9, Alter Ego = 10, Foreigner = 11, Shielder = 12
function getClassValue(input){
  var classVal = 0;

  if(input.localeCompare("Saber") == 0){
    console.log("saber");
    classVal = 0;
  }
  else if(input.localeCompare("Archer") == 0){
    console.log("archer");
    classVal = 1;
  }
  else if(input.localeCompare("Lancer") == 0){
    console.log("lancer");
    classVal = 2;
  }
  else if(input.localeCompare("Rider") == 0){
    console.log("rider");
    classVal = 3;
  }
  else if(input.localeCompare("Caster") == 0){
    console.log("caster");
    classVal = 4;
  }
  else if(input.localeCompare("Assassin") == 0){
    console.log("assassin");
    classVal = 5;
  }
  else if(input.localeCompare("Berserker") == 0){
    console.log("berserker");
    classVal = 6;
  }
  else if(input.localeCompare("Ruler") == 0){
    console.log("ruler");
    classVal = 7;
  }
  else if(input.localeCompare("Avenger") == 0){
    console.log("avenger");
    classVal = 8;
  }
  else if(input.localeCompare("Moon Cancer") == 0){
    console.log("moon cancer");
    classVal = 9;
  }
  else if(input.localeCompare("Alter Ego") == 0){
    console.log("alter ego");
    classVal = 10;
  }
  else if(input.localeCompare("Foreigner") == 0){
    console.log("foreigner");
    classVal = 11;
  }
  else if(input.localeCompare("Shielder") == 0){
    console.log("shielder");
    classVal = 12;
  }

  return classVal;
}

// Man = 0, Sky = 1, Earth = 2
function getAttrValue(input){
  var attrVal = 0;

  if(input.localeCompare("Man") == 0){
    console.log("man");
    attrVal = 0;
  }
  else if(input.localeCompare("Sky") == 0){
    console.log("sky");
    attrVal = 1;
  }
  else if(input.localeCompare("Earth") == 0){
    console.log("sky");
    attrVal = 2;
  }

  return attrVal;
}

function classMultiplier(input){
  var classVal = 1;

  if (input.localeCompare("Archer") == 0){
    console.log("archer");
    classVal = 0.95;
  }
  else if (input.localeCompare("Lancer") == 0 ){
    console.log("lancer");
    classVal = 1.05;
  }
  else if (input.localeCompare("Caster") == 0 || input.localeCompare("Assassin") == 0 ){
    console.log("caster or assassin");
    classVal = 0.9;
  }
  else if (input.localeCompare("Berseker") == 0 || input.localeCompare("Ruler") == 0 ||
  input.localeCompare("Avenger") == 0){
    console.log("berserker or ruler or avenger");
    classVal = 1.1;
  }
  return classVal;
}

function cardDmg(input){
  var cardVal = 1;

  if (input.localeCompare("Buster") == 0){
    console.log("np type buster");
    cardVal = 1.5;
  }
  else if (input.localeCompare("Arts") == 0){
    console.log("np type arts");
    cardVal = 1.0;
  }
  else if (input.localeCompare("Quick") == 0){
    console.log("np type quick");
    cardVal = 0.8;
  }

  return cardVal;
}
