import {schedulerStale} from './slate-watchdog-policy.mjs';
const now=2_000_000;
const row={dynamicRefreshDueAt: new Date(1_000_000), dynamicLastRunAt: new Date(900_000), dynamicRefreshLeaseUntil:null};
const cases=[
 ['overdue idle job',row,true],
 ['newer success',{...row,dynamicLastRunAt:new Date(1_100_000)},false],
 ['equal success',{...row,dynamicLastRunAt:new Date(1_000_000)},false],
 ['active lease',{...row,dynamicRefreshLeaseUntil:new Date(now+1)},false],
 ['expired lease',{...row,dynamicRefreshLeaseUntil:new Date(now-1)},true],
 ['no prior run',{...row,dynamicLastRunAt:null},true],
 ['future due',{...row,dynamicRefreshDueAt:new Date(now+1)},false],
 ['disabled due',{...row,dynamicRefreshDueAt:null},false],
 ['invalid due',{...row,dynamicRefreshDueAt:'bad'},false],
 ['invalid last',{...row,dynamicLastRunAt:'bad'},false],
 ['invalid lease',{...row,dynamicRefreshLeaseUntil:'bad'},false],
 ['grace boundary',{...row,dynamicRefreshDueAt:new Date(now-900000)},false],
];
for(const [name,input,expected] of cases) {
 if(schedulerStale(input,now,900)!==expected) throw Error(name);
}
console.log('PASS: 12 scheduler policy cases');
