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

Once the server has started up you'll be able to access time crunch by going to http://localhost:3000/

## TODO

* Design dashboard

* Implement dashboard alerts for expiring food

* Implement top 10 recipe suggestions on dashboard

* Implement expiring soon warnings on dashboard

* Implement "add to shopping list" feature

* Use new unit input for food

* Make new unit input on food less ugly

* Add shopping list feature

* Add shopping list page

* Add shopping list controller

* Add shopping list routes

* Center column labels

* Implement different recipe sorts selectable by dropdown

* Add arrows next to recipe column heads to indicate sorting state

* Force all ingredients to be same unit type (imperial or metric) with exception of non-standard (pinch, dash, etc)

* Allow users to convert recipes to their units of choice

* Separate recipe form from ListCtrl

* Highlight expired foods

* Design recipe categories

* Use universal units to determine if user can make recipe with current stock

* Allow for users to input other types of units (eg Cloves)

* Add unusual measurements (dash, pinch, etc)

* Force users to use https

* HTTPS support

* Write "How to Use" documentation

* Add "In Action" section to README

* Filter recipes by only what user has ingredients for

* Allow user to turn off ingredient filter on recipes

* Allow user to mark recipe as "made" subtract food from pantry

* Implement "active" classes for appropriate navbar links

* Implement pagination in recipe list

* Create liked recipe list