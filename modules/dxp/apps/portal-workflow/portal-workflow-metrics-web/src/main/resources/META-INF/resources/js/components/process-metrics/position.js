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

import {positionX} from './bk';
import * as _ from './lodash';
import {asNonCompoundGraph, buildLayerMatrix} from './util';

export default function position(g) {
	g = asNonCompoundGraph(g);

	positionY(g);
	_.forEach(positionX(g), (x, v) => {
		g.node(v).x = x;
	});
}

function positionY(g) {
	var layering = buildLayerMatrix(g);
	var rankSep = g.graph().ranksep;
	var prevY = 0;
	_.forEach(layering, (layer) => {
		var maxHeight = _.max(
			_.map(layer, (v) => {
				return g.node(v).height;
			})
		);
		_.forEach(layer, (v) => {
			g.node(v).y = prevY + maxHeight / 2;
		});
		prevY += maxHeight + rankSep;
	});
}
