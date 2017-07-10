# time crunch - Work In Progress

A webapp that keeps track of sell by dates of food in the user's fridge and pantry, and recommends recipes based on the food the user currently owns.

## Concept

time crunch is a web application for finding recipes that use your soon-to-expire food and help reduce your home's food waste. Users can add/share their own recipes or link to their favorite recipes hosted on other sites.

## Setup

#### Before Cloning

Before following the rest of this setup you must install Node.js and npm. npm has provided some helpful instructions on how to do this that can be found [here](https://docs.npmjs.com/getting-started/installing-node).

#### Installation and Running

After cloning this repository run:

>npm install

This will install all dependencies needed to run this app.

Now you're ready to run!

>SECRET='{ENTER_A_SECRET}' npm start

to run in development mode use `env='development'` in the above command.

The secret is necessary for signing json web tokens, and this application cannot run properly without one.

Once the server has started up you'll be able to access time crunch by going to http://localhost:3000

## TODO

* Move routes into separate files

* Load vote when getting recipe details

* Integrate vote into recipe object in angularApp

* Move factories into separate files

* Reflect proper vote status after refresh

* Create vote factory

* Use vote model to track users vote status

* Destroy votes in unvote route

* Add upvote/like button to recipe list (?)

* limit user to one like/upvote per recipe

* undo like/upvote if user clicks a second time

* Allow user to select score as sort option

* Implement different recipe sorts selectable by dropdown

* Separate recipe form from ListCtrl

* Highlight expired and soon-to-expire foods

* Design recipe categories

* Implement upvotes/downvotes for recipes

* Backend unit conversions

* Convert all volume to ml on backend

* Create volume conversion table

* Convert all weight to g on backend

* Create weight conversion table

* Backend metric to imperial conversions (and reverse)

* Standardized unit inputs

* HTTPS support

* Write "How to Use" documentation

* Filter recipes by only what user has ingredients for

* Allow user to mark recipe as "made" subtract food from pantry

* Implement "active" classes for appropriate navbar links

* Implement pagination

* Create favorite recipe function

* Implement recipe favorite button

* Change delete to checkboxes