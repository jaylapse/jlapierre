window.GAMES_LIBRARY = window.GAMES_LIBRARY || [];
window.GAMES_LIBRARY.push({
  id:'thirteen-words',
  name:'13 Words',
  mechanic:'word',
  format:'10 targets on one board',
  summary:'Ten connected targets appear at once for rapid clue rounds with easy board rotation.',
  notes:[
    'Each board now stays within one theme so the targets feel connected.',
    'Add more boards here whenever you want fresh categories.',
    'This host-first version keeps the target list visible.'
  ],
  pools:[
    { title:'Superheroes and comic characters', subtitle:'10 clue targets', items:[
      {name:'Spider-Man', detail:'Marvel superhero'},
      {name:'Batman', detail:'DC superhero'},
      {name:'Iron Man', detail:'Marvel superhero'},
      {name:'Black Panther', detail:'Marvel superhero'},
      {name:'Superman', detail:'DC superhero'},
      {name:'Deadpool', detail:'Marvel antihero'},
      {name:'Wonder Woman', detail:'DC superhero'},
      {name:'The Flash', detail:'DC superhero'},
      {name:'Hulk', detail:'Marvel superhero'},
      {name:'Captain America', detail:'Marvel superhero'}
    ]},
    { title:'Video games', subtitle:'10 clue targets', items:[
      {name:'Minecraft', detail:'Sandbox game'},
      {name:'Fortnite', detail:'Battle royale'},
      {name:'Mario Kart', detail:'Racing game'},
      {name:'The Legend of Zelda', detail:'Adventure game'},
      {name:'Grand Theft Auto', detail:'Open-world action'},
      {name:'Among Us', detail:'Social deduction'},
      {name:'Pokémon', detail:'Creature-collecting RPG'},
      {name:'Call of Duty', detail:'Shooter franchise'},
      {name:'Elden Ring', detail:'Action RPG'},
      {name:'Sonic the Hedgehog', detail:'Platformer'}
    ]},
    { title:'Movies', subtitle:'10 clue targets', items:[
      {name:'Titanic', detail:'Romance / disaster'},
      {name:'Star Wars', detail:'Space opera'},
      {name:'Jurassic Park', detail:'Adventure / sci-fi'},
      {name:'The Lion King', detail:'Animated adventure'},
      {name:'Toy Story', detail:'Animated comedy'},
      {name:'Home Alone', detail:'Holiday comedy'},
      {name:'Barbie', detail:'Comedy / fantasy'},
      {name:'Finding Nemo', detail:'Animated adventure'},
      {name:'Frozen', detail:'Animated musical'},
      {name:'John Wick', detail:'Action thriller'}
    ]},
    { title:'TV shows', subtitle:'10 clue targets', items:[
      {name:'The Office', detail:'Workplace comedy'},
      {name:'Friends', detail:'Sitcom'},
      {name:'Breaking Bad', detail:'Crime drama'},
      {name:'Stranger Things', detail:'Sci-fi thriller'},
      {name:'The Simpsons', detail:'Animated sitcom'},
      {name:'Squid Game', detail:'Survival drama'},
      {name:'Wednesday', detail:'Mystery / fantasy'},
      {name:'Peaky Blinders', detail:'Crime drama'},
      {name:'The Last of Us', detail:'Post-apocalyptic drama'},
      {name:'Game of Thrones', detail:'Fantasy drama'}
    ]},
    { title:'Sports stars', subtitle:'10 clue targets', items:[
      {name:'Lionel Messi', detail:'Soccer'},
      {name:'Cristiano Ronaldo', detail:'Soccer'},
      {name:'LeBron James', detail:'Basketball'},
      {name:'Stephen Curry', detail:'Basketball'},
      {name:'Serena Williams', detail:'Tennis'},
      {name:'Tiger Woods', detail:'Golf'},
      {name:'Simone Biles', detail:'Gymnastics'},
      {name:'Tom Brady', detail:'Football'},
      {name:'Shohei Ohtani', detail:'Baseball'},
      {name:'Michael Jordan', detail:'Basketball'}
    ]}
  ]
});