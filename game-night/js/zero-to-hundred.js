window.GAMES_LIBRARY = window.GAMES_LIBRARY || [];
window.GAMES_LIBRARY.push({
  id:'zero-to-hundred',
  name:'0-100',
  mechanic:'word',
  format:'Reference card only - nothing here is interactive. The rules below cover setup, turns, and win conditions; New board switches to a set of variant ideas for making it more engaging.',
  summary:'Both players secretly choose a number from 0 to 100, then ask yes/no questions to deduce the opponents number.',
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
      {name:'Tournament mode', detail:'Play three rounds and total the wins.'},
      {name:'Team mode', detail:'Play in pairs, discussing each guess before answering.'},
      {name:'Reverse round', detail:'The winner picks the next starting range, like 0-50.'},
      {name:'Silent guess', detail:'Players write guesses down instead of saying them aloud.'}
    ]}
  ]
});
