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
 * Assigns an initial order value for each node by performing a DFS search
 * starting from nodes in the first rank. Nodes are assigned an order in their
 * rank as they are first visited.
 *
 * This approach comes from Gansner, et al., "A Technique for Drawing Directed
 * Graphs."
 *
 * Returns a layering matrix with an array per layer and each layer sorted by
 * the order of its nodes.
 */

export default function initOrder(g) {
	var visited = {};
	var simpleNodes = _.filter(g.nodes(), (v) => {
		return !g.children(v).length;
	});
	var maxRank = _.max(
		_.map(simpleNodes, (v) => {
			return g.node(v).rank;
		})
	);
	var layers = _.map(_.range(maxRank + 1), () => {
		return [];
	});

	function dfs(v) {
		if (_.has(visited, v)) {
			return;
		}
		visited[v] = true;
		var node = g.node(v);
		layers[node.rank].push(v);
		_.forEach(g.successors(v), dfs);
	}

	var orderedVs = _.sortBy(simpleNodes, (v) => {
		return g.node(v).rank;
	});
	_.forEach(orderedVs, dfs);

	return layers;
}
