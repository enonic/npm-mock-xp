export function parentFromPath(path: string): string {
	const parts = path.split('/');
	parts.pop();
	return parts.join('/') || '/';
}
