# neo-map release notes

## 0.4 (WIP)

- Added support for [neo4j-spatial plugin](https://github.com/neo4j-contrib/spatial) SimplePoint layers
- Bug fix: enforce tooltip is a string (fix rendering issue in some weird cases)
- Fix CI
- Code refactoring


## 0.3.1 (2019-11-19)

- Remove warning popup when changing the limit (#36);
- Fix the tooltip input display (#34);
- Improve map centering/zooming (now fit bounds);
- Lat/lon/tooltip labels now selectable from list of available labels;


## 0.3.0 (2019-11-17)

- Better error and warning handling:
    - Inform the user when query returns no result
    - Warning when switching from advanced to simple query
    - Warning before deleting a layer (definitive action)
- Possibility to switch from simple to advanced layer with pre-filled query
- Possibility to show the generated query for simple mode layer
- Display the selected marker color in the layer header (left side bar)
- Maximum number of points shown on the map is customizable (marker layer)
