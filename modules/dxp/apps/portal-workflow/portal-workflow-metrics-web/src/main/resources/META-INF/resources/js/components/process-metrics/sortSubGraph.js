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
import resolveConflicts from './resolveConflicts';
import sort from './sort';

export default function sortSubgraph(g, v, cg, biasRight) {
	var movable = g.children(v);
	var node = g.node(v);
	var bl = node ? node.borderLeft : undefined;
	var br = node ? node.borderRight : undefined;
	var subgraphs = {};

	if (bl) {
		movable = _.filter(movable, (w) => {
			return w !== bl && w !== br;
		});
	}

	var barycenters = barycenter(g, movable);
	_.forEach(barycenters, (entry) => {
		if (g.children(entry.v).length) {
			var subgraphResult = sortSubgraph(g, entry.v, cg, biasRight);
			subgraphs[entry.v] = subgraphResult;
			if (_.has(subgraphResult, 'barycenter')) {
				mergeBarycenters(entry, subgraphResult);
			}
		}
	});

	var entries = resolveConflicts(barycenters, cg);
	expandSubgraphs(entries, subgraphs);

	var result = sort(entries, biasRight);

	if (bl) {
		result.vs = _.flatten([bl, result.vs, br], true);
		if (g.predecessors(bl).length) {
			var blPred = g.node(g.predecessors(bl)[0]),
				brPred = g.node(g.predecessors(br)[0]);
			if (!_.has(result, 'barycenter')) {
				result.barycenter = 0;
				result.weight = 0;
			}
			result.barycenter =
				(result.barycenter * result.weight +
					blPred.order +
					brPred.order) /
				(result.weight + 2);
			result.weight += 2;
		}
	}

	return result;
}

function expandSubgraphs(entries, subgraphs) {
	_.forEach(entries, (entry) => {
		entry.vs = _.flatten(
			entry.vs.map((v) => {
				if (subgraphs[v]) {
					return subgraphs[v].vs;
				}

				return v;
			}),
			true
		);
	});
}

function mergeBarycenters(target, other) {
	if (!_.isUndefined(target.barycenter)) {
		target.barycenter =
			(target.barycenter * target.weight +
				other.barycenter * other.weight) /
			(target.weight + other.weight);
		target.weight += other.weight;
	} else {
		target.barycenter = other.barycenter;
		target.weight = other.weight;
	}
}

function barycenter(g, movable) {
	return _.map(movable, (v) => {
		var inV = g.inEdges(v);
		if (!inV.length) {
			return {v};
		} else {
			var result = _.reduce(
				inV,
				(acc, edge) => {
					var edgeT = g.edge(edge),
						nodeU = g.node(edge.v);

					return {
						sum: acc.sum + edgeT.weight * nodeU.order,
						weight: acc.weight + edgeT.weight,
					};
				},
				{sum: 0, weight: 0}
			);

			return {
				barycenter: result.sum / result.weight,
				v,
				weight: result.weight,
			};
		}
	});
}
