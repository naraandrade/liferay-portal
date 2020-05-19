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
import React, {useContext, useEffect, useRef, useState} from 'react';

import {AppContext} from '../../AppContext.es';
import Popover from '../../components/popover/Popover.es';
import isClickOutside from '../../utils/clickOutside.es';
import {addItem} from '../../utils/client.es';
import CustomObjectPopover from '../custom-object/CustomObjectPopover.es';
import SelectObjects from './SelectObjectsDropDown.es';

const NewAppPopover = (
	{alignElement, history, onCancel, setVisible, visible},
	forwardRef
) => {
	const {basePortletURL} = useContext(AppContext);
	const customObjectButtonRef = useRef();
	const popoverRef = useRef();
	const [isPopoverVisible, setPopoverVisible] = useState(false);

	const [selectedValue, setSelectedValue] = useState({
		id: undefined,
		name: undefined,
	});
	const {id: customObjectId, name: customObjectName} = selectedValue;

	const onContinue = () => {
		history.push(`/standard/deploy/${customObjectId}`);
	};

	const handleOnSubmit = ({isAddFormView, name}) => {
		const addURL = `/o/data-engine/v2.0/data-definitions/by-content-type/app-builder`;

		addItem(addURL, {
			availableLanguageIds: ['en_US'],
			dataDefinitionFields: [],
			name: {
				value: name,
			},
		}).then(({id}) => {
			if (isAddFormView) {
				Liferay.Util.navigate(
					Liferay.Util.PortletURL.createRenderURL(basePortletURL, {
						dataDefinitionId: id,
						isAppsPortlet: true,
						mvcRenderCommandName: '/edit_form_view',
						newCustomObject: true,
					})
				);
			}
		});
	};

	const emptyStateOnClick = () => {
		setVisible(false);
		setPopoverVisible(!isPopoverVisible);
	};

	useEffect(() => {
		const handler = ({target}) => {
			const isOutside = isClickOutside(
				target,
				customObjectButtonRef.current,
				popoverRef.current
			);

			if (isOutside) {
				setPopoverVisible(false);
			}
		};

		window.addEventListener('click', handler);

		return () => window.removeEventListener('click', handler);
	}, [popoverRef]);

	return (
		<>
			<Popover
				alignElement={alignElement}
				className="apps-popover mw-100"
				content={() => (
					<>
						<label>{Liferay.Language.get('object')}</label>

						<SelectObjects
							onClickEmptyState={emptyStateOnClick}
							onSelect={setSelectedValue}
							selectedvalue={customObjectName}
						/>
					</>
				)}
				footer={() => (
					<div className="border-top mt-3 p-3" style={{width: 450}}>
						<div className="d-flex justify-content-end">
							<ClayButton
								className="mr-3"
								displayType="secondary"
								onClick={() => {
									setSelectedValue({});

									onCancel();
								}}
								small
							>
								{Liferay.Language.get('cancel')}
							</ClayButton>

							<ClayButton
								disabled={!customObjectId}
								onClick={() => {
									onContinue(customObjectId);
								}}
								small
							>
								{Liferay.Language.get('continue')}
							</ClayButton>
						</div>
					</div>
				)}
				ref={forwardRef}
				showArrow={false}
				title={() => (
					<>
						<h4 className="mb-3">
							{Liferay.Language.get('new-app')}
						</h4>

						<span className="font-weight-light text-secondary">
							{Liferay.Language.get(
								'create-an-app-to-manage-the-data-of-an-object'
							)}
						</span>
					</>
				)}
				visible={visible}
			/>

			<CustomObjectPopover
				alignElement={alignElement}
				onCancel={() => {
					setPopoverVisible(false);
				}}
				onSubmit={handleOnSubmit}
				ref={popoverRef}
				visible={isPopoverVisible}
			/>
		</>
	);
};

export default React.forwardRef(NewAppPopover);
