function calculateDamage(waveNumber){
  let currServant = savedServants[servant];
  let currQuest = savedQuests[quest];
  let questClass1 = "";
  let questClass2 = "";
  let questClass3 = "";
  let questAttr1 = "";
  let questAttr2 = "";
  let questAttr3 = "";
  let cardBuffs = "";

  // retrieve servant values
  let servantClass = getClassValue(currServant.class);
  let servantAttr = getAttrValue(currServant.attribute);
  let atk = parseFloat(currServant.attack) || 0;
  let np = parseFloat(currServant.npdamagepercent)/100 || 0;
  let npCardType = getCardDmg(currServant.nptype) || 0;
  let servantClassMultiplier = getClassMultiplier(currServant.class) || 0;

  // calculate buffs
  let busterUp = parseFloat(currServant.busterup)/100 + parseFloat($('#BusterUpPercentageQuest' + waveNumber).val())/100 || 0;
  let artsUp = parseFloat(currServant.artsup)/100 + parseFloat($('#ArtsUpPercentageQuest' + waveNumber).val())/100 || 0;
  let quickUp = parseFloat(currServant.quickup)/100 + parseFloat($('#QuickUpPercentageQuest' + waveNumber).val())/100 || 0;
  let attackUp = parseFloat(currServant.attackup)/100 + parseFloat($('#AttackUpPercentageQuest' + waveNumber).val())/100 || 0;
  let npBuffs = parseFloat(currServant.npdamageup)/100 + parseFloat($('#NPDamageUpQuest' + waveNumber).val())/100 || 0;
  let flatAttack = parseFloat(currServant.flatattackup) + parseFloat($('#FlatAttackUpQuest' + waveNumber).val()) || 0;
  let busterDefenseDebuffs = parseFloat($('#BusterDebuffPercentageQuest' + waveNumber).val())/100 || 0;
  let artsDefenseDebuffs = parseFloat($('#ArtsDebuffPercentageQuest' + waveNumber).val())/100 || 0;
  let quickDefenseDebuffs = parseFloat($('#QuickDebuffPercentageQuest' + waveNumber).val())/100 || 0;
  let cardDebuffs = 0;
  let defenseDebuffs = parseFloat($('#DefenseDebuffPercentageQuest' + waveNumber).val())/100 || 0;
  let npSpBuffs = parseFloat($('#NPSpecialAttackQuest' + waveNumber).val())/100 || 0;
  let powerBuff = parseFloat(currServant.powermod + $('#PowerModQuest' + waveNumber).val())/100 || 0;
  let npGainBuff = parseFloat($('#NPGainUpPercentageQuest' + waveNumber).val()/100) || 0

  console.log("busterup: " + busterUp + " artsup: " + artsUp + " quickup: " + quickUp + " npbuffs: " + npBuffs +
     " attackup: " + attackUp + " flatattackup: " + flatAttack + " busterdefensedebuff: " + busterDefenseDebuffs +
     " artsdefensedebuff: " + artsDefenseDebuffs + " quickdefensedebuff: " + quickDefenseDebuffs + " powerbuff: " +
      powerBuff + " defensedebuff:" + defenseDebuffs + " npSpBuffs: " + npSpBuffs + " npGainBuff: " + npGainBuff);

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
  let classAdvantage1 = ClassAdv[servantClass][questClass1];
  let classAdvantage2 = ClassAdv[servantClass][questClass2];
  let classAdvantage3 = ClassAdv[servantClass][questClass3];
  let attrAdvantage1 = AttrAdv[servantAttr][questAttr1];
  let attrAdvantage2 = AttrAdv[servantAttr][questAttr2];
  let attrAdvantage3 = AttrAdv[servantAttr][questAttr3];

  if(debug){
    console.log("multiplier class 1: " + classAdvantage1);
    console.log("multiplier attr 1: " + attrAdvantage1);
  }

  //alert(cardBuffs + " " + parseFloat($('#QuickUpPercentageQuest' + waveNumber).val())/100);

  let damageDealt1 = atk * np * npCardType * classAdvantage1 * servantClassMultiplier * 0.23 *
              (1 + attackUp + defenseDebuffs) * (1 + cardBuffs + cardDebuffs) * (1 + npBuffs + powerBuff) *
              (1 + npSpBuffs) * attrAdvantage1 + flatAttack;
  let damageDealt2 = atk * np * npCardType * classAdvantage2 * servantClassMultiplier * 0.23 *
              (1 + attackUp + defenseDebuffs) * (1 + cardBuffs + cardDebuffs) * (1 + npBuffs + powerBuff) *
              (1 + npSpBuffs) * attrAdvantage2 + flatAttack;
  let damageDealt3 = atk * np * npCardType * classAdvantage3 * servantClassMultiplier * 0.23 *
              (1 + attackUp + defenseDebuffs) * (1 + cardBuffs + cardDebuffs) * (1 + npBuffs + powerBuff) *
              (1 + npSpBuffs) *  attrAdvantage3 + flatAttack;

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
  }
  else if(currServant.nptype.localeCompare("Arts") == 0){
    cardBuffs += artsDefenseDebuffs;
  }
  else if(currServant.nptype.localeCompare("Quick") == 0){
    cardBuffs += quickDefenseDebuffs;
  }

  // return average low and high damage dealt
  return [Math.round(0.9 * damageDealt1), Math.round(damageDealt1), Math.round(1.1 * damageDealt1),
    Math.round(0.9 * damageDealt2), Math.round(damageDealt2), Math.round(1.1 * damageDealt2),
    Math.round(0.9 * damageDealt3), Math.round(damageDealt3), Math.round(1.1 * damageDealt3),
    cardBuffs, npGainBuff];
}

// np refund calcluation
// rider +10%, caster +20%, assassin -10%, berserker -20%
function calculateNPRefund(hp1, hp2, hp3, enemyMod1, enemyMod2, enemyMod3, damage1, damage2, damage3, cardBuff, npGainUp){
  // if enemies start at 0 health, ignore them for np regen calculations
  let ignoreEnemy1 = false;
  let ignoreEnemy2 = false;
  let ignoreEnemy3 = false;

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

  let enemyServerMod1 = enemyMod1; // changes based on enemy class and type
  let enemyServerMod2 = enemyMod2; // changes based on enemy class and type
  let enemyServerMod3 = enemyMod3; // changes based on enemy class and type
  let firstCardBonus = 0; // 0 because NP card
  let cardNpValue = 0; // buster quick arts card modifier
  let cardMod = 0; // % buster,quick,arts up etc
  let npChargeRateMod = savedServants[servant].npgainup/100 + npGainUp || 0; // changes to np charge rate
  let npChargeOff = savedServants[servant].npgain; // np gain offensive
  let critMod = 1; // no NP Crit
  let overkillModifier = 1;
  let npRefund = 0;
  let npHits = savedServants[servant].nphits // how many hits this np has

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
  for(let i = 0; i < npHits; i++){
    damage = damage1 * NPHitDist[npHits - 1][i];

    // check overkill
    if(!ignoreEnemy1){
      if(hp1 - damage < 0){
        overkillModifier = 1.5;
      }
      else{
        overkillModifier = 1;
      }

      if(debug){
        console.log("np refund calc loop: " + i + " enemy1 hp: " + hp1 + " nphits: " + npHits);
        console.log("npchargeoff: " + npChargeOff + " firstCardBonus: " + firstCardBonus +
          " cardNpValue: " + cardNpValue + " cardMod: " + cardMod + " enemyServerMod1: " + enemyServerMod1 +
          " npChargeRateMod: " + Number(npChargeRateMod) + " critmod: " + critMod + " overkill mod : " + overkillModifier);
        console.log("damage1: " + damage);
      }
      npRefund += ((npChargeOff * (firstCardBonus + (cardNpValue * ( 1 + Number(cardMod) )))*
        enemyServerMod1 * (1 + Number(npChargeRateMod)) * critMod) * overkillModifier);
    }

    // update hp
    hp1 -= damage;
    console.log(npRefund);
    damage = damage2 * NPHitDist[npHits - 1][i];

    // check overkill
    if(!ignoreEnemy2){
      if(hp2 - damage < 0){
        overkillModifier = 1.5;
      }
      else{
        overkillModifier = 1;
      }
      npRefund += ((npChargeOff * (firstCardBonus + (cardNpValue * (1 + Number(cardMod) )))*
        enemyServerMod2 * (1 + Number(npChargeRateMod)) * critMod) * overkillModifier);
    }

    // update hp
    hp2 -= damage;
    console.log(npRefund);
    damage = damage3 * NPHitDist[npHits - 1][i];

    if(!ignoreEnemy3){
      if(hp3 - damage < 0){
        overkillModifier = 1.5;
      }
      else{
        overkillModifier = 1;
      }
      npRefund += ((npChargeOff * (firstCardBonus + (cardNpValue * (1 + Number(cardMod) ))) *
        enemyServerMod3 * (1 + Number(npChargeRateMod)) * critMod) * overkillModifier);
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
  let classVal = 0;

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
  let attrVal = 0;

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

function getClassMultiplier(input){
  let classVal = 1;

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

function getCardDmg(input){
  let cardVal = 1;

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
