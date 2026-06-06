window.GAMES_LIBRARY = window.GAMES_LIBRARY || [];
window.GAMES_LIBRARY.push({
  id:'zero-to-hundred',
  name:'0-100',
  mechanic:'word',
  format:'Rules only',
  summary:'Both players secretly choose a number from 0 to 100, then ask yes/no questions to deduce the opponents number.',
  notes:[
    'Suggested scoring: first correct guess wins 1 point, or play best-of-5 rounds.',
    'To make it more tense, limit each player to one guess per turn after one question.',
    'You can allow one "cap" challenge if a player thinks the opponent is bluffing.'
  ],
  pools:[
    { title:'How it works', subtitle:'Clean rules for the host', items:[
      {name:'Setup', detail:'Both players write a secret number from 0 to 100.'},
      {name:'Turns', detail:'Players alternate asking yes/no questions like "Is it above 50?"'},
      {name:'Guessing', detail:'A player may use their turn to make a full guess instead of a question.'},
      {name:'Win condition', detail:'First correct guess wins the round.'},
      {name:'Variant', detail:'Use a 30-second clock for each turn to keep the pace moving.'}
    ]},
    { title:'Engaging variants', subtitle:'Ways to make it feel bigger', items:[
      {name:'Hot / cold hints', detail:'If a guess is close, the host can answer "warmer" or "colder".'},
      {name:'Category rounds', detail:'Make the number related to age, jersey number, or score.'},
      {name:'Blind turn', detail:'Players may only ask one question before making a guess.'},
      {name:'Steal rule', detail:'If one player misses, the opponent gets one last guess.'},
      {name:'Tournament mode', detail:'Play three rounds and total the wins.'}
    ]}
  ]
});
