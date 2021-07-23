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

export function adjust(g) {
	var rankDir = g.graph().rankdir.toLowerCase();
	if (rankDir === 'lr' || rankDir === 'rl') {
		swapWidthHeight(g);
	}
}

export function undo(g) {
	var rankDir = g.graph().rankdir.toLowerCase();
	if (rankDir === 'bt' || rankDir === 'rl') {
		reverseY(g);
	}

	if (rankDir === 'lr' || rankDir === 'rl') {
		swapXY(g);
		swapWidthHeight(g);
	}
}

function swapWidthHeight(g) {
	_.forEach(g.nodes(), (v) => {
		swapWidthHeightOne(g.node(v));
	});
	_.forEach(g.edges(), (edge) => {
		swapWidthHeightOne(g.edge(edge));
	});
}

function swapWidthHeightOne(attrs) {
	var w = attrs.width;
	attrs.width = attrs.height;
	attrs.height = w;
}

function reverseY(g) {
	_.forEach(g.nodes(), (v) => {
		reverseYOne(g.node(v));
	});

	_.forEach(g.edges(), (edge) => {
		var edgeT = g.edge(edge);
		_.forEach(edgeT.points, reverseYOne);
		if (_.has(edgeT, 'y')) {
			reverseYOne(edgeT);
		}
	});
}

function reverseYOne(attrs) {
	attrs.y = -attrs.y;
}

function swapXY(g) {
	_.forEach(g.nodes(), (v) => {
		swapXYOne(g.node(v));
	});

	_.forEach(g.edges(), (edge) => {
		var edgeT = g.edge(edge);
		_.forEach(edgeT.points, swapXYOne);
		if (_.has(edgeT, 'x')) {
			swapXYOne(edgeT);
		}
	});
}

function swapXYOne(attrs) {
	var x = attrs.x;
	attrs.x = attrs.y;
	attrs.y = x;
}
