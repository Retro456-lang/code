# 01. Simple English Mental Models & Analogies (10-Year-Old Level)

Welcome to your mental model foundation! If you freeze in front of a blank file offline, it means you were memorizing code lines instead of understanding the real-world mental models. 

Read these analogies carefully. When you write code, picture these physical objects in your mind!

---

## 1. Client & Server: The Restaurant Customer and Kitchen

```
[ CLIENT ]  ---- (1) Sends Request (Order Slip) ---->  [ SERVER ]
(Android)   <--- (2) Returns Response (Dish/Food) ---  (Express Node)
```

* **The Client (Android App)**: Imagine a customer sitting at a restaurant table. The customer cannot cook food themselves; they can only read the menu, make an order, and wait for the food to arrive.
* **The Server (Express.js)**: Imagine the restaurant waiter and kitchen. The kitchen receives the order slip, prepares the food, packs it nicely, and sends it back to the customer.
* **Golden Rule**: The kitchen NEVER sends food unless a customer orders it first! A Server only responds when a Client makes an HTTP Request.

---

## 2. Database & SQL: The Grand Filing Cabinet & The Magic Clerk

```
[ SERVER ]  ---- (1) SQL Command ("FIND USER #5") ---->  [ DATABASE ]
(Express)   <--- (2) Folder Data (Rows & Columns) ----  (PostgreSQL)
```

* **The Database (PostgreSQL)**: A gigantic, locked steel filing cabinet in the back room of the restaurant. Inside are organized drawers called **Tables** (e.g., `users` table, `orders` table).
* **SQL (Structured Query Language)**: The special magic language spoken by the filing clerk guarding the cabinet. 
* If Express says: *"Hey cabinet, give me user!"* -> The clerk ignores Express.
* If Express speaks SQL: `SELECT * FROM users WHERE email = 'alex@example.com';` -> The clerk instantly opens the exact drawer, finds the matching sheet of paper, and hands it to Express!

---

## 3. HTTP Verbs: The 4 Types of Menu Requests

When the Client talks to the Server, it must specify **what action** it wants to take:

| HTTP Verb | Restaurant Analogy | Database Action | Example |
| :--- | :--- | :--- | :--- |
| **GET** | *"Can I look at the menu?"* | Read / Fetch | Get user profile or list of products |
| **POST** | *"I would like to place a NEW order."* | Create / Insert | Register a new user or submit login credentials |
| **PUT** | *"Please change cheese to swiss on my order."* | Update / Replace | Update user profile details |
| **DELETE** | *"Cancel my order!"* | Remove / Delete | Delete an account or order |

---

## 4. Password Hashing (bcrypt): The Secret One-Way Blender

```
"myPassword123" + Salt 🧂  ---> [ BCRYPT BLENDER ] ---> "$2b$10$eW8...x9Z"
                                                          (Confetti!)
```

* **Why Hashing?**: Never store plain passwords like `supersecret123` in the Database filing cabinet! If a burglar breaks in, they steal everyone's password.
* **The Blender Analogy**: `bcrypt` is a magic food blender. You throw `supersecret123` into the blender along with a pinch of random salt (`Salt` 🧂). The blender shreds it into un-mixable confetti (`$2b$10$eW8...x9Z`).
* **One-Way Rule**: You CANNOT un-blend confetti back into whole paper.
* **How Login Works**: When the user logs in with `supersecret123` tomorrow, you put it through the exact same blender with the stored salt. If the resulting confetti matches the stored confetti, the password was correct!

---

## 5. JWT (JSON Web Token): The Theme Park VIP Wristband

```
[ LOGIN SUCCESS ] ---> Server hands Client a Sealed Wristband (JWT)
                      [ Header . Payload (User ID) . Secret Stamp ]

[ NEXT REQUEST ]  ---> Client wears Wristband: `Authorization: Bearer <JWT>`
                      Server checks stamp seal (No DB lookup needed!)
```

* **The Analogy**: Imagine going to a Theme Park. You show your ID and pay at the main entrance gate (Login).
* **The Problem**: You don't want to show your passport and pay $50 every single time you board a roller coaster (Protected Routes like Profile or Dashboard).
* **The JWT Solution**: The gatekeeper gives you a waterproof **VIP Wristband** stamped with the Mayor's Secret Golden Seal.
* **Using the JWT**: For the rest of the day, when you get on any ride, the ride operator just inspects the Golden Seal on your wristband (`Authorization: Bearer <token>`). If the seal is intact, you get in immediately! The ride operator doesn't need to call the main entrance gate to verify who you are.

---

## 6. Kotlin Network Requests: The Stage Actor & Background Drone

```
[ MAIN UI THREAD ]  ---> Actor on stage (Renders buttons, handles clicks)
                         * MUST NEVER BLOCK OR STOP *

[ COROUTINE / IO ]  ---> Background Drone (Flies over network to Express)
                         * Gets JSON -> Flies back -> Updates UI *
```

* **Main Thread (UI Actor)**: Android's Main Thread is an actor performing live on stage in front of 1,000 audience members. If the actor freezes for 3 seconds waiting for a network response, the app crashes with an ANR (Application Not Responding) dialog!
* **Background Coroutines (Messenger Drone)**: When the user clicks "Login", the UI Actor launches a background messenger drone (`Dispatchers.IO`). The drone flies over the network to the Express server, waits for the response, flies back, and hands the JSON data to the UI Actor (`Dispatchers.Main`) to draw on screen.
