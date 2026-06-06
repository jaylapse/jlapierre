window.GAMES_LIBRARY = window.GAMES_LIBRARY || [];
window.GAMES_LIBRARY.push({
  id:'i-can-eat-that',
  name:'I Can Eat That',
  mechanic:'draft',
  format:'Challenge rules',
  summary:'Players bid time to eat a food item; the last person to call cap must either eat it or concede the point.',
  notes:[
    'Host should choose foods that are safe and reasonable for the players.',
    'Use original foods and avoid anything dangerous, extreme, or allergen-heavy.',
    'A stopwatch makes this game much more fun.'
  ],
  pools:[
    { title:'Rules summary', subtitle:'Host-ready explanation', items:[
      {name:'1. Pick a food', detail:'Choose something both players can realistically eat.'},
      {name:'2. Time bids', detail:'Players alternate saying how quickly they can finish it.'},
      {name:'3. Call cap', detail:'When a player thinks the other is bluffing, they say "I think you cant."'},
      {name:'4. Resolve', detail:'The last bidder must attempt the food challenge.'},
      {name:'5. Point', detail:'If they succeed, they get the point; otherwise the cap caller gets it.'}
    ]},
    { title:'Better house rules', subtitle:'Ways to make it more fair', items:[
      {name:'Equal food size', detail:'Both players get the same portion.'},
      {name:'Time cap', detail:'No bid can be lower than 30 seconds unless both agree.'},
      {name:'One challenge token', detail:'Each player gets one free pass per game night.'},
      {name:'Judge check', detail:'The host decides whether the food is fully eaten.'},
      {name:'Score target', detail:'First to 3 points wins the match.'}
    ]}
  ]
});
