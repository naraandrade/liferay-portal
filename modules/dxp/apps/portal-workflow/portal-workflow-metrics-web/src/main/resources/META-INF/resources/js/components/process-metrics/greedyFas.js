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

import List from './list';
import * as _ from './lodash';

/*
 * A greedy heuristic for finding a feedback arc set for a graph. A feedback
 * arc set is a set of edges that can be removed to make a graph acyclic.
 * The algorithm comes from: P. Eades, X. Lin, and W. F. Smyth, "A fast and
 * effective heuristic for the feedback arc set problem." This implementation
 * adjusts that from the paper to allow for weighted edges.
 */

var DEFAULT_WEIGHT_FN = _.constant(1);

export default function greedyFAS(g, weightFn) {
	if (g.nodeCount() <= 1) {
		return [];
	}
	var state = buildState(g, weightFn || DEFAULT_WEIGHT_FN);
	var results = doGreedyFAS(state.graph, state.buckets, state.zeroIdx);

	// Expand multi-edges

	return _.flatten(
		_.map(results, (edge) => {
			return g.outEdges(edge.v, edge.w);
		}),
		true
	);
}

function doGreedyFAS(g, buckets, zeroIdx) {
	var results = [];
	var sources = buckets[buckets.length - 1];
	var sinks = buckets[0];

	var entry;
	while (g.nodeCount()) {
		while ((entry = sinks.dequeue())) {
			removeNode(g, buckets, zeroIdx, entry);
		}
		while ((entry = sources.dequeue())) {
			removeNode(g, buckets, zeroIdx, entry);
		}
		if (g.nodeCount()) {
			for (var i = buckets.length - 2; i > 0; --i) {
				entry = buckets[i].dequeue();
				if (entry) {
					results = results.concat(
						removeNode(g, buckets, zeroIdx, entry, true)
					);
					break;
				}
			}
		}
	}

	return results;
}

function removeNode(g, buckets, zeroIdx, entry, collectPredecessors) {
	var results = collectPredecessors ? [] : undefined;

	_.forEach(g.inEdges(entry.v), (edge) => {
		var weight = g.edge(edge);
		var uEntry = g.node(edge.v);

		if (collectPredecessors) {
			results.push({v: edge.v, w: edge.w});
		}

		uEntry.out -= weight;
		assignBucket(buckets, zeroIdx, uEntry);
	});

	_.forEach(g.outEdges(entry.v), (edge) => {
		var weight = g.edge(edge);
		var w = edge.w;
		var wEntry = g.node(w);
		wEntry['in'] -= weight;
		assignBucket(buckets, zeroIdx, wEntry);
	});

	g.removeNode(entry.v);

	return results;
}

function buildState(g, weightFn) {
	var fasGraph = new Graph();
	var maxIn = 0;
	var maxOut = 0;

	_.forEach(g.nodes(), (v) => {
		fasGraph.setNode(v, {in: 0, out: 0, v});
	});

	// Aggregate weights on nodes, but also sum the weights across multi-edges
	// into a single edge for the fasGraph.

	_.forEach(g.edges(), (edge) => {
		var prevWeight = fasGraph.edge(edge.v, edge.w) || 0;
		var weight = weightFn(edge);
		var edgeWeight = prevWeight + weight;
		fasGraph.setEdge(edge.v, edge.w, edgeWeight);
		maxOut = Math.max(maxOut, (fasGraph.node(edge.v).out += weight));
		maxIn = Math.max(maxIn, (fasGraph.node(edge.w)['in'] += weight));
	});

	var buckets = _.range(maxOut + maxIn + 3).map(() => {
		return new List();
	});
	var zeroIdx = maxIn + 1;

	_.forEach(fasGraph.nodes(), (v) => {
		assignBucket(buckets, zeroIdx, fasGraph.node(v));
	});

	return {buckets, graph: fasGraph, zeroIdx};
}

function assignBucket(buckets, zeroIdx, entry) {
	if (!entry.out) {
		buckets[0].enqueue(entry);
	} else if (!entry['in']) {
		buckets[buckets.length - 1].enqueue(entry);
	} else {
		buckets[entry.out - entry['in'] + zeroIdx].enqueue(entry);
	}
}
