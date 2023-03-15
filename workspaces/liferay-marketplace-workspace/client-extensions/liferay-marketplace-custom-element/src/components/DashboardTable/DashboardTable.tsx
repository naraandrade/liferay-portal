import ClayTable from '@clayui/table';

import swapVert from '../../assets/icons/swap-vert.svg';

import './DashboardTable.scss';

import React, {ReactNode} from 'react';

import {DashboardEmptyTable} from './DashboardEmptyTable';

export type AppProps = {
	image: string;
	name: string;
	rating: string;
	selected: boolean;
	status: string;
	type: string;
	updatedBy: string;
	updatedDate: string;
	updatedResponsible: string;
	version: string;
};

interface DashboardTableProps<T> {
	children: (item: T) => ReactNode;
	emptyStateMessage: {
		description1: string;
		description2: string;
		title: string;
	};
	items: T[];
}

export function DashboardTable<T>({
	children,
	emptyStateMessage,
	items,
}: DashboardTableProps<T>) {
	const {description1, description2, title} = emptyStateMessage;

	if (!items.length) {
		return (
			<DashboardEmptyTable
				description1={description1}
				description2={description2}
				title={title}
			/>
		);
	}
	else {
		return (
			<ClayTable borderless className="dashboard-table-container">
				<ClayTable.Head>
					<ClayTable.Cell headingCell>
						<div className="dashboard-table-header-name">
							<span className="dashboard-table-header-text">
								Name
							</span>

							<img
								alt="Swap Vert"
								className="dashboard-table-header-name-icon"
								src={swapVert}
							/>
						</div>
					</ClayTable.Cell>

					<ClayTable.Cell headingCell>
						<span className="dashboard-table-header-text">
							Version
						</span>
					</ClayTable.Cell>

					<ClayTable.Cell headingCell>
						<span className="dashboard-table-header-text">
							Type
						</span>
					</ClayTable.Cell>

					<ClayTable.Cell headingCell>
						<span className="dashboard-table-header-text">
							Last Updated
						</span>
					</ClayTable.Cell>

					<ClayTable.Cell headingCell>
						<span className="dashboard-table-header-text">
							Rating
						</span>
					</ClayTable.Cell>

					<ClayTable.Cell headingCell>
						<span className="dashboard-table-header-text">
							Status
						</span>
					</ClayTable.Cell>
				</ClayTable.Head>

				<ClayTable.Body>
					{items.map((item, index) => (
						<React.Fragment key={index}>
							{children(item)}
						</React.Fragment>
					))}
				</ClayTable.Body>
			</ClayTable>
		);
	}
}
