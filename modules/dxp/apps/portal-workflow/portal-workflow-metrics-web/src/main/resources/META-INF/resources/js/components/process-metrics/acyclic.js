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

import greedyFAS from './greedyFas';
import * as _ from './lodash';

export function run(g) {
	var fas =
		g.graph().acyclicer === 'greedy'
			? greedyFAS(g, weightFn(g))
			: dfsFAS(g);
	_.forEach(fas, (edge) => {
		var label = g.edge(edge);
		g.removeEdge(edge);
		label.forwardName = edge.name;
		label.reversed = true;
		g.setEdge(edge.w, edge.v, label, _.uniqueId('rev'));
	});

	function weightFn(g) {
		return function (edge) {
			return g.edge(edge).weight;
		};
	}
}

function dfsFAS(g) {
	var fas = [];
	var stack = {};
	var visited = {};

	function dfs(v) {
		if (_.has(visited, v)) {
			return;
		}
		visited[v] = true;
		stack[v] = true;
		_.forEach(g.outEdges(v), (edge) => {
			if (_.has(stack, edge.w)) {
				fas.push(edge);
			} else {
				dfs(edge.w);
			}
		});
		delete stack[v];
	}

	_.forEach(g.nodes(), dfs);

	return fas;
}

export function undo(g) {
	_.forEach(g.edges(), (edge) => {
		var label = g.edge(edge);
		if (label.reversed) {
			g.removeEdge(edge);

			var forwardName = label.forwardName;
			delete label.reversed;
			delete label.forwardName;
			g.setEdge(edge.w, edge.v, label, forwardName);
		}
	});
}
