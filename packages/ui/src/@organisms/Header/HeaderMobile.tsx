'use client';

import { useState } from 'react';
import { MobileMenu } from '../../@molecules';

export const HeaderMobile = () => {
	const [open, setOpen] = useState(false);
	const toggleDrawer = () => setOpen(!open);

	return <MobileMenu toggleDrawer={toggleDrawer} open={open} />;
};
