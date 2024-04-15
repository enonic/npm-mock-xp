// @ts-ignore
import {render} from '/lib/xp/slm';

// @ts-ignore
const VIEW_ABS = resolve('/site/parts/mypart/mypart.slm');
// @ts-ignore
const VIEW_NO_PATH = resolve('mypart.slm');
// @ts-ignore
const VIEW_DOT = resolve('./mypart.slm');
// @ts-ignore
const VIEW_DOT_DOT = resolve('../../../views/goodbye.slm');

export function get() {
	return {
		body: [
			render(VIEW_ABS, {subject: 'Absolute'}),
			render(VIEW_NO_PATH, {subject: 'No Path'}),
			render(VIEW_DOT, {subject: 'Dot Path'}),
			render(VIEW_DOT_DOT, {subject: 'Dotdot Path'}),
		].join('\n'),
		contentType: 'text/html',
	}
}
