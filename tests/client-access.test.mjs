// Run: node --test tests/client-access.test.mjs
// Clients never mix (Erika, Oct 30: "Bill is signed in but all he can see in Blog Builder is Culture Foundry."). The Content Offer Builder
// used to switch Brand Command access on for whatever ?client= the address named, before any check, and took the agency
// from ?org=. Now the agency is the signed-in person's own (admins: the one they opened), the client is opened only after
// the dashboard's client-access.js says yes (a super admin, or a member of the client's agency), and it is checked again
// before anything of it is read. Runs the app's own lib/data.js with stand-ins for the dashboard and Firebase (even a
// stand-in Brand.connect that hands back agency B's client). FICTIONAL clients.
import test from 'node:test';
import assert from 'node:assert/strict';
import { register } from 'node:module';

const STUBS = {
  'client-access.js': `const L = () => globalThis.__caLog;
    export async function whoAmI() { return { uid: 'u-a', admin: false, orgId: 'org-a', orgName: 'Agency A' }; }
    export async function orgFor() { return 'org-a'; }
    export async function canOpenClient(id) { L().checked.push(id); return id === 'client-a' ? { ok: true, admin: false, orgId: 'org-a' } : { ok: false, reason: 'not-yours' }; }
    export function refuse(id) { L().refused.push(id); }
    export function forgetClient() {} export function dropBrandParam() {}`,
  'brand-connect.js': `const L = () => globalThis.__caLog;
    export function showBackButton() {}
    export function launchParams() { return globalThis.__caLaunch; }
    // the worst case: a connect that hands back whatever the address named
    export async function connect(o) { L().connect.push(o); const id = (o && o.clientId) || globalThis.__caLaunch.clientId; return { clientId: id, brand: { name: id === 'client-b' ? 'Northwind Kites' : 'Alder Bakery' } }; }
    export async function hasAccess(id) { L().read.push('hasAccess:' + id); return false; }
    export async function setAccess(id) { L().read.push('setAccess:' + id); }
    export async function getContext(id) { L().read.push('context:' + id); return { text: '', rules: '' }; }
    export async function listClients(o) { L().read.push('list:' + ((o && o.orgId) || '')); return [{ id: 'client-a', name: 'Alder Bakery', organization_id: 'org-a' }]; }
    export function dashboardUrl() { return ''; }`,
  'firebase-sync.js': `const L = () => globalThis.__caLog;
    export async function currentUser() { return { uid: 'u-a', email: 'bill@agency-a.example' }; }
    export async function getOrganization(id) { L().read.push('org:' + id); return { name: id === 'org-a' ? 'Agency A' : 'Agency B' }; }
    export async function getMembership() { return { orgId: 'org-a', role: 'agency' }; }
    export async function loadClient(id) { L().read.push('client:' + id); return null; }
    export async function loadClients() { return { clients: [] }; }
    export const isAdminEmail = () => false; export const unpack = (x) => x;`,
  'firebase-app.js': 'export const getApp = () => ({}); export const getApps = () => [{}];',
  'firebase-firestore.js': `const L = () => globalThis.__caLog;
    export const getFirestore = () => ({}); export const doc = (db, ...p) => p.join('/'); export const collection = (db, ...p) => p.join('/');
    export async function getDoc(p) { L().read.push('doc:' + p); return { exists: () => false, data: () => ({}) }; }
    export async function getDocs(p) { L().read.push('docs:' + p); return { docs: [] }; }
    export const query = (x) => x; export const where = () => null; export const orderBy = () => null; export const limit = () => null;`,
};
const hooks = `let S = {};
  export async function initialize(d) { S = d.stubs; }
  export async function resolve(spec, ctx, next) {
    if (/^https:\\/\\//.test(spec)) return { url: 'stub:' + spec.replace(/[?#].*$/, '').split('/').pop(), shortCircuit: true };
    return next(spec, ctx);
  }
  export async function load(url, ctx, next) {
    if (url.startsWith('stub:')) return { format: 'module', source: S[url.slice(5)] || 'export {};', shortCircuit: true };
    return next(url, ctx);
  }`;
register('data:text/javascript,' + encodeURIComponent(hooks), { data: { stubs: STUBS } });

console.warn = () => {}; // the allowed case logs about the stand-ins it doesn't have (image check, founder profiles)
const user = { uid: 'u-a', email: 'bill@agency-a.example' };
globalThis.window = { CatalystAuth: { ready: Promise.resolve(user), user: () => user } };
async function open(launch) {
  globalThis.__caLaunch = launch;
  globalThis.__caLog = { checked: [], refused: [], connect: [], read: [] };
  const D = await import('../lib/data.js?' + Math.random());
  const out = await D.init();
  return { D, out, log: globalThis.__caLog };
}

test("agency A opening agency B's link sees nothing of B", async () => {
  const { D, out, log } = await open({ clientId: 'client-b', orgId: 'org-b' });
  assert.equal(out.mode, 'no-client');
  assert.deepEqual(log.refused, ['client-b']);
  assert.ok(!log.read.some((x) => /client-b|org-b/.test(x)), 'nothing of B is read, and no access is switched on for it: ' + log.read.join(', '));
  assert.ok(log.connect.every((o) => o.orgId === 'org-a'), 'the agency is the person’s own');
  assert.equal(D.orgId(), 'org-a');
  assert.doesNotMatch(JSON.stringify([out, D.clientName ? D.clientName() : '']), /Northwind|Agency B/);
});

test("switching to agency B's client is refused before anything of it is read", async () => {
  const { D, log } = await open({ clientId: 'client-a', orgId: 'org-a' });
  log.read.length = 0;
  assert.equal(await D.switchClient('client-b'), null);
  assert.ok(!log.read.some((x) => /client-b/.test(x)), log.read.join(', '));
  assert.ok(log.refused.includes('client-b'));
});

test("agency A's own client still opens, after the check", async () => {
  const { out, log } = await open({ clientId: 'client-a', orgId: 'org-a' });
  assert.equal(out.mode, 'live');
  assert.equal(out.clientId, 'client-a');
  assert.ok(log.checked.includes('client-a'));
  assert.deepEqual(log.refused, []);
});
