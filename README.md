# Exele Event Map - OSIsoft Visualization Virtual Hackathon 2017 Entry

A Project Vision custom symbol, from [Exele][exele], for entry in [OSIsoft's Visualization Virtual Hackathon 2017](https://pisquare.osisoft.com/community/developers-club/hackathons/blog/2017/01/13/visualization-virtual-hackathon).

![The Exele Event Map](https://cloud.githubusercontent.com/assets/238079/23826489/dab12766-066a-11e7-8f28-5832ee33aa28.gif)

## Exele Event Map

This symbol provides [a treemap][treemap] graphic of Event Frames (EF) for an AF Element in Project Vision. This allows Project Vision users to analyze their Event Frames to discover patterns, correlations, or commonalities within, and between, Event Frames and their attributes.

## Features

* Generation of Event Treemap using display time context
* Filtering by EF Template
* Adjustment of cell sizes and colors by selected EF Template attributes
* Displays EF Attribute values by clicking on any cell in the Event Map
* Displays a summary of total EF duration
* Supports element context switching

## Video demonstration
[See our demo on YouTube](https://www.youtube.com/watch?v=dhGGgUiWyf0)

## Usage

By default, the cell size is proportional to the Event Frame duration and the cell color indicates the Event Frame Template.

Hovering over a cell will show summary data about the Event Frame. Clicking on a cell displays attribute Event Frame Template Attributes values in a table.

If a template filter is applied then attributes can be selected to control the size and color of the cell. Selecting “None” for either attribute size and/or color sets the cell attributes to the EF duration and EF template name, respectively.

## Use Cases

The Event Map allows an end user to quickly discover outliers, abnormal events and patterns.  The visual representation of cell size and color make it easy to analyze the events.  When viewing all event templates the frequency and duration of each type of event is readily apparent.  This can help answer questions such as:

* Which events account for the most or least time for a particular asset?
* What is the proportion of time for one event type compared to another?

Mapping the size and color dimensions of the cells to Event Frame attributes identifies which events were most or least impactful.  This can help answer questions like:

* Which of these events had the best or worst outcome and what attribute contributed the most to that outcome?

This information can be used to tune an asset or refine a procedure.

## Background

After a number of discussions on what PI Visualization users require to obtain improved insight into their data, the Exele hackathon team decided upon [a treemap][treemap] symbol that we are calling an “Event Map”.

Our goal for the Event Map symbol was to allow quick and easy visual comparison of multiple events, comparison across assets, and easily identify the most significant outliers among selected dimensions.

We liked the idea of the using a treemap as it allows a user to easily view multiple dimensions using using both cell size and color.  We also decided to calculate total duration, provide additional context by show Event Frame attributes (by clicking), and including tooltips to include more information for exploring the data.

## Examples of the symbol in use

In the below image of our Event Map, we have shown a one to one ratio between the size of the cell, and the color.  The darker blue represents a higher value and the white represents a smaller value:

![An event map showing a spectrum from darker blues for higher values to lighter blues for smaller values](https://cloud.githubusercontent.com/assets/238079/23826247/baebfd56-0666-11e7-9af7-daecb9ed25fb.png)

The Event Map symbol can also show the distribution of EFs under multiple EF templates for a single AF Element. Here, three EF templates are depicted, and the color of the cells represent the template:

![An event map showing EFs filled in with colors determined by their EF templates](https://cloud.githubusercontent.com/assets/238079/23826248/baec2ed4-0666-11e7-8b12-8019bd4b5bf3.png)

The event map can be used to compare events from multiple assets:

![Multiple event maps comparing EFs from different assets](https://cloud.githubusercontent.com/assets/238079/23826249/baecb3b8-0666-11e7-9ee3-645022ce001e.png)

## Installation

* Download this project and copy the symbol-related files to, or clone the repository into, the `ext` folder of your Project Vision installation, e.g. `INSTALLATION_FOLDER\Scripts\app\editor\symbols\ext`
* Change the variable `apiURL` in the file [sym-eventmap.js](./sym-eventmap.js) from `https://pisrv01.pischool.int/PIwebapi` to the URL of your PI Web API.

## Dependencies

In addition to the libraries supplied by Project Vision, there is a dependency on D3. A copy is provided with the source code in the libraries folder and will automatically be used by Project Vision.

## Development

This project provides files useful for local development in the [local folder](./local). These files can be used to test the symbol without Project Vision given only a PI Web API Server. There is no dependency on Angular.

You can host the local development files using Visual Studio or via any static file server.

## Original Authors

* Dan Fishman
* Mike Kiefer
* James Sconfitto

We hope that you enjoy our symbol and are happy to hear your thoughts on its use at your company.

We’d like to thank [Exele][exele] for allowing us to invest our time and resources into participating in this hackathon. [Learn more about Exele and our products on our website][exele].

## License

Copyright 2017 Exele Information Systems, Inc.

This work is released under the [Apache 2.0 license](./LICENSE).

## Future development

We look forward to continuing development of existing features as well as adding new features. Here are some next steps we are considering:

* Allow the user to choose between different color schemes that can be used to color the event map's cells.
* Display to the user the domain of their sizing and coloring attributes and where their selected EF falls on that domain.
* Add the ability to categorize EFs by attributes that are Enumeration Sets. This will allow the viewer to compare and contrast EFs sharing the "categorizing" attribute but differing by the "colorizing" attribute.
* Increase the use of batch calls and batch subrequests to improve performance and reduce network requests

[exele]:http://exele.com
[treemap]:https://github.com/d3/d3-hierarchy/blob/master/README.md#treemap
