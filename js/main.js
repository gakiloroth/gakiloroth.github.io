const QUEST_ENEMY_COUNT = 9;
const WAVE_ENEMY_COUNT = 3;
const PARTY_MAX_LIMIT = 20;

var servantName = "";
var servantID = 1;
var servantNPType = "";
var servantNPGain = "";
var servantNPHits = "";
var ceID = 0;
var savedServants = JSON.parse(localStorage.getItem("savedServants") || "[]");
var savedQuests = JSON.parse(localStorage.getItem("savedQuests") || "[]");
var party = JSON.parse(localStorage.getItem("party") || "[]");
var servant = JSON.parse(localStorage.getItem("servant") || "[]");
var quest = JSON.parse(localStorage.getItem("quest") || "[]");
var questEnemyHP = [];
var questRefunds = [];
var questNPTotalTime = 0;
var startup = true;
var editServantMode = false;
var editServant = -1;
var editQuestMode = false;
var editQuest = -1;
var debug = false;
var version = "1.72";

// actions to do when the page is loaded
$(document).ready(function() {
  // clear local storage if version update requires
  checkVersionAndClearStorage();

  // save which tab was active
  $('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
    localStorage.setItem('activeTab', $(e.target).attr('href'));
  });
  var activeTab = localStorage.getItem('activeTab');
  if(activeTab){
      $('.nav-tabs a[href="' + activeTab + '"]').tab('show');
  }

  console.log("servant: " + servant);

  initializeBattleSim();
  initializeBattleParty();
  initializeCommonNodes();
  updateSavedServantsDisplay();
  updateSavedQuestsDisplay();
  updateServantToggles();
  updateQuestPartyToggles();
  updateQuestToggles();
  initializeCraftEssences();
  loadGist(document.getElementById("READMEGist"),"gakiloroth/83c901dc2a5bf767cd873ccda406b042");
  startup = false;
});

function checkVersionAndClearStorage(){
  let localVersion = localStorage.getItem("version") || "";
  if(localVersion.localeCompare(version) !== 0){
    console.log("New version detected - clearing stored information.")
    localStorage.removeItem("savedServants");
    localStorage.removeItem("savedQuests");
    localStorage.removeItem("party");
    localStorage.removeItem("servant");
    localStorage.removeItem("quest");
    localStorage.removeItem("activeTab");

    localStorage.setItem("version", version);
    location.reload();
  }
}

// avoid using document.write in gist embed
function loadGist(element, gistId) {
    var callbackName = "gist_callback";
    window[callbackName] = function (gistData) {
        delete window[callbackName];
        var html = '<link rel="stylesheet" href="' + (gistData.stylesheet) + '"></link>';
        html += gistData.div;
        element.innerHTML = html;
        script.parentNode.removeChild(script);
    };
    var script = document.createElement("script");
    script.setAttribute("src", "https://gist.github.com/" + gistId + ".json?callback=" + callbackName);
    document.body.appendChild(script);
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
      servantID = servantList[i].id;
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

      // load passive values
      $('#NPGainUpPercentage').val(Number(servantList[i].npGainUpPercentage));
      $('#NPDamageUp').val(Number(servantList[i].npDamageUp));
      $('#BusterUpPercentage').val(Number(servantList[i].busterUpPercentage));
      $('#QuickUpPercentage').val(Number(servantList[i].quickUpPercentage));
      $('#ArtsUpPercentage').val(Number(servantList[i].artsUpPercentage));
      $('#FlatAttackUp').val(Number(servantList[i].flatAttackUp));

      $('#' + servantNPType).prop("checked", true).click();

      // on change updates
      $('#maxGrailed').on('change', function(){
        let nonBaseAttack = 0;
        if ($(this).is(':checked')) {
          if($('#maxFou').is(':checked')){
            nonBaseAttack += 1000;
          }
          // add another 1000 for total 2000 if maxGoldFou is also checked
          if($('#maxGoldFou').is(':checked')){
            nonBaseAttack += 1000;
          }
          $('#attack').val( Number(attk[2]) + nonBaseAttack);
        }
        else {
          if($('#maxFou').is(':checked')){
            nonBaseAttack += 1000;
          }
          // add another 1000 for total 2000 if maxGoldFou is also checked
          if($('#maxGoldFou').is(':checked')){
            nonBaseAttack += 1000;
          }
          $('#attack').val( Number(attk[1]) + nonBaseAttack);
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
for(let i = 1; i <= QUEST_ENEMY_COUNT; i++){
  $('#enemy'+ i + 'Class').on('change', function(){
    let enemyclass = getClassValue($('#enemy'+ i + 'Class').val());
    console.log("enemy" + i + "class: " + enemyclass);
    $('#enemy' + i + 'NPGainMod').val(EnemyServerMod[enemyclass]);
  });
}

// on CE level change
$('#ceLevel').on('change', function(){
  // get current ce data from ceID
  var currCELvl = $('#ceLevel').val();
  var currCE = CEList[ceID - 1];

  $('#ceLvlDisplay').empty().html('<b>CE Lvl</b>: '  + currCELvl + ' |');
  $('#ceAttackDisplay').empty().html('<b>CE Attack:</b> ' + currCE.atkGrowth[currCELvl - 1]);
});

// add CE effects and stats to form
document.getElementById('addCraftEssence').onclick = function(){
  // get curr ce data
  var currCE = CEList[ceID - 1];
  var ceNonMLB = currCE.nonMLB;
  var ceMLB = currCE.MLB;
  var ceLevel = $('#ceLevel').val();

  // store current field values
  var currNPGainUpPercentage = $('#NPGainUpPercentage').val();
  var currNPDamageUp = $('#NPDamageUp').val();
  var currBusterUpPercentage = $('#BusterUpPercentage').val();
  var currQuickUpPercentage = $('#QuickUpPercentage').val();
  var currArtsUpPercentage = $('#ArtsUpPercentage').val();
  var currFlatAttackUp = $('#FlatAttackUp').val();
  var servantTotalAttack = $('#attack').val();

  // add attack from total attack
  $('#attack').val(Number(servantTotalAttack) + Number(currCE.atkGrowth[Number(ceLevel) - 1]));

  if($("#ceMLB").is(':checked')){
    // add MLB CE effects
    $('#NPGainUpPercentage').val(Number(currNPGainUpPercentage) + Number(ceMLB.npGainUpPercentage));
    $('#NPDamageUp').val(Number(currNPDamageUp) + Number(ceMLB.npDamageUp));
    $('#BusterUpPercentage').val(Number(currBusterUpPercentage) + Number(ceMLB.busterUpPercentage));
    $('#QuickUpPercentage').val(Number(currQuickUpPercentage) + Number(ceMLB.quickUpPercentage));
    $('#ArtsUpPercentage').val(Number(currArtsUpPercentage) + Number(ceMLB.artsUpPercentage));
    $('#FlatAttackUp').val(Number(currFlatAttackUp) + Number(ceMLB.flatAttackUp));
  } else {
    // add non MLB CE effects
    $('#NPGainUpPercentage').val(Number(currNPGainUpPercentage) + Number(ceNonMLB.npGainUpPercentage));
    $('#NPDamageUp').val(Number(currNPDamageUp) + Number(ceNonMLB.npDamageUp));
    $('#BusterUpPercentage').val(Number(currBusterUpPercentage) + Number(ceNonMLB.busterUpPercentage));
    $('#QuickUpPercentage').val(Number(currQuickUpPercentage) + Number(ceNonMLB.quickUpPercentage));
    $('#ArtsUpPercentage').val(Number(currArtsUpPercentage) + Number(ceNonMLB.artsUpPercentage));
    $('#FlatAttackUp').val(Number(currFlatAttackUp) + Number(ceNonMLB.flatAttackUp));
  }
};

// remove CE effects and stats from form
document.getElementById('removeCraftEssence').onclick = function(){
  // get curr ce data
  var currCE = CEList[ceID - 1];
  var ceNonMLB = currCE.nonMLB;
  var ceMLB = currCE.MLB;
  var ceLevel = $('#ceLevel').val();

  // store current field values
  var currNPGainUpPercentage = $('#NPGainUpPercentage').val();
  var currNPDamageUp = $('#NPDamageUp').val();
  var currBusterUpPercentage = $('#BusterUpPercentage').val();
  var currQuickUpPercentage = $('#QuickUpPercentage').val();
  var currArtsUpPercentage = $('#ArtsUpPercentage').val();
  var currFlatAttackUp = $('#FlatAttackUp').val();
  var servantTotalAttack = $('#attack').val();

  // remove attack from total attack
  $('#attack').val(Number(servantTotalAttack) - Number(currCE.atkGrowth[Number(ceLevel) - 1]));

  if($("#ceMLB").is(':checked')){
    // add MLB CE effects
    $('#NPGainUpPercentage').val(Number(currNPGainUpPercentage) - Number(ceMLB.npGainUpPercentage));
    $('#NPDamageUp').val(Number(currNPDamageUp) - Number(ceMLB.npDamageUp));
    $('#BusterUpPercentage').val(Number(currBusterUpPercentage) - Number(ceMLB.busterUpPercentage));
    $('#QuickUpPercentage').val(Number(currQuickUpPercentage) - Number(ceMLB.quickUpPercentage));
    $('#ArtsUpPercentage').val(Number(currArtsUpPercentage) - Number(ceMLB.artsUpPercentage));
    $('#FlatAttackUp').val(Number(currFlatAttackUp) - Number(ceMLB.flatAttackUp));
  } else {
    // add non MLB CE effects
    $('#NPGainUpPercentage').val(Number(currNPGainUpPercentage) - Number(ceNonMLB.npGainUpPercentage));
    $('#NPDamageUp').val(Number(currNPDamageUp) - Number(ceNonMLB.npDamageUp));
    $('#BusterUpPercentage').val(Number(currBusterUpPercentage) - Number(ceNonMLB.busterUpPercentage));
    $('#QuickUpPercentage').val(Number(currQuickUpPercentage) - Number(ceNonMLB.quickUpPercentage));
    $('#ArtsUpPercentage').val(Number(currArtsUpPercentage) - Number(ceNonMLB.artsUpPercentage));
    $('#FlatAttackUp').val(Number(currFlatAttackUp) - Number(ceNonMLB.flatAttackUp));
  }
};

// reset servant form
document.getElementById('resetServantForm').onclick = function(){
  resetServant();
  $('#inputServant').empty().append($('<option></option>').val('Select Servant').html('Select Servant'));

  // reset form validation display
  var forms = document.getElementsByClassName('needs-validation-servant');
  Array.prototype.filter.call(forms, function(form) {
    form.classList.remove('was-validated');
  });
};

// reset quest form
document.getElementById('resetQuestForm').onclick = function(){
  resetQuest();

  // reset form validation display
  var forms = document.getElementsByClassName('needs-validation-quest');
  Array.prototype.filter.call(forms, function(form) {
    form.classList.remove('was-validated');
  });
};

// filter common nodes list
$(document).ready(function(){
  $("#nodeListSearch").on("keyup", function() {
    var value = $(this).val().toLowerCase();
    $("#commonNodesList li").filter(function() {
      $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1)
    });
  });
});

// filter craft essences list
$(document).ready(function(){
  $("#ceListSearch").on("keyup", function() {
    var value = $(this).val().toLowerCase();
    $("#ceList li").filter(function() {
      $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1)
    });
  });
});

// delete all party members
document.getElementById('deleteAllPartyMembers').onclick = function(){
  if(debug){
    alert("deleteAllPartyMembers");
  }
  party = [];
  localStorage.setItem("party", JSON.stringify(party));

  updateSavedServantsDisplay();
  updateServantToggles();
  initializeBattleSim();
  initializeBattleParty();
  updateQuestPartyToggles();
};

// delete all saved servants
document.getElementById('deleteAllServants').onclick = function(){
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
    updateQuestPartyToggles();

    //reload is necessary to show battle sim as needing servants
    location.reload();
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
  addServant();
};

// add quest data into array
document.getElementById('addQuest').onclick = function(){
  addQuest();
};

function updateNPTime(){
  $('#npTotalTimeDisplay').empty().html('<b>Total NP Time  <img src="images/light-alert.png" width="20" data-toggle="tooltip" data-html="true" title="These are rough estimates and are at 2x speed -  estimates and are at 2x speed - use as a general guide. Hopefully I\'ll find a more accurate way of measuring NP times in the future."></img> : '
  + questNPTotalTime.toFixed(2) + 's &nbsp;&nbsp;</b><button type="button" id="resetTotalNPTime"' + 'class="btn btn-outline-danger btn-sm">Reset</button></p>');
  attachNPTimeReset();
}

function attachNPTimeReset(){
  document.getElementById('resetTotalNPTime').onclick = function(){
    questNPTotalTime = 0;
    $('#npTotalTimeDisplay').empty().html('<b>Total NP Time  <img src="images/light-alert.png" width="20" data-toggle="tooltip" data-html="true" title="These are rough estimates and are at 2x speed - use as a general guide. Hopefully I\'ll find a more accurate way of measuring NP times in the future."></img> : '
    + '0s &nbsp;&nbsp;</b><button type="button" id="resetTotalNPTime" class="btn btn-outline-danger btn-sm">Reset</button></p>');
  };
}

// calculate NP Damage for Wave 1
document.getElementById('submitBattleForm1').onclick = async function(){
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

    // calculate np refund - pass in hp1, hp2, hp3, enemyMod1, enemyMod2, enemyMod3, damage1, damage2, damage3, cardBuff, npGainUp,
    // enemySpecificCardDebuffs, np hit counts, np hit dist
    let currNPHits = savedServants[servant].nphits
    let currNPHitDist = await fetchNPRefund(currNPHits);
    let refunded = calculateNPRefund(questEnemyHP[0], questEnemyHP[3], questEnemyHP[6], curr.enemy1npgainmod, curr.enemy2npgainmod, curr.enemy3npgainmod,
     result[0], result[3], result[6], result[9], result[10], result[11], currNPHits, currNPHitDist)

    questNPTotalTime += servantList[savedServants[servant].id - 1].nptime;
    $('#npRefundDisplay1').empty().html('<b>Wave 1: Min. NP Refunded: </b>' + refunded.toFixed(2) + '%');
    $('#npRefundDisplay2').empty().html('<b>Wave 2: Last NP Refund from last wave: </b>' + refunded.toFixed(2) + '%<b> | Min. NP Refunded: </b> N/A</b>');
    updateNPTime();

    questRefunds[0] = refunded.toFixed(2);

    // update enemy hp in Array
    for(let i = 0; i < QUEST_ENEMY_COUNT; i++){
      questEnemyHP[i] -= result[i];
    }

    // reset form validation display
    Array.prototype.filter.call(forms, function(form) {
      form.classList.remove('was-validated');
    });
  }
};

// reset battle sim wave 1
document.getElementById('resetHP1').onclick = function(){
  resetBattleSim(1);
}

// reset battle sim form wave 1
document.getElementById('resetBattleForm1').onclick = function(){
  resetBattleForm(1);

  // reset form validation display
  var forms = document.getElementsByClassName('needs-validation-battle1');
  Array.prototype.filter.call(forms, function(form) {
    form.classList.remove('was-validated');
  });
}

// calculate NP Damage for Wave 2
document.getElementById('submitBattleForm2').onclick = async function(){
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
    let waveOffset = 9;

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
    let currNPHits = savedServants[servant].nphits
    let currNPHitDist = await fetchNPRefund(currNPHits);
    let refunded = calculateNPRefund(questEnemyHP[9], questEnemyHP[12], questEnemyHP[15], curr.enemy4npgainmod, curr.enemy5npgainmod, curr.enemy6npgainmod,
     result[0], result[3], result[6], result[9], result[10], result[11], currNPHits, currNPHitDist);

    questNPTotalTime += servantList[savedServants[servant].id - 1].nptime;
    if(typeof questRefunds[0] === "undefined"){
      $('#npRefundDisplay2').empty().html('<b>Wave 2: Last NP Refund from last wave: </b> N/A<b> | Min. NP Refunded: </b>' + refunded.toFixed(2) + '% </b>')
    }
    else{
      $('#npRefundDisplay2').empty().html('<b>Wave 2: Last NP Refund from last wave: </b>' + questRefunds[0] + '%<b> | Min. NP Refunded: </b>' + refunded.toFixed(2) + '% </b>');
    }
    $('#npRefundDisplay3').empty().html('<b>Wave 3: Last NP Refund from last wave: </b>' + refunded.toFixed(2) + '%<b> | Min. NP Refunded: </b> N/A</b>');
    updateNPTime();

    questRefunds[1] = refunded.toFixed(2);

    // update enemy hp in Array
    for(let i = 0; i < QUEST_ENEMY_COUNT; i++){
      questEnemyHP[i + waveOffset] -= result[i];
    }

    // reset form validation display
    Array.prototype.filter.call(forms, function(form) {
      form.classList.remove('was-validated');
    });
  }
};

// reset battle sim wave 2
document.getElementById('resetHP2').onclick = function(){
  resetBattleSim(2);

}

// reset battle sim form wave 2
document.getElementById('resetBattleForm2').onclick = function(){
  resetBattleForm(2);

  // reset form validation display
  var forms = document.getElementsByClassName('needs-validation-battle2');
  Array.prototype.filter.call(forms, function(form) {
    form.classList.remove('was-validated');
  });
}

// calculate NP Damage for Wave 3
document.getElementById('submitBattleForm3').onclick = async function(){
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
    let waveOffset = 18;

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
    let currNPHits = savedServants[servant].nphits
    let currNPHitDist = await fetchNPRefund(currNPHits);
    let refunded = calculateNPRefund(questEnemyHP[18], questEnemyHP[21], questEnemyHP[24], curr.enemy7npgainmod, curr.enemy8npgainmod, curr.enemy9npgainmod,
     result[0], result[3], result[6], result[9], result[10], result[11], currNPHits, currNPHitDist);

    questNPTotalTime += servantList[savedServants[servant].id - 1].nptime;
    if(typeof questRefunds[1] === "undefined"){
      $('#npRefundDisplay3').empty().html('<b>Wave 2: Last NP Refund from last wave: </b> N/A<b> | Min. NP Refunded: </b>' + refunded.toFixed(2) + '% </b>')
    }
    else{
      $('#npRefundDisplay3').empty().html('<b>Wave 3: Last NP Refund from last wave: </b>' + questRefunds[1] + '%<b> | Min. NP Refunded: </b>' + refunded.toFixed(2) + '% </b>');
    }
    updateNPTime();

    questRefunds[2] = refunded.toFixed(2);

    // update enemy hp
    for(let i = 0; i < QUEST_ENEMY_COUNT; i++){
      questEnemyHP[i + waveOffset] -= result[i];
    }

    // reset form validation display
    Array.prototype.filter.call(forms, function(form) {
      form.classList.remove('was-validated');
    });
  }
};

// reset battle sim wave 3
document.getElementById('resetHP3').onclick = function(){
  resetBattleSim(3);
}

// reset battle sim form wave 3
document.getElementById('resetBattleForm3').onclick = function(){
  resetBattleForm(3);

  // reset form validation display
  var forms = document.getElementsByClassName('needs-validation-battle3');
  Array.prototype.filter.call(forms, function(form) {
    form.classList.remove('was-validated');
  });
}

// update saved servant display
function updateSavedServantsDisplay(){
  $('#savedServants1').empty();
  $('#savedServants2').empty();
  for(let i = 0; i < savedServants.length; i++){
    let curr = savedServants[i];
    let busterstring = "";
    let artsstring = "";
    let quickstring = "";
    console.log("busterup: " + curr.busterup);
    if(parseFloat(curr.busterup) !== 0){
      console.log("busterup isnt 0");
      busterstring = 'Buster Up: ' + curr.busterup + '%';
    }
    if(parseFloat(curr.artsup) !== 0){
      artsstring = ' Arts Up: ' + curr.artsup + '%';
    }
    if(parseFloat(curr.quickup) !== 0){
      quickstring = ' Quick Up: ' + curr.quickup + '%';
    }

    $('#savedServants1').append($('<li class="list-group-item">ID: ' + curr.id + " <b>" + curr.name + '</b> | Nickname: ' +
     curr.nickname + ' | Craft Essence: ' + curr.craftessence +  ' | Power Mod: ' + curr.powermod + '% | NP Gain Up: ' + curr.npgainup + '%<br>' + 'NP Level: ' +
     curr.nplevel + ' | Attack: ' + curr.attack + ' | NP Buff: ' + curr.npdamageup + '%' +
     ' | Attr. : ' + curr.attribute + '<br> ' + busterstring + artsstring + quickstring +
     '<span class="float-right"><button type="button" id=' + "useServant" + i +
     ' class="btn btn-outline-success btn-sm" data-toggle="button" aria-pressed="false" autocomplete="false">In Party</button> ' +
     '<button type="button" id=' + "editServant" + i +
     ' class="btn btn-outline-warning btn-sm">Edit</button> ' +
     '<button type="button" id=' + "deleteServant" + i +
     ' class="btn btn-outline-danger btn-sm">Delete</button></span>' + '</li>'));


     $('#savedServants2').append($('<li class="list-group-item">ID: ' + curr.id + " <b>" + curr.name + '</b> | Nickname: ' +
      curr.nickname + ' | Craft Essence: ' + curr.craftessence +  ' | Power Mod: ' + curr.powermod + '%<br>' + 'NP Level: ' +
      curr.nplevel + ' | Attack: ' + curr.attack + ' | NP Buff: ' + curr.npdamageup + '%' +
      ' | Attr. : ' + curr.attribute + " | " +  busterstring + artsstring + quickstring +'</li>'));

    // link up delete button
    document.getElementById("deleteServant" + i).addEventListener("click", function(){
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
    });

    // link up servant select button
    document.getElementById("useServant" + i).addEventListener("click", function(){
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
        updateQuestPartyToggles();
      }
      // add servant to party
      else{
        if(party.length == PARTY_MAX_LIMIT){
          alert("You can only have " + PARTY_MAX_LIMIT + " servants in a party.");

          document.getElementById("useServant" + i).setAttribute('aria-pressed', false);
          return;
        }

        party.unshift(i);
        localStorage.setItem("party", JSON.stringify(party));

        // test update without reload
        initializeBattleSim();
        initializeBattleParty();
        updateQuestPartyToggles();
      }
    });

    // link up edit servant button
    document.getElementById("editServant" + i).addEventListener("click", function(){
      if(debug){
        alert("editservant"+ i);
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

      // change display to servant
      $('#inputClass').val(savedServants[i].class);

      // load servant options
      loadServantOptions();
      servantName = savedServants[i].name;
      servantID = savedServants[i].id;
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
      $('#attack').val(savedServants[i].attack);
      $('#inputNPLevel').val(savedServants[i].nplevel);
      $('#NPDamagePercent').val(savedServants[i].npdamagepercent);
      $('#BusterUpPercentage').val(savedServants[i].busterup);
      $('#ArtsUpPercentage').val(savedServants[i].artsup);
      $('#QuickUpPercentage').val(savedServants[i].quickup);
      $('#AttackUpPercentage').val(savedServants[i].attackup);
      $('#FlatAttackUp').val(savedServants[i].flatattackup);
      $('#NPDamageUp').val(savedServants[i].npdamageup);
      servantNPGain = savedServants[i].npgain;
      loadNPPercentages(servantID);
      $('#maxGrailed').prop('disabled', false);
      $('#maxFou').prop('disabled', false);
      if(savedServants[i].maxgrailed == 1){
        $('#maxGrailed').prop('checked', true);
      }
      if(savedServants[i].maxfou == 1){
        $('#maxFou').prop('checked', true);

        // if fou is chosen, enable gold fou button
        $('#maxGoldFou').prop('disabled', false);
      } else{ // disable max gold fou button - can be enabled if swapping between editing servants
        $('#maxGoldFou').prop('disabled', true);
        $('#maxGoldFou').prop('checked', false);
      }
      if(savedServants[i].maxgoldfou == 1){
        $('#maxGoldFou').prop('checked', true);
      }

      // on change updates for max grailed - servant specific so needs to be loaded
      let attk = servantList[savedServants[i].id - 1].attack.split(',');
      $('#maxGrailed').on('change', function(){
        if ($(this).is(':checked')) {
          let nonBaseAttack = 0;

          if($('#maxFou').is(':checked')){
            nonBaseAttack += 1000;
          }
          // add another 1000 for total 2000 if maxGoldFou is also checked
          if($('#maxGoldFou').is(':checked')){
            nonBaseAttack += 1000;
          }
          $('#attack').val( Number(attk[2]) + nonBaseAttack);
        }
        else {
          let nonBaseAttack = 0;

          if($('#maxFou').is(':checked')){
            nonBaseAttack += 1000;
          }
          // add another 1000 for total 2000 if maxGoldFou is also checked
          if($('#maxGoldFou').is(':checked')){
            nonBaseAttack += 1000;
          }
          $('#attack').val( Number(attk[1]) + nonBaseAttack);
        }
      });

      // load current CE id, if CE was chosen (id 0 if not)
      ceID = savedServants[i].craftessenceid;
      if(ceID != 0){
        let servantCE = CEList[ceID - 1];

        // load CE fields
        $('#ceNameDisplay').empty().html('<b>CE Name:</b> ' + savedServants[i].craftessence + ' |');
        $('#ceLvlDisplay').empty().html('<b>CE Lvl</b>:' +  savedServants[i].craftessencelevel + ' |');
        $('#ceAttackDisplay').empty().html('<b>CE Attack:</b> ' + savedServants[i].craftessenceatk);

        $('#ceLevel').empty();
        for(let j = 1; j <= servantCE.maxLvl; j++){
          $('#ceLevel').append($('<option></option>').val(j).html(j));
        }
        $('#ceLevel').val(savedServants[i].craftessencelevel);

        if(savedServants[i].craftessencemlb == 1){
          $('#ceMLB').prop('checked', true);
        }

        // enable use CE button
        $('#addCraftEssence').prop('disabled', false);
      } else{
        //reset CE fields
        $('#addCraftEssence').prop('disabled', true);
        $('#ceLevel').empty().append($('<option>Choose a CE first.</option>'));
        $('#ceNameDisplay').empty().html('<b>CE Name:</b>  N/A | ');
        $('#ceLvlDisplay').empty().html('<b>CE Lvl</b>: N/A | ');
        $('#ceAttackDisplay').empty().html('<b>CE Attack:</b>  N/A ');
      }

      // load np type button
      let servantNPType = savedServants[i].nptype;
      $('#' + servantNPType).prop('checked',true).click();

      // load fields
      $('#NPGainUpPercentage').val(savedServants[i].npgainup);
      servantNPHits = savedServants[i].nphits;
      $('#PowerMod').val(savedServants[i].powermod);
      $('#inputAttribute').val(savedServants[i].attribute);
      $('#inputNickname').val(savedServants[i].nickname);
      $('#NPDamageUp').val(savedServants[i].npdamageup);

      // change add servant to save servant
      $('#addServant').prop('disabled', false);
      $('#addServant').text('Save Servant');
      $('#addServant').attr("id","saveEditedServant");
      document.getElementById("saveEditedServant").onclick = function() { saveEditedServant(i); };
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
    document.getElementById("useQuest" + i).addEventListener("click", function(){
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
    document.getElementById("editQuest" + i).addEventListener("click", function(){
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

      for(let i = 1; i <= QUEST_ENEMY_COUNT; i++){
        $('#enemy' + i + 'HP').val(curr['enemy' + i + 'hp']);
        $('#enemy' + i + 'Class').val(curr['enemy' + i + 'class']);
        $('#enemy' + i + 'Attribute').val(curr['enemy' + i + 'attribute']);
        $('#enemy' + i + 'NPGainMod').val(EnemyServerMod[getClassValue(curr['enemy' + i + 'class'])]);
      }

      //change add servant to save servant
      $('#addQuest').prop('disabled', false);
      $('#addQuest').text('Save Quest');
      $('#addQuest').attr("id","saveEditedQuest");
      document.getElementById("saveEditedQuest").onclick = function() { saveEditedQuest(i); };
    });
  }
}

// make sure party buttons are toggled correctly
function updateServantToggles(){
  for(let i = 0; i < party.length; i++){
    $('#useServant' + party[i]).addClass('active');
    $('#useServant' + party[i]).attr('aria-pressed', true);
  }
}

// make sure quest buttons are toggled correctly
function updateQuestToggles(){
  $('#useQuest' + quest).addClass('active');
  $('#useQuest' + quest).attr('aria-pressed', true);
}

// make sure quest party toggles are toggled
function updateQuestPartyToggles(){
  $('#battlePartySelect' + party.indexOf(servant)).addClass('active');
  $('#battlePartySelect' + party.indexOf(servant)).attr('aria-pressed', true);
}

// initialize battle sim
function initializeBattleSim(){
  if(savedQuests.length === 0 || savedServants.length === 0 || quest.length === 0 || quest === ""){
    console.log("savedquestlength: " + savedQuests.length + " savedservantlength: " + savedServants.length +
      " quest: " + quest);
    return;
  }

  // initialize quest related data
  console.log("quest: " + quest + " " + JSON.stringify(savedServants));
  let currQuest = savedQuests[quest];
  $('#questNameDisplay').empty().html('<b>Current Quest: </b>' + currQuest.name);

  for(let i = 1; i <= QUEST_ENEMY_COUNT; i++){
      document.getElementById('questEnemy' + i + 'Class').src = "images/" + currQuest['enemy' + i + 'class'].toLowerCase().replace(/\s/g, '') + ".png";
      $('#questEnemy' + i + 'HP').empty().html('HP: ' + currQuest['enemy' + i + 'hp']);
      $('#questEnemy' + i + 'NPDamage').empty().html('NP Damage: 0 / 0 / 0');
      $('#questEnemy' + i + 'HPLeft').empty().html('HP Left: ' + currQuest['enemy' + i + 'hp'] + " / " + currQuest['enemy' + i + 'hp'] + " / " + currQuest['enemy' + i + 'hp']);
  }

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

  // initialize servant related data
  console.log("servant: " + servant + " " + JSON.stringify(servant));
  console.log("party: " + party.length + " " + JSON.stringify(party));

  if(party.length === 0 || typeof servant === "undefined"){
    console.log("partylength: " + party.length + " servantlength: " + servant.length)
    return;
  }

  let currServant = savedServants[servant];
  // if there is a servant selected
  if(!(typeof currServant === "undefined")){
    $('#servantBattleDisplay').empty().html('<b>Current Servant: </b>' + currServant.name + ' NP ' + currServant.nplevel);
  }
}

// initialize the battle party
function initializeBattleParty(){
  $('#battlePartyDisplay').empty();

  for(let i = 0; i < party.length; i++){
    let curr = savedServants[party[i]];

    $('#battlePartyDisplay').append($('<li class="list-group-item">ID:' + curr.id + ' <b>' + curr.name + '</b>' +
     ' | CE: ' + curr.craftessence + ' | NP Lvl: ' + curr.nplevel + ' | Nickname: ' + curr.nickname +
     '<span class="float-right"><button type="button" id=' + "battlePartySelect" + i +
     ' class="btn btn-outline-success btn-sm" data-toggle="button" aria-pressed="false"' +
     ' autocomplete="false">Select</button></span>' + '</li>'));

    // link up delete button
    document.getElementById("battlePartySelect" + i).addEventListener("click", function(){
      if(debug){
        alert("battlepartyselect" + i);
      }
      if(servant === party[i]){
        // deselect
        servant = "";
        localStorage.setItem("servant", JSON.stringify(servant));

        $('#servantBattleDisplay').empty().html('<b>Current Servant: </b>');
      }
      else{
        // add and shift party
        servant = party[i];
        localStorage.setItem("servant", JSON.stringify(servant));
        initializeBattleParty();
        updateQuestPartyToggles();

        let currServant = savedServants[party[i]];
        $('#servantBattleDisplay').empty().html('<b>Current Servant: </b>' + currServant.name + ' NP ' + currServant.nplevel);
      }
    });
  }
}

// initialize common nodes
function initializeCommonNodes(){
  for(let i = 0; i < Nodes.length; i++){
    let currNode = Nodes[i];
    $('#commonNodesList').append('<li class="list-group-item">' + currNode.name +
    '<span class="float-right"><button type="button" id=' + "loadNode" + currNode.id +
    ' class="btn btn-outline-success btn-sm">Load Node</button></span></li></span>');

    // hook up button
    document.getElementById("loadNode" + currNode.id).addEventListener("click", function(){
      if(debug){
        alert("load node " + currNode.id);
      }

      // fill in quest values
      if(currNode['name'].indexOf('{') > -1){
        $('#QuestName').val(currNode['name'].substr(0, currNode['name'].indexOf('{')));
      } else{
        $('#QuestName').val(currNode['name']);
      }
      for(let j = 1; j <= 9; j++){
        $('#enemy'+ j +'HP').val(currNode['enemy'+ j +'HP']);
        $('#enemy'+ j +'Class').val(currNode['enemy'+ j +'Class']).change();
        $('#enemy'+ j +'Attribute').val(currNode['enemy'+ j +'Attribute']);
      }

    });
  }
}

// initialize craft essences
function initializeCraftEssences(){
  for(let i = 0; i < CEList.length; i++){
    let currCE = CEList[i];
    $('#ceList').append('<li class="list-group-item" loading="lazy">' + "ID: " + currCE.id + " | " + '<img src=\"' + currCE.imgURL + '\" width=\"40\" height=\"40\"> '
    + currCE.name + " | Rarity: " + currCE.rarity
    + '<span class="float-right"><button type="button" id=loadCE' + currCE.id + ' class="btn btn-outline-success btn-sm">Load CE</button></span></li></span>');

    // hook up button
    document.getElementById("loadCE" + currCE.id).addEventListener("click", function(){
      if(debug){
        alert("load CE " + currCE.id);
      }

      // load CE data - but don't add into form yet
      $('#ceNameDisplay').empty().html('<b>CE Name:</b> ' + currCE.name + ' |');
      $('#ceLvlDisplay').empty().html('<b>CE Lvl</b>: 1 |');
      $('#ceAttackDisplay').empty().html('<b>CE Attack:</b> ' + currCE.atkGrowth[0]);

      // save the current CE id
      ceID = currCE.id;

      // enable use ce buttons
      $('#addCraftEssence').prop('disabled', false);

      // enable and fill in CE level selector
      $('#ceLevel').empty();
      for(let i = 1; i <= currCE.maxLvl; i++){
        $('#ceLevel').append($('<option></option>').val(i).html(i));
      }
    });
  }
}

// reset battle sim wave
function resetBattleSim(wavenumber){
  // reset wave's hp remaining
  let currQuest = savedQuests[quest];

  if(wavenumber === 1){
    questRefunds[0] = undefined;

    $('#npRefundDisplay1').empty().html('<b>Wave 1: Min. NP Refunded: </b>N/A');

    if(typeof questRefunds[1] === "undefined"){
      $('#npRefundDisplay2').empty().html('<b>Wave 2: Last NP Refund from last wave: </b> N/A <b>| Min. NP Refunded: </b>N/A');
    }
    else{
      $('#npRefundDisplay2').empty().html('<b>Wave 2: Last NP Refund from last wave: </b> N/A <b>| Min. NP Refunded: </b>' + questRefunds[1] + '%');
    }

    $('#questEnemy1HPLeft').empty().html('HP Left: ' + currQuest.enemy1hp + " / " + currQuest.enemy1hp + " / " + currQuest.enemy1hp);
    $('#questEnemy2HPLeft').empty().html('HP Left: ' + currQuest.enemy2hp + " / " + currQuest.enemy2hp + " / " + currQuest.enemy2hp);
    $('#questEnemy3HPLeft').empty().html('HP Left: ' + currQuest.enemy3hp + " / " + currQuest.enemy3hp + " / " + currQuest.enemy3hp);
    $('#questEnemy1NPDamage').empty().html('NP Damage: 0 / 0 / 0');
    $('#questEnemy2NPDamage').empty().html('NP Damage: 0 / 0 / 0');
    $('#questEnemy3NPDamage').empty().html('NP Damage: 0 / 0 / 0');

    for(let i = 0; i < 9; i++){
      if(i >= 0 && i <= 2){
        questEnemyHP[i] = currQuest.enemy1hp;
      }
      else if(i >= 3 && i <= 5){
        questEnemyHP[i] = currQuest.enemy2hp;
      }
      else if(i >= 6 && i <= 8){
        questEnemyHP[i] = currQuest.enemy3hp;
      }
    }
  }
  if(wavenumber === 2){
    questRefunds[1] = undefined;
    if(typeof questRefunds[0] === "undefined"){
      $('#npRefundDisplay2').empty().html('<b>Wave 2: Last NP Refund from last wave: </b> N/A <b>| Min. NP Refunded: </b>N/A');
    }
    else{
      $('#npRefundDisplay2').empty().html('<b>Wave 2: Last NP Refund from last wave: </b>' + questRefunds[0] + '% <b>| Min. NP Refunded: </b>N/A');
    }

    if(typeof questRefunds[1] === "undefined" && typeof questRefunds[2] === "undefined"){
      $('#npRefundDisplay3').empty().html('<b>Wave 3: Last NP Refund from last wave: </b> N/A <b>| Min. NP Refunded: </b>N/A');
    }
    else if(typeof questRefunds[1] === "undefined"){
      $('#npRefundDisplay3').empty().html('<b>Wave 3: Last NP Refund from last wave: </b> N/A <b>| Min. NP Refunded: </b>' + questRefunds[2] + '%');
    }
    else if(typeof questRefunds[2] === "undefined"){
      $('#npRefundDisplay3').empty().html('<b>Wave 3: Last NP Refund from last wave: </b>' + questRefunds[1] + '% <b>| Min. NP Refunded: </b>N/A');
    }
    else{
      $('#npRefundDisplay3').empty().html('<b>Wave 3: Last NP Refund from last wave: </b> N/A <b>| Min. NP Refunded: </b>N/A');
    }

    $('#questEnemy4HPLeft').empty().html('HP Left: ' + currQuest.enemy4hp + " / " + currQuest.enemy4hp + " / " + currQuest.enemy4hp);
    $('#questEnemy5HPLeft').empty().html('HP Left: ' + currQuest.enemy5hp + " / " + currQuest.enemy5hp + " / " + currQuest.enemy5hp);
    $('#questEnemy6HPLeft').empty().html('HP Left: ' + currQuest.enemy6hp + " / " + currQuest.enemy6hp + " / " + currQuest.enemy6hp);
    $('#questEnemy4NPDamage').empty().html('NP Damage: 0 / 0 / 0');
    $('#questEnemy5NPDamage').empty().html('NP Damage: 0 / 0 / 0');
    $('#questEnemy6NPDamage').empty().html('NP Damage: 0 / 0 / 0');

    for(let i = 9; i < 18; i++){
      if(i >= 9 && i <= 11){
        questEnemyHP[i] = currQuest.enemy4hp;
      }
      else if(i >= 12 && i <= 14){
        questEnemyHP[i] = currQuest.enemy5hp;
      }
      else if(i >= 15 && i <= 17){
        questEnemyHP[i] = currQuest.enemy6hp;
      }
    }
  }
  if(wavenumber === 3){
    questRefunds[2] = undefined;

    if(typeof questRefunds[1] === "undefined" && typeof questRefunds[2] === "undefined"){
      $('#npRefundDisplay3').empty().html('<b>Wave 3: Last NP Refund from last wave: </b> N/A <b>| Min. NP Refunded: </b>N/A');
    }
    else if(typeof questRefunds[1] === "undefined"){
      $('#npRefundDisplay3').empty().html('<b>Wave 3: Last NP Refund from last wave: </b> N/A <b>| Min. NP Refunded: </b>' + questRefunds[2] + '%');
    }
    else if(typeof questRefunds[2] === "undefined"){
      $('#npRefundDisplay3').empty().html('<b>Wave 3: Last NP Refund from last wave: </b>' + questRefunds[1] + '% <b>| Min. NP Refunded: </b>N/A');
    }
    else{
      $('#npRefundDisplay3').empty().html('<b>Wave 3: Last NP Refund from last wave: </b> N/A <b>| Min. NP Refunded: </b>N/A');
    }

    $('#npRefundDisplay3').empty().html('<b>Wave 3: Last NP Refund from last wave:  </b>' + questRefunds[1] +'% <b>| Min. NP Refunded: </b>N/A');
    $('#questEnemy7HPLeft').empty().html('HP Left: ' + currQuest.enemy7hp + " / " + currQuest.enemy7hp + " / " + currQuest.enemy7hp);
    $('#questEnemy8HPLeft').empty().html('HP Left: ' + currQuest.enemy8hp + " / " + currQuest.enemy8hp + " / " + currQuest.enemy8hp);
    $('#questEnemy9HPLeft').empty().html('HP Left: ' + currQuest.enemy9hp + " / " + currQuest.enemy9hp + " / " + currQuest.enemy9hp);
    $('#questEnemy7NPDamage').empty().html('NP Damage: 0 / 0 / 0');
    $('#questEnemy8NPDamage').empty().html('NP Damage: 0 / 0 / 0');
    $('#questEnemy9NPDamage').empty().html('NP Damage: 0 / 0 / 0');

    questRefunds[2] = undefined;

    for(let i = 18; i < 27; i++){
      if(i >= 18 && i <= 20){
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

  // party indexes incremented, match with servant
  if(typeof servant === "undefined" || servant.length == 0){
    //don't increment if first servant
  }
  else{
    servant++;
  }

  localStorage.setItem("party", JSON.stringify(party));
  localStorage.setItem("servant", JSON.stringify(servant));

  let ceName;
  let ceMLB;
  let ceLevel;
  let ceAtk;
  let maxGrailed = $("#maxGrailed").is(':checked') ? 1 : 0;
  let maxFou = $("#maxFou").is(':checked') ? 1 : 0;
  let maxGoldFou = $("#maxGoldFou").is(':checked') ? 1 : 0;

  //if no CE is chosen
  if(ceID == 0){
    ceName = "N/A";
    ceMLB = 0;
    ceLevel = 0;
    ceAtk = 0;
  } else {
    ceName = CEList[ceID-1].name;
    ceMLB = $("#ceMLB").is(':checked') ? 1 : 0;
    ceLevel = Number($('#ceLevel').val());
    ceAtk = CEList[ceID-1].atkGrowth[ceLevel-1];
  }

  savedServants.unshift({"id": servantID,"name": servantName,"class": $('#inputClass').val(),"attack": $('#attack').val(),"nplevel": $('#inputNPLevel').val(),
    "npdamagepercent": $('#NPDamagePercent').val(),"busterup": $('#BusterUpPercentage').val(),"artsup": $('#ArtsUpPercentage').val(),
    "quickup": $('#QuickUpPercentage').val(),"attackup": $('#AttackUpPercentage').val(),"flatattackup": $('#FlatAttackUp').val(),
    "npdamageup": $('#NPDamageUp').val(),"npgain": servantNPGain,"nptype": $('input[name=cardoptions]:checked').val(),"npgainup": $('#NPGainUpPercentage').val(),
    "nphits": servantNPHits,"powermod": $('#PowerMod').val(),"attribute": $('#inputAttribute').val(),"nickname": $('#inputNickname').val(),
    "maxgrailed":maxGrailed,"maxfou":maxFou,"maxgoldfou": maxGoldFou,
    "craftessence":ceName,"craftessencelevel": ceLevel,"craftessenceid": ceID,"craftessencemlb":ceMLB, "craftessenceatk": ceAtk});

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
    let ceName;
    let ceMLB;
    let ceLevel;
    let ceAtk;
    let maxGrailed = $("#maxGrailed").is(':checked') ? 1 : 0;
    let maxFou = $("#maxFou").is(':checked') ? 1 : 0;
    let maxGoldFou = $("#maxGoldFou").is(':checked') ? 1 : 0;

    //if no CE is chosen
    if(ceID == 0){
      ceName = "N/A";
      ceMLB = 0;
      ceLevel = 0;
      ceAtk = 0;
    } else {
      ceName = CEList[ceID-1].name;
      ceMLB = $("#ceMLB").is(':checked') ? 1 : 0;
      ceLevel = Number($('#ceLevel').val());
      ceAtk = CEList[ceID-1].atkGrowth[ceLevel-1];
    }

    savedServants[index]=({"id": servantID, "name": servantName,"class": $('#inputClass').val(),"attack": $('#attack').val(),"nplevel": $('#inputNPLevel').val(),
      "npdamagepercent": $('#NPDamagePercent').val(),"busterup": $('#BusterUpPercentage').val(),"artsup": $('#ArtsUpPercentage').val(),
      "quickup": $('#QuickUpPercentage').val(),"attackup": $('#AttackUpPercentage').val(),"flatattackup": $('#FlatAttackUp').val(),
      "npdamageup": $('#NPDamageUp').val(),"npgain": servantNPGain,"nptype": $('input[name=cardoptions]:checked').val(),"npgainup": $('#NPGainUpPercentage').val(),
      "nphits": servantNPHits,"powermod": $('#PowerMod').val(),"attribute": $('#inputAttribute').val(),"nickname": $('#inputNickname').val(),
      "maxgrailed":maxGrailed,"maxfou":maxFou,"maxgoldfou": maxGoldFou,
      "craftessence":ceName,"craftessencelevel": ceLevel,"craftessenceid": ceID,"craftessencemlb":ceMLB,"craftessenceatk":ceAtk});

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

function addQuest(){
  if(debug){
    alert("addquest");
  }
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
    if(quest.length !== 0){
      quest++;
    }
    localStorage.setItem("quest", JSON.stringify(quest));
    updateSavedQuestsDisplay();
    updateQuestToggles();
    Array.prototype.filter.call(forms, function(form) {
      form.classList.remove('was-validated');
    });

    // testing updates without reload
    //location.reload();
  }
}

function saveEditedQuest(index){
  if(debug){
    console.log("Saving edited quest: " + index);
  }

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

  if(valid){
    savedQuests[index] = ({"name": $('#QuestName').val(),
      "enemy1hp": $('#enemy1HP').val(),"enemy1class": $('#enemy1Class').val(),"enemy1attribute": $('#enemy1Attribute').val(),"enemy1npgainmod": $('#enemy1NPGainMod').val(),
      "enemy2hp": $('#enemy2HP').val(),"enemy2class": $('#enemy2Class').val(),"enemy2attribute": $('#enemy2Attribute').val(),"enemy2npgainmod": $('#enemy2NPGainMod').val(),
      "enemy3hp": $('#enemy3HP').val(),"enemy3class": $('#enemy3Class').val(),"enemy3attribute": $('#enemy3Attribute').val(),"enemy3npgainmod": $('#enemy3NPGainMod').val(),
      "enemy4hp": $('#enemy4HP').val(),"enemy4class": $('#enemy4Class').val(),"enemy4attribute": $('#enemy4Attribute').val(),"enemy4npgainmod": $('#enemy4NPGainMod').val(),
      "enemy5hp": $('#enemy5HP').val(),"enemy5class": $('#enemy5Class').val(),"enemy5attribute": $('#enemy5Attribute').val(),"enemy5npgainmod": $('#enemy5NPGainMod').val(),
      "enemy6hp": $('#enemy6HP').val(),"enemy6class": $('#enemy6Class').val(),"enemy6attribute": $('#enemy6Attribute').val(),"enemy6npgainmod": $('#enemy6NPGainMod').val(),
      "enemy7hp": $('#enemy7HP').val(),"enemy7class": $('#enemy7Class').val(),"enemy7attribute": $('#enemy7Attribute').val(),"enemy7npgainmod": $('#enemy7NPGainMod').val(),
      "enemy8hp": $('#enemy8HP').val(),"enemy8class": $('#enemy8Class').val(),"enemy8attribute": $('#enemy8Attribute').val(),"enemy8npgainmod": $('#enemy8NPGainMod').val(),
      "enemy9hp": $('#enemy9HP').val(),"enemy9class": $('#enemy9Class').val(),"enemy9attribute": $('#enemy9Attribute').val(),"enemy9npgainmod": $('#enemy9NPGainMod').val()
    });

    localStorage.setItem("savedQuests", JSON.stringify(savedQuests));
    updateSavedQuestsDisplay();
    updateQuestToggles();
    Array.prototype.filter.call(forms, function(form) {
      form.classList.remove('was-validated');
    });
  }

  location.reload();
  return;
}

// save quest data into array
function saveQuest(){
  if(savedQuests.length > 600){
    return false;
  }

  savedQuests.unshift({"name": $('#QuestName').val(),
    "enemy1hp": $('#enemy1HP').val(),"enemy1class": $('#enemy1Class').val(),"enemy1attribute": $('#enemy1Attribute').val(),"enemy1npgainmod": $('#enemy1NPGainMod').val(),
    "enemy2hp": $('#enemy2HP').val(),"enemy2class": $('#enemy2Class').val(),"enemy2attribute": $('#enemy2Attribute').val(),"enemy2npgainmod": $('#enemy2NPGainMod').val(),
    "enemy3hp": $('#enemy3HP').val(),"enemy3class": $('#enemy3Class').val(),"enemy3attribute": $('#enemy3Attribute').val(),"enemy3npgainmod": $('#enemy3NPGainMod').val(),
    "enemy4hp": $('#enemy4HP').val(),"enemy4class": $('#enemy4Class').val(),"enemy4attribute": $('#enemy4Attribute').val(),"enemy4npgainmod": $('#enemy4NPGainMod').val(),
    "enemy5hp": $('#enemy5HP').val(),"enemy5class": $('#enemy5Class').val(),"enemy5attribute": $('#enemy5Attribute').val(),"enemy5npgainmod": $('#enemy5NPGainMod').val(),
    "enemy6hp": $('#enemy6HP').val(),"enemy6class": $('#enemy6Class').val(),"enemy6attribute": $('#enemy6Attribute').val(),"enemy6npgainmod": $('#enemy6NPGainMod').val(),
    "enemy7hp": $('#enemy7HP').val(),"enemy7class": $('#enemy7Class').val(),"enemy7attribute": $('#enemy7Attribute').val(),"enemy7npgainmod": $('#enemy7NPGainMod').val(),
    "enemy8hp": $('#enemy8HP').val(),"enemy8class": $('#enemy8Class').val(),"enemy8attribute": $('#enemy8Attribute').val(),"enemy8npgainmod": $('#enemy8NPGainMod').val(),
    "enemy9hp": $('#enemy9HP').val(),"enemy9class": $('#enemy9Class').val(),"enemy9attribute": $('#enemy9Attribute').val(),"enemy9npgainmod": $('#enemy9NPGainMod').val()
  });
  localStorage.setItem("savedQuests", JSON.stringify(savedQuests));
  return true;
}

// delete servants and save
function deleteAllServants(){
  servant = "";
  savedServants = [];
  localStorage.setItem("servant", JSON.stringify(servant));
  localStorage.setItem("savedServants", JSON.stringify(savedServants));
}

// delete quests and save
function deleteAllQuests(){
  quest = "";
  savedQuests = [];
  localStorage.setItem("quest", JSON.stringify(quest));
  localStorage.setItem("savedQuests", JSON.stringify(savedQuests));
  updateSavedQuestsDisplay();
}

// reset battle forms
function resetBattleForm(waveNumber){
  let waveOffset = 3 * (waveNumber - 1);

  // clear all enemy / servant form
  $('#NPDamageUpQuest' + waveNumber).val(0);
  $('#NPGainUpPercentageQuest' + waveNumber).val(0);
  $('#AttackUpPercentageQuest' + waveNumber).val(0);
  $('#FlatAttackUpQuest' + waveNumber).val(0);
  $('#BusterUpPercentageQuest' + waveNumber).val(0);
  $('#ArtsUpPercentageQuest' + waveNumber).val(0);
  $('#QuickUpPercentageQuest' + waveNumber).val(0);
  $('#PowerModQuest' + waveNumber).val(0);
  $('#BusterDebuffPercentageQuest' + waveNumber).val(0);
  $('#ArtsDebuffPercentageQuest' + waveNumber).val(0);
  $('#QuickDebuffPercentageQuest' + waveNumber).val(0);
  $('#NPSpecialAttackQuest' + waveNumber).val(0);
  $('#DefenseDebuffPercentageQuest' + waveNumber).val(0);

  // clear enemy specific form
  for(let i = 0; i <= 3; i++){
    $('#NPSpecialAttackQuest' + waveNumber + 'Enemy' + (i + waveOffset)).val(0);
    $('#PowerModQuest' + waveNumber + 'Enemy' + (i + waveOffset)).val(0);
    $('#DefenseDebuffPercentageQuest' + waveNumber + 'Enemy' + (i + waveOffset)).val(0);
    $('#BusterDebuffPercentageQuest' + waveNumber + 'Enemy' + (i + waveOffset)).val(0);
    $('#ArtsDebuffPercentageQuest' + waveNumber + 'Enemy' + (i + waveOffset)).val(0);
    $('#QuickDebuffPercentageQuest' + waveNumber + 'Enemy' + (i + waveOffset)).val(0);
  }
}

// reset servant form
function resetServant() {
  $('#hasNPupgrade').hide();
  $('#maxGrailed').prop('disabled', true);
  $('#maxGrailed').prop('checked', false);
  $('#maxFou').prop('checked', false);
  $('#maxFou').prop('disabled', true);
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
  $('#inputNickname').val("");
  $('#addCraftEssence').prop('disabled', true);
  $('#ceMLB').prop('checked', false);
  $('#ceLevel').empty().append($('<option></option>').html("Choose a CE first."));
  $('#ceNameDisplay').empty().html('<b>CE Name:</b> N/A |');
  $('#ceLvlDisplay').empty().html('<b>CE Lvl</b>: N/A |');
  $('#ceAttackDisplay').empty().html('<b>CE Attack:</b> N/A');
  ceID = 0;
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
  var questClass = new Array(3);
  var questAttr = new Array(3);
  var cardBuffs = "";
  var enemyCardDebuffs = new Array(3);
  var waveOffset = ((waveNumber - 1) * 3) + 1; // 1,4,7

  // enemy specific mods
  var questNpSp = new Array(3);
  var questPower = new Array(3);
  var questDefDebuff = new Array(3);
  var questBusterDebuff = new Array(3);
  var questArtsDebuff = new Array(3);
  var questQuickDebuff = new Array(3);

  // retrieve servant values
  var servantClass = getClassValue(currServant.class);
  var servantAttr = getAttrValue(currServant.attribute);
  var atk = parseFloat(currServant.attack) || 0;
  var np = parseFloat(currServant.npdamagepercent)/100 || 0;
  var npCardType = cardDmg(currServant.nptype) || 0;
  var servantClassMultiplier = classMultiplier(currServant.class) || 0;

  // calculate buffs
  var busterUp = parseFloat(currServant.busterup)/100 + parseFloat($('#BusterUpPercentageQuest' + waveNumber).val())/100 || 0;
  var artsUp = parseFloat(currServant.artsup)/100 + parseFloat($('#ArtsUpPercentageQuest' + waveNumber).val())/100 || 0;
  var quickUp = parseFloat(currServant.quickup)/100 + parseFloat($('#QuickUpPercentageQuest' + waveNumber).val())/100 || 0;
  var attackUp = parseFloat(currServant.attackup)/100 + parseFloat($('#AttackUpPercentageQuest' + waveNumber).val())/100 || 0;
  var npBuffs = parseFloat(currServant.npdamageup)/100 + parseFloat($('#NPDamageUpQuest' + waveNumber).val())/100 || 0;
  var flatAttack = parseFloat(currServant.flatattackup) + parseFloat($('#FlatAttackUpQuest' + waveNumber).val()) || 0;
  var busterDefenseDebuffs = parseFloat($('#BusterDebuffPercentageQuest' + waveNumber).val())/100 || 0;
  var artsDefenseDebuffs = parseFloat($('#ArtsDebuffPercentageQuest' + waveNumber).val())/100 || 0;
  var quickDefenseDebuffs = parseFloat($('#QuickDebuffPercentageQuest' + waveNumber).val())/100 || 0;
  var cardDebuffs = 0;
  var defenseDebuffs = parseFloat($('#DefenseDebuffPercentageQuest' + waveNumber).val())/100 || 0;
  var npSpBuffs = parseFloat($('#NPSpecialAttackQuest' + waveNumber).val())/100 || 0;
  var powerBuff = parseFloat(currServant.powermod)/100 + $('#PowerModQuest' + waveNumber).val()/100 || 0;
  var npGainBuff = parseFloat($('#NPGainUpPercentageQuest' + waveNumber).val()/100) || 0

  // load in enemy specific mods
  for(let i = 0; i < 3; i++){
    questNpSp[i] = parseFloat($('#NPSpecialAttackQuest' + waveNumber + 'Enemy' + (i+waveOffset)).val())/100 || 0;
    questPower[i] = parseFloat($('#PowerModQuest' + waveNumber + 'Enemy' + (i+waveOffset)).val())/100 || 0;
    questDefDebuff[i] = parseFloat($('#DefenseDebuffPercentageQuest' + waveNumber + 'Enemy' + (i+waveOffset)).val())/100 || 0;
    questBusterDebuff[i] = parseFloat($('#BusterDebuffPercentageQuest' + waveNumber + 'Enemy' + (i+waveOffset)).val())/100 || 0;
    questArtsDebuff[i] = parseFloat($('#ArtsDebuffPercentageQuest' + waveNumber + 'Enemy' + (i+waveOffset)).val())/100 || 0;
    questQuickDebuff[i] = parseFloat($('#QuickDebuffPercentageQuest' + waveNumber + 'Enemy' + (i+waveOffset)).val())/100 || 0;
  }

  if(debug){
    console.log("busterup: " + busterUp + " artsup: " + artsUp + " quickup: " + quickUp + " npbuffs: " + npBuffs +
       " attackup: " + attackUp + " flatattackup: " + flatAttack + " busterdefensedebuff: " + busterDefenseDebuffs +
       " artsdefensedebuff: " + artsDefenseDebuffs + " quickdefensedebuff: " + quickDefenseDebuffs + " powerbuff: " +
        powerBuff + " defensedebuff:" + defenseDebuffs + " npSpBuffs: " + npSpBuffs + " npGainBuff: " + npGainBuff);
    }

  if(currServant.nptype.localeCompare("Buster") == 0){
    cardBuffs = busterUp;
    cardDebuffs = busterDefenseDebuffs;
  }
  else if(currServant.nptype.localeCompare("Arts") == 0){
    cardBuffs = artsUp;
    cardDebuffs = artsDefenseDebuffs;
  }
  else if(currServant.nptype.localeCompare("Quick") == 0){
    cardBuffs = quickUp;
    cardDebuffs = quickDefenseDebuffs;
  }

  // enemy value calculations
  for(let i = waveOffset; i <= 2 + waveOffset; i++){
    questClass[i-waveOffset] = getClassValue(currQuest['enemy' + i + 'class']);
    questAttr[i-waveOffset] = getAttrValue(currQuest['enemy' + i + 'attribute']);
  }

  if(debug){
    console.log("quest class 1: " + questClass[0]);
    console.log("quest attr 1: " + questAttr[0]);
    console.log("quest class 2: " + questClass[1]);
    console.log("quest attr 2: " + questAttr[1]);
  }

  // interactive calculations
  var classAdvantage = new Array(3);
  var attrAdvantage = new Array(3);
  for(let i = 0; i < 3; i++){
    classAdvantage[i] = ClassAdv[servantClass][questClass[i]];
    attrAdvantage[i] = AttrAdv[servantAttr][questAttr[i]];
  }

  if(debug){
    console.log("multiplier class 1: " + classAdvantage[0]);
    console.log("multiplier attr 1: " + attrAdvantage[0]);
  }

  var damageDealt = new Array(3);
  for(let i = 0; i < 3; i++){
    // get correct card mods
    if(currServant.nptype.localeCompare("Buster") == 0){
      questCardDebuff = questBusterDebuff[i];
    }
    else if(currServant.nptype.localeCompare("Arts") == 0){
      questCardDebuff = questArtsDebuff[i];
    }
    else if(currServant.nptype.localeCompare("Quick") == 0){
      questCardDebuff = questQuickDebuff[i];
    }

    // get avg damage dealt
    damageDealt[i] = atk * np * npCardType * classAdvantage[i] * servantClassMultiplier * 0.23 *
                (1 + attackUp + defenseDebuffs + questDefDebuff[i]) * (1 + cardBuffs + cardDebuffs + questCardDebuff) *
                (1 + npBuffs + (powerBuff + questPower[i])) * (1 + (npSpBuffs + questNpSp[i])) * attrAdvantage[i] + flatAttack;
  }

  if(debug){
    console.log("damageDealt[0]: " + damageDealt[0]);
  }

  // don't double add servant saved buffs for np gain
  if(currServant.nptype.localeCompare("Buster") == 0){
    cardBuffs = busterUp - parseFloat(currServant.busterup)/100;
  }
  else if(currServant.nptype.localeCompare("Arts") == 0){
    cardBuffs = artsUp - parseFloat(currServant.artsup)/100;
  }
  else if(currServant.nptype.localeCompare("Quick") == 0){
    cardBuffs = quickUp - parseFloat(currServant.quickup)/100;
  }

  // add card resist down to cardbuffs for np refund calculations
  if(currServant.nptype.localeCompare("Buster") == 0){
    cardBuffs += busterDefenseDebuffs;
    enemyCardDebuffs = questBusterDebuff;
  }
  else if(currServant.nptype.localeCompare("Arts") == 0){
    cardBuffs += artsDefenseDebuffs;
    enemyCardDebuffs = questArtsDebuff;
  }
  else if(currServant.nptype.localeCompare("Quick") == 0){
    cardBuffs += quickDefenseDebuffs;
    enemyCardDebuffs = questQuickDebuff;
  }

  // if non damaging np, return 0
  if(np == 0){
    return [0, 0, 0,
            0, 0, 0,
            0, 0, 0,
      cardBuffs, npGainBuff];
  }

  // return average low and high damage dealt
  return [Math.floor(0.9 * (damageDealt[0] - flatAttack) + flatAttack), Math.floor(damageDealt[0]), Math.floor(1.099 * (damageDealt[0] - flatAttack) + flatAttack),
    Math.floor(0.9 * (damageDealt[1] - flatAttack) + flatAttack), Math.floor(damageDealt[1]), Math.floor(1.099 * (damageDealt[1] - flatAttack) + flatAttack),
    Math.floor(0.9 * (damageDealt[2] - flatAttack) + flatAttack), Math.floor(damageDealt[2]), Math.floor(1.099 * (damageDealt[2] - flatAttack) + flatAttack),
    cardBuffs, npGainBuff, enemyCardDebuffs];
}

// np refund calcluation
// rider +10%, caster +20%, assassin -10%, berserker -20%
async function fetchNPRefund(npHits){
  let currNPHitDist = NPHitDist[npHits - 1];

  // retrieve np hit dist from API - use local data if failure
  const url = 'https://api.atlasacademy.io/nice/JP/servant/' + savedServants[servant].id;
  try {
    const fetchResult = fetch(url);
    const response = await fetchResult;
    const jsonData = await response.json();
    if (jsonData !== null){
      currNPHitDist = jsonData.noblePhantasms[0].npDistribution.map(x => x/100);
      console.log(url + " | np hit dist: " + currNPHitDist);
    }
    else{
      console.log("API data error! Using local data.");
    }
  } catch(e){
    console.log(e);
  }
  return currNPHitDist;
}

function calculateNPRefund(hp1, hp2, hp3, enemyMod1, enemyMod2, enemyMod3, damage1, damage2, damage3, cardBuff, npGainUp, enemySpecificCardDebuff, npHits, npHitDist){
  // if enemies start at 0 health, ignore them for np regen calculations
  var ignoreEnemy1 = false;
  var ignoreEnemy2 = false;
  var ignoreEnemy3 = false;

  if(parseFloat(hp1) === 0 || parseFloat(hp1) <= 0){
    ignoreEnemy1 = true;
    console.log("ignore enemy 1");
  }
  if(parseFloat(hp2) === 0 || parseFloat(hp2) <= 0){
    ignoreEnemy2 = true;
    console.log("ignore enemy 2");
  }
  if(parseFloat(hp3) === 0 || parseFloat(hp3) <= 0){
    ignoreEnemy3 = true;
    console.log("ignore enemy 3");
  }

  var enemyServerMod1 = enemyMod1; // changes based on enemy class and type
  var enemyServerMod2 = enemyMod2; // changes based on enemy class and type
  var enemyServerMod3 = enemyMod3; // changes based on enemy class and type
  var firstCardBonus = 0; // 0 because NP card
  var cardNpValue = 0; // buster quick arts card modifier
  var cardMod = 0; // % buster,quick,arts up etc
  var npChargeRateMod = savedServants[servant].npgainup/100 + npGainUp || 0; // changes to np charge rate
  var npChargeOff = savedServants[servant].npgain; // np gain offensive
  var critMod = 1; // no NP Crit
  var overkillModifier = 1;
  var npRefund = 0;
  var npHits = savedServants[servant].nphits // how many hits this np has

  console.log("cardBuff: " + cardBuff + " servant np gain up: " + savedServants[servant].npgainup + " servantbasenpgain: " + savedServants[servant].npgain +
    " servant busterup: " + savedServants[servant].busterup + " servant arts up: " + savedServants[servant].artsup +
    " servant quickup: " + savedServants[servant].quickup);

  // set np card type and card buffs
  if(savedServants[servant].nptype.localeCompare("Buster") == 0){
    cardNpValue = 0;
    cardMod = savedServants[servant].busterup/100;
  }
  else if(savedServants[servant].nptype.localeCompare("Arts") == 0){
    cardNpValue = 3;
    cardMod = savedServants[servant].artsup/100;
  }
  else if(savedServants[servant].nptype.localeCompare("Quick") == 0){
    cardNpValue = 1;
    cardMod = savedServants[servant].quickup/100;
  }
  cardMod = (Number(cardMod) + Number(cardBuff));

  let damage = 0;
  let refund1 = 0, refund2 = 0, refund3 = 0;
  for(let i = 0; i < npHits; i++){
    damage = damage1 * npHitDist[i];

    // check overkill
    if(!ignoreEnemy1){
      let isOverkill = false;
      if(hp1 - damage < 0){
        overkillModifier = 1.500;
        isOverkill = true;
      }
      else{
        overkillModifier = 1.000;
      }
      let baseNPGained = (npChargeOff * (firstCardBonus + (cardNpValue * ( 1 + Number(cardMod) + Number(enemySpecificCardDebuff[0]))))*
        enemyServerMod1 * (1 + Number(npChargeRateMod)) * critMod);

      console.log("np refund calc loop: " + i + " enemy1 hp: " + hp1 + " nphits: " + npHits);
      console.log("npchargeoff: " + npChargeOff + " firstCardBonus: " + firstCardBonus +
        " cardNpValue: " + cardNpValue + " cardMod: " + cardMod + " enemySpecificCardDebuff: " + Number(enemySpecificCardDebuff[0]) + " enemyServerMod1: " + enemyServerMod1 +
        " npChargeRateMod: " + Number(npChargeRateMod) + " critmod: " + critMod + " overkill mod : " + overkillModifier);
      console.log("damage1: " + damage);

      refund1 += Math.floor(baseNPGained * overkillModifier * 100) / 100;
      console.log("refund1: " + refund1);
      npRefund += Math.floor(baseNPGained * overkillModifier * 100) / 100;
    }

    // update hp
    hp1 -= damage;

    console.log(npRefund);

    damage = damage2 * npHitDist[i];

    // check overkill
    if(!ignoreEnemy2){
      let isOverkill = false;
      if(hp2 - damage < 0){
        overkillModifier = 1.500;
        isOverkill = true;
      }
      else{
        overkillModifier = 1.000;
      }

      let baseNPGained = (npChargeOff * (firstCardBonus + (cardNpValue * ( 1 + Number(cardMod) + Number(enemySpecificCardDebuff[1]))))*
        enemyServerMod2 * (1 + Number(npChargeRateMod)) * critMod);

      refund2 += Math.floor(baseNPGained * overkillModifier * 100) / 100;
      console.log("refund2: " + refund2);
      npRefund += Math.floor(baseNPGained * overkillModifier * 100) / 100;
    }

    // update hp
    hp2 -= damage;

    console.log(npRefund);

    damage = damage3 * npHitDist[i];

    if(!ignoreEnemy3){
      let isOverkill = false;
      if(hp3 - damage < 0){
        overkillModifier = 1.500;
        isOverkill = true;
      }
      else{
        overkillModifier = 1.000;
      }

      let baseNPGained = (npChargeOff * (firstCardBonus + (cardNpValue * ( 1 + Number(cardMod)  + Number(enemySpecificCardDebuff[2]))))*
        enemyServerMod3 * (1 + Number(npChargeRateMod)) * critMod);

      refund3 += Math.floor(baseNPGained * overkillModifier * 100) / 100;
      console.log("refund3: " + refund3);
      npRefund += Math.floor(baseNPGained * overkillModifier * 100) / 100;
    }

    // update hp
    hp3 -= damage;

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
    console.log("earth");
    attrVal = 2;
  }
  else if(input.localeCompare("Star") == 0){
    console.log("star");
    attrVal = 3;
  }
  else if(input.localeCompare("Beast") == 0){
    console.log("beast");
    attrVal = 4;
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
  else if (input.localeCompare("Berserker") == 0 || input.localeCompare("Ruler") == 0 ||
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

function getServantID(name){
  for(let i = 0; i < servantList.length; i++){
    if(servantList[i].name.localeCompare(name) === 0){
      return servantList[i].id;
    }
  }
}

function loadNPPercentages(servantID){
  // set np related stats
  let npmulti = [0,0,0,0,0];
  if (servantList[servantID - 1].npmultiplier){
    npmulti = servantList[servantID - 1].npmultiplier.split(',');
  }

  $('#NPDamagePercent').val( Math.round(Number( npmulti[$('#inputNPLevel').val()-1])));
  $('#inputNPLevel').on('change', function(){
    $('#NPDamagePercent').val( Math.round(Number( npmulti[$('#inputNPLevel').val()-1])));
  });

}
