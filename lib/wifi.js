/*
 * Wifi Support
 *
 * Copyright(c) 2012 Fred Chien <fred@mandice.com>
 *
 */

module.exports = function(connman) {
	var self = this;
	var dbus = connman.dbus;

	this.service = null;

	/* Create connection for Wifi Technology */
	this.technology = connman.Technology.Find('wifi');

	this.ListAPs = function(callback) {
		process.nextTick(function() {
			var origList = connman.manager.GetServices();
			var list = [];

			/* We only get services of wifi */
			for (var index in origList) {
				if (origList[index][1].Type != 'wifi')
					continue;

				origList[index][1].dbusObject = origList[index][0];

				list.push(origList[index][1]);
			}

			delete origList;

			callback(list);
		});
	};

	this.Scan = function(callback) {
		if (self.technology) {
			process.nextTick(function() {
				self.technology.Scan();
				callback();
			});
		}
	};

	this.FindAccessPoint = function(ssid, callback) {
		process.nextTick(function() {
			var List = connman.manager.GetServices();
			var ap;

			for (var index in List) {
				ap = List[index];
				if (ap[1].Name == ssid) {
					callback(null, ap);

					delete List;

					return;
				}
			}

			delete List;
		});

		callback(new Error('Cannot find such access point'));
	};

	this.Connect = function(ssid, passphrase, security) {
		if (self.technology) {
			self.FindAccessPoint(ssid, function(err, ap) {
				if (err)
					return;

				/* Get service interface */
				self.service = dbus.get_interface(connman.systemBus, 'net.connman', ap[0], 'net.connman.Service');

				/* Connect to Agent to make connection with access point */
				self.service.Connect();
			});
		}
	};

	/* Properties */
	this.__defineGetter__('Connected', function() {
		return self.technology.GetProperties().Connected;
	});

	this.__defineGetter__('Powered', function() {
		return self.technology.GetProperties().Powered;
	});

	this.__defineSetter__('Powered', function(value) {
		self.technology.SetProperty('Powered', value);
	});

	this.__defineGetter__('Tethering', function() {
		return self.technology.GetProperties().Tethering;
	});

	this.__defineSetter__('Tethering', function(value) {
		self.technology.SetProperty('Tethering', value);
	});
};
