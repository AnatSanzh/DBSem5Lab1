module.exports = {
	filterKeys: (raw, filter) => Object.keys(raw)
		.filter(key => filter(key, raw[key]))
		.reduce((obj, key) => {
			obj[key] = raw[key];
			return obj;
		}, {}),
	fromKeys: (keys) => keys
		.reduce((obj, key) => (obj[key]=undefined, obj), {})
};