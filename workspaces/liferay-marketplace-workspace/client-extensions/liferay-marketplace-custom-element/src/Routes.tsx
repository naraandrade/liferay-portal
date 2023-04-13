import {useEffect, useState} from 'react';

import {AppCreationFlow} from './pages/AppCreationFlow/AppCreationFlow';
import {CustomerGatePage} from './pages/CustomerGatePage/CustomerGatePage';
import GetAppPage from './pages/GetAppPage/GetAppPage';
import {NextStepPage} from './pages/NextStepPage/NextStepPage';
import {PublishedAppsDashboardPage} from './pages/PublishedAppsDashboardPage/PublishedAppsDashboardPage';
import {PublisherGatePage} from './pages/PublisherGatePage/PublisherGatePage';
import {PurchasedAppsDashboardPage} from './pages/PurchasedAppsDashboardPage/PurchasedAppsDashboardPage';
import {Spinner} from './components/Spinner/Spinner';
import {userAccountChecker} from './utils/util';

import {Liferay} from './liferay/liferay';

interface AppRoutesProps {
	route: string;
}

export default function AppRoutes({route}: AppRoutesProps) {
	const [userCustomerChecker, setUserCustomerChecker] = useState(false);
	const [userPublisherChecker, setUserPublisherChecker] = useState(false);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		const makeUserAccountChecker = async () => {
			setUserCustomerChecker(
				await userAccountChecker(['Cloud Customer'])
			);
			setUserPublisherChecker(
				await userAccountChecker([
					'Business Publisher',
					'Individual Publisher',
				])
			);
			setIsLoading(false);
		};
		makeUserAccountChecker();
	}, []);

	if (route === 'create-app') {
		return <AppCreationFlow />;
	}
	else if (route === 'get-app') {
		return <GetAppPage userCustomerChecker={userCustomerChecker} />;
	}
	else if (route === 'next-steps') {
		return <NextStepPage />;
	}
	else if (route === 'purchased-apps') {
		if (isLoading) {
			<Spinner />;
		}
		else if (userCustomerChecker && Liferay.ThemeDisplay.isSignedIn()) {
			return <PurchasedAppsDashboardPage />;
		}
		else {
			return <CustomerGatePage />;
		}
	}
	else if (route === 'published-apps') {
		if (isLoading) {
			<Spinner />;
		}
		else if (userPublisherChecker && Liferay.ThemeDisplay.isSignedIn()) {
			return <PublishedAppsDashboardPage />;
		}
		else {
			return <PublisherGatePage />;
		}
	}

	return <></>;
}
