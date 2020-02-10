var servantName = "";
var servantNPType = "";
var servantNPGain = "";
var servantNPHits = "";
var savedServants = JSON.parse(localStorage.getItem("savedServants") || "[]");
var savedQuests = JSON.parse(localStorage.getItem("savedQuests") || "[]");
var party = JSON.parse(localStorage.getItem("party") || "[]");
var servant = JSON.parse(localStorage.getItem("servant") || "[]");
var quest = JSON.parse(localStorage.getItem("quest") || "[]");
var questEnemyHP = [];
var questRefunds = [];
var startup = true;
var editServantMode = false;
var editServant = -1;
var editQuestMode = false;
var editQuest = -1;
var debug = false;

// actions to do when the page is loaded
$(document).ready(function() {
  init();
});
function init(){
  // save which tab was active
  $('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
    localStorage.setItem('activeTab', $(e.target).attr('href'));
  });
  var activeTab = localStorage.getItem('activeTab');
  if(activeTab){
      $('.nav-tabs a[href="' + activeTab + '"]').tab('show');
  }

  initializeClassDropdown();
  initializeBattleSim();
  initializeBattleParty();
  updateSavedServantsDisplay();
  updateSavedQuestsDisplay();
  updateServantToggles();
  updateBattlePartyToggles();
  updateQuestToggles();
  startup = false;
}

// prevent enter from submitting form
$(document).ready(function() {
  $(window).keydown(function(event){
    if(event.keyCode == 13) {
      event.preventDefault();
      return false;
    }
  });
});

// initialize tooltips
$(function () {
  $('[data-toggle="tooltip"]').tooltip()
})

// filter out a list of servants based on class
$("#inputClass").change(function(){ loadServantOptions();});
function loadServantOptions(){
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
}

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
      else{
        $('#attack').val( Number( attk[1]) );
      }

      $('#' + servantNPType).prop("checked", true).click();

      // on change updates
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

      $('#NPType').on('change', function(){
        servantNPType = $('#NPType').val();
        console.log(servantNPType);
      });

    }
  }
});

// automatically input default enemy np gain mod based on class
$('#enemy1Class').on('change', function(){
  let enemyclass = getClassValue($('#enemy1Class').val());
  console.log("enemy1class: " + enemyclass);
  $('#enemy1NPGainMod').val(EnemyServerMod[enemyclass]);
});

$('#enemy2Class').on('change', function(){
  let enemyclass = getClassValue($('#enemy2Class').val());
  console.log("enemy2class: " + enemyclass);
  $('#enemy2NPGainMod').val(EnemyServerMod[enemyclass]);
});

$('#enemy3Class').on('change', function(){
  let enemyclass = getClassValue($('#enemy3Class').val());
  console.log("enemy3class: " + enemyclass);
  $('#enemy3NPGainMod').val(EnemyServerMod[enemyclass]);
});

$('#enemy4Class').on('change', function(){
  let enemyclass = getClassValue($('#enemy4Class').val());
  console.log("enemy4class: " + enemyclass);
  $('#enemy4NPGainMod').val(EnemyServerMod[enemyclass]);
});

$('#enemy5Class').on('change', function(){
  let enemyclass = getClassValue($('#enemy5Class').val());
  console.log("enemy5class: " + enemyclass);
  $('#enemy5NPGainMod').val(EnemyServerMod[enemyclass]);
});

$('#enemy6Class').on('change', function(){
  let enemyclass = getClassValue($('#enemy6Class').val());
  console.log("enemy6class: " + enemyclass);
  $('#enemy6NPGainMod').val(EnemyServerMod[enemyclass]);
});

$('#enemy7Class').on('change', function(){
  let enemyclass = getClassValue($('#enemy7Class').val());
  console.log("enemy7class: " + enemyclass);
  $('#enemy7NPGainMod').val(EnemyServerMod[enemyclass]);
});

$('#enemy8Class').on('change', function(){
  let enemyclass = getClassValue($('#enemy8Class').val());
  console.log("enemy8class: " + enemyclass);
  $('#enemy8NPGainMod').val(EnemyServerMod[enemyclass]);
});

$('#enemy9Class').on('change', function(){
  let enemyclass = getClassValue($('#enemy9Class').val());
  console.log("enemy9class: " + enemyclass);
  $('#enemy9NPGainMod').val(EnemyServerMod[enemyclass]);
});

// reset servant form
$('#resetServantForm').click(function(){
  resetServant();
  $('#inputServant').empty().append($('<option></option>').val('Select Servant').html('Select Servant'));

  // reset form validation display
  var forms = document.getElementsByClassName('needs-validation-servant');
  Array.prototype.filter.call(forms, function(form) {
    form.classList.remove('was-validated');
  });
});

// reset quest form
$('#resetQuestForm').click(function(){
  resetQuest();

  // reset form validation display
  var forms = document.getElementsByClassName('needs-validation-quest');
  Array.prototype.filter.call(forms, function(form) {
    form.classList.remove('was-validated');
  });
});

// delete all party members
$('#deleteAllPartyMembers').click(function(){
  if(debug){
    alert("deleteAllPartyMembers");
  }
  party = [];
  localStorage.setItem("party", JSON.stringify(party));

  updateSavedServantsDisplay();
  updateServantToggles();
  initializeBattleSim();
  initializeBattleParty();
  updateBattlePartyToggles();
});

// delete all saved servants
$('#deleteAllServants').click(function(){
  if(debug){
    alert("deleteAllServants");
  }
  event.preventDefault();
  event.stopPropagation();

  if(savedServants.length == 0){
   return;
  }
  if(confirm('Do you want to delete ALL saved servants?')){
    party = [];
    localStorage.setItem("party", JSON.stringify(party));

    deleteAllServants();

    updateSavedServantsDisplay();
    initializeBattleSim();
    initializeBattleParty();
    updateBattlePartyToggles();

    //reload is necessary to show battle sim as needing servants
    location.reload();
  }
});

// delete all quests
$('#deleteAllQuests').click(function(){
  if(savedQuests.length == 0){
   return;
  }
  if(confirm('Do you want to delete ALL quests?')){
    deleteAllQuests();
  }
});

// save servant data into array
$('#addServant').click(addServant);

// add quest data into array
$('#addQuest').click(addQuest);

// calculate NP Damage for Wave 1
$('#submitBattleForm1').click(function(){
  // if no servant selected
  if(typeof savedServants[servant] === "undefined"){
    return;
  }

  let valid = true;
  'use strict';
  var forms = document.getElementsByClassName('needs-validation-battle1');
  var validation = Array.prototype.filter.call(forms, function(form) {
    if (form.checkValidity() === false) {
      valid = false;
      event.preventDefault();
      event.stopPropagation();
    }
    form.classList.add('was-validated');
  });

  if(valid) {
    let curr = savedQuests[quest];
    let result = calculateDamage(1);

    $('#questEnemy1NPDamage').empty().html('NP Damage: ' + result[0] + ' / ' + result[1] + ' / ' + result[2]);
    $('#questEnemy2NPDamage').empty().html('NP Damage: ' + result[3] + ' / ' + result[4] + ' / ' + result[5]);
    $('#questEnemy3NPDamage').empty().html('NP Damage: ' + result[6] + ' / ' + result[7] + ' / ' + result[8]);

    $('#questEnemy1HPLeft').empty().html('HP Left: ' + (questEnemyHP[0] - result[0]) + ' / '
      + (questEnemyHP[1] - result[1]) + ' / ' + (questEnemyHP[2] - result[2]));
    $('#questEnemy2HPLeft').empty().html('HP Left: ' + (questEnemyHP[3] - result[3]) + ' / '
      + (questEnemyHP[4] - result[4]) + ' / ' + (questEnemyHP[5] - result[5]));
    $('#questEnemy3HPLeft').empty().html('HP Left: ' + (questEnemyHP[6] - result[6]) + ' / '
      + (questEnemyHP[7] - result[7]) + ' / ' + (questEnemyHP[8] - result[8]));

    // calculate np refund - pass in hp1, hp2, hp3, enemyMod1, enemyMod2, enemyMod3, damage1, damage2, damage3, cardBuff, npGainUp
    let refunded = calculateNPRefund(questEnemyHP[0], questEnemyHP[3], questEnemyHP[6], curr.enemy1npgainmod, curr.enemy2npgainmod, curr.enemy3npgainmod,
     result[0], result[3], result[6], result[9], result[10]);

    $('#npRefundDisplay1').empty().html('<b>Wave 1: Min. NP Refunded: </b>' + refunded.toFixed(2) + '%');
    $('#npRefundDisplay2').empty().html('<b>Wave 2: Last NP Refund from last wave: </b>' + refunded.toFixed(2) + '%<b> | Min. NP Refunded: </b> N/A</b>');
    questRefunds[0] = refunded.toFixed(2);

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

    // reset form validation display
    Array.prototype.filter.call(forms, function(form) {
      form.classList.remove('was-validated');
    });
  }
});

// reset battle sim wave 1
$('#resetHP1').click({wave: 1}, resetBattleSim);

// reset battle sim form wave 1
$('#resetBattleForm1').click({wave: 1}, resetBattleForm);

// calculate NP Damage for Wave 2
$('#submitBattleForm2').click(function(){
  // if no servant selected
  if(typeof savedServants[servant] === "undefined"){
    return;
  }

  let valid = true;
  'use strict';
  var forms = document.getElementsByClassName('needs-validation-battle2');
  var validation = Array.prototype.filter.call(forms, function(form) {
    if (form.checkValidity() === false) {
      valid = false;
      event.preventDefault();
      event.stopPropagation();
    }
    form.classList.add('was-validated');
  });

  if(valid) {
    let curr = savedQuests[quest];
    let result = calculateDamage(2);

    $('#questEnemy4NPDamage').empty().html('NP Damage: ' + result[0] + ' / ' + result[1] + ' / ' + result[2]);
    $('#questEnemy5NPDamage').empty().html('NP Damage: ' + result[3] + ' / ' + result[4] + ' / ' + result[5]);
    $('#questEnemy6NPDamage').empty().html('NP Damage: ' + result[6] + ' / ' + result[7] + ' / ' + result[8]);

    $('#questEnemy4HPLeft').empty().html('HP Left: ' + (questEnemyHP[9] - result[0]) + ' / '
      + (questEnemyHP[10] - result[1]) + ' / ' + (questEnemyHP[11] - result[2]));
    $('#questEnemy5HPLeft').empty().html('HP Left: ' + (questEnemyHP[12] - result[3]) + ' / '
      + (questEnemyHP[13] - result[4]) + ' / ' + (questEnemyHP[14] - result[5]));
    $('#questEnemy6HPLeft').empty().html('HP Left: ' + (questEnemyHP[15] - result[6]) + ' / '
      + (questEnemyHP[16] - result[7]) + ' / ' + (questEnemyHP[17] - result[8]));

    // calculate np refund - pass in hp1, hp2, hp3, enemyMod1, enemyMod2, enemyMod3, damage1, damage2, damage3, cardBuff, npGainUp
    let refunded = calculateNPRefund(questEnemyHP[9], questEnemyHP[12], questEnemyHP[15], curr.enemy4npgainmod, curr.enemy5npgainmod, curr.enemy6npgainmod,
      result[0], result[3], result[6], result[9], result[10]);

    if(typeof questRefunds[0] === "undefined"){
      $('#npRefundDisplay2').empty().html('<b>Wave 2: Last NP Refund from last wave: </b> N/A<b> | Min. NP Refunded: </b>' + refunded.toFixed(2) + '% </b>')
    }
    else{
      $('#npRefundDisplay2').empty().html('<b>Wave 2: Last NP Refund from last wave: </b>' + questRefunds[0] + '%<b> | Min. NP Refunded: </b>' + refunded.toFixed(2) + '% </b>');
    }
    $('#npRefundDisplay3').empty().html('<b>Wave 3: Last NP Refund from last wave: </b>' + refunded.toFixed(2) + '%<b> | Min. NP Refunded: </b> N/A</b>');
    questRefunds[1] = refunded.toFixed(2);

    // update enemy hp in Array
    questEnemyHP[9] -= result[0];
    questEnemyHP[10] -= result[1];
    questEnemyHP[11] -= result[2];
    questEnemyHP[12] -= result[3];
    questEnemyHP[13] -= result[4];
    questEnemyHP[14] -= result[5];
    questEnemyHP[15] -= result[6];
    questEnemyHP[16] -= result[7];
    questEnemyHP[17] -= result[8];

    // reset form validation display
    Array.prototype.filter.call(forms, function(form) {
      form.classList.remove('was-validated');
    });
  }
});

// reset battle sim wave 2
$('#resetHP2').click({wave: 2}, resetBattleSim);

// reset battle sim form wave 2
$('#resetBattleForm2').click({wave: 2}, resetBattleForm);

// calculate NP Damage for Wave 3
$('#submitBattleForm3').click(function(){
  // if no servant selected
  if(typeof savedServants[servant] === "undefined"){
    return;
  }

  let valid = true;
  'use strict';
  var forms = document.getElementsByClassName('needs-validation-battle3');
  var validation = Array.prototype.filter.call(forms, function(form) {
    if (form.checkValidity() === false) {
      valid = false;
      event.preventDefault();
      event.stopPropagation();
    }
    form.classList.add('was-validated');
  });

  if(valid) {
    let curr = savedQuests[quest];
    let result = calculateDamage(3);

    $('#questEnemy7NPDamage').empty().html('NP Damage: ' + result[0] + ' / ' + result[1] + ' / ' + result[2]);
    $('#questEnemy8NPDamage').empty().html('NP Damage: ' + result[3] + ' / ' + result[4] + ' / ' + result[5]);
    $('#questEnemy9NPDamage').empty().html('NP Damage: ' + result[6] + ' / ' + result[7] + ' / ' + result[8]);

    $('#questEnemy7HPLeft').empty().html('HP Left: ' + (questEnemyHP[18] - result[0]) + ' / '
      + (questEnemyHP[19] - result[1]) + ' / ' + (questEnemyHP[20] - result[2]));
    $('#questEnemy8HPLeft').empty().html('HP Left: ' + (questEnemyHP[21] - result[3]) + ' / '
      + (questEnemyHP[22] - result[4]) + ' / ' + (questEnemyHP[23] - result[5]));
    $('#questEnemy9HPLeft').empty().html('HP Left: ' + (questEnemyHP[24] - result[6]) + ' / '
      + (questEnemyHP[25] - result[7]) + ' / ' + (questEnemyHP[26] - result[8]));

    // calculate np refund - pass in hp1, hp2, hp3, enemyMod1, enemyMod2, enemyMod3, damage1, damage2, damage3, cardBuff, npGainUp
    let refunded = calculateNPRefund(questEnemyHP[18], questEnemyHP[21], questEnemyHP[24], curr.enemy7npgainmod, curr.enemy8npgainmod, curr.enemy9npgainmod,
      result[0], result[3], result[6], result[9], result[10]);

    if(typeof questRefunds[1] === "undefined"){
      $('#npRefundDisplay3').empty().html('<b>Wave 2: Last NP Refund from last wave: </b> N/A<b> | Min. NP Refunded: </b>' + refunded.toFixed(2) + '% </b>')
    }
    else{
      $('#npRefundDisplay3').empty().html('<b>Wave 3: Last NP Refund from last wave: </b>' + questRefunds[1] + '%<b> | Min. NP Refunded: </b>' + refunded.toFixed(2) + '% </b>');
    }
    questRefunds[2] = refunded.toFixed(2);

    // update enemy hp
    questEnemyHP[18] -= result[0];
    questEnemyHP[19] -= result[1];
    questEnemyHP[20] -= result[2];
    questEnemyHP[21] -= result[3];
    questEnemyHP[22] -= result[4];
    questEnemyHP[23] -= result[5];
    questEnemyHP[24] -= result[6];
    questEnemyHP[25] -= result[7];
    questEnemyHP[26] -= result[8];

    // reset form validation display
    Array.prototype.filter.call(forms, function(form) {
      form.classList.remove('was-validated');
    });
  }
});

// reset battle sim wave 3
$('#resetHP3').click({wave: 3}, resetBattleSim);

// reset battle sim form wave 3
$('#resetBattleForm3').click({wave: 3}, resetBattleForm);

// update saved servant display
function updateSavedServantsDisplay(){
  $('#savedServants1').empty();
  $('#savedServants2').empty();
  for(let i = 0; i < savedServants.length; i++){
    let currServant = savedServants[i];
    let busterstring = "";
    let artsstring = "";
    let quickstring = "";
    console.log("busterup: " + currServant.busterup);
    if(parseFloat(currServant.busterup) !== 0){
      console.log("busterup isnt 0");
      busterstring = 'Buster Up: ' + currServant.busterup + '%';
    }
    if(parseFloat(currServant.artsup) !== 0){
      artsstring = ' Arts Up: ' + currServant.artsup + '%';
    }
    if(parseFloat(currServant.quickup) !== 0){
      quickstring = ' Quick Up: ' + currServant.quickup + '%';
    }

    $('#savedServants1').append($('<li class="list-group-item"><b>' + currServant.name + '</b> | CE: ' +
     currServant.craftessence + ' | Power Mod: ' + currServant.powermod + '% | NP Gain Up: ' + currServant.npgainup + '%<br>' + 'NP Level: ' +
     currServant.nplevel + ' | Attack: ' + currServant.attack + ' | NP Buff: ' + currServant.npdamageup + '%' +
     ' | Attr. : ' + currServant.attribute + '<br> ' + busterstring + artsstring + quickstring +
     '<span class="float-right"><button type="button" id=' + "useServant" + i +
     ' class="btn btn-outline-success btn-sm" data-toggle="button" aria-pressed="false" autocomplete="false">In Party</button> ' +
     '<button type="button" id=' + "editServant" + i +
     ' class="btn btn-outline-warning btn-sm">Edit</button> ' +
     '<button type="button" id=' + "deleteServant" + i +
     ' class="btn btn-outline-danger btn-sm">Delete</button></span>' + '</li>'));


     $('#savedServants2').append($('<li class="list-group-item"><b>' + currServant.name + '</b> | CE: ' +
      currServant.craftessence + ' | Power Mod: ' + currServant.powermod + '%<br>' + 'NP Level: ' +
      currServant.nplevel + ' | Attack: ' + currServant.attack + ' | NP Buff: ' + currServant.npdamageup + '%' +
      ' | Attr. : ' + currServant.attribute + '<br> Buster Up: ' + currServant.busterup + ' | Arts Up: ' + currServant.artsup +
      ' | Quick Up: ' + currServant.quickup + '</li>'));

    // link up delete button
    $('#deleteServant' + i).click(function(){
      if(debug){
        alert("deleteservant" +  i);
      }

      if(editServantMode){
        alert("Please do not delete a servant while editing!");
        return;
      }

      if(party.length !== 0){
        alert("Please have no servants in party when deleting!");
        return;
      }
      savedServants.splice(i,1);
      localStorage.setItem("savedServants", JSON.stringify(savedServants));

      updateSavedServantsDisplay();
      updateServantToggles();

      // test update without reload
      //location.reload();
    });

    // link up servant select button
    $('#useServant' + i).click(function(){
      if(debug){
        alert("useservant"+ i);
      }

      // remove servant from party
      if(party.includes(i)){
        servant = "";
        servantNPType = "";

        // remove servant from party
        servantPartyIndex = party.indexOf(i);
        party.splice(servantPartyIndex,1);

        // save changes
        localStorage.setItem("servant", JSON.stringify(servant));
        localStorage.setItem("party", JSON.stringify(party));

        // test update without reload
        initializeBattleSim();
        initializeBattleParty();
        updateBattlePartyToggles();
      }
      // add servant to party
      else{
        if(party.length == 6){
          alert("You can only have 6 servants in a party.");

          // de-highlight button
          $('#useServant' + i).attr('class', 'btn btn-outline-success btn-sm');
          return;
        }

        party.unshift(i);
        localStorage.setItem("party", JSON.stringify(party));

        initializeBattleSim();
        initializeBattleParty();
        updateBattlePartyToggles();
      }
    });

    // link up edit servant button
    $('#editServant' + i).click(function(){
      if(debug){
        alert("editservant"+ i);
        //alert(JSON.stringify(savedServants));
      }

      // if already editing this unit, stop editing
      if(editServant === i){
        location.reload();
        return;
      }

      // set all buttons to non active
      for(let j = 0; j < savedServants.length; j++){
        $('#editServant' + j ).removeClass('active');
      }
      editServantMode = true;
      editServant = i;
      $('#editServant' + i).addClass('active');

      let currServant = savedServants[i];
      // change display to servant
      $('#inputClass').val(currServant.class);

      // load servant options\
      loadServantOptions();
      servantName = currServant.name;
      let servantID = getServantID(servantName);

      // hook up servant change value updates
      $('#inputServant').val(servantID);
      $('#inputServant').on('change', function(){
        loadNPPercentages($('#inputServant').val());
        $('#maxGrailed').prop('disabled', false);
        $('#maxGrailed').prop('checked', false);
        $('#maxFou').prop('checked', false);
        $('#inputNPLevel').val(1);
        $('#hasNPupgrade').hide();

        // update display with servant stats
        if (servantList[$('#inputServant').val() - 1].npupgrade == 1) {
            $('#hasNPupgrade').show();
          }
      });

      // load fields
      $('#attack').val(currServant.attack);
      $('#inputNPLevel').val(currServant.nplevel);
      $('#NPDamagePercent').val(currServant.npdamagepercent);
      $('#BusterUpPercentage').val(currServant.busterup);
      $('#ArtsUpPercentage').val(currServant.artsup);
      $('#QuickUpPercentage').val(currServant.quickup);
      $('#AttackUpPercentage').val(currServant.attackup);
      $('#FlatAttackUp').val(currServant.flatattackup);
      $('#NPDamageUp').val(currServant.npdamageup);
      servantNPGain = currServant.npgain;
      loadNPPercentages(servantID);

      // load np type button
      servantNPType = currServant.nptype;
      $('#' + servantNPType).prop('checked',true).click();

      // load fields
      $('#NpGainUpPercentage').val(currServant.npgainup);
      servantNPHits = currServant.nphits;
      $('#PowerMod').val(currServant.powermod);
      $('#inputAttribute').val(currServant.attribute);
      $('#inputCE').val(currServant.craftessence);
      $('#NPDamageUp').val(currServant.npdamageup);

      // change add servant to save servant
      $('#addServant').prop('disabled', false);
      $('#addServant').unbind();
      $('#addServant').text('Save Servant');
      $('#addServant').attr("id","saveEditedServant");
      $('#saveEditedServant').click(function() { saveEditedServant(i); });
    });
  }
}

// update quest updateSavedQuestsDisplay
function updateSavedQuestsDisplay(){
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
    '<button type="button" id=' + "editQuest" + i + ' class="btn btn-outline-warning btn-sm">Edit</button> ' +
    '<button type="button" id=' + "deleteQuest" + i + ' class="btn btn-outline-danger btn-sm">Delete</button></span>' + '</li>'));

    // link up delete button
    document.getElementById("deleteQuest" + i).addEventListener("click", function(){
      if(debug){
        alert("deletequest " + i);
      }

      if(editQuestMode){
        alert("Please do not delete a quest while editing!");
        return;
      }
      if(quest !== "" && quest.length !== 0){
        alert("Please have no quest selected when deleting!");
        if(debug){
          alert(JSON.stringify(quest));
        }
        return;
      }

      savedQuests.splice(i,1);
      localStorage.setItem("savedQuests", JSON.stringify(savedQuests));
      updateSavedQuestsDisplay();
    });

    // link up use button
    $('#useQuest' + i).click(function(){
      if(debug){
        alert("usequest " + i);
      }
      if(quest === i){
        quest = "";
        updateQuestToggles();
        localStorage.setItem("quest", JSON.stringify(quest));

        // reload needed to update battle sim
        location.reload();
      }
      else{
        if(debug){
          alert("select quest ");
        }
        quest = i;
        localStorage.setItem("quest", JSON.stringify(quest));

        // reload needed to update battle sim
        location.reload();
      }
    });

    // link up edit button
    $('#editQuest' + i).click(function(){
      if(debug){
        alert("editquest"+ i);
      }

      // if already editing this unit, stop editing
      if(editQuest === i){
        location.reload();
        return;
      }

      // set all buttons to non active
      for(let j = 0; j < savedQuests.length; j++){
        $('#editQuest' + j ).removeClass('active');
      }
      editQuestMode = true;
      editQuest = i;
      $('#editQuest' + i).addClass('active');


      let curr = savedQuests[i];
      // change display to servant
      $('#QuestName').val(curr.name);

      $('#enemy1HP').val(curr.enemy1hp);
      $('#enemy1Class').val(curr.enemy1class);
      $('#enemy1Attribute').val(curr.enemy1attribute);
      $('#enemy2HP').val(curr.enemy2hp);
      $('#enemy2Class').val(curr.enemy2class);
      $('#enemy2Attribute').val(curr.enemy2attribute);
      $('#enemy3HP').val(curr.enemy3hp);
      $('#enemy3Class').val(curr.enemy3class);
      $('#enemy3Attribute').val(curr.enemy3attribute);
      $('#enemy4HP').val(curr.enemy4hp);
      $('#enemy4Class').val(curr.enemy4class);
      $('#enemy4Attribute').val(curr.enemy4attribute);
      $('#enemy5HP').val(curr.enemy5hp);
      $('#enemy5Class').val(curr.enemy5class);
      $('#enemy5Attribute').val(curr.enemy5attribute);
      $('#enemy6HP').val(curr.enemy6hp);
      $('#enemy6Class').val(curr.enemy6class);
      $('#enemy6Attribute').val(curr.enemy6attribute);
      $('#enemy7HP').val(curr.enemy7hp);
      $('#enemy7Class').val(curr.enemy7class);
      $('#enemy7Attribute').val(curr.enemy7attribute);
      $('#enemy8HP').val(curr.enemy8hp);
      $('#enemy8Class').val(curr.enemy8class);
      $('#enemy8Attribute').val(curr.enemy8attribute);
      $('#enemy9HP').val(curr.enemy9hp);
      $('#enemy9Class').val(curr.enemy9class);
      $('#enemy9Attribute').val(curr.enemy9attribute);

      //change add servant to save servant
      $('#addQuest').prop('disabled', false);
      $('#addQuest').text('Save Quest');
      $('#addQuest').attr("id","saveEditedQuest");
      $('#saveEditedQuest').click(function() { saveEditedQuest(i); });
    });
  }
}
