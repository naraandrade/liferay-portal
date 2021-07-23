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

import acyclic from './acyclic';
import addBorderSegments from './addBorderSegments';
import {adjust, undo} from './coordinateSystem';
import * as _ from './lodash';
import nestingGraph from './nestingGraph';
import normalize from './normalize';
import order from './order';
import parentDummyChains from './parentDummyChains';
import position from './position';
import rank from './rank';
import {
	addDummyNode,
	asNonCompoundGraph,
	buildLayerMatrix,
	intersectRect,
	normalizeRanks,
	notime,
	removeEmptyRanks,
	time,
} from './util';

export default function layout(g, options) {
	var timeU = options && options.debugTiming ? time : notime;

	timeU('layout', () => {
		var layoutGraph = timeU('  buildLayoutGraph', () => {
			return buildLayoutGraph(g);
		});

		timeU('  runLayout', () => {
			runLayout(layoutGraph, timeU);
		});

		timeU('  updateInputGraph', () => {
			updateInputGraph(g, layoutGraph);
		});
	});
}

function runLayout(g, time) {
	time('    makeSpaceForEdgeLabels', () => {
		makeSpaceForEdgeLabels(g);
	});

	time('    removeSelfEdges', () => {
		removeSelfEdges(g);
	});

	time('    acyclic', () => {
		acyclic.run(g);
	});

	time('    nestingGraph.run', () => {
		nestingGraph.run(g);
	});

	time('    rank', () => {
		rank(asNonCompoundGraph(g));
	});

	time('    injectEdgeLabelProxies', () => {
		injectEdgeLabelProxies(g);
	});

	time('    removeEmptyRanks', () => {
		removeEmptyRanks(g);
	});

	time('    nestingGraph.cleanup', () => {
		nestingGraph.cleanup(g);
	});

	time('    normalizeRanks', () => {
		normalizeRanks(g);
	});

	time('    assignRankMinMax', () => {
		assignRankMinMax(g);
	});

	time('    removeEdgeLabelProxies', () => {
		removeEdgeLabelProxies(g);
	});

	time('    normalize.run', () => {
		normalize.run(g);
	});
	time('    parentDummyChains', () => {
		parentDummyChains(g);
	});
	time('    addBorderSegments', () => {
		addBorderSegments(g);
	});
	time('    order', () => {
		order(g);
	});
	time('    insertSelfEdges', () => {
		insertSelfEdges(g);
	});
	time('    adjustCoordinateSystem', () => {
		adjust(g);
	});
	time('    position', () => {
		position(g);
	});
	time('    positionSelfEdges', () => {
		positionSelfEdges(g);
	});
	time('    removeBorderNodes', () => {
		removeBorderNodes(g);
	});
	time('    normalize.undo', () => {
		normalize.undo(g);
	});
	time('    fixupEdgeLabelCoords', () => {
		fixupEdgeLabelCoords(g);
	});
	time('    undoCoordinateSystem', () => {
		undo(g);
	});
	time('    translateGraph', () => {
		translateGraph(g);
	});
	time('    assignNodeIntersects', () => {
		assignNodeIntersects(g);
	});
	time('    reversePoints', () => {
		reversePointsForReversedEdges(g);
	});
	time('    acyclic.undo', () => {
		acyclic.undo(g);
	});
}

/*
 * Copies final layout information from the layout graph back to the input
 * graph. This process only copies whitelisted attributes from the layout graph
 * to the input graph, so it serves as a good place to determine what
 * attributes can influence layout.
 */
function updateInputGraph(inputGraph, layoutGraph) {
	_.forEach(inputGraph.nodes(), (v) => {
		var inputLabel = inputGraph.node(v);
		var layoutLabel = layoutGraph.node(v);

		if (inputLabel) {
			inputLabel.x = layoutLabel.x;
			inputLabel.y = layoutLabel.y;

			if (layoutGraph.children(v).length) {
				inputLabel.width = layoutLabel.width;
				inputLabel.height = layoutLabel.height;
			}
		}
	});

	_.forEach(inputGraph.edges(), (edge) => {
		var inputLabel = inputGraph.edge(edge);
		var layoutLabel = layoutGraph.edge(edge);

		inputLabel.points = layoutLabel.points;
		if (_.has(layoutLabel, 'x')) {
			inputLabel.x = layoutLabel.x;
			inputLabel.y = layoutLabel.y;
		}
	});

	inputGraph.graph().width = layoutGraph.graph().width;
	inputGraph.graph().height = layoutGraph.graph().height;
}

var graphNumAttrs = ['nodesep', 'edgesep', 'ranksep', 'marginx', 'marginy'];
var graphDefaults = {edgesep: 20, nodesep: 50, rankdir: 'tb', ranksep: 50};
var graphAttrs = ['acyclicer', 'ranker', 'rankdir', 'align'];
var nodeNumAttrs = ['width', 'height'];
var nodeDefaults = {height: 0, width: 0};
var edgeNumAttrs = ['minlen', 'weight', 'width', 'height', 'labeloffset'];
var edgeDefaults = {
	height: 0,
	labeloffset: 10,
	labelpos: 'r',
	minlen: 1,
	weight: 1,
	width: 0,
};
var edgeAttrs = ['labelpos'];

/*
 * Constructs a new graph from the input graph, which can be used for layout.
 * This process copies only whitelisted attributes from the input graph to the
 * layout graph. Thus this function serves as a good place to determine what
 * attributes can influence layout.
 */
function buildLayoutGraph(inputGraph) {
	var g = new Graph({compound: true, multigraph: true});
	var graph = canonicalize(inputGraph.graph());

	g.setGraph(
		_.merge(
			{},
			graphDefaults,
			selectNumberAttrs(graph, graphNumAttrs),
			_.pick(graph, graphAttrs)
		)
	);

	_.forEach(inputGraph.nodes(), (v) => {
		var node = canonicalize(inputGraph.node(v));
		g.setNode(
			v,
			_.defaults(selectNumberAttrs(node, nodeNumAttrs), nodeDefaults)
		);
		g.setParent(v, inputGraph.parent(v));
	});

	_.forEach(inputGraph.edges(), (edge) => {
		var edgeT = canonicalize(inputGraph.edge(edge));
		g.setEdge(
			edgeT,
			_.merge(
				{},
				edgeDefaults,
				selectNumberAttrs(edge, edgeNumAttrs),
				_.pick(edge, edgeAttrs)
			)
		);
	});

	return g;
}

/*
 * This idea comes from the Gansner paper: to account for edge labels in our
 * layout we split each rank in half by doubling minlen and halving ranksep.
 * Then we can place labels at these mid-points between nodes.
 *
 * We also add some minimal padding to the width to push the label for the edge
 * away from the edge itself a bit.
 */
function makeSpaceForEdgeLabels(g) {
	var graph = g.graph();
	graph.ranksep /= 2;
	_.forEach(g.edges(), (edge) => {
		var edgeT = g.edge(edge);
		edgeT.minlen *= 2;
		if (edgeT.labelpos.toLowerCase() !== 'c') {
			if (graph.rankdir === 'TB' || graph.rankdir === 'BT') {
				edgeT.width += edgeT.labeloffset;
			} else {
				edgeT.height += edgeT.labeloffset;
			}
		}
	});
}

/*
 * Creates temporary dummy nodes that capture the rank in which each edge's
 * label is going to, if it has one of non-zero width and height. We do this
 * so that we can safely remove empty ranks while preserving balance for the
 * label's position.
 */
function injectEdgeLabelProxies(g) {
	_.forEach(g.edges(), (edge) => {
		var edgeT = g.edge(edge);
		if (edgeT.width && edgeT.height) {
			var v = g.node(edge.v);
			var w = g.node(edge.w);
			var label = {edge, rank: (w.rank - v.rank) / 2 + v.rank};
			addDummyNode(g, 'edge-proxy', label, '_ep');
		}
	});
}

function assignRankMinMax(g) {
	var maxRank = 0;
	_.forEach(g.nodes(), (v) => {
		var node = g.node(v);
		if (node.borderTop) {
			node.minRank = g.node(node.borderTop).rank;
			node.maxRank = g.node(node.borderBottom).rank;
			maxRank = _.max(maxRank, node.maxRank);
		}
	});
	g.graph().maxRank = maxRank;
}

function removeEdgeLabelProxies(g) {
	_.forEach(g.nodes(), (v) => {
		var node = g.node(v);
		if (node.dummy === 'edge-proxy') {
			g.edge(node.e).labelRank = node.rank;
			g.removeNode(v);
		}
	});
}

function translateGraph(g) {
	var minX = Number.POSITIVE_INFINITY;
	var maxX = 0;
	var minY = Number.POSITIVE_INFINITY;
	var maxY = 0;
	var graphLabel = g.graph();
	var marginX = graphLabel.marginx || 0;
	var marginY = graphLabel.marginy || 0;

	function getExtremes(attrs) {
		var x = attrs.x;
		var y = attrs.y;
		var w = attrs.width;
		var h = attrs.height;
		minX = Math.min(minX, x - w / 2);
		maxX = Math.max(maxX, x + w / 2);
		minY = Math.min(minY, y - h / 2);
		maxY = Math.max(maxY, y + h / 2);
	}

	_.forEach(g.nodes(), (v) => {
		getExtremes(g.node(v));
	});
	_.forEach(g.edges(), (edge) => {
		var edgeT = g.edge(edge);
		if (_.has(edgeT, 'x')) {
			getExtremes(edgeT);
		}
	});

	minX -= marginX;
	minY -= marginY;

	_.forEach(g.nodes(), (v) => {
		var node = g.node(v);
		node.x -= minX;
		node.y -= minY;
	});

	_.forEach(g.edges(), (edge) => {
		var edgeT = g.edge(edge);
		_.forEach(edgeT.points, (p) => {
			p.x -= minX;
			p.y -= minY;
		});
		if (_.has(edgeT, 'x')) {
			edgeT.x -= minX;
		}
		if (_.has(edgeT, 'y')) {
			edgeT.y -= minY;
		}
	});

	graphLabel.width = maxX - minX + marginX;
	graphLabel.height = maxY - minY + marginY;
}

function assignNodeIntersects(g) {
	_.forEach(g.edges(), (edge) => {
		var edgeT = g.edge(edge);
		var nodeV = g.node(edge.v);
		var nodeW = g.node(edge.w);
		var p1, p2;
		if (!edgeT.points) {
			edgeT.points = [];
			p1 = nodeW;
			p2 = nodeV;
		} else {
			p1 = edgeT.points[0];
			p2 = edgeT.points[edgeT.points.length - 1];
		}
		edgeT.points.unshift(intersectRect(nodeV, p1));
		edgeT.points.push(intersectRect(nodeW, p2));
	});
}

function fixupEdgeLabelCoords(g) {
	_.forEach(g.edges(), (edge) => {
		var edgeT = g.edge(edge);
		if (_.has(edgeT, 'x')) {
			if (edgeT.labelpos === 'l' || edgeT.labelpos === 'r') {
				edgeT.width -= edgeT.labeloffset;
			}

			switch (edgeT.labelpos) {
				case 'l':
					edgeT.x -= edgeT.width / 2 + edgeT.labeloffset;
					break;
				case 'r':
					edgeT.x += edgeT.width / 2 + edgeT.labeloffset;
					break;
				default:
					break;
			}
		}
	});
}

function reversePointsForReversedEdges(g) {
	_.forEach(g.edges(), (edge) => {
		var edgeT = g.edge(edge);
		if (edgeT.reversed) {
			edgeT.points.reverse();
		}
	});
}

function removeBorderNodes(g) {
	_.forEach(g.nodes(), (v) => {
		if (g.children(v).length) {
			var node = g.node(v);
			var t = g.node(node.borderTop);
			var b = g.node(node.borderBottom);
			var l = g.node(_.last(node.borderLeft));
			var r = g.node(_.last(node.borderRight));

			node.width = Math.abs(r.x - l.x);
			node.height = Math.abs(b.y - t.y);
			node.x = l.x + node.width / 2;
			node.y = t.y + node.height / 2;
		}
	});

	_.forEach(g.nodes(), (v) => {
		if (g.node(v).dummy === 'border') {
			g.removeNode(v);
		}
	});
}

function removeSelfEdges(g) {
	_.forEach(g.edges(), (edge) => {
		if (edge.v === edge.w) {
			var node = g.node(edge.v);
			if (!node.selfEdges) {
				node.selfEdges = [];
			}
			node.selfEdges.push({edge, label: g.edge(edge)});
			g.removeEdge(edge);
		}
	});
}

function insertSelfEdges(g) {
	var layers = buildLayerMatrix(g);
	_.forEach(layers, (layer) => {
		var orderShift = 0;
		_.forEach(layer, (v, i) => {
			var node = g.node(v);
			node.order = i + orderShift;
			_.forEach(node.selfEdges, (selfEdge) => {
				addDummyNode(
					g,
					'selfedge',
					{
						edge: selfEdge.e,
						height: selfEdge.label.height,
						label: selfEdge.label,
						order: i + ++orderShift,
						rank: node.rank,
						width: selfEdge.label.width,
					},
					'_se'
				);
			});
			delete node.selfEdges;
		});
	});
}

function positionSelfEdges(g) {
	_.forEach(g.nodes(), (v) => {
		var node = g.node(v);
		if (node.dummy === 'selfedge') {
			var selfNode = g.node(node.e.v);
			var x = selfNode.x + selfNode.width / 2;
			var y = selfNode.y;
			var dx = node.x - x;
			var dy = selfNode.height / 2;
			g.setEdge(node.e, node.label);
			g.removeNode(v);
			node.label.points = [
				{x: x + (2 * dx) / 3, y: y - dy},
				{x: x + (5 * dx) / 6, y: y - dy},
				{x: x + dx, y},
				{x: x + (5 * dx) / 6, y: y + dy},
				{x: x + (2 * dx) / 3, y: y + dy},
			];
			node.label.x = node.x;
			node.label.y = node.y;
		}
	});
}

function selectNumberAttrs(object, attrs) {
	return _.mapValues(_.pick(object, attrs), Number);
}

function canonicalize(attrs) {
	var newAttrs = {};
	_.forEach(attrs, (v, k) => {
		newAttrs[k.toLowerCase()] = v;
	});

	return newAttrs;
}
