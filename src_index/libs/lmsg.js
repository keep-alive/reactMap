! function(e, t) {
	"function" == typeof define && define.amd ? define([], t) : "object" == typeof exports ? module.exports = t() : e.lmsg = t()
}(this, function() {
	var e = {};
	if (e.isLSAvailable = function() {
			var e = "_";
			try {
				return localStorage.setItem(e, e), localStorage.removeItem(e), !0
			} catch (t) {
				return !1
			}
		}(), e.isLSAvailable) {
		var t = 100,
			r = 200,
			o = localStorage,
			n = {},
			i = !1,
			u = {},
			f = function() {
				for (var e in n) {
					var i = o.getItem(e);
					if (i && u[e] && -1 === u[e].indexOf(i)) {
						u[e].push(i);
						try {
							var c = JSON.parse(i);
							c && (i = c)
						} catch (s) {}
						for (var a = 0; a < n[e].length; a++) n[e][a](i);
						o.getItem(e + "-removeit") || (o.setItem(e + "-removeit", "1"), function(t) {
							setTimeout(function() {
								o.removeItem(t), o.removeItem(t + "-removeit"), u[e] = []
							}, r)
						}(e))
					} else i || (u[e] = [])
				}
				return setTimeout(f, t), !0
			};
		e.send = function(e, t) {
			var r = "";
			"function" == typeof t && (t = t()), r = "object" == typeof t ? JSON.stringify(t) : t, o.setItem(e, r)
		}, e.subscribe = function(e, t) {
			n[e] || (n[e] = [], u[e] = []), n[e].push(t), i || (i = f())
		}, e.unsubscribe = function(e) {
			n[e] && (n[e] = []), u[e] && (u[e] = [])
		}, e.getBuffer = function() {
			return u
		}
	} else e.send = e.subscribe = function() {
		throw new Error("localStorage not supported.")
	};
	return e
});