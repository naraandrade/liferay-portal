/**
 * Copyright (c) 2000-present Liferay, Inc. All rights reserved.
 *
 * The contents of this file are subject to the terms of the Liferay Enterprise
 * Subscription License ("License"). You may not use this file except in
 * compliance with the License. You can obtain a copy of the License by
 * contacting Liferay, Inc. See the License for the specific language governing
 * permissions and limitations under the License, including but not limited to
 * distribution rights of the Software.
 */

import {Graph} from 'graphlib';

import * as _ from './lodash';

/*
 * Adds a dummy node to the graph and return v.
 */
function addDummyNode(g, type, attrs, name) {
	var v;
	do {
		v = _.uniqueId(name);
	} while (g.hasNode(v));

	attrs.dummy = type;
	g.setNode(v, attrs);

	return v;
}

/*
 * Returns a new graph with only simple edges. Handles aggregation of data
 * associated with multi-edges.
 */
function simplify(g) {
	var simplified = new Graph().setGraph(g.graph());
	_.forEach(g.nodes(), (v) => {
		simplified.setNode(v, g.node(v));
	});
	_.forEach(g.edges(), (edge) => {
		var simpleLabel = simplified.edge(edge.v, edge.w) || {
			minlen: 1,
			weight: 0,
		};
		var label = g.edge(edge);
		simplified.setEdge(edge.v, edge.w, {
			minlen: Math.max(simpleLabel.minlen, label.minlen),
			weight: simpleLabel.weight + label.weight,
		});
	});

	return simplified;
}

function asNonCompoundGraph(g) {
	var simplified = new Graph({multigraph: g.isMultigraph()}).setGraph(
		g.graph()
	);
	_.forEach(g.nodes(), (v) => {
		if (!g.children(v).length) {
			simplified.setNode(v, g.node(v));
		}
	});
	_.forEach(g.edges(), (edge) => {
		simplified.setEdge(edge, g.edge(edge));
	});

	return simplified;
}

function successorWeights(g) {
	var weightMap = _.map(g.nodes(), (v) => {
		var sucs = {};
		_.forEach(g.outEdges(v), (edge) => {
			sucs[edge.w] = (sucs[edge.w] || 0) + g.edge(edge).weight;
		});

		return sucs;
	});

	return _.zipObject(g.nodes(), weightMap);
}

function predecessorWeights(g) {
	var weightMap = _.map(g.nodes(), (v) => {
		var preds = {};
		_.forEach(g.inEdges(v), (edge) => {
			preds[edge.v] = (preds[edge.v] || 0) + g.edge(edge).weight;
		});

		return preds;
	});

	return _.zipObject(g.nodes(), weightMap);
}

/*
 * Finds where a line starting at point ({x, y}) would intersect a rectangle
 * ({x, y, width, height}) if it were pointing at the rectangle's center.
 */
function intersectRect(rect, point) {
	var x = rect.x;
	var y = rect.y;

	// Rectangle intersection algorithm from:
	// http://math.stackexchange.com/questions/108113/find-edge-between-two-boxes

	var dx = point.x - x;
	var dy = point.y - y;
	var w = rect.width / 2;
	var h = rect.height / 2;

	if (!dx && !dy) {
		throw new Error(
			'Not possible to find intersection inside of the rectangle'
		);
	}

	var sx, sy;
	if (Math.abs(dy) * w > Math.abs(dx) * h) {
		// Intersection is top or bottom of rect.

		if (dy < 0) {
			h = -h;
		}
		sx = (h * dx) / dy;
		sy = h;
	} else {
		// Intersection is left or right of rect.

		if (dx < 0) {
			w = -w;
		}
		sx = w;
		sy = (w * dy) / dx;
	}

	return {x: x + sx, y: y + sy};
}

/*
 * Given a DAG with each node assigned "rank" and "order" properties, this
 * function will produce a matrix with the ids of each node.
 */
function buildLayerMatrix(g) {
	var layering = _.map(_.range(maxRank(g) + 1), () => {
		return [];
	});
	_.forEach(g.nodes(), (v) => {
		var node = g.node(v);
		var rank = node.rank;
		if (!_.isUndefined(rank)) {
			layering[rank][node.order] = v;
		}
	});

	return layering;
}

/*
 * Adjusts the ranks for all nodes in the graph such that all nodes v have
 * rank(v) >= 0 and at least one node w has rank(w) = 0.
 */
function normalizeRanks(g) {
	var min = _.min(
		_.map(g.nodes(), (v) => {
			return g.node(v).rank;
		})
	);
	_.forEach(g.nodes(), (v) => {
		var node = g.node(v);
		if (_.has(node, 'rank')) {
			node.rank -= min;
		}
	});
}

function removeEmptyRanks(g) {
	// Ranks may not start at 0, so we need to offset them

	var offset = _.min(
		_.map(g.nodes(), (v) => {
			return g.node(v).rank;
		})
	);

	var layers = [];
	_.forEach(g.nodes(), (v) => {
		var rank = g.node(v).rank - offset;
		if (!layers[rank]) {
			layers[rank] = [];
		}
		layers[rank].push(v);
	});

	var delta = 0;
	var nodeRankFactor = g.graph().nodeRankFactor;
	_.forEach(layers, (vs, i) => {
		if (_.isUndefined(vs) && i % nodeRankFactor !== 0) {
			--delta;
		} else if (delta) {
			_.forEach(vs, (v) => {
				g.node(v).rank += delta;
			});
		}
	});
}

function addBorderNode(g, prefix, rank, order) {
	var node = {
		height: 0,
		width: 0,
	};
	if (arguments.length >= 4) {
		node.rank = rank;
		node.order = order;
	}

	return addDummyNode(g, 'border', node, prefix);
}

function maxRank(g) {
	return _.max(
		_.map(g.nodes(), (v) => {
			var rank = g.node(v).rank;
			if (!_.isUndefined(rank)) {
				return rank;
			}
		})
	);
}

/*
 * Partition a collection into two groups: `lhs` and `rhs`. If the supplied
 * function returns true for an entry it goes into `lhs`. Otherwise it goes
 * into `rhs.
 */
function partition(collection, fn) {
	var result = {lhs: [], rhs: []};
	_.forEach(collection, (value) => {
		if (fn(value)) {
			result.lhs.push(value);
		} else {
			result.rhs.push(value);
		}
	});

	return result;
}

/*
 * Returns a new function that wraps `fn` with a timer. The wrapper logs the
 * time it takes to execute the function.
 */
function time(name, fn) {
	// var start = _.now();

	try {
		return fn();
	} finally {
		// console.log(name + ' time: ' + (_.now() - start) + 'ms');
	}
}

function notime(name, fn) {
	return fn();
}

export {
	addDummyNode,
	simplify,
	asNonCompoundGraph,
	successorWeights,
	predecessorWeights,
	intersectRect,
	buildLayerMatrix,
	normalizeRanks,
	removeEmptyRanks,
	addBorderNode,
	maxRank,
	partition,
	time,
	notime,
};
