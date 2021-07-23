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
import {addBorderNode, addDummyNode} from './util';

/*
 * A nesting graph creates dummy nodes for the tops and bottoms of subgraphs,
 * adds appropriate edges to ensure that all cluster nodes are placed between
 * these boundries, and ensures that the graph is connected.
 *
 * In addition we ensure, through the use of the minlen property, that nodes
 * and subgraph border nodes to not end up on the same rank.
 *
 * Preconditions:
 *
 *    1. Input graph is a DAG
 *    2. Nodes in the input graph has a minlen attribute
 *
 * Postconditions:
 *
 *    1. Input graph is connected.
 *    2. Dummy nodes are added for the tops and bottoms of subgraphs.
 *    3. The minlen attribute for nodes is adjusted to ensure nodes do not
 *       get placed on the same rank as subgraph border nodes.
 *
 * The nesting graph idea comes from Sander, "Layout of Compound Directed
 * Graphs."
 */

export function run(g) {
	var root = addDummyNode(g, 'root', {}, '_root');
	var depths = treeDepths(g);
	var height = _.max(_.values(depths)) - 1; // Note: depths is an Object not an array
	var nodeSep = 2 * height + 1;

	g.graph().nestingRoot = root;

	// Multiply minlen by nodeSep to align nodes on non-border ranks.

	_.forEach(g.edges(), (edge) => {
		g.edge(edge).minlen *= nodeSep;
	});

	// Calculate a weight that is sufficient to keep subgraphs vertically compact

	var weight = sumWeights(g) + 1;

	// Create border nodes and link them up

	_.forEach(g.children(), (child) => {
		dfs(g, root, nodeSep, weight, height, depths, child);
	});

	// Save the multiplier for node layers for later removal of empty border
	// layers.

	g.graph().nodeRankFactor = nodeSep;
}

function dfs(g, root, nodeSep, weight, height, depths, v) {
	var children = g.children(v);
	if (!children.length) {
		if (v !== root) {
			g.setEdge(root, v, {minlen: nodeSep, weight: 0});
		}

		return;
	}

	var top = addBorderNode(g, '_bt');
	var bottom = addBorderNode(g, '_bb');
	var label = g.node(v);

	g.setParent(top, v);
	label.borderTop = top;
	g.setParent(bottom, v);
	label.borderBottom = bottom;

	_.forEach(children, (child) => {
		dfs(g, root, nodeSep, weight, height, depths, child);

		var childNode = g.node(child);
		var childTop = childNode.borderTop ? childNode.borderTop : child;
		var childBottom = childNode.borderBottom
			? childNode.borderBottom
			: child;
		var thisWeight = childNode.borderTop ? weight : 2 * weight;
		var minlen = childTop !== childBottom ? 1 : height - depths[v] + 1;

		g.setEdge(top, childTop, {
			minlen,
			nestingEdge: true,
			weight: thisWeight,
		});

		g.setEdge(childBottom, bottom, {
			minlen,
			nestingEdge: true,
			weight: thisWeight,
		});
	});

	if (!g.parent(v)) {
		g.setEdge(root, top, {minlen: height + depths[v], weight: 0});
	}
}

function treeDepths(g) {
	var depths = {};
	function dfs(v, depth) {
		var children = g.children(v);
		if (children && children.length) {
			_.forEach(children, (child) => {
				dfs(child, depth + 1);
			});
		}
		depths[v] = depth;
	}
	_.forEach(g.children(), (v) => {
		dfs(v, 1);
	});

	return depths;
}

function sumWeights(g) {
	return _.reduce(
		g.edges(),
		(acc, edge) => {
			return acc + g.edge(edge).weight;
		},
		0
	);
}

export function cleanup(g) {
	var graphLabel = g.graph();
	g.removeNode(graphLabel.nestingRoot);
	delete graphLabel.nestingRoot;
	_.forEach(g.edges(), (edge) => {
		var edgeT = g.edge(edge);
		if (edgeT.nestingEdge) {
			g.removeEdge(edge);
		}
	});
}
