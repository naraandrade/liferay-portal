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

import ClayButton from '@clayui/button';
import {TreeView} from '@clayui/core';
import {ClayDropDownWithItems} from '@clayui/drop-down';
import ClayIcon from '@clayui/icon';
import {
	DateTimeRenderer,
	FrontendDataSet,

	// @ts-ignore

} from '@liferay/frontend-data-set-web';
import {Card, getLocalizableLabel} from '@liferay/object-js-components-web';
import classNames from 'classnames';
import React from 'react';

import {
	IFDSTableProps,
	defaultDataSetProps,
	fdsItem,
	formatActionURL,
} from '../utils/fds';

import './ViewObjectDefinitions.scss';

interface ItemData {
	dateModified: string;
	defaultLanguageId: string;
	id: number;
	required: boolean;
	status: {label: string; label_i18n: string};
	system: boolean;
}

export default function ViewObjectDefinitions({
	apiURL,
	creationMenu,
	formName,
	id,
	items,
	style,
	url,
}: IFDSTableProps) {
	function objectDefinitionLabelDataRenderer({
		itemData,
		value,
	}: fdsItem<ItemData>) {
		const handleEditDefinition = () => {
			window.location.href = formatActionURL(url, itemData.id);
		};

		return (
			<div className="table-list-title">
				<a href="#" onClick={handleEditDefinition}>
					{getLocalizableLabel(
						itemData.defaultLanguageId as Liferay.Language.Locale,
						value
					)}
				</a>
			</div>
		);
	}

	function objectDefinitionModifiedDateDataRenderer({
		itemData,
	}: {
		itemData: ItemData;
	}) {
		return DateTimeRenderer({
			options: {
				format: {
					day: 'numeric',
					month: 'short',
					timeZone: 'UTC',
					year: 'numeric',
				},
			},
			value: String(itemData.dateModified),
		});
	}

	function objectDefinitionStatusDataRenderer({
		itemData,
	}: {
		itemData: ItemData;
	}) {
		return (
			<strong
				className={classNames(
					itemData.status.label === 'approved'
						? 'label-success'
						: 'label-info',
					'label'
				)}
			>
				{itemData.status.label_i18n}
			</strong>
		);
	}

	function objectDefinitionSystemDataRenderer({
		itemData,
	}: {
		itemData: ItemData;
	}) {
		return itemData.system
			? Liferay.Language.get('yes')
			: Liferay.Language.get('no');
	}

	const dataSetProps = {
		...defaultDataSetProps,
		apiURL,
		creationMenu,
		customDataRenderers: {
			objectDefinitionLabelDataRenderer,
			objectDefinitionModifiedDateDataRenderer,
			objectDefinitionStatusDataRenderer,
			objectDefinitionSystemDataRenderer,
		},
		formName,
		id,
		itemsActions: items,
		namespace:
			'_com_liferay_object_web_internal_object_definitions_portlet_ObjectDefinitionsPortlet_',

		portletId:
			'com_liferay_object_web_internal_object_definitions_portlet_ObjectDefinitionsPortlet',
		style,
		views: [
			{
				contentRenderer: 'table',
				label: 'Table',
				name: 'table',
				schema: {
					fields: [
						{
							contentRenderer:
								'objectDefinitionLabelDataRenderer',
							expand: false,
							fieldName: 'label',
							label: Liferay.Language.get('label'),
							localizeLabel: true,
							sortable: false,
						},
						{
							expand: false,
							fieldName: 'scope',
							label: Liferay.Language.get('scope'),
							localizeLabel: true,
							sortable: false,
						},
						{
							contentRenderer:
								'objectDefinitionSystemDataRenderer',
							expand: false,
							fieldName: 'system',
							label: Liferay.Language.get('system'),
							localizeLabel: true,
							sortable: false,
						},
						{
							contentRenderer:
								'objectDefinitionModifiedDateDataRenderer',
							expand: false,
							fieldName: 'dateModified',
							label: Liferay.Language.get('modified-date'),
							localizeLabel: true,
							sortable: false,
						},
						{
							contentRenderer:
								'objectDefinitionStatusDataRenderer',
							expand: false,
							fieldName: 'status',
							label: Liferay.Language.get('status'),
							localizeLabel: true,
							sortable: false,
						},
					],
				},
				thumbnail: 'table',
			},
		],
	};

	const header = () => {
		return (
			<div className="lfr__object-web-view-object-definitions-card-header">
				<div className="d-flex">
					<h3>Uncategorized</h3>

					<ClayDropDownWithItems
						items={[]}
						trigger={
							<ClayButton
								className="component-action"
								displayType="unstyled"
								monospaced
							>
								<ClayIcon symbol="ellipsis-v" />
							</ClayButton>
						}
					/>
				</div>

				<ClayButton displayType="secondary">
					View in Model Builder
				</ClayButton>
			</div>
		);
	};

	return (
		<div className="lfr__object-web-view-object-definitions">
			<div className="lfr__object-web-view-object-definitions-model-list-container">
				<div className="lfr__object-web-view-object-definitions-model-list-header">
					<h4>OBJECTS MODEL</h4>

					<div className="d-flex">
						<ClayIcon symbol="plus" />

						<ClayIcon symbol="ellipsis-v" />
					</div>
				</div>

				<TreeView
					defaultItems={[
						{name: 'Uncategorized'},
						{name: 'Another model'},
					]}
					nestedKey="children"
				>
					{(item) => <TreeView.Item>{item.name}</TreeView.Item>}
				</TreeView>
			</div>

			<Card header={header()} viewMode="no-header-border">
				<FrontendDataSet {...dataSetProps} />
			</Card>
		</div>
	);
}
