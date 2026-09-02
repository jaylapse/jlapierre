window.GAMES_LIBRARY = window.GAMES_LIBRARY || [];
window.GAMES_LIBRARY.push({
  id:'age-golf',
  name:'Age Golf',
  mechanic:'number',
  format:'Shows one of 10 names at a time from the category. Tap to reveal the age, then Next name to move on - it loops back to the first after the 10th. Ages are computed live from real birthdates, so they stay correct automatically. New board jumps to a different category.',
  summary:'Ten names from a category, one at a time with the age hidden until you tap to reveal it.',
  pools:[
    { title:'Actors', subtitle:'26 names, 10 shown', items:[
      {name:'Paul Rudd', birthdate:'1969-04-06'},{name:'Sandra Bullock', birthdate:'1964-07-26'},{name:'Denzel Washington', birthdate:'1954-12-28'},{name:'Zendaya', birthdate:'1996-09-01'},{name:'Ryan Gosling', birthdate:'1980-11-12'},
      {name:'Margot Robbie', birthdate:'1990-07-02'},{name:'Keanu Reeves', birthdate:'1964-09-02'},{name:'Anne Hathaway', birthdate:'1982-11-12'},{name:'Pedro Pascal', birthdate:'1975-04-02'},{name:'Florence Pugh', birthdate:'1996-01-03'},
      {name:'Tom Holland', birthdate:'1996-06-01'},{name:'Ariana DeBose', birthdate:'1991-01-25'},{name:'Timothée Chalamet', birthdate:'1995-12-27'},{name:"Lupita Nyong'o", birthdate:'1983-03-01'},{name:'Jason Momoa', birthdate:'1979-08-01'},
      {name:'Emily Blunt', birthdate:'1983-02-23'},{name:'Seth Rogen', birthdate:'1982-04-15'},{name:'Viola Davis', birthdate:'1965-08-11'},{name:'Henry Cavill', birthdate:'1983-05-05'},{name:'Cillian Murphy', birthdate:'1976-05-25'},
      {name:'Rachel Zegler', birthdate:'2001-05-03'},{name:'Austin Butler', birthdate:'1991-08-17'},{name:'Sydney Sweeney', birthdate:'1997-09-12'},{name:'Glen Powell', birthdate:'1988-10-21'},{name:'Anya Taylor-Joy', birthdate:'1996-04-16'},
      {name:'Barry Keoghan', birthdate:'1992-10-18'}
    ], draw:10 },
    { title:'Athletes', subtitle:'26 names, 10 shown', items:[
      {name:'Tom Brady', birthdate:'1977-08-03'},{name:'LeBron James', birthdate:'1984-12-30'},{name:'Lionel Messi', birthdate:'1987-06-24'},{name:'Serena Williams', birthdate:'1981-09-26'},{name:'Tiger Woods', birthdate:'1975-12-30'},
      {name:'Michael Phelps', birthdate:'1985-06-30'},{name:'Simone Biles', birthdate:'1997-03-14'},{name:'Cristiano Ronaldo', birthdate:'1985-02-05'},{name:'Michael Jordan', birthdate:'1963-02-17'},{name:'Wayne Gretzky', birthdate:'1961-01-26'},
      {name:'Naomi Osaka', birthdate:'1997-10-16'},{name:'Shohei Ohtani', birthdate:'1994-07-05'},{name:'Stephen Curry', birthdate:'1988-03-14'},{name:'Kevin Durant', birthdate:'1988-09-29'},{name:'Patrick Mahomes', birthdate:'1995-09-17'},
      {name:'Aaron Judge', birthdate:'1992-04-26'},{name:'Novak Djokovic', birthdate:'1987-05-22'},{name:'Naomi Broady', birthdate:'1990-02-28'},{name:'Caitlin Clark', birthdate:'2002-01-22'},{name:"A'ja Wilson", birthdate:'1996-08-08'},
      {name:'Victor Wembanyama', birthdate:'2004-01-04'},{name:'Coco Gauff', birthdate:'2004-03-13'},{name:'Erling Haaland', birthdate:'2000-07-21'},{name:'Jude Bellingham', birthdate:'2003-06-29'},{name:'Nikola Jokic', birthdate:'1995-02-19'},
      {name:'Sabrina Ionescu', birthdate:'1997-12-06'}
    ], draw:10 },
    { title:'Singers', subtitle:'26 names, 10 shown', items:[
      {name:'Taylor Swift', birthdate:'1989-12-13'},{name:'Drake', birthdate:'1986-10-24'},{name:'Beyonce', birthdate:'1981-09-04'},{name:'Adele', birthdate:'1988-05-05'},{name:'Justin Bieber', birthdate:'1994-03-01'},
      {name:'The Weeknd', birthdate:'1990-02-16'},{name:'Billie Eilish', birthdate:'2001-12-18'},{name:'Ed Sheeran', birthdate:'1991-02-17'},{name:'Rihanna', birthdate:'1988-02-20'},{name:'Bruno Mars', birthdate:'1985-10-08'},
      {name:'Ariana Grande', birthdate:'1993-06-26'},{name:'Selena Gomez', birthdate:'1992-07-22'},{name:'Miley Cyrus', birthdate:'1992-11-23'},{name:'Katy Perry', birthdate:'1984-10-25'},{name:'Harry Styles', birthdate:'1994-02-01'},
      {name:'Shakira', birthdate:'1977-02-02'},{name:'Billie Joe Armstrong', birthdate:'1972-02-17'},{name:'Coldplay Chris Martin', birthdate:'1977-03-02'},{name:'Alicia Keys', birthdate:'1981-01-25'},{name:'Lizzo', birthdate:'1988-04-27'},
      {name:'Sabrina Carpenter', birthdate:'1999-05-11'},{name:'Chappell Roan', birthdate:'1998-02-19'},{name:'Doja Cat', birthdate:'1995-10-21'},{name:'Kendrick Lamar', birthdate:'1987-06-17'},{name:'Dua Lipa', birthdate:'1995-08-22'},
      {name:'Olivia Rodrigo', birthdate:'2003-02-20'}
    ], draw:10 },
    { title:'Creators & Internet Personalities', subtitle:'24 names, 10 shown', items:[
      {name:'MrBeast', birthdate:'1998-05-07'},{name:'Kai Cenat', birthdate:'2001-12-16'},{name:'IShowSpeed', birthdate:'2005-01-21'},{name:'Joe Rogan', birthdate:'1967-08-11'},{name:'Logan Paul', birthdate:'1995-04-01'},
      {name:'Emma Chamberlain', birthdate:'2001-05-22'},{name:'Mark Rober', birthdate:'1980-03-11'},{name:'Hasan Piker', birthdate:'1991-07-25'},{name:'Pokimane', birthdate:'1996-05-14'},{name:'KSI', birthdate:'1993-06-19'},
      {name:'Megan Thee Stallion', birthdate:'1995-02-15'},{name:"Charli D'Amelio", birthdate:'2004-05-01'},{name:'Addison Rae', birthdate:'2000-10-06'},{name:'Khaby Lame', birthdate:'2000-03-09'},{name:'Markiplier', birthdate:'1989-06-28'},
      {name:'Ninja', birthdate:'1991-06-05'},{name:'PewDiePie', birthdate:'1989-10-24'},{name:'Mr. Bean', birthdate:'1955-01-06'},{name:'Gordon Ramsay', birthdate:'1966-11-08'},{name:'Steve Harvey', birthdate:'1957-01-17'},
      {name:'Alix Earle', birthdate:'2000-12-16'},{name:'Airrack', birthdate:'1997-01-12'},{name:'Druski', birthdate:'1994-09-12'},{name:'Bretman Rock', birthdate:'1998-07-31'}
    ], draw:10 },
    { title:'Comedians', subtitle:'16 names, 10 shown', items:[
      {name:'Kevin Hart', birthdate:'1979-07-06'},{name:'Amy Schumer', birthdate:'1981-06-01'},{name:'Dave Chappelle', birthdate:'1973-08-24'},{name:'Tina Fey', birthdate:'1970-05-18'},{name:'John Mulaney', birthdate:'1982-08-26'},
      {name:'Ali Wong', birthdate:'1982-04-19'},{name:'Trevor Noah', birthdate:'1984-02-20'},{name:"Conan O'Brien", birthdate:'1963-04-18'},{name:'Iliza Shlesinger', birthdate:'1983-02-22'},{name:'Bo Burnham', birthdate:'1990-08-21'},
      {name:'Nate Bargatze', birthdate:'1979-03-25'},{name:'Sarah Silverman', birthdate:'1970-12-01'},{name:'Jim Gaffigan', birthdate:'1966-07-07'},{name:'Hasan Minhaj', birthdate:'1985-09-23'},{name:'Taylor Tomlinson', birthdate:'1993-11-04'},
      {name:'Michael Che', birthdate:'1983-05-19'}
    ], draw:10 }
  ]
});
