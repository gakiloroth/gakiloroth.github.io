// initialize battle sim
function initializeBattleSim(){
  if(savedQuests.length === 0 || savedServants.length === 0 || quest.length === 0 || quest === ""){
    console.log("savedquestlength: " + savedQuests.length + " savedservantlength: " + savedServants.length +
      " quest: " + quest);
    return;
  }

  // initialize quest related data
  if(debug){
    console.log("quest: " + quest + " " + JSON.stringify(savedServants));
  }

  let currQuest = savedQuests[quest];
  $('#questNameDisplay').empty().html('<b>Current Quest: </b>' + currQuest.name);

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

// initialize class drop down
function initializeClassDropdown(){
let select = $('#inputClass');
  for(let i = 0; i < classDropdownOptions.length; i++) {
      let option = classDropdownOptions[i];

      select.append('<option value=' + option + '>' + option + '</option>');
    }
}

// initialize the battle party
function initializeBattleParty(){
  $('#battlePartyDisplay').empty();

  for(let i = 0; i < party.length; i++){
    let curr = savedServants[party[i]];

    $('#battlePartyDisplay').append($('<li class="list-group-item"><b>' + curr.name + '</b> | CE: ' +
     curr.craftessence +
     '<span class="float-right"><button type="button" id=' + "battlePartySelect" + i +
     ' class="btn btn-outline-success btn-sm" data-toggle="button" aria-pressed="false"' +
     ' autocomplete="false">Select</button></span>' + '</li>'));

    // link up delete button
    $('#battlePartySelect' + i).click(function(){
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
        updateBattlePartyToggles();

        let currServant = savedServants[party[i]];
        $('#servantBattleDisplay').empty().html('<b>Current Servant: </b>' + currServant.name + ' NP ' + currServant.nplevel);
      }
    });
  }
}
