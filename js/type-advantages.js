// Man = 0, Sky = 1, Earth = 2, Star = 3, Beast = 4
const AttrAdv = [[1, 1.1, 0.9, 1, 1], // man
[.9, 1, 1.1, 1, 1], // sky
[1.1, .9, 1, 1, 1], // earth
[1, 1, 1, 1, 1.1], // star
[1, 1, 1, 1.1, 1] // beast
]

// Saber = 0, Archer = 1, Lancer = 2, Rider = 3, Caster = 4, Assassin = 5, Berserker = 6,
// Ruler = 7, Avenger, Moon Cancer = 9, Alter Ego = 10, Foreigner = 11, Shielder = 12
// row title is the attacker
const ClassAdv =[[1, .5, 2, 1, 1, 1, 2, .5, 1, 1, 1, 1, 1], // saber
[2, 1, .5, 1, 1, 1, 2, .5, 1, 1, 1, 1, 1], // archer
[.5, 2, 1, 1, 1, 1, 2, .5, 1, 1, 1, 1, 1], // lancer
[1, 1, 1, 1, 2, .5, 2, .5, 1, 1, 1, 1, 1], // rider
[1, 1, 1, .5, 1, 2, 2, .5, 1, 1, 1, 1, 1], // caster
[1, 1, 1, 2, .5, 1, 2, .5, 1, 1, 1, 1, 1], // assassin
[1.5, 1.5, 1.5, 1.5, 1.5, 1.5, 1.5, 1.5, 1.5, 1.5, 1.5, .5, 1,], // berserker
[1, 1, 1, 1, 1, 1, 2, 1, .5, 2, 1, 1, 1], // ruler
[1, 1, 1, 1, 1, 1, 2, 2, 1, .5, 1, 1, 1], // avenger
[1, 1, 1, 1, 1, 1, 2, .5, 2, 1, 1, 1, 1], // moon cancer
[.5, .5, .5, 1.5, 1.5, 1.5, 2, 1, 1, 1, 1, 2, 1], // alter ego
[1, 1, 1, 1, 1, 1, 2, 1, 1, 1, .5, 1, 1], // foreigner
[1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1] // shielder
]
