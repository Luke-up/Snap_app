This is the frontend repository for a Snap game.
Game uses websockets with Socket.io to enable realtime chat and gameplay.

Game is available to use on: https://snap-app-qsg9.onrender.com/
To run on your local machine this frontend React application should be paired with the snap server node application which will facilitate the backend server.
https://github.com/Luke-up/Snap_server

To play first enter a name in the top right corner.
If you are the first player you can create the room by optionally choosing topics from the options provided, if none of the options are selected the cards will show a mix of all of the categories.

These categories have been filled with Japanese language onomatopeia as a fun way to study this part of speech. 
However these can be easily editted on your own machine, should you wish to clone this repo.
The cards.json folder determines the content of the cards.
Cards are made of a category which should be one of the 3: animals, emotions and verbs.
Then a value which is unique for each card, the value can be the same as one of the hints as well, this is then used to check if two selections are matching.
Lastly each card must have 3 hint options, these can be duplicates within a single card, but multiple hints should not be the same over 2 or more cards. Otherwise this could result in a player choosing 2 cards the match, but not getting the points as the cards would have different values.
For example if cards with the values of 'mouse' and 'rat' both shared the same hint of 'Squeak' then a player might incorrectly recieve a negative mark if choosing the 'Mouse' 'Speak' and the Rat 'Squeak' as matches.

Once the categories have been chosen the create room button should be pressed which will direct you to the new room.
In the header you can find this rooms unique id, which should be shared with other players in order for them to join.

To join an existing room the room must currently have less than 5 players.
If there are 5 players already the room will be considered full.
Enter the join id which should be shared by the room creator in the join room input box and press the join room button.
Once more than one person has entered the room the option to ready up will show.
Clicking ready up adds the player to the waiting players list, once all players have readied the game will begin.
If at any point a player clicks the exit button in the top right of the screen they will return to the homescreen and their data removed from the room.
Players will also return to the pre-ready state.

Once a game has started each player will recieve a card matching one of the categories selected.
The players will have three seconds to check their own cards before the other cards are revealed.
The player then has two options, to snap or not snap.

The snap button is shown in green and should only be pressed if the user sees two matching cards. 
Once pressed this action cannot be taken back, to prevent players from hijacking a round.
If the snap button is pressed the user must then select the two matching cards.
These two cards will be compared and points awarded or subtracted from the user.
Once the user presses snap the game state is paused for the rest of the users, who cannot do anything until the user clicks on the two matching cards.
If the cards are not matches the user will recieve a score subtraction and other users will resume the round.
Gameplay continues until a match is found or there are no more users, or in the last case if a user declares that all the cards are unique.

The option to declare no matches is shown alongside the snap button.
This button can be pressed if the user believes there are no matches.
If the user is correct they will be awarded points.
If not then they will recieve a subtraction of points and the game will continue if there are more players otherwise revert to the pre-ready state.

Game scores are shown in the top left alongside a chatbox which will update the gameplay of each phase and show player actions.
The players can also chat directly into this chatbox.

Game has been set to have a 30% chance of showing a matching pair every round.
