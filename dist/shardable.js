'use strict';

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Shardable = function () {
	function Shardable(knex) {
		(0, _classCallCheck3.default)(this, Shardable);

		this.knex = knex;
	}

	(0, _createClass3.default)(Shardable, [{
		key: 'createNextIdFunction',
		value: function createNextIdFunction() {
			var schemaName = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'public';


			var sql = '\n\t\tCREATE OR REPLACE FUNCTION ' + schemaName + '.next_id(In seq_name regclass, set_shard_id int, OUT result bigint) AS $$\n\t\tDECLARE\n\t\t\tour_epoch bigint := 1314220021721;\n\t\t\tseq_id bigint;\n\t\t\tnow_millis bigint;\n\t\t\tshard_id int := set_shard_id;\n\t\t\tmod_key bigint := 1024;\n\t\tBEGIN\n\t\t\tSELECT nextval(seq_name) % mod_key INTO seq_id;\n\t\t\tSELECT FLOOR(EXTRACT(EPOCH FROM clock_timestamp()) * 1000) INTO now_millis;\n\t\t\tresult := (now_millis - our_epoch) << 23;\n\t\t\tresult := result | (shard_id << 10);\n\t\t\tresult := result | (seq_id);\n\t\tEND\n\t\t$$ LANGUAGE PLPGSQL;\n\t';
			return this.knex.raw(sql);
		}
	}, {
		key: 'dropNextIdFunction',
		value: function dropNextIdFunction() {
			var schemaName = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'public';

			var sql = 'DROP FUNCTION ' + schemaName + '.next_id(In seq_name regclass, set_shard_id int, OUT result bigint);';
			return this.knex.raw(sql);
		}
	}, {
		key: 'setShardPrimaryKey',
		value: function setShardPrimaryKey(tableName) {
			var owner = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
			var shardId = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 1;


			var user = void 0;
			if (owner === null) {
				user = this.knex.client.config.connection.user;
			} else {
				user = owner;
			}

			var sql = '\n\t\t\tCREATE SEQUENCE ' + tableName + '_id_seq\n\t\t\t  INCREMENT 1\n\t\t\t  MINVALUE 1\n\t\t\t  MAXVALUE 9223372036854775807\n\t\t\t  START 1\n\t\t\t  CACHE 1;\n\t\t\tALTER TABLE ' + tableName + '_id_seq\n\t\t\t  OWNER TO ' + user + ';\n\t\n\t\t\tALTER TABLE ' + tableName + ' ADD CONSTRAINT ' + tableName + '_pkey PRIMARY KEY(id);\n\t\t\tALTER TABLE ' + tableName + ' ALTER COLUMN id SET DEFAULT next_id(\'' + tableName + '_id_seq\'::regclass, ' + shardId + ');\n        ';

			return this.knex.raw(sql);
		}
	}, {
		key: 'dropSequence',
		value: function dropSequence(tableName) {
			var sql = 'DROP SEQUENCE ' + tableName + '_id_seq;';
			return this.knex.raw(sql);
		}
	}]);
	return Shardable;
}();

exports.default = Shardable;
module.exports = exports['default'];