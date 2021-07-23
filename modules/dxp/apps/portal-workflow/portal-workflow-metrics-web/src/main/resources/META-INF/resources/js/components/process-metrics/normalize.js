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

/*
 * Breaks any long edges in the graph into short segments that span 1 layer
 * each. This operation is undoable with the denormalize function.
 *
 * Pre-conditions:
 *
 *    1. The input graph is a DAG.
 *    2. Each node in the graph has a "rank" property.
 *
 * Post-condition:
 *
 *    1. All edges in the graph have a length of 1.
 *    2. Dummy nodes are added where edges have been split into segments.
 *    3. The graph is augmented with a "dummyChains" attribute which contains
 *       the first dummy in each chain of dummy nodes produced.
 */

export function run(g) {
	g.graph().dummyChains = [];
	_.forEach(g.edges(), (edge) => {
		normalizeEdge(g, edge);
	});
}

function normalizeEdge(g, edge) {
	var v = edge.v;
	var vRank = g.node(v).rank;
	var w = edge.w;
	var wRank = g.node(w).rank;
	var name = edge.name;
	var edgeLabel = g.edge(edge);
	var labelRank = edgeLabel.labelRank;

	if (wRank === vRank + 1) {
		return;
	}

	g.removeEdge(edge);

	var dummy, attrs, i;
	for (i = 0, ++vRank; vRank < wRank; ++i, ++vRank) {
		edgeLabel.points = [];
		attrs = {
			edgeLabel,
			edgeObj: edge,
			height: 0,
			rank: vRank,
			width: 0,
		};
		dummy = addDummyNode(g, 'edge', attrs, '_d');
		if (vRank === labelRank) {
			attrs.width = edgeLabel.width;
			attrs.height = edgeLabel.height;
			attrs.dummy = 'edge-label';
			attrs.labelpos = edgeLabel.labelpos;
		}
		g.setEdge(v, dummy, {weight: edgeLabel.weight}, name);
		if (i === 0) {
			g.graph().dummyChains.push(dummy);
		}
		v = dummy;
	}

	g.setEdge(v, w, {weight: edgeLabel.weight}, name);
}

export function undo(g) {
	_.forEach(g.graph().dummyChains, (v) => {
		var node = g.node(v);
		var origLabel = node.edgeLabel;
		var w;
		g.setEdge(node.edgeObj, origLabel);
		while (node.dummy) {
			w = g.successors(v)[0];
			g.removeNode(v);
			origLabel.points.push({x: node.x, y: node.y});
			if (node.dummy === 'edge-label') {
				origLabel.x = node.x;
				origLabel.y = node.y;
				origLabel.width = node.width;
				origLabel.height = node.height;
			}
			v = w;
			node = g.node(v);
		}
	});
}
