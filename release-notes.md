# neomap release notes

## 0.5.1 (2020-08-08)

- Fix overflow in side bar (layer configuration)
- Publish package to NPM and update installation instructions

## 0.5.0 (2020-07-04)

- Support for clusters in map rendering (#50)
- Add support for Neo4j point built-in type (#58)
- Better support for Neo4j Desktop versions (#53)
- Support for Neo4j 4.x (#60)
- Some code refactoring (#52 - #58)

## 0.4.0 (2020-02-27)

- Performance improvements for map display (#32)
- Use a color picker to choose marker color in the full palette (#11)
- Change marker tooltips to popup (so that one can copy/paste the content) and icon markers to circle markers
- Introduction of a "Polyline" rendering. So far, only supports single polyline (beta)
- Added support for [neo4j-spatial plugin](https://github.com/neo4j-contrib/spatial) SimplePoint layers (#5) (beta)
- Add "Save As" and "Open" basic functionality (beta)
- Bug fix: enforce tooltip is a string (fix rendering issue in some weird cases)
- Fix CI on GitHub
- Code refactoring by introducing a neo4jService to isolate the DB queries

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
