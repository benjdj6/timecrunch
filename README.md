# time crunch - WIP

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

The secret is necessary for signing json web tokens, and this application cannot run properly without one.

Once the server has started up you'll be able to access time crunch by going to http://localhost:3000

## TODO

* Highlight expired and soon-to-expire foods

* Create recipe edit page

* Restrict recipe editing to original author

* Allow user to update food amount values

* Design recipe categories

* Implement upvotes/downvotes for recipes

* Backend unit conversions

* Backend metric to imperial conversions (and reverse)

* Standardized unit inputs

* HTTPS support

* Write "How to Use" documentation

* Improve comments on templates

* Don't expose stack trace on prod

* Handle unauthorized errors more elegantly

* Update forms to use bootstrap inputs

* Filter recipes by only what user has ingredients for

* Allow user to mark recipe as "made" subtract food from pantry

* Implement "active" classes for appropriate navbar links

* Make recipe form prettier

* Add edit button to recipe detail page

* Format ingredients on details page to be more table/list like

* Implement pagination

* Create favorite recipe function

* Implement recipe favorite button

* Create distinction between public/private recipes

* Change delete to checkboxes