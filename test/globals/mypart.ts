// @ts-ignore
import {render} from '/lib/xp/slm';

// @ts-ignore
const VIEW_ABS = resolve('/mypart.slm');
// @ts-ignore
const VIEW_REL = resolve('./mypart.slm');

export function get() {
	return {
		body: [
			render(VIEW_ABS, {subject: 'World'}),
			render(VIEW_REL, {subject: 'Norway'})
		].join('\n'),
		contentType: 'text/html',
	}
}
