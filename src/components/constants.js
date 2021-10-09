// layer type: either from node labels or cypher
export const LAYER_TYPE_LATLON = "latlon";
export const LAYER_TYPE_POINT = "point";
export const LAYER_TYPE_CYPHER = "cypher";
export const LAYER_TYPE_SPATIAL = "spatial";

// TODO: move this into a separate configuration/constants file
export const RENDERING_MARKERS = "markers";
export const RENDERING_POLYLINE = "polyline";
export const RENDERING_HEATMAP = "heatmap";
export const RENDERING_CLUSTERS = "clusters";
export const RENDERING_RELATIONS = "relations";

// default parameters for new layers
export const NEW_LAYER = {
  ukey: undefined,
  name: "New layer",
  layerType: LAYER_TYPE_LATLON,
  latitudeProperty: { value: "lat", label: "lat" },
  longitudeProperty: { value: "lon", label: "lon" },
  pointProperty: { value: "point", label: "point" },
  tooltipProperty: { value: "", label: "" },
  relationshipTooltipProperty: { value: "", label: "" },
  nodeLabel: [],
  propertyNames: [],
  spatialLayers: [],
  data: [],
  bounds: [],
  color: { r: 0, g: 0, b: 255, a: 1 },
  limit: null,
  rendering: RENDERING_MARKERS,
  radius: 30,
  cypher: "",
  relationshipLabel: [],
  relationshipColor: { r: 0, g: 100, b: 255, a: 0.8 },
  // TODO: this should not be in Layer state?
  hasSpatialPlugin: false,
  spatialLayer: { value: "", label: "" },
};
