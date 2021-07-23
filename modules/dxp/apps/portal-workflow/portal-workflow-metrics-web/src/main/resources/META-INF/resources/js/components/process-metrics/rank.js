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

import feasibleTree from './feasibleTree';
import networkSimplex from './networkSimplex';
import {longestPath} from './util';

/*
 * Assigns a rank to each node in the input graph that respects the "minlen"
 * constraint specified on edges between nodes.
 *
 * This basic structure is derived from Gansner, et al., "A Technique for
 * Drawing Directed Graphs."
 *
 * Pre-conditions:
 *
 *    1. Graph must be a connected DAG
 *    2. Graph nodes must be objects
 *    3. Graph edges must have "weight" and "minlen" attributes
 *
 * Post-conditions:
 *
 *    1. Graph nodes will have a "rank" attribute based on the results of the
 *       algorithm. Ranks can start at any index (including negative), we'll
 *       fix them up later.
 */
export default function rank(g) {
	switch (g.graph().ranker) {
		case 'network-simplex':
			networkSimplexRanker(g);
			break;
		case 'tight-tree':
			tightTreeRanker(g);
			break;
		case 'longest-path':
			longestPathRanker(g);
			break;
		default:
			networkSimplexRanker(g);
	}
}

// A fast and simple ranker, but results are far from optimal.

var longestPathRanker = longestPath;

function tightTreeRanker(g) {
	longestPath(g);
	feasibleTree(g);
}

function networkSimplexRanker(g) {
	networkSimplex(g);
}
