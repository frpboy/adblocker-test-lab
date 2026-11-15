import test from 'node:test';
import assert from 'node:assert/strict';
import * as Sentry from '@sentry/browser';
import { createMinimalTransport } from '../src/monitoring/transport.js';
const event = [[{ event_id: 'HOSTILE', sent_at: 'HOSTILE' }], [[{ type: 'event', filename: 'HOSTILE' }, { message: 'HOSTILE', user: {email:'HOSTILE'} }], [{ type: 'attachment' }, 'HOSTILE']]];
const canary='PRIVATE_CANARY';
test('real SDK final fetch contains fresh fixed schema only, no original carrier or attachments', async()=>{
 const calls=[];
 Sentry.init({dsn:'https://98d400030fed6f4093eae00b839abf3b@o4510460282601472.ingest.us.sentry.io/4512436422901760',defaultIntegrations:false,sendClientReports:false,transport:()=>createMinimalTransport({fetcher:async(u,o)=>{calls.push({u,o});return new Response('',{status:200})}})});
 Sentry.setUser({email:canary});Sentry.setContext('secret',{secret:canary});Sentry.getCurrentScope().addAttachment({filename:canary,data:canary});
 Sentry.captureEvent({event_id:'a'.repeat(32),timestamp:1,message:canary,request:{url:canary},exception:{values:[{value:canary,stacktrace:{frames:[{abs_path:canary,vars:{x:canary}}]}}]},tags:{secret:canary},extra:{secret:canary}},{attachments:[{filename:canary,data:canary}]});await Sentry.flush(1000);
 assert.equal(calls.length,1);const {u,o}=calls[0];assert.equal(JSON.stringify({u,o}).includes(canary),false);const [h,i,e]=o.body.split('\n').map(JSON.parse);assert.equal(i.type,'event');assert.match(e.event_id,/^[0-9a-f]{32}$/);assert.notEqual(e.event_id,'a'.repeat(32));assert.equal(h.event_id,e.event_id);assert.ok(e.timestamp>1);assert.deepEqual(Object.keys(e).sort(),['environment','event_id','level','message','platform','release','timestamp']);assert.equal(o.credentials,'omit');assert.equal(o.referrerPolicy,'no-referrer');
});
test('direct hostile envelopes rebuilt, every other item type dropped',async()=>{
 const wires=[];const tr=createMinimalTransport({fetcher:async(u,o)=>{wires.push(o.body);return new Response('')}});await tr.send(event);assert.equal(wires.length,1);assert.equal(wires[0].includes('HOSTILE'),false);
 for(const type of ['session','transaction','replay_event','replay_recording','profile','log','client_report','attachment']) await tr.send([{},[[{type},canary]]]);assert.equal(wires.length,1);
});
test('concurrency, hourly cap and 429 backoff suppress extra sends',async()=>{
 let t=3600000,calls=0;const tr=createMinimalTransport({now:()=>t,fetcher:async()=>{calls++;return new Response('',{status:429})}});await tr.send(event);t+=60001;await tr.send(event);assert.equal(calls,1);t+=3600000;await tr.send(event);assert.equal(calls,2);
 let n=0;const cap=createMinimalTransport({now:()=>t,fetcher:async()=>{n++;return new Response('')}});for(let i=0;i<12;i++){await cap.send(event);t+=60001}assert.equal(n,10);
});
test('fetch failure/hang is isolated under outer deadline',async()=>{
 for(const fetcher of [()=>{throw Error('failure')},()=>Promise.reject(Error('failure')),()=>new Promise(()=>{})]){const tr=createMinimalTransport({fetcher});const t=Date.now();await assert.doesNotReject(tr.send(event));assert.ok(Date.now()-t<1000)}
});

test('inflight suppression and long vendor backoff are enforced',async()=>{
 let t=3600000,calls=0,finish;
 const tr=createMinimalTransport({now:()=>t,fetcher:()=>{calls++;return new Promise(resolve=>{finish=resolve})}});
 const pending=tr.send(event);await Promise.resolve();await tr.send(event);assert.equal(calls,1);finish(new Response(''));await pending;
 t+=60001;let n=0;const backoff=createMinimalTransport({now:()=>t,fetcher:async()=>{n++;return new Response('',{status:429,headers:{'retry-after':'7200','x-sentry-rate-limits':'10800:error:organization'}})}});
 await backoff.send(event);t+=7200001;await backoff.send(event);assert.equal(n,1);t+=3600000;await backoff.send(event);assert.equal(n,2);
});

test('ignored abort retains busy past deadline; body cancellation also retains busy',async()=>{
 let t=3600000,calls=0,finish;
 const tr=createMinimalTransport({now:()=>t,fetcher:()=>{calls++;return new Promise(resolve=>{finish=resolve})}});
 const first=tr.send(event);await Promise.resolve();await first;assert.equal(await tr.flush(),false);t+=120000;await tr.send(event);assert.equal(calls,1);
 let cancelled=0,releaseBody;
 finish({status:200,headers:new Headers(),body:{cancel(){cancelled++;return new Promise(resolve=>{releaseBody=resolve})}}});
 await Promise.resolve();await Promise.resolve();assert.equal(cancelled,1);assert.equal(await tr.flush(),false);await tr.send(event);assert.equal(calls,1);releaseBody();await Promise.resolve();await Promise.resolve();assert.equal(await tr.flush(),true);
});
