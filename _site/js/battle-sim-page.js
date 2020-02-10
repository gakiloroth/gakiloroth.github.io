// make sure quest party toggles are toggled
function updateBattlePartyToggles(){
  $('#battlePartySelect' + party.indexOf(servant)).addClass('active');
  $('#battlePartySelect' + party.indexOf(servant)).attr('aria-pressed', true);
}

// reset battle forms
function resetBattleForm(event){
  let waveNumber = event.data.wave;

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

  // reset form validation display
  var forms = document.getElementsByClassName('needs-validation-battle' + waveNumber);
  Array.prototype.filter.call(forms, function(form) {
    form.classList.remove('was-validated');
  });
}

// reset battle sim wave
function resetBattleSim(event){
  // reset wave's hp remaining
  let currQuest = savedQuests[quest];
  let wavenumber = event.data.wave;

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
