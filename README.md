# FGO 3T Simulator

This is a small personal project I'm working on to learn how to do some basic web dev. It's inspired by matekakunai's [FGO Damage Calculator](https://maketakunai.github.io/).

If there are any bugs PLEASE leave an issue and I will try to fix it when time permits.

# How to Use
## Servants Manager Tab
Enter all the information a servant would have, including their passives, and the buffs from the CE you want. The CE field can be anything you want, so you can name it the CE you used, or any other info to remember what this servant is supposed to have. Further buffs can be added on the battle simulator tab. You can then select servants to put into your "party" up to 4, to test in the battle simulator.

## Quests Manager Tab
Enter all the HP values, classes, and attributes of all the enemies you want in the node. If you wish for an enemy to NOT be counted into NP refund calculations (ie. it is a 1-2 enemy node), simply set the enemy HP to 0.

## Battle Simulator
Once you have servants selected (in your party) and a quest selected, you can then test NP damage and NP refund in the battle simulator tab. Select one of the servants from your party from the bottom of the screen, apply further buffs you might use on that wave, and then click "Calculate NP Damage" to see NP damage and NP refund.

Click the "Prev" and "Next" buttons to test on other waves.


## Functionality Goals

With this simulator you will be able to save a servant's stats (with CE), and quest nodes (3 waves of enemies).
Then, you can choose one servant and one quest, and test NP damage and NP refund.

Work in Progress:
- Buttons to add popular buffs (Waver, Umu Bride, etc.)
