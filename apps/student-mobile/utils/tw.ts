import { create } from 'twrnc';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const config = require('../tailwind.config.js');

const tw = create(config);

export default tw;
