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

import * as _ from './lodash';

/*
 * A function that takes a layering (an array of layers, each with an array of
 * ordererd nodes) and a graph and returns a weighted crossing count.
 *
 * Pre-conditions:
 *
 *    1. Input graph must be simple (not a multigraph), directed, and include
 *       only simple edges.
 *    2. Edges in the input graph must have assigned weights.
 *
 * Post-conditions:
 *
 *    1. The graph and layering matrix are left unchanged.
 *
 * This algorithm is derived from Barth, et al., "Bilayer Cross Counting."
 */

export default function crossCount(g, layering) {
	var cc = 0;
	for (var i = 1; i < layering.length; ++i) {
		cc += twoLayerCrossCount(g, layering[i - 1], layering[i]);
	}

	return cc;
}

function twoLayerCrossCount(g, northLayer, southLayer) {
	// Sort all of the edges between the north and south layers by their position
	// in the north layer and then the south. Map these edges to the position of
	// their head in the south layer.

	var southPos = _.zipObject(
		southLayer,
		_.map(southLayer, (v, i) => {
			return i;
		})
	);
	var southEntries = _.flatten(
		_.map(northLayer, (v) => {
			return _.sortBy(
				_.map(g.outEdges(v), (edge) => {
					return {pos: southPos[edge.w], weight: g.edge(edge).weight};
				}),
				'pos'
			);
		}),
		true
	);

	// Build the accumulator tree

	var firstIndex = 1;
	while (firstIndex < southLayer.length) {
		firstIndex <<= 1;
	}
	var treeSize = 2 * firstIndex - 1;
	firstIndex -= 1;
	var tree = _.map(new Array(treeSize), () => {
		return 0;
	});

	// Calculate the weighted crossings

	var cc = 0;
	_.forEach(
		southEntries.forEach((entry) => {
			var index = entry.pos + firstIndex;
			tree[index] += entry.weight;
			var weightSum = 0;
			while (index > 0) {
				if (index % 2) {
					weightSum += tree[index + 1];
				}
				index = (index - 1) >> 1;
				tree[index] += entry.weight;
			}
			cc += entry.weight * weightSum;
		})
	);

	return cc;
}
