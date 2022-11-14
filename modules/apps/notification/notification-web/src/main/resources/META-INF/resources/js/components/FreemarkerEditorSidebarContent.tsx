/**
 * Copyright (c) 2000-present Liferay, Inc. All rights reserved.
 *
 * This library is free software; you can redistribute it and/or modify it under
 * the terms of the GNU Lesser General Public License as published by the Free
 * Software Foundation; either version 2.1 of the License, or (at your option)
 * any later version.
 *
 * This library is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
 * FOR A PARTICULAR PURPOSE. See the GNU Lesser General Public License for more
 * details.
 */

import {
	API,
	AutoComplete,
	Collapsible,
	CustomSidebarContentProps,
	Element,
	filterArrayByQuery,
} from '@liferay/object-js-components-web';
import React, {useEffect, useMemo, useState} from 'react';

import {defaultLanguageId} from '../constants';
import {setEntityFieldsUtil} from '../utils';
import {Item} from './DefinitionOfTerms';

export default function FreemarkerEditorSidebarContent({
	elements,
	handleElementClick,
}: CustomSidebarContentProps) {
	const [entityFields, setEntityFields] = useState<Item[]>([]);
	const [objectDefinitions, setObjectDefinitions] = useState<
		ObjectDefinition[]
	>();
	const [query, setQuery] = useState<string>('');
	const [selectedEntity, setSelectedEntity] = useState<ObjectDefinition>();

	const filteredObjectDefinitions = useMemo(() => {
		if (objectDefinitions) {
			return filterArrayByQuery(objectDefinitions, 'label', query);
		}
	}, [objectDefinitions, query]);

	useEffect(() => {
		API.getObjectDefinitions().then((items) => {
			setObjectDefinitions(items);
		});
	}, []);

	const copyObjectFieldTerm = ({itemData}: {itemData: Item}) => {
		navigator.clipboard.writeText(itemData.term);
	};

	useEffect(() => {
		Liferay.on('copyObjectFieldTerm', copyObjectFieldTerm);

		return () => {
			Liferay.detach('copyObjectFieldTerm');
		};
	}, []);

	return (
		<>
			<AutoComplete
				emptyStateMessage={Liferay.Language.get(
					'no-entities-were-found'
				)}
				items={filteredObjectDefinitions ?? []}
				label={Liferay.Language.get('entity')}
				onChangeQuery={setQuery}
				onSelectItem={(item: ObjectDefinition) => {
					setEntityFieldsUtil(
						Liferay.ThemeDisplay.getPortalURL(),
						item,
						setEntityFields
					);
					setSelectedEntity(item);
				}}
				query={query}
				value=""
			>
				{({label, name}) => (
					<div className="d-flex justify-content-between">
						<div>{label[defaultLanguageId] ?? name}</div>
					</div>
				)}
			</AutoComplete>

			{elements?.map(({items, label}) => (
				<Collapsible key={label} label={label}>
					{items.map((item) => (
						<Element
							helpText={item.helpText}
							key={item.label}
							label={item.label}
							onClick={() => handleElementClick(item)}
						/>
					))}
				</Collapsible>
			))}
		</>
	);
}
