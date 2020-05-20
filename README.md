# Vamp Web

The web front-end for Vamp. Written in React and Typescript. This is served to browsers.

Figma design: https://www.figma.com/file/D3N0p97W7eIBJgQJgwPVPUNY/Looper-Site-Project?node-id=136%3A517

Vamp tasks Trello: https://trello.com/b/rTThP8dv

If you can't access these ask me (Jeff).

## Getting Started

To get started you should have [NPM](https://www.npmjs.com/) and [Node](https://nodejs.org/en/) installed.

1. `git clone https://github.com/JeffDemanche/vamp-server` and `git clone https://github.com/JeffDemanche/vamp-web` into the same directory (so there are sibling directories `vamp-server` and `vamp-web`).
2. Run `npm i` in both directories to make sure all NPM packages are up-to-date.
3. In `vamp-server` run `npm run dev`. This will start the server. In `vamp-web` run `npm run webpack`. This will run the Webpack script that automatically builds the web client bundle that the server serves to users.
4. You should now be able to visit `localhost:4567` and be served the app from the server.

## Contributing

For now don't merge anything into master without having someone look at the pull request. The basic workflow should be that when you start working on a feature run `git checkout -b <branch name>`. Then commit changes to that branch and publish a pull request when you want feedback.