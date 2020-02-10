
// make sure quest buttons are toggled correctly
function updateQuestToggles(){
  $('#useQuest' + quest).addClass('active');
  $('#useQuest' + quest).attr('aria-pressed', true);
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
  }
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

// delete quests and save
function deleteAllQuests(){
  quest = "";
  savedQuests = [];
  localStorage.setItem("quest", JSON.stringify(quest));
  localStorage.setItem("savedQuests", JSON.stringify(savedQuests));
  updateSavedQuestsDisplay();
}
