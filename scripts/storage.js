// localStorage can throw (private mode, blocked site data), so every access is guarded.
// Key names match the original site so existing visitors keep their theme and note.
export const KEYS = {
	theme: 'theme',
	note: 'note',
	view: 'view',
	sound: 'sound',
};

export const storage = {
	get(key) {
		try {
			return localStorage.getItem(key);
		} catch {
			return null;
		}
	},
	set(key, value) {
		try {
			localStorage.setItem(key, value);
			return true;
		} catch {
			return false;
		}
	},
};
