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
import {addDummyNode} from './util';

export default function addBorderSegments(g) {
	function dfs(v) {
		var children = g.children(v);
		var node = g.node(v);
		if (children.length) {
			_.forEach(children, dfs);
		}

		if (_.has(node, 'minRank')) {
			node.borderLeft = [];
			node.borderRight = [];
			for (
				var rank = node.minRank, maxRank = node.maxRank + 1;
				rank < maxRank;
				++rank
			) {
				addBorderNode(g, 'borderLeft', '_bl', v, node, rank);
				addBorderNode(g, 'borderRight', '_br', v, node, rank);
			}
		}
	}

	_.forEach(g.children(), dfs);
}

function addBorderNode(g, prop, prefix, sg, sgNode, rank) {
	var label = {borderType: prop, height: 0, rank, width: 0};
	var prev = sgNode[prop][rank - 1];
	var curr = addDummyNode(g, 'border', label, prefix);
	sgNode[prop][rank] = curr;
	g.setParent(curr, sg);
	if (prev) {
		g.setEdge(prev, curr, {weight: 1});
	}
}
