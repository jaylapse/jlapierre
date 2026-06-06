window.GAMES_LIBRARY = window.GAMES_LIBRARY || [];
window.GAMES_LIBRARY.push({
  id:'got-it',
  name:'Got It',
  mechanic:'word',
  format:'Rules only',
  summary:'Two players say a word at the same time and try to converge on the same final answer.',
  notes:[
    'This game can work as a quick warm-up or tiebreaker.',
    'Because the core idea has no obvious automatic winner, use one of the scoring variants below.',
    'A shared word or agreed synonym counts as a successful "got it".'
  ],
  pools:[
    { title:'How to score it', subtitle:'Ways to give it a winner', items:[
      {name:'Same-word point', detail:'If both players say the same word on the same attempt, they score 1 point.'},
      {name:'Closest-match point', detail:'If both answer with near-synonyms, the host awards the point.'},
      {name:'3-strike round', detail:'Each pair gets three attempts; if they never match, no point is given.'},
      {name:'Fastest sync', detail:'First pair to match wins the round.'},
      {name:'Best-of-5', detail:'Play five prompts and track total matches.'}
    ]},
    { title:'Make it more game-like', subtitle:'Engagement tweaks', items:[
      {name:'Timed answers', detail:'Players have 5 seconds to answer each attempt.'},
      {name:'Category prompts', detail:'Use themes like animals, foods, movies, or sports.'},
      {name:'Bonus match', detail:'If they match on attempt 1, award a bonus point.'},
      {name:'Steal option', detail:'If one player is very close, the other can steal with a perfect match.'},
      {name:'Endgame', detail:'Use it as a sudden-death decider when scores are tied.'}
    ]}
  ]
});
