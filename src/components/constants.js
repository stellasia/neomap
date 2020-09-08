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


// default parameters for new layers
export const NEW_LAYER = {
	ukey: 'NewLayer',
	name: "New layer",
	layerType: LAYER_TYPE_LATLON,
	latitudeProperty: {value: "latitude", label: "latitude"},
	longitudeProperty: {value: "longitude", label: "longitude"},
	pointProperty: {value: "point", label: "point"},
	tooltipProperty: {value: "", label: ""},
	nodeLabel: [],
	propertyNames: [],
	spatialLayers: [],
	data: [],
	bounds: [],
	color: {r: 0, g: 0, b: 255, a: 1},
	limit: null,
	rendering: RENDERING_MARKERS,
	radius: 30,
	cypher: "",
	// TODO: this should not be in Layer state?
	hasSpatialPlugin: false,
	spatialLayer: {value: "", label: ""},
};
