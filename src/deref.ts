export default function deref<T>(obj: T): T {
	return JSON.parse(JSON.stringify(obj));
}
