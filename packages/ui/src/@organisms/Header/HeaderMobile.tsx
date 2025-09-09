'use client';

import { useState } from 'react';
import { MobileMenu } from '../../@molecules';
import { useUser } from '../../context';
import { useAuth } from '@etnos/tools';

export const HeaderMobile = () => {
	const [open, setOpen] = useState(false);
	const toggleDrawer = () => setOpen(!open);

	const { onSignOut } = useAuth();

	const { user } = useUser();

	return (
		<MobileMenu
			toggleDrawer={toggleDrawer}
			open={open}
			user={user}
			onLogout={onSignOut}
		/>
	);
};
