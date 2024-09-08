# Snap Game Frontend

This is the frontend repository for a **Snap game**.  
The game uses WebSockets with Socket.io to enable real-time chat and gameplay.

### Game Link:
- Play the game at: [https://snap-app-qsg9.onrender.com/](https://snap-app-qsg9.onrender.com/)

### Backend Server:
To run the frontend React application locally, you need to pair it with the Snap server Node.js backend:  
- Backend repo: [https://github.com/Luke-up/Snap_server](https://github.com/Luke-up/Snap_server)

---

## How to Play

__Game might be slow to start up as the server will spin down after 15 minutes of inactivity. If this is the case, simply wait 60 seconds, refresh the page and try again. __

1. **Enter a Name**  
   Start by entering a name in the top-right corner.

2. **Create a Room**  
   If you're the first player, you can create a room by choosing topics from the options provided.  
   If no options are selected, a mix of all categories will be shown on the cards.

3. **Game Categories**  
   The categories are filled with Japanese onomatopoeia for fun study, but these can be edited on your own machine.  
   - Categories are stored in the `cards.json` folder.  
   - **Each card** must include:
     - A **category**: animals, emotions, or verbs.
     - A **unique value** for each card.
     - **Three hints** (duplicates within a card are allowed, but no duplicate hints across cards).  
       - Example: Avoid cards with "mouse" and "rat" sharing the same hint like "Squeak" to prevent scoring issues.

4. **Room Creation**  
   After selecting the categories, click the `Create Room` button. You'll be directed to the new room.  
   - Share the unique room ID (in the header) with others to invite them.

5. **Join a Room**  
   A room can have a maximum of 5 players.  
   To join, enter the room ID in the `Join Room` input box and press `Join Room`.

6. **Ready Up**  
   Once two or more players have joined, the `Ready Up` button will appear.  
   - Players who click it will be added to the waiting list.
   - Once all players are ready, the game will begin.

7. **Exit the Room**  
   Clicking the `Exit` button in the top-right returns the player to the homescreen, and removes their data from the room.

---

## Gameplay

1. **Card Reveal**  
   Once the game starts, each player receives a card based on the selected categories.  
   - Players have **3 seconds** to check their card before all cards are revealed.

2. **Snap or Not Snap**  
   Players then decide to `Snap` or `Not Snap`.  
   - The `Snap` button will appear in green if two matching cards are visible.  
   - If a player presses `Snap`, they must select the two matching cards to score points.

3. **Match Validation**  
   After snapping, the game pauses, and the player selects the two cards.  
   - **Correct match**: Player gets points, and the round ends.  
   - **Incorrect match**: Player loses points, and the game continues.

4. **Declare No Matches**  
   Players can declare no matches if they believe there are none.  
   - Correct declaration awards points, while an incorrect one results in a penalty.

5. **End of Round**  
   The game continues until a match is found, all players leave, or all cards are declared unique.

---

## Scoring and Chat

- **Game Scores**: Shown in the top-left corner of the screen.
- **Chatbox**: A chatbox is available to communicate with other players and track game progress and actions.

---

### Game Logic

- There is a **30% chance** of showing a matching pair in each round.
