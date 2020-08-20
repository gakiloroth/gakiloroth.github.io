# FGO 3T Simulator   <img src="https://github.com/gakiloroth/gakiloroth.github.io/blob/master/images/padoru_vector_by_manaalchemist.png" width="48">

This is a small personal project I'm working on to learn how to do some basic web dev. It's inspired by matekakunai's [FGO Damage Calculator](https://maketakunai.github.io/).

If there are any bugs PLEASE leave an issue [here](https://github.com/gakiloroth/gakiloroth.github.io/issues) and I will try to fix it when time permits.

# Important
Updates may change some how of the backend are done, and if calculations don't work or some things are broken, please try testing in an incognito window(will have no cached data). If it works there, you may have to empty your cache or manually empty your party, delete all servants, and delete all quests.

# How to Use
## Servants Manager Tab
Enter all the information a servant would have, including their passives, and the buffs from the CE you want. The CE field can be anything you want, so you can name it the CE you used, or any other info to remember what this servant is supposed to have. Further buffs can be added on the battle simulator tab. You can then select servants to put into your "party" up to 4, to test in the battle simulator.

## Quests Manager Tab
Enter all the HP values, classes, and attributes of all the enemies you want in the node. If you wish for an enemy to NOT be counted into NP refund calculations (ie. it is a 1-2 enemy node), simply set the enemy HP to 0. You can also toggle common nodes to see and search for common nodes to the enemy data of into the quest editor.

**Tip**: If you're not sure what an enemy's attribute might be, make your attacking servant and the enemy's attribute the same, which will set the attribute damage modifier to 1.

The "NP Gain Mod" entries are **usually** the default that gets put in when you choose classes. However, there are "special" enemies that have different NP Gain Mods. If you know that the enemy you are testing is "special" and you know their specific NP Gain Mod, you can change it here to whatever you need. Otherwise, just leave it as is.

## Battle Simulator Tab
Once you have servants selected (in your party) and a quest selected, you can then test NP damage and NP refund in the battle simulator tab. Select one of the servants from your party from the bottom of the screen, apply further buffs you might use on that wave, and then click "Calculate NP Damage" to see NP damage and NP refund. The NP Total Timer counter at the top counts the NP time every time you calculate NP damage - but keep in mind this is a rough estimate and I hope to put more accurate data in the future if possible.

There is also now the ability to mark NP Sp. Attack and Power Mod for specific enemies (for situations such as Sieg / Mordred). Click on the "Toggle Enemy Specific Display" button to show these buttons. (More modifiers may be added under this if needed.)

Remember Passive Skill effects and effects that "activate first" before NP(or things like Arash OC NP Damage)!

Click the "Prev" and "Next" buttons to test on other waves.


## Functionality Goals

With this simulator you will be able to save a servant's stats (with CE), and quest nodes (3 waves of enemies).
Then, you can choose several servants, one quest, and test NP damage and NP refund.

Work in Progress:
- Load popular nodes into quest page easily (beta - still adding more nodes, testing for functionality). Since I haven't really found a good API to try to scrape this data from, there can be typos from me manually entering common nodes so please point out any mistakes I made. I'm hoping to build something to scrape node data eventually if an API is made(got my eyes on Atlas).
- Buttons to add popular buffs (Waver, Umu Bride, etc.) on the battle simulator page
- Collapse card buff/debuffs into one option
- Add ability to def. debuff/ card debuff specific enemies (not sure if needed yet)
