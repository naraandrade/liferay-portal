/**
 * SPDX-FileCopyrightText: (c) 2000 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

import React from 'react';

const markerEndId = 'customMarker';

export default function MarkerEndDefinition({color}) {
	return (
		<defs>
			<marker
				className="react-flow__arrowhead"
				fill="none"
				id={markerEndId}
				markerHeight="8"
				markerWidth="20"
				orient="auto"
				refX="20"
				refY="9"
				viewBox="0 0 9 19"
			>
				<rect fill="#0B5FFF" height="18" rx="1" width="2" x="10" y="0.5" />

				<path d="M1 17.5L8 9.5L1 1.5" stroke="#0B5FFF" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"/>
			</marker>
		</defs>
	);
}

export {markerEndId};
