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
import {partition} from './util';

export default function sort(entries, biasRight) {
	var parts = partition(entries, (entry) => {
		return _.has(entry, 'barycenter');
	});
	var sortable = parts.lhs,
		unsortable = _.sortBy(parts.rhs, (entry) => {
			return -entry.i;
		}),
		vs = [],
		sum = 0,
		weight = 0,
		vsIndex = 0;

	sortable.sort(compareWithBias(!!biasRight));

	vsIndex = consumeUnsortable(vs, unsortable, vsIndex);

	_.forEach(sortable, (entry) => {
		vsIndex += entry.vs.length;
		vs.push(entry.vs);
		sum += entry.barycenter * entry.weight;
		weight += entry.weight;
		vsIndex = consumeUnsortable(vs, unsortable, vsIndex);
	});

	var result = {vs: _.flatten(vs, true)};
	if (weight) {
		result.barycenter = sum / weight;
		result.weight = weight;
	}

	return result;
}

function consumeUnsortable(vs, unsortable, index) {
	var last;
	while (unsortable.length && (last = _.last(unsortable)).i <= index) {
		unsortable.pop();
		vs.push(last.vs);
		index++;
	}

	return index;
}

function compareWithBias(bias) {
	return function (entryV, entryW) {
		if (entryV.barycenter < entryW.barycenter) {
			return -1;
		} else if (entryV.barycenter > entryW.barycenter) {
			return 1;
		}

		return !bias ? entryV.i - entryW.i : entryW.i - entryV.i;
	};
}
