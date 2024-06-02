## Development

1. Clone the repository to local machine
2. Navigate to the project directory
3. Run `npm run bootstrap` to install all dependencies for sub packages
4. Open another terminal window, and navigate to the backend directory at `packages/backend`
5. Run `npm start` to start the backend
6. On the other terminal, navigate to the frontend directory at `packages/frontend`
7. Run `npm run dev`
8. Access `http://localhost:5173` (or type `o + enter` into the terminal)

## Some important concepts and logic

### State management

The project uses Redux for managing state. Whenever the state changes, components that depend
on the state reload. For example, the kanban columns depend on the state to render all the tickets.
If a ticket is edited, added, or removed, the state changes, and the columns re-render to display the changes.

Modifying the state with Redux happens by dispatching actions (both dispatch and action are imporant keywords so keep them in mind)
Action is a function that modifies the state, and dispatching is the way of executing the action.
So, dispatching the action kanban/editTicket with some data modifies the state, and components depending on the state re-render.
Kanban actions are defined in `packages/web/src/features/kanbanSlice.js`.

### Keeping clients in sync

For this kind of application, it is imperative to keep all clients in sync with one another.
If one client moves a ticket to the next column it must be moved for everyone else as well.

This is achieved using WebSockets. Unlike more traditional HTTP GET/POST/etc., WebSockets are bi-directional,
meaning that messages and data can be sent from client to server, and vice-versa.
Furthermore, the server has a list of all connected clients which is crucial; otherwise, the server could not sync all clients.

### State + WS

Now that we know the two main systems underneath the application, we can go into how those two interact with each other

Lets start by finding the action listener.
In `packages/web/src/App.jsx`, we have part where we use `useWebSocket` method to connect to the server.
The method also has an event listener `onMessage`. Now, and this is very important, whenever the server sends
a websocket message to the client, the client checks if the message is of type "dispatch", and if it is, it *dispatches an action*.
In other words, essentially, a client can dispatch actions on other connected clients via WebSockets. Which, by the way, is fucking cool, if you care for this kind of stuff. Pardon my language.
Through the dispatched action the state is modified and relevant components re-render, achieving [perfect syncronization](https://www.youtube.com/watch?v=j_0aBLn-FUI), unless something goes to shit, of course.

Now, we can inspect `Board.jsx`. The file has `handleDragEnd` that has two important methods: `sendJsonMessage` and `dispatch`.
Sometimes we don't have to run everything through the server, and just immediately update the client.
In these cases we can dispatch the action, and also send a sync request to the server using `sendJsonMessage`.
On server, we then modify the database if needed, and send the updated information to all connected clients, except the original client who moved the ticket and initiated the sync.

All other clients then receive the WebSocket message about moving the ticket, the action is dispatched in App.jsx, the state is modified, and columns re-render with new ticket positions.

## Philosophy and design reasoning

This documentation is written by Roope Sinisalo, the lead developer (lmao) of the project at the time.
I was, for the better or the worse, the most experienced of the lot, so I selected, decided, and initiated many used technologies, so blame me I guess.
The text is written from my perspective so, unless mentioned otherwise, "I" and "me" refers to, well, me.
I hope it contains some useful information for the future groups that work on the project, and not just my random ramblings. Most of the stuff should be in the project plan as well.

Also, while you're here, some additional information on the project:
This iteration / version of the project took place during the spring semester of 2024 after the previous group had worked on the same assignment on the previous semester.
We continued (or tried to, anyway) the work of the previous project group. However, there was not much documentation - nor work - left behind.
Not to blame anyone, but the GitHub seemed to be somewhat of a mess with nothing in the main branch and bunch of stuff behind 5 branches.
There also wasn't real trace of requirements, user stories, etc. so instead of trying to figure out what was going on for the next x weeks,
we decided to start from the beginning. The project manager, Vladislav Smelko, collected new requirements from KITT and theFIRMA CEO Joonatan Cheney.
We created a new wireframe and the project's designer created an astonishing mockup which we then showed to KITT and Joonatan.
Feedback was taken into consideration and appropriate changes were made.
We designed Database diagrams, API endpoints, and all that jazz, and documented everything on Teams unless someone fucked up at some point in the timeline.
During and after that the project initiation and development started, and the rest of this section is about that. Good luck, and I'm sorry.

### Inner workings and logic

The purpose of the project was to develop a locally run ticket management system for KITT. As such, we did not need any real servers or hosting in general.
Also, when asked from ex-CEO, and from what I understood, at the time theFIRMA didn't really have people skilled enough to manage deployments etc. on their own servers (kekw).
Alas, I digress.

Because aforementioned requirement, I thought we can use Vite's preview server feature with the `--host` flag. After the application is built (using `vite build`), the resulting production version
can be "previewd" using `vite preview` or `npm run preview`. It works similar to `vite dev` / `npm run dev`, and allows the host to access the application at `localhost:4173` (note, dev uses 5173).
When paired with the `--host` flag, the project is exposed to LAN, and other devices can access it using the host's IP. In theory, this sounds very convenient, and it is probably what we
are going to be using at the beginning. However, after taking a closer look at [Vite's documentation](https://vitejs.dev/guide/cli.html#vite-preview), it says, and I copy-paste,
"Locally preview the production build. Do not use this as a production server as it's not designed for it." Huh. That seems not-so-good. I think it's probably fine though.
If the project at some point decides to not work, we can host the application locally some other way, there is no way that isn't possible.

Hosting out of the way, the next stop is server-client connections and such.

The main concern and question I had from the start was "How do we keep the clients synced?". Afterall, KITT has a PC at the front-desk and in the backroom, and it would be very inconvenient, dangerous even,
to require the staff to reload the page all the time. They don't remember to do that, and then the database is overwritten by changes from whichever was out-of-date.
We could, of course, auto-reload the page every now and then, but that causes new problems: what if a user is editing a ticket? do we pause the reload process until thats done? what if something happens on the other machine in the meantime? how much duct-tape and gum is required for all this?

Enter Websockets. Whenever a client connects to the server, a bidirectional WS connection is opened.
This means that when a user creates a new ticket (or edits or deletes, or basically anything other than GET), it is saved to the database (of course), but the data is also sent to all other users connected to the server.
Then, all the other users who received the data can render the ticket locally without the need for full reload or re-fetch. Everything is in sync. Cool. Also, as far as I know, this is what Trello does.
This isn't normally possible, by the way, at least to my knowing. Normally the server is only aware of requests and responses it receives and sends, and it doesn't have a full list of connected users. It also cannot send data to client unless it is expected.
I considered Server Sent Events, another way to send data in realtime, but they are unidirectional from server to client. It would most likely be doable, but in the end WebSockets are more versatile and, and I think, more convenient.

Anyway, [I cannot wait for everything to turn shit when I realize the choices I made were all wrong](https://i.kym-cdn.com/photos/images/newsfeed/001/318/550/e2d.jpg).

I was gonna write something more but I forgot what. Oh well, take care.


## Filestructure
Instead of having separate repositories for front- and backend, we / I decided to
create a single monorepo for them both. For that end, I started by creating a [Lerna](https://lerna.js.org/) project.
The real reason and need for Lerna (for our use case, anyway) is somewhat unclear, but it is what the tutorial said to do so it is what it is.
The monorepo's root has a node_modules folder, where all packages from both front- and backend are installed. An exception to this are some package specific cache files and such.

Now, the monorepo has packages/ directory that houses the backend and web / frontend projects. Both have package.json's of their own, but like said, `npm i` installs packages to the root.
I would have liked to have less duplication especially with the scripts but didn't really have time for researching and figuring that out.

## Backend
For backend we settled for **node.js**  (18.18.2) and **express.js**, because both are popular libraries and, perhaps more importantly, used on school courses which helps with familiarity.
More of backend and its (file)structure can be read on the backend's own README file.
[ ] TODO: write backend's README


## Frontend
Frontend uses React.js library, mainly for same reasons as express.js; popularity and usage in school projects.
For general tooling we use [Vite](https://vitejs.dev/), that offers faster-than-create-react-app browser updates: aka how long it takes for changes to appear on the browser.
**Importantly** and conveniently, Vite suppors --host flag when starting development or preview environment.
Basically what it does is that it exposes the project to LAN. This is very useful especially for our usecase, because we can build the project on one of the KITT machines,
run `npm run preview --host` to boot up the now-built production version of the app, and access it via `192.xx.xx.xx:4173` (or whatever) on the other KITT devices - all out of the box.
KITT operates on a closed LAN so, in the words of Todd Howard, "it just work". In theory anyway, it hasn't been tested yet lmao.

We also decided to use [tailwindcss](https://tailwindcss.com/), which me and my friend group have found excellent in our projects.
[ ] TODO: write frontend's README


## Database
SQLite was selected for the lightweightness, easiness-of-use, and locality-ness (are these words?).
Because the project had to (at the time anyway) only run locally on one of KITT machines, we neither needed nor wanted a separate server for the database.
SQLite also seemed faily easy to use, and it provided straightforward CLI commands to "dumb" all the data into a file for backuping (something that is yet to be done).
I also considered PostgreSQL, MySQL, Redis, and some others, but none of them really stood out in relation to this project and use-case.

In the end, I don't think the used database matters all that much, and everyone has their own preferences so it's whatever.
I'd imagine some script is enough to transfer data from one to another if the need arises, though I'm not too familiar with that process myself I'm afraid.

### General tooling etc.
We use [Prettier](https://prettier.io/) for code formatting using `npm run format`. This script is added to both frontend and backend.
In addition, with React.js comes [eslint](https://eslint.org/) which can be used witht the command `npm run lint`, though only in frontend project.
Before you ask, the difference between them is that prettier makes the code consistent (e.g. all strings use single-quotes ' instead of double "), and lint looks for possible bugs.
While in the end it is up to the project manager / lead developer, I personally think using both commands before committing should be mandatory.

Typescript was not used because most team members were not familiar enough with it and there was already bunch of new stuff requiring learning.
