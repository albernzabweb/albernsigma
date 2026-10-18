import {test} from 'node:test';
import assert from 'node:assert/strict';
import {loginError} from '../lib/auth-errors';
test('Login distinguishes email confirmation, credentials and service setup errors',()=>{
 assert.match(loginError({code:'email_not_confirmed'}),/belum dikonfirmasi/);
 assert.match(loginError({code:'invalid_credentials'}),/Email atau kata sandi/);
 assert.match(loginError({message:'Invalid API key',status:401}),/Konfigurasi koneksi/);
 assert.match(loginError({status:429}),/Terlalu banyak/);
 assert.match(loginError({status:503}),/Layanan autentikasi/);
});
test('Unknown authentication errors do not reflect raw provider messages or credentials',()=>{
 assert.equal(loginError({message:'private diagnostic data'}).includes('private diagnostic data'),false);
});
