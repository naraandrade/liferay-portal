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

export default function addSubgraphConstraints(g, cg, vs) {
	var prev = {},
		rootPrev;

	_.forEach(vs, (v) => {
		var child = g.parent(v),
			parent,
			prevChild;
		while (child) {
			parent = g.parent(child);
			if (parent) {
				prevChild = prev[parent];
				prev[parent] = child;
			} else {
				prevChild = rootPrev;
				rootPrev = child;
			}
			if (prevChild && prevChild !== child) {
				cg.setEdge(prevChild, child);

				return;
			}
			child = parent;
		}
	});

	/*
  function dfs(v) {
    var children = v ? g.children(v) : g.children();
    if (children.length) {
      var min = Number.POSITIVE_INFINITY,
          subgraphs = [];
      _.each(children, function(child) {
        var childMin = dfs(child);
        if (g.children(child).length) {
          subgraphs.push({ v: child, order: childMin });
        }
        min = Math.min(min, childMin);
      });
      _.reduce(_.sortBy(subgraphs, "order"), function(prev, curr) {
        cg.setEdge(prev.v, curr.v);
        return curr;
      });
      return min;
    }
    return g.node(v).order;
  }
  dfs(undefined);
  */
}
