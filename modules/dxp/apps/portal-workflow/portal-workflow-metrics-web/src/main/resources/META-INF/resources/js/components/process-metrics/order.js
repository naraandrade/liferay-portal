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

import addSubgraphConstraints from './addSubgraphConstraints';
import buildLayerGraph from './buildLayerGraph';
import crossCount from './crossCount';
import initOrder from './initOrder';
import * as _ from './lodash';
import sortSubgraph from './sortSubGraph';
import {buildLayerMatrix, maxRank} from './util';

/*
 * Applies heuristics to minimize edge crossings in the graph and sets the best
 * order solution as an order attribute on each node.
 *
 * Pre-conditions:
 *
 *    1. Graph must be DAG
 *    2. Graph nodes must be objects with a "rank" attribute
 *    3. Graph edges must have the "weight" attribute
 *
 * Post-conditions:
 *
 *    1. Graph nodes will have an "order" attribute based on the results of the
 *       algorithm.
 */
export default function order(g) {
	var maxRankT = maxRank(g),
		downLayerGraphs = buildLayerGraphs(
			g,
			_.range(1, maxRankT + 1),
			'inEdges'
		),
		upLayerGraphs = buildLayerGraphs(
			g,
			_.range(maxRankT - 1, -1, -1),
			'outEdges'
		);

	var layering = initOrder(g);
	assignOrder(g, layering);

	var bestCC = Number.POSITIVE_INFINITY,
		best;

	for (var i = 0, lastBest = 0; lastBest < 4; ++i, ++lastBest) {
		sweepLayerGraphs(i % 2 ? downLayerGraphs : upLayerGraphs, i % 4 >= 2);

		layering = buildLayerMatrix(g);
		var cc = crossCount(g, layering);
		if (cc < bestCC) {
			lastBest = 0;
			best = _.cloneDeep(layering);
			bestCC = cc;
		}
	}

	assignOrder(g, best);
}

function buildLayerGraphs(g, ranks, relationship) {
	return _.map(ranks, (rank) => {
		return buildLayerGraph(g, rank, relationship);
	});
}

function sweepLayerGraphs(layerGraphs, biasRight) {
	var cg = new Graph();
	_.forEach(layerGraphs, (layerGraph) => {
		var root = layerGraph.graph().root;
		var sorted = sortSubgraph(layerGraph, root, cg, biasRight);
		_.forEach(sorted.vs, (v, i) => {
			layerGraph.node(v).order = i;
		});
		addSubgraphConstraints(layerGraph, cg, sorted.vs);
	});
}

function assignOrder(g, layering) {
	_.forEach(layering, (layer) => {
		_.forEach(layer, (v, i) => {
			g.node(v).order = i;
		});
	});
}
