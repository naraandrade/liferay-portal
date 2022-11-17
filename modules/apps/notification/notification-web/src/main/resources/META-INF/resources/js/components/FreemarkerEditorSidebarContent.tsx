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
	AutoComplete,
	Collapsible,
	CustomSidebarContentProps,
	Element,
	SidebarCategory,
	filterArrayByQuery,
} from '@liferay/object-js-components-web';
import React, {useEffect, useMemo, useState} from 'react';

import {defaultLanguageId} from '../constants';

const renderElements = (
	elements?: SidebarCategory[],
	handleElementClick?: Function
) => {
	return elements?.map(({items, label}) => (
		<Collapsible key={label} label={label}>
			{items.map((item) => (
				<Element
					helpText={item.helpText}
					key={item.label}
					label={item.label}
					onClick={() =>
						handleElementClick && handleElementClick(item)
					}
				/>
			))}
		</Collapsible>
	));
};

interface ObjectDefinitionInfo {
	fields: SidebarCategory[];
	objectDefinition: ObjectDefinition;
	relationships: ObjectDefinitionInfo[];
}

interface IOtherProps {
	objectDefinitionsInfo?: ObjectDefinitionInfo[];
}

export default function FreemarkerEditorSidebarContent({
	elements,
	handleElementClick,
	...otherProps
}: CustomSidebarContentProps) {
	const {objectDefinitionsInfo = []} = otherProps as IOtherProps;
	const [query, setQuery] = useState<string>('');
	const [selectedEntity, setSelectedEntity] = useState<ObjectDefinition>();
	const [selectedRelationship, setSelectedRelationship] = useState<
		ObjectDefinition
	>();
	const [
		selectedObjectDefinitionInfo,
		setSelectedObjectDefinitionInfo,
	] = useState<ObjectDefinitionInfo>();

	const entities = objectDefinitionsInfo.map((item) => item.objectDefinition);

	const filteredEntities = useMemo(() => {
		return filterArrayByQuery(entities, 'label', query);
	}, [entities, query]);

	useEffect(() => {
		setSelectedObjectDefinitionInfo(
			objectDefinitionsInfo.find(
				(item) => item.objectDefinition.id === selectedEntity?.id
			)
		);
	}, [objectDefinitionsInfo, selectedEntity]);

	return (
		<>
			<AutoComplete
				emptyStateMessage={Liferay.Language.get(
					'no-entities-were-found'
				)}
				items={filteredEntities ?? []}
				label={Liferay.Language.get('entity')}
				onChangeQuery={setQuery}
				onSelectItem={(item: ObjectDefinition) => {
					setSelectedEntity(item);
				}}
				query={query}
				value={selectedEntity?.label[defaultLanguageId]}
			>
				{({label, name}) => (
					<div className="d-flex justify-content-between">
						<div>{label[defaultLanguageId] ?? name}</div>
					</div>
				)}
			</AutoComplete>

			{selectedEntity &&
				renderElements(
					selectedObjectDefinitionInfo?.fields,
					handleElementClick
				)}

			{selectedEntity &&
				selectedObjectDefinitionInfo?.relationships.length !== 0 && (
					<>
						<AutoComplete
							emptyStateMessage={Liferay.Language.get(
								'no-relationships-were-found'
							)}
							items={filteredEntities ?? []}
							label={Liferay.Language.get('relationship')}
							onChangeQuery={setQuery}
							onSelectItem={(item: ObjectDefinition) => {
								setSelectedRelationship(item);
							}}
							query={query}
							value={
								selectedRelationship?.label[defaultLanguageId]
							}
						>
							{({label, name}) => (
								<div className="d-flex justify-content-between">
									<div>
										{label[defaultLanguageId] ?? name}
									</div>
								</div>
							)}
						</AutoComplete>

						{selectedRelationship &&
							renderElements(
								selectedObjectDefinitionInfo?.relationships.find(
									(item) =>
										item.objectDefinition.id ===
										selectedRelationship.id
								)?.fields,
								handleElementClick
							)}
					</>
				)}

			{renderElements(elements, handleElementClick)}
		</>
	);
}
